# Measurement and troubleshooting

Performance measurements are meaningful only when their timed operations, input sizes and correctness rules are explicit.

## Separate the stages

Measure connection establishment, SQL execution plus fetch, DataFrame construction, scientific computation and result writeback separately when your client exposes those boundaries. A wall-clock read followed by a model fit is an end-to-end workflow measurement, not server SQL QPS.

Use a fixed input and verify complete output before timing. Record server/client versions, rows and bytes returned, machine quota, concurrency, cache/warmup policy and the number of independent repetitions. Report distributions such as median and p95 rather than the fastest run.

A prepared-query connection reused across repetitions excludes connection setup. A concurrent Spark/Flink job can interfere with both SQL latency and available memory; stop unrelated clients before an isolated comparison. Performance equivalence between two SQL rewrites requires the same data, returned values and measurement boundaries.

## Resource pressure and failure classification

| Observation | Meaning and next check |
|---|---|
| Increased cgroup memory.max pressure events | Memory pressure was observed; inspect workload and quotas. It is not itself an OOM kill. |
| Increased oom/oom_kill counters | An OOM event occurred; identify the affected process and operation. |
| Query succeeds but a background diagnostic upload fails | Track the upload separately; verify result correctness and source persistence before attributing data loss. |
| Query returns an internal error and the process survives | A recovered execution failure still needs a reproducible case; process survival does not make the query correct. |
| Row counts agree but NULLs/values differ | Treat as a correctness failure; row count alone is insufficient. |
| Retry succeeds | Verify replay keys and full result readback; success alone does not establish absence of duplicate publication. |

The larger validation observed diagnostic statement_info payloads exceeding a TEXT capacity and background ETL upload errors. See [the capacity issue](https://github.com/matrixorigin/matrixone/issues/29809) and [the upload issue](https://github.com/matrixorigin/matrixone/issues/29797). Counts of log lines, failed internal operations and failed business workflows are different metrics.

## Recovery evidence

Record acknowledged commits separately from operations with unknown outcomes. After restart, query through a fresh connection and compare complete keys/values with the acknowledged ledger. Check rollback state, source hashes and application replay keys as separate properties.

Finite synthetic single-process recovery observations do not establish distributed fault tolerance or a production availability objective. A model-storage roundtrip does not establish training throughput, and a correct client-side algorithm does not measure a native MO algorithm.

Use the [execution-plan guide](../../Performance-Tuning/explain/explain-overview.md) to investigate server work and the [transaction guide](../../Develop/Transactions/matrixone-transaction-overview/overview.md) to interpret visibility. Keep the smallest failing SQL and its fixture together with actual error text, dependency versions and full expected output.
