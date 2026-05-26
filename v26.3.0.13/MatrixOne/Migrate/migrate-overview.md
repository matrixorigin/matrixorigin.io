# migrating data to MatrixOne Overview

## MatrixOne tools and functions for migrating data

When using MatrixOne, it is sometimes necessary to migrate data from other databases to MatrixOne. Due to differences between different databases, data migration requires some extra work. To facilitate users to import external data quickly, MatrixOne provides a variety of tools and functions.

Here are some of the standard tools and functions:

### LOAD DATA

Like MySQL, MatrixOne provides the `LOAD DATA` function, allowing users to quickly and parallelly import external CSV files or JSON files into tables that match the table structure.

### SOURCE

In MatrixOne, you can also use the `SOURCE` command to migrate data and table structures to the target database.

For more information on bulk import using `LOAD DATA` or `SOURCE`, see [Bulk Load Overview](../Develop/import-data/bulk-load/bulk-load-overview.md).

## Reference

MatrixOne provides the following documents to help you quickly understand how to migrate data from other databases to MatrixOne:

- [Migrate data from MySQL to MatrixOne](migrate-from-mysql-to-matrixone.md)
- [Migrate data from Oracle to MatrixOne](migrate-from-oracle-to-matrixone.md)
- [Migrate data from SQL Server to MatrixOne](migrate-from-sqlserver-to-matrixone.md)
- [Migrate data from PostgreSQL to MatrixOne](migrate-from-postgresql-to-matrixone.md)
