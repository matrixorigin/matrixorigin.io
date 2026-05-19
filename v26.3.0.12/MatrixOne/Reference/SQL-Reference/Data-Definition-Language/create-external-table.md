---
title: "CREATE EXTERNAL TABLE"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "CREATE EXTERNAL TABLE"
since: unknown
last_updated: 2026-05-08
llms_summary: "External table access data in external sources as if it were in a table in the database."
---
# **CREATE EXTERNAL TABLE**

> External table access data in external sources as if it were in a table in the database.

## **Description**

**External table** access data in external sources as if it were in a table in the database.

You can connect to the database and create metadata for the external table using DDL.

The DDL for an external table consists of two parts: one part that describes the MatrixOne column types, and another part (the access parameters) that describes the mapping of the external data to the MatrixOne data columns.

This document describe how to create a new tables outside of the MatrixOne databases.

## **Syntax**

### Common syntax

```
> CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name;
(
    name1 type1,
    name2 type2,
    ...
)
```

### Syntax

```
## Create a external table for a local file (specify the compression format)
create external table t(...) localfile{"filepath"='<string>', "compression"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

## Create a external table for a local file (if no compression format is specified, the format is auto, and the file format is automatically checked)
create external table t(...) localfile{"filepath"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';


## Create a external table for an S3 file (specify the compression format)
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>', "compression"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

## Create a external table for an S3 file (if no compression format is specified, the format is auto, and the file format is automatically checked)
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';
```

### Explanations

#### Parameter Description

|Parameter|Description|
|:-:|:-:|
|endpoint|A endpoint is a URL that can conncect to AWS Web service. For example: s3.us-west-2.amazonaws.com|
|access_key_id| S3 Access key ID |
|secret_access_key| S3 Secret access key |
|bucket| S3 Bucket to access |
|filepath| relative file path |
|region| AWS S3 Area|
|compression| Compressed format of S3 files. If empty, it indicates uncompressed files. Supported fields or Compressed format are "auto", "none", "gzip", "bzip2", "flate", "zlib", and "lz4".|
|auto|Compressed format: indicates that the file name extension automatically checks the compressed format of a file|
|none|Compressed format: indicates the uncompressed format, and the rest indicates the compressed format of the file|

## Example

```sql
create external table ex_table_cpk(clo1 tinyint,clo2 smallint,clo3 int,clo4 bigint,clo5 tinyint unsigned,clo6 smallint unsigned,clo7 int unsigned,clo8 bigint unsigned,col9 float,col10 double,col11 varchar(255),col12 Date,col13 DateTime,col14 timestamp,col15 bool,col16 decimal(5,2),col17 text,col18 varchar(255),col19 varchar(255),col20 varchar(255))infile{"filepath"='$resources/external_table_file/cpk_table_1.csv'};
```

For more information on creating an external table with an `s3option` mapping to an S3 file, see [Import the data from S3 Compatible object storage](../../../Develop/import-data/bulk-load/load-s3.md).

### INFILE Parquet syntax

MatrixOne also supports creating external tables on Parquet files using the `INFILE` clause:

```
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name (
    column1 type1,
    column2 type2,
    ...
) infile{"filepath"='<path>', "format"='parquet'};
```

| Parameter | Description |
|---|---|
| filepath | Path to the local file or directory containing Parquet files. |
| format | Set to `'parquet'` for Parquet-format external tables. |

### Hive-Style Partitioned Parquet External Tables

For Parquet files organized in Hive-style directory partitions (e.g., `year=2024/month=01/data.parquet`), use the following `INFILE` options:

```
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name (
    column1 type1,
    partition_col1 type_p1,
    partition_col2 type_p2,
    ...
) infile{
    "filepath"='<path>',
    "format"='parquet',
    "hive_partitioning"='true',
    "hive_partition_columns"='partition_col1,partition_col2'
};
```

| INFILE option | Required | Description |
|---|---|---|
| `hive_partitioning` | Yes | Set to `'true'` to enable Hive-style partition discovery. |
| `hive_partition_columns` | Yes | Comma-separated list of partition column names. Must match columns declared in the table schema (case-insensitive). |

**Partition column behavior:**

- Partition columns are declared as regular columns in the table schema and are filled from directory names.
- Column name matching is case-insensitive.
- `=` and `IN` predicates on partition columns are pruned at the file-listing stage for reduced I/O.
- Directory named `__HIVE_DEFAULT_PARTITION__` maps to SQL `NULL` for the partition column.
- The virtual column `__mo_filepath` returns the source file path for each row and is available on all external tables.

**Example — Single-level partition:**

<!-- validator-ignore-exec -->
```sql
DROP DATABASE IF EXISTS hive_single_demo;
CREATE DATABASE hive_single_demo;
USE hive_single_demo;

CREATE EXTERNAL TABLE hive_single (
    id INT,
    name VARCHAR(50),
    year INT
) infile{
    "filepath"='$resources/hive_partition/single_level/',
    "format"='parquet',
    "hive_partitioning"='true',
    "hive_partition_columns"='year'
};

SELECT * FROM hive_single WHERE year = 2024;
SELECT COUNT(DISTINCT __mo_filepath) FROM hive_single;

DROP DATABASE hive_single_demo;
```

**Example — Multi-level partition:**

<!-- validator-ignore-exec -->
```sql
DROP DATABASE IF EXISTS hive_multi_demo;
CREATE DATABASE hive_multi_demo;
USE hive_multi_demo;

CREATE EXTERNAL TABLE hive_multi (
    id INT,
    value DOUBLE,
    year INT,
    month VARCHAR(2)
) infile{
    "filepath"='$resources/hive_partition/multi_level/',
    "format"='parquet',
    "hive_partitioning"='true',
    "hive_partition_columns"='year,month'
};

SELECT * FROM hive_multi WHERE year = 2024 AND month = '01';

DROP DATABASE hive_multi_demo;
```

**Constraints and notes for Hive external tables:**

- The `'format'` must be `'parquet'`. CSV and other formats are not supported with hive partitioning.
- Partition columns cannot be of VECTOR type.
- `NOT NULL` partition columns reject directories named `__HIVE_DEFAULT_PARTITION__`.
- URL-encoded directory names (containing `%`) are not currently supported.
- When a Parquet file contains a physical column that overlaps with a partition column name, the partition value from the directory path overrides the physical column value.
- `LOAD DATA INFILE` into a hive-partitioned external table is rejected.

## **Constraints**

MatrixOne only supports `select` on **EXTERNAL TABLE**, `delete`, `insert`, and `update` is not supported.
