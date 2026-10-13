---
title: "Qualify an ecosystem integration"
doc_type: guide
description: "Identify the actual integration route, record versioned capabilities and diagnose connector compatibility before deployment."
---

# Qualify an ecosystem integration

Choose a source-to-destination route before selecting a connector. MySQL wire-protocol access establishes a connection interface; SQL generation, metadata reflection, bulk loading and recovery still need separate checks. A connector using a MySQL source's binlog does not establish that MatrixOne is a compatible binlog source.

## Record the exact route

Keep one qualification record per tool version, driver version, MatrixOne build, source role and sink role. Include TLS and authentication settings, SQL mode, session time zone, schemas, explicit type mappings, batch size and parallelism. Keep credentials outside the record and configuration examples.

Record reads, inserts, updates, deletes, schema changes and recovery independently. Use these statuses:

| Status | Meaning |
|---|---|
| Native path verified | The actual component API or runtime performed the operation in the recorded configuration. |
| Explicit adapter verified | The component ran, with a named representation conversion or external SQL effect adapter. |
| Blocked | Preserve the original error, minimal reproduction and affected configuration. |
| Not qualified | The component, direction or failure scenario has not completed its own check. |

An operation's passing status applies to the recorded configuration, not to every release or to the entire product. A task's row-set assertions do not count as separate scheduler deployments or crashes.

## Check the component boundary

| Component family | What must actually execute | Additional boundary to record |
|---|---|---|
| PyMySQL, mysql-connector-python, SQLAlchemy, JDBC, ODBC and MatrixOne SDK | Driver reads/writes, parameter binding and the intended commit/rollback API | Metadata reflection, cloned DDL, TLS and connection reuse; read checks do not qualify writes. |
| ConnectorX and Ibis | Actual reader/backend queries | Default type inference versus explicit CAST/HEX representations. |
| PETL, pandas, Polars and Dask | Native transformations and the configured load path | Explicit dtypes, decimal context, duration mapping and whether SQL effects are external adapters. |
| DuckDB and PyArrow | Actual engine/file roundtrip and the intended SQL sink | Parquet/IPC representations and an explicit SQL bridge versus a native connector. |
| DataX and SeaTunnel | Actual job and source/sink plugins | Plugin/driver versions, source partitioning, destination statement and batch versus streaming mode. |
| Spark, Flink CDC and Trino | Actual engine runtime and intended connector | Installing a client or checking a port does not qualify the engine, source CDC or checkpoint sink. |
| Singer and dlt | Tap/target protocol or pipeline runtime, including state | Identify custom targets, type envelopes and SQL merge adapters. |
| Kafka Connect/Debezium and Confluent JDBC | Connector tasks, generated SQL and offset handling | Qualify source CDC and destination writes separately; schema evolution and rebalance recovery need their own checks. |
| kafka-python and Redpanda Connect | Actual producer/consumer or pipeline runtime | A custom SQL sink supplies its own effect and offset contract. |
| NiFi | Actual processor flow and database writer | Failure queues, rollback settings, update keys and generated UPSERT statements. |
| Airbyte | Official source and destination protocol, records and STATE acknowledgments | A SQL sink adapter is separate from the official destination; protocol-runner execution is separate from a full Airbyte platform deployment. |
| Airflow and DolphinScheduler | Actual DAG/task runtime and intended hook or SQL task | A Shell task invoking Python does not qualify native JDBC tasks or scheduler HA. |
| dbt | Actual model build and materialization, followed by data tests | Parse alone does not qualify build; table models do not establish incremental/delete semantics. |
| Fivetran Connector SDK | Official SDK operations and checkpoint handling | Local tester execution does not qualify the hosted service or a production destination. |
| PyIceberg | Actual catalog, typed append/scan and intended sink | A local file/catalog plus SQL bridge is separate from a native MatrixOne Iceberg connector; append does not enforce SQL primary-key uniqueness. |

Start from existing [DataX](Etl/DataX/datax-mysql-matrixone.md), [SeaTunnel](Etl/Seatunnel/seatunnel-mysql-matrixone.md), [Spark](Computing-Engine/Spark/spark-mysql-matrixone.md) and [Flink](Computing-Engine/Flink/flink-mysql-matrixone.md) examples, then qualify the production operation and recovery route. Check [MySQL compatibility](../../Overview/feature/mysql-compatibility.md) and [JDBC limitations](../../Reference/Limitations/mo-jdbc-feature-list.md) separately.

## Investigate generated SQL and metadata

Preserve the original generated statement, parameter types, driver error and component state. Reproduce the statement with a small synthetic input on the affected server and on a control database where the semantics overlap. Then identify whether the failure comes from SQL syntax, server behavior, driver metadata, an intermediate representation or the tool's configuration.

The following historical reports provide concrete compatibility probes. Check the issue's affected build and fix before using a workaround in a different release:

| Route | Probe | Related report |
|---|---|---|
| Airbyte MySQL destination | LOAD DATA with `SET NULLIF(@user_variable, ...)`; verify destination STATE ACK after durable data | [#29849](https://github.com/matrixorigin/matrixone/issues/29849) |
| NiFi MySQL UPSERT | Parameterized assignment of an unchanged primary key | [#29850](https://github.com/matrixorigin/matrixone/issues/29850) |
| Debezium JDBC schema evolution | Parenthesized ALTER ADD COLUMN and generated target DDL | [#29851](https://github.com/matrixorigin/matrixone/issues/29851) |
| Ibis UInt64 reflection | BIGINT UNSIGNED metadata and inferred type | [#29846](https://github.com/matrixorigin/matrixone/issues/29846) |
| ENUM/SET merge | Alias-qualified JOIN UPDATE assignment | [#29923](https://github.com/matrixorigin/matrixone/issues/29923) |
| dlt incremental merge | Cross-database same-name correlated DELETE | [#29876](https://github.com/matrixorigin/matrixone/issues/29876) |
| SQLAlchemy reflected DDL | BOOL metadata and reflected column type | [#29879](https://github.com/matrixorigin/matrixone/issues/29879) |

When a report is closed, record its fix commit, first release containing the fix and regression result. Closure alone does not establish that a deployed release contains the fix. Keep a failed native path separate from a passing adapted path.

## Qualify recovery and operating limits

Use [Failure recovery for ingestion pipelines](failure-recovery.md) to check deletion, schema changes, retries and checkpoint ordering. Record batch size, task parallelism, actual connections, memory limits, queue capacity and source retention. A case worker can start multiple native partitions, so its count is not a connection limit.

Report throughput and latency together with hardware, storage, dataset, versions, duration and failure schedule. A memory-filesystem functional run does not establish disk throughput, long-duration stability or production HA.

The ecosystem test reports referenced by [matrixone#29848](https://github.com/matrixorigin/matrixone/issues/29848) use a pinned MatrixOne build and distinguish explicit adapters from native operations. Requalify against the release you deploy instead of treating the test plan's tool or case count as certification.
