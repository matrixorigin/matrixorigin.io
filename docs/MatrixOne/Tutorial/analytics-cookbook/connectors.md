# Spark and Flink analytical pipelines

Both engines can read MatrixOne through MySQL JDBC, perform their own computations and publish results back to MatrixOne. Record the engine, Java, connector and Python worker versions as part of the pipeline contract.

## Spark configuration and value checks

Use PySpark 3.5.3, Java 17 and MySQL Connector-J 8.0.33 for the verified recipe. Explicitly configure isolationLevel=READ_COMMITTED on JDBC writes: Spark's default READ_UNCOMMITTED failed on the tested MO revision. See [the compatibility issue](https://github.com/matrixorigin/matrixone/issues/29838).

Set PYSPARK_PYTHON and PYSPARK_DRIVER_PYTHON to the same virtual-environment interpreter. Arrow worker examples additionally used PyArrow 16.1.0. Java 21 direct-buffer access failed in the earlier Spark/Arrow combination; Java 17 worked. That is a client runtime finding, not a SQL correctness failure.

The [Spark migration guide](../../Develop/Ecological-Tools/Computing-Engine/Spark/spark-mysql-matrixone.md) contains a complete DATE roundtrip fixture. Independently check every source field, perform the native Spark operations, then read published values through another client. Caching a source once is different from independently querying it for each workflow.

## Execute a bounded Flink source/join/aggregate/sink

Install apache-flink==2.1.1 and use Java 17. Put the following dependency JARs in MO_JAR_DIR:

| Maven artifact | Version |
|---|---|
| org.apache.flink:flink-connector-jdbc-core | 4.1.0-2.1 |
| org.apache.flink:flink-connector-jdbc-mysql | 4.1.0-2.1 |
| com.mysql:mysql-connector-j | 8.0.33 |
| io.openlineage:openlineage-java | 1.32.0 |
| io.openlineage:openlineage-sql-java | 1.32.0 |

Set MO_JDBC_URL to the same host, port and dedicated database as the [Python connection settings](index.md#run-the-complete-examples). Use the corresponding JDBC TLS properties if your endpoint requires TLS; the Python CA setting does not automatically configure Java.

Run [flink_bounded.py](examples/flink_bounded.py) together with [common.py](examples/common.py):

```bash
python flink_bounded.py
```

The script checks all three event rows and both dimension rows, executes a native Flink dimension join and grouped count/sum, writes through the JDBC sink, then independently reads the entire result through PyMySQL.

Expected output:

```text
bounded Flink JDBC results: [(10,2,30),(20,1,7)]
```

Region 10 has two values summing to 30; region 20 has one summing to 7. The script removes only its own source, dimension and destination tables after the job completes.

## Streaming validation has a different scope

The larger Spark supplement used one real shared Structured Streaming pipeline with an event-time watermark, very-late rows, checkpoint stop/restart and a foreachBatch transactional idempotent MySQL-protocol upsert sink. Its 10,000 group assertions were not 10,000 independent streaming jobs and did not validate a built-in Spark JDBC streaming sink.

The larger Flink supplement, like the runnable example here, used bounded JDBC data and included all rows present in that snapshot. It did not test arrival-time watermarks, restart recovery or exactly-once delivery.

For a streaming deployment, specify source offsets, accepted lateness, deduplication keys, checkpoint ownership and the sink's replay contract. A JDBC append plus checkpointing alone does not guarantee each business result is published once.
