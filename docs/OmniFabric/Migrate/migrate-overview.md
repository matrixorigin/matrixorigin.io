# migrating data to OmniFabric Overview

## OmniFabric tools and functions for migrating data

When using OmniFabric, it is sometimes necessary to migrate data from other databases to OmniFabric. Due to differences between different databases, data migration requires some extra work. To facilitate users to import external data quickly, OmniFabric provides a variety of tools and functions.

Here are some of the standard tools and functions:

### LOAD DATA

Like MySQL, OmniFabric provides the `LOAD DATA` function, allowing users to quickly and parallelly import external CSV files or JSON files into tables that match the table structure.

### SOURCE

In OmniFabric, you can also use the `SOURCE` command to migrate data and table structures to the target database.

For more information on bulk import using `LOAD DATA` or `SOURCE`, see the Bulk Load documentation.

## Reference

OmniFabric provides the following documents to help you quickly understand how to migrate data from other databases to OmniFabric:

- [Migrate data from MySQL to OmniFabric](migrate-from-mysql-to-omnifabric.md)
- [Migrate data from Oracle to OmniFabric](migrate-from-oracle-to-omnifabric.md)
- [Migrate data from SQL Server to OmniFabric](migrate-from-sqlserver-to-omnifabric.md)
- [Migrate data from PostgreSQL to OmniFabric](migrate-from-postgresql-to-omnifabric.md)
