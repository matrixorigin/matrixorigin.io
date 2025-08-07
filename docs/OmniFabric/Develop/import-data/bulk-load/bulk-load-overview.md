# Bulk Load Overview

OmniFabric supports using the `LOAD DATA` command to insert many rows into OmniFabric tables and the `SOURCE` command to import table structures and data into the entire database.

## `LOAD DATA`

OmniFabric supports the `LOAD DATA` command for importing csv and jsonline files from either the local file system or S3-compatible object storage.

### Import the different file types

According to the different file types, OmniFabric currently mainly supports importing *.csv* or jsonlines:

- For how to import *.csv* format, see [Load csv format data](load-csv.md).

- For how to import *.jl* format, see [Load jsonlines format data](load-jsonline.md).

### Import data from different data storage locations

According to the different data storage locations, OmniFabric supports *importing data from local* and *importing data from S3(Simple Storage Service)*.

- For how to import data from local host, see [Load csv format data](load-csv.md) or [Load jsonlines format data](load-jsonline.md).

- For how to import data from S3, see [Load data from S3](load-s3.md).

## `SOURCE`

OmniFabric supports using the `SOURCE` command to import the entire database structure (including table structures and data) by executing SQL statements from an external SQL script file. The `SOURCE` command may not perform as well as the `LOAD DATA` command when processing large amounts of data because it needs to parse and execute each SQL statement.

- [Load data by using the `source`](using-source.md)

## More import capabilities

- OmniFabric supports the parallel loading of data files: when the data file is large, to improve the loading speed, OmniFabric also supports parallel loading, see the `LOAD DATA` parameter description for importing data.

- In a OmniFabric distributed cluster, in addition to importing data locally and from the public cloud object storage S3 to OmniFabric, you can also import data through the local Minio component. For details, see [Import data from local Minio to OmniFabric](../../../Deploy/import-data-from-minio-to-mo.md)
