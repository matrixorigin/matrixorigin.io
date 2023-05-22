# migrating data to MatrixOne Overview

## MatrixOne tools and functions for migrating data

When using MatrixOne, it is sometimes necessary to migrate data from other databases to MatrixOne. Due to differences between different databases, data migration requires some extra work. To facilitate users to import external data quickly, MatrixOne provides a variety of tools and functions.

Here are some of the standard tools and functions:

### LOAD DATA

Like MySQL, MatrixOne provides the LOAD DATA function, allowing users to quickly and parallelly import external CSV files or JSON files into tables that match the table structure.

For more information, see [Bulk Load Overview](../Develop/import-data/bulk-load/bulk-load-overview.md) for details.

### CN directly writes to S3

In MatrixOne, when the transaction size exceeds a certain threshold (about 10MB), the data in the transaction will no longer be written to the write-ahead log and directly to S3, thus significantly improving data writing performance. When data is migrated to MatrixOne, users can use this feature to complete data writing quickly. This feature will also be reflected in subsequent migrations.

## Reference

MatrixOne provides the following documents to help you quickly understand how to migrate data from other databases to MatrixOne:

- [Migrate data from MySQL to MatrixOne](migrate-from-mysql-to-matrixone.md)
- [Migrate data from Oracle to MatrixOne](migrate-from-oracle-to-matrixone.md)
- [Migrate data from SQL Server to MatrixOne](migrate-from-sqlserver-to-matrixone.md)
