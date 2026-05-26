# **MySQL Compatibility**

This documentation primarily introduces the compatibility comparison information between the MySQL mode of MatrixOne database and the native MySQL database.

MatrixOne is highly compatible with the MySQL 8.0 protocol and commonly used features and syntax of MySQL 8.0. Additionally, MatrixOne provides support for commonly used MySQL-related tools, including Navicat, MySQL Workbench, JDBC, etc. However, due to the different technical architecture of MatrixOne and its ongoing development and improvement, some functionalities are not yet supported. This section will mainly discuss the differences between the MySQL mode of MatrixOne database and the native MySQL database from the following aspects:

- DDL Statements
- DCL Statements
- DML Statements
- Advanced SQL Features
- Data Types
- Indexes and Constraints
- Partition
- Functions and Operators
- Storage Engine
- Transaction
- Security and Permissions
- Backup and Restore
- System Variables
- Programming Language
- Peripheral Tools

## DDL statements

### About DATABASE

* A database with a Chinese name is not supported.
* `ENCRYPTION` are currently supported but do not work.
* `ALTER DATABASE` is not supported.
* Only the `utf8mb4` character set and `utf8mb4_bin` collation are supported by default and cannot be changed.

### About TABLE

* `ENGINE=` in the table definition is not supported.
* The clauses: `CHANGE [COLUMN]`, `MODIFY [COLUMN]`, `RENAME COLUMN`, `ADD [CONSTRAINT [symbol]] PRIMARY KEY`, `DROP PRIMARY KEY`, and `ALTER COLUMN ORDER BY` can be freely combined in `ALTER TABLE`, these are not supported to be used with other clauses for the time being.
* Temporary tables currently do not support using `ALTER TABLE` to modify the table structure.
* Tables created using `CREATE TABLE ... CLUSTER BY...` do not allow modifications to the table structure using `ALTER TABLE`.
* `ALTER TABLE` does not support `PARTITION` related operations.
* Support defining `Cluster by column` clauses to pre-sort a column to speed up queries.

### About VIEW

* The `with check option` clause is not supported, but MatrixOne simply ignores' ENGINE= '.
* The `DEFINER` and `SQL SECURITY` clauses are not supported.

### About SEQUENCE

* MySQL does not support `SEQUENCE` objects, but MatrixOne can create a sequence through `CREATE SEQUENCE`, and the syntax of MatrixOne is the same as PostgreSQL.
* When using `SEQUENCE` in a table, you must pay attention to the `auto_increment` and `sequence` cannot be used together; otherwise, an error will be occured.

## DCL Statement

### About ACCOUNT

* Multi Account is a unique function of MatrixOne, including related statements such as `CREATE/ALTER/DROP ACCOUNT`.

### About Permission

* `GRANT`, authorization logic is different from MySQL.

* `REVOLE`, the recovery logic is different from MySQL.

### About SHOW

* MatrixOne does not support performing SHOW operations on certain objects, including `TRIGGER`, `FUNCTION`, `EVENT`, `PROCEDURE`, `ENGINE`, and so on.
* Due to architectural differences, MatrixOne has implemented some SHOW commands solely for syntactic compatibility; these commands will not produce any output, such as `SHOW STATUS/PRIVILEGES`, etc.
* Although some commands have the same syntax as MySQL, their results differ significantly from MySQL due to different implementations. These commands include `SHOW GRANTS`, `SHOW ERRORS`, `SHOW PROCESSLIST`, `SHOW VARIABLES`.
* For the purpose of its own management, MatrixOne offers several unique SHOW commands such as `SHOW BACKEND SERVERS`, `SHOW ACCOUNTS`, `SHOW ROLES`, `SHOW NODE LIST`, and others.

### About SET

* The system variables in MatrixOne differ significantly from MySQL, with most only providing syntactic compatibility. The parameters that can be set at present include: `ROLE`, `SQL_MODE`, and `TIME_ZONE`.

## DML Statements

### About SELECT

* `SELECT...FOR UPDATE` only supports single-table queries.

### About INSERT

* MatrixOne does not support modifiers such as `LOW_PRIORITY`, `DELAYED`, `HIGH_PRIORITY`.

### About UPDATE

* MatrixOne does not support the use of `LOW_PRIORITY` and `IGNORE` modifiers.

### About DELETE

* MatrixOne does not support modifiers such as `LOW_PRIORITY`, `QUICK`, or `IGNORE`.

### About Subqueries

* MatrixOne does not support multi-level associated subqueries in `IN`.

### About LOAD

* MatrixOne supports `SET`, but only in the form of `SET columns_name=nullif(expr1,expr2)`.
* MatrixOne supports `LOAD DATA LOCAL` on the client side, but the `--local-infle` parameter must be added when connecting.
* MatrixOne supports the import of `JSONlines` files but requires some unique syntax.
* MatrixOne supports importing files from object storage but requires some unique syntax.

### About EXPLAIN

* MatrixOne's `Explain` and `Explain Analyze` printing formats refer to PostgreSQL, which differs from MySQL.
* JSON-type output is not supported.

### other

* The `REPLACE` statement does not currently support rows of values ​​inserted using the `VALUES row_constructor_list` parameter.

## Advanced SQL Features

* Triggers are not supported.
* Stored procedures are not supported.
* Event dispatchers are not supported.
* Materialized views are not supported.
* Support for custom functions, Python only, with big differences in use with MySQL.

## Stream Computing

* Streaming is unique to MatrixOne and currently version 1.2.3 only supports Kafka connectors.
* Kafka connectors need to be created and used with a special syntax.

## Data Types

* BOOL: Different from MySQL's Boolean value type, which is int, MatrixOne's `Boolean` value is a new type whose value can only be `True` or `False`.
* DECIMAL: `DECIMAL(P, D)`, the maximum precision of the effective number P and the number of digits after the decimal point D of MatrixOne is 38 digits, and MySQL is 65 and 30, respectively.
* Float numbers: The usage of `Float(M,D)` and `Double(M,D)` is discarded after MySQL 8.0.17, but MatrixOne still retains this usage.
* DATETIME: The maximum value range of MySQL is `'1000-01-01 00:00:00'` to `'9999-12-31 23:59:59'`, and the maximum range of MatrixOne is `'0001-01 -01 00:00:00'` to `'9999-12-31 23:59:59'`.
* TIMESTAMP: The maximum value range of MySQL is `'1970-01-01 00:00:01.000000'` UTC to `'2038-01-19 03:14:07.999999'` UTC, the maximum range of MatrixOne is `'0001- 01-01 00:00:00'` UTC to `'9999-12-31 23:59:59'` UTC.
* MatrixOne supports `UUID` type.
* MatrixOne supports vector types.
* MatrixOne supports datalink type.
* Spatial types are not supported.
* `SET` types are not supported.
* `MEDIUMINT` type is not supported.

## Indexes and Constraints

* MatrixOne supports vector indexing.
* Secondary indexes only implement syntax and have no speedup effect.
* Foreign keys do not support the `ON CASCADE DELETE` cascade delete.

## Partition Support

* Supports KEY, HASH, RANGE, RANGE COLUMNS, LIST, LIST COLUMNS.
* Supports KEY, HASH two kinds of partition cropping, the other four are not yet realized.
* Sub-partitioning only implements the syntax, not the function.
* ADD/DROP/TRUNCATE PARTITION is not yet supported.

## MatrixOne Keywords

* MatrixOne and MySQL keywords have many differences, see [MatrixOne Keywords](../../Reference/Language-Structure/keywords.md).

## Functions and Operators

### Aggregate Functions

* Support MatrixOne-specific Median function.

### Date and Time Functions

* MatrixOne's `TO_DATE` function is the same as MySQL's `STR_TO_DATE` function.

### CAST Function

* The type conversion rules are pretty different from MySQL; see [CAST](../../Reference/Operators/operators/cast-functions-and-operators/cast.md).

### Window functions

* Only `RANK`, `DENSE_RANK`, `ROW_NUMBER` are supported.

### JSON functions

* Only `JSON_UNQUOTE`, `JSON_QUOTE`, `JSON_EXTRACT` are supported.

### System Management functions

- `CURRENT_ROLE_NAME()`, `CURRENT_ROLE()`, `CURRENT_USER_NAME()`, `CURRENT_USER()`, `PURGE_LOG()` are supported.

## TAE Storage Engine

* MatrixOne's TAE storage engine is independently developed and does not support MySQL's InnoDB, MyISAM, or other engines.
* There is only a TAE storage engine in MatrixOne; there is no need to use `ENGINE=XXX` to change the engine.

## Security and Permissions

* Only using `ALTER USER` can change the password.
* Does not support modifying the upper limit of user connections.
* Connection IP whitelisting is not supported.
* Does not support `LOAD` file authorization management.
* Can support `SELECT INTO` file authorization management through the `CREATE STAGE` section.

## Transaction

* MatrixOne defaults to optimistic transactions.
* different from MySQL, DDL statements in MatrixOne are transactional, and DDL operations can be rolled back within a transaction.
* SET operations within a transaction are not allowed in MatrixOne.
* Table-level lock `LOCK/UNLOCK TABLE` is not supported.

## Backup and Restore

* Support for physical backups based on the mobackup tool.
* Snapshot backup support
* The mysqldump backup tool is not supported, only the mo-dump tool.
* Binlog log backup is not supported.

## System variables

* MatrixOne's lower_case_table_names has 2 modes, default is 1.
* MatrixOne's sql_mode only supports ONLY_FULL_GROUP_BY.

## System Tables

* MatrixOne's system tables have their own unique system tables, but also take into account MySQL's system tables as a whole.  
* The default mysql and information_schema libraries in MatrixOne are compatible with the MySQL usage model.
* The system_metrics system library in MatrixOne collects and stores a range of runtime status monitoring data for MatrixOne services.  
* The system_system library in MatrixOne collects statements and system logs executed by users and systems in MatrixOne.
* The mo_catalog system library in MatrixOne stores various database objects and metadata in MatrixOne.  

## Programming language

* Java, Python, C#, Golang connectors, and ORM are basically supported, and connectors and ORMs in other languages ​​may encounter compatibility issues.

## Other support tools

* Navicat, DBeaver, MySQL Workbench, and HeidiSQL are basically supported, but the support for table design functions could be better due to the incomplete ability of ALTER TABLE.
* The xtrabackup backup tool is not supported.
