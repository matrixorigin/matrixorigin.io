# **CREATE SOURCE**

## **Grammar description**

`CREATE SOURCE` Creates a connection to streamed data and adds a new SOURCE table to the current database.

## **Grammar structure**

```sql
CREATE [OR REPLACE] SOURCE [IF NOT EXISTS] stream_name 
( { column_name data_type [KEY | HEADERS | HEADER(key)] } [, ...] )
WITH ( property_name = expression [, ...]);
```

## Interpretation of grammar

- stream_name: SOURCE Name. The SOURCE name must be different from any existing SOURCE name in the current database.
- column_name: Streaming data maps to column names in the SOURCE table.
- data_type: column_name corresponds to the type of field in the data table.
- property_name = expression: For specific configuration item names for streaming data mappings and corresponding values, the configurable items are as follows:

| property_name | expression Description |
| :-----------------: | :------------------------------------------------------------------------------: |
| "type"        |  Only 'kafka' is supported: Currently, only kafka is supported as an accepted source.       |
| "topic"       |   The corresponding topic in the kafka data source            |
| "partion"      |   The corresponding partion in the kafka data source  |
| "value"       |   Only 'json' is supported: Currently, only json is supported as an accepted data format.   |
| "bootstrap.servers" |   The IP:PORT of the kafka server.  |
| "sasl.username"   |   Specify the SASL (Simple Authentication and Security Layer) username to use when connecting to Kafka. |
| "sasl.password"   |   Used in conjunction with sasl.username, this parameter provides the corresponding password|
| "sasl.mechanisms"  |    SASL mechanism for authentication between client and server|
| "security.protocol" |     Specifies the security protocol to use when communicating with the Kafka server |

## **Examples**

```sql
create source stream_test(c1 char(25),c2 varchar(500),c3 text,c4 tinytext,c5 mediumtext,c6 longtext )with(
    "type"='kafka',
    "topic"= 'test',
    "partition" = '0',
    "value"= 'json',
    "bootstrap.servers"='127.0.0.1:9092'   
)
Query OK, 0 rows affected (0.01 sec)
```

## Limitations

drop and alter are not currently supported in the SOURCE table.

Only join kafka is currently supported when creating a SOURCE table, and only transport data in json format is supported.
