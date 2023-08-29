# Detailed Stream Engine Architecture

MatrixOne incorporates a built-in stream engine designed for real-time querying, processing, and enriching data stored in a series of incoming data points, known as data streams. Developers can now use SQL to define and create stream processing pipelines as a real-time data backend service. Furthermore, developers can utilize SQL to query data within streams and establish connections with non-streaming datasets, thereby further simplifying the data stack.

## Technical Architecture

The technical architecture of the MatrixOne stream engine is illustrated as follows:

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/stream-arch.png?raw=true)

MatrixOne introduced the ability to create streaming tables and implemented a Kafka connector to fulfill the streaming data ingestion requirements of numerous time-series scenarios.

### Connectors

Connectors facilitate connecting with external data sources, such as the Kafka connector introduced in MatrixOne 1.0.

MatrixOne supports the use of the following statement to establish a connection between connectors and external data sources:

```sql
CREATE SOURCE | SINK CONNECTOR [IF NOT EXISTS] connector_name CONNECTOR_TYPE WITH (property_name = expression [, ...]);
```

Here, the parameter `CONNECTOR_TYPE` is used to specify the target.

### Streams

A stream represents an append-only data flow akin to an unbounded table with infinite events. Each stream maps to an event group in the storage layer, such as Kafka topics or MatrixOne tables.

- External stream: A stream using an external storage layer via connectors.
- Internal stream: A stream that utilizes MatrixOne tables as the event storage.

MatrixOne supports the use of the following statement to **create streams**:

```sql
CREATE [OR REPLACE] [EXTERNAL] STREAM [IF NOT EXISTS] stream_name
({ column_name data_type [KEY | HEADERS | HEADER(key)] } [, ...])
WITH (property_name = expression [, ...]);
```

For example, you can refer to the following examples:

```sql
CREATE EXTERNAL STREAM STUDENTS (ID STRING KEY, SCORE INT)
WITH (kafka_topic = 'students_topic', value_format = 'JSON', partitions = 4);
```

Or:

```sql
CREATE STREAM STUDENTS (ID STRING KEY, SCORE INT)
```

You can also query streams and connect them with other tables and materialized views, as shown below:

```sql
SELECT * FROM STUDENTS WHERE rank > 5;
```

Additionally, you can insert new events, as demonstrated below:

```sql
INSERT INTO foo (ROWTIME, KEY_COL, COL_A) VALUES (1510923225000, 'key', 'A');
```
