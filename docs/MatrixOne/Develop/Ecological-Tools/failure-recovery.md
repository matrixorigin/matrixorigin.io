---
title: "Failure recovery for ingestion pipelines"
doc_type: guide
description: "Validate deletion, schema changes, acknowledgment ordering and replay before relying on a pipeline's recovery guarantees."
---

# Failure recovery for ingestion pipelines

Recovery is complete when destination values and the durable source position agree. A restarted task or an acknowledged batch alone does not establish this. Qualify the actual connector and sink described in [Qualify an ecosystem integration](integration-compatibility.md).

## Define delivery and effect semantics

At-least-once delivery can replay an event. An idempotent effect produces the same result when applied again, such as replacing a value with a fixed value at the same key. Incrementing a balance or appending an audit record is not automatically idempotent.

An exactly-once effect needs a durable protocol covering event identity, deduplication, business effects and progress. A sink-local transaction cannot by itself atomically commit an independent source's offset. State which failure window is handled by transactional coupling and which is handled by replay and deduplication.

| Failure window | Required recovery check |
|---|---|
| Before the destination commit | No partial business effect; the event remains eligible for retry. |
| After commit, before ACK or offset persistence | Replay does not duplicate a non-idempotent effect. |
| After source progress advances | Every acknowledged event has its required durable effect; no event is skipped. |
| During rebalance or concurrent retry | An old worker cannot overwrite progress or commit a stale effect after a new owner takes over. |
| After retention expires | Detect the gap and reconcile or resnapshot; do not report successful incremental recovery over missing history. |

## Establish a sink-local transaction contract

For a custom sink, a possible design stores an event ledger, business effect and sink-local checkpoint in one transaction. This is a design pattern to qualify for the intended isolation level, not a built-in guarantee of every connector:

```text
begin transaction
  verify that this worker still owns the partition generation
  check the stable event identity in the deduplication ledger
  if the event is new:
    apply its business effect
    record its identity and outcome
  advance the sink-local checkpoint only over a contiguous processed prefix
commit transaction
acknowledge or persist external source progress
```

Concurrent workers need a tested uniqueness/conflict protocol and a fencing generation. Do not advance progress using the highest observed offset if earlier events remain unprocessed. Reconcile the ledger and effect after losing a commit acknowledgment. If the connector lacks this contract, describe its delivery and idempotency behavior explicitly instead of assigning it an exactly-once label.

See the historical [event-ledger/checkpoint request](https://github.com/matrixorigin/matrixone/issues/29857). A passing constant-value UPSERT replay is only one check; also test an increment, append or another non-idempotent effect.

## Verify deletion and ordering

Define how a source delete maps to a destination tombstone or physical delete. Verify that replaying the delete is safe, that deletion does not depend on dropping the entire target table, and that a later legitimate insert is retained.

Test insert, update, delete, duplicate delete and delete-then-reinsert at the same key. Then deliver an older update after the delete or reinsertion. Decide whether the route preserves source order or uses an event version to reject stale events. A deleted row should not reappear solely because an old update was replayed.

## Verify schema changes

Test data written before and after adding a column, including NULL and an explicit default. Check whether existing rows receive the intended value and whether the component refreshes its schema metadata.

Qualify widening, rename and column removal separately. A sink that can generate ADD COLUMN does not necessarily implement these changes. If target DDL is an external step, state the deployment order and keep it distinct from automatic source-to-sink evolution. Some databases or connectors do not make DDL and data changes one atomic operation.

## Exercise the actual runtime

| Component | Recovery boundary to inspect |
|---|---|
| Airbyte | Official destination STATE ACK must follow the required durable records. An adapter's state does not qualify the official destination. |
| Kafka Connect and JDBC sinks | Task errors, generated DDL, offsets, rebalance and commit acknowledgment loss. Restarting a task alone does not prove reconciliation. |
| NiFi | Success, retry and failure relationships; FlowFile queues, transaction rollback and backpressure. Preserve failed records until their disposition is verified. |
| Airflow and DolphinScheduler | A failed task must fail the DAG/task outcome. Retry resumes from durable state and does not repeat a non-idempotent effect. |
| Fivetran Connector SDK | Upsert/update/delete operations and checkpoint state across fresh local executions. Local execution does not establish hosted-service semantics. |
| dbt | Rerun the intended incremental materialization, including deletes and schema changes. A full table rebuild can conceal an incremental recovery error. |
| Singer and dlt | Source cursor/state, target commit and merge outcome; distinguish protocol or SQL adapters from native behavior. |

For [MatrixOne native CDC](../../Maintain/cdc/mocdc.md), check the PITR/GC retention requirements in that guide. A restart after the retained change history has expired cannot be assumed to replay every intermediate operation. The native CDC route and a MySQL binlog route require separate qualification.

## Keep a reproducible recovery record

Record the versions, event identities, operation sequence, partition/order, schemas and expected values before injecting a failure. Keep source state, destination rows, ledger/checkpoint values, component logs and failed records after each recovery step. Compare complete values and multiplicity through a fresh connection.

Report the exact number of failures, their injection points, whether a real process was terminated, and which component performed the recovery. A large parameterized case count does not replace these failure checks. Track duration, memory, storage, backlog and latency for a separate stability or performance qualification.
