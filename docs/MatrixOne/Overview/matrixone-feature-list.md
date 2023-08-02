# MatrixOne Features

This document lists the features supported by the latest version of MatrixOne and features that are common and in MatrixOne's roadmap but not currently supported.

## Data definition language (DDL)

| Data definition Language(DDL) | Supported(Y)/Not supported (N) /Experimental (E)|
| ----------------------------- | ---- |
| CREATE DATABASE          | Y                                            |
| DROP DATABASE            | Y                                            |
| ALTER DATABASE           | N                                            |
| CREATE TABLE             | Y                                            |
| ALTER TABLE              | E, Support modification of table name, addition and deletion of columns, does not support modification of columns        |
| RENAME TABLE             | N, Can be replaced by `ALTER TABLE tbl RENAME TO new_tbl`  |
| DROP TABLE               | Y                                            |
| CREATE INDEX             | Y, Secondary indexes have no speedup         |
| DROP INDEX               | Y                                            |
| MODIFY COLUMN            | N                                            |
| PRIMARY KEY              | Y                                            |
| CREATE VIEW              | Y                                            |
| ALTER VIEW               | Y                                            |
| DROP VIEW                | Y                                            |
| TRUNCATE TABLE           | Y                                            |
| AUTO_INCREMENT           | Y                                            |
| SEQUENCE                 | Y                                            |
| TEMPORARY TABLE          | Y                                            |
| CREATE STREAM            | N                                            |
| PARTITION BY             | E, Only some types are supported             |
| CHARSET, COLLATION       | N, Only UTF8 is supported by default         |

## SQL statements

| SQL Statement         | Supported(Y)/Not supported (N) /Experimental (E) |
| ---------------------- | ------------------------------------ |
| SELECT                 | Y                                  |
| INSERT                 | Y                                  |
| UPDATE                  | Y                                  |
| DELETE                  | Y                                  |
| REPLACE                  | N                                  |
| INSERT ON DUPLICATE KEY UPDATE        | Y                                  |
| LOAD DATA                     | Y                                  |
| SELECT INTO                  | Y                                  |
| INNER/LEFT/RIGHT/OUTER JOIN          | Y                                  |
| UNION, UNION ALL                  | Y                                  |
| EXCEPT, INTERSECT                 | Y                                  |
| GROUP BY, ORDER BY            | Y                                  |
| CLUSTER BY            | Y                                  |
| SUBQUERY                    | Y                                  |
| (Common Table Expressions, CTE)  | Y                                  |
| BEGIN/START TRANSACTION, COMMIT, ROLLBACK | Y                                  |
| EXPLAIN                                            | Y                                  |
| EXPLAIN ANALYZE                                    | Y                                  |
| LOCK/UNLOCK TABLE                           | N                                  |
| User-defined Variables                    | Y                                  |

## Advanced SQL Features

| Advanced SQL Features         | Supported(Y)/Not supported (N) /Experimental (E) |
| ----------------------------- | ---------------------------------- |
| PREPARE                 | Y                                  |
| STORED PROCEDURE     | N                                  |
| TRIGGER                | N                                  |
| EVENT SCHEDULER     | N                                  |
| UDF                 | N                                  |
| Materialized VIEW | N                                  |

## Data types

| Data type categories | Data types        | Supported(Y)/Not supported (N) /Experimental (E) |
| -------------------- | ----------------- | ---- |
| Integer Numbers     | TINYINT/SMALLINT/INT/BIGINT (UNSIGNED) | Y                                  |
|              | BIT                                    | N                                  |
| Real Numbers     | FLOAT                                  | Y                                  |
|              | DOUBLE                                 | Y                                  |
| String Types   | CHAR                                   | Y                                  |
|              | VARCHAR                                | Y                                  |
|              | BINARY                                 | Y                                  |
|              | VARBINARY                              | Y                                  |
|              | TINYTEXT/TEXT/MEDIUMTEXT/LONGTEXT      | Y                                  |
|              | ENUM                                   | N, Can be replaced by `VARCHAR` |
|              | SET                                    | N                                  |
| Binary Types   | TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB      | Y                                  |
| Time and Date Types   | DATE                                   | Y                                  |
|              | TIME                                   | Y                                  |
|              | DATETIME                               | Y                                  |
|              | TIMESTAMP                              | Y                                  |
|              | YEAR                                   | N                                  |
| Boolean      | BOOL                                   | Y                                  |
| Decimal Types | DECIMAL | Y, up to 38 digits |
| JSON Types | JSON | Y |
| vector type | VECTOR | N |
| Spatial Type | SPATIAL | N |

## Indexing and constraints

| Indexing and constraints             | Supported(Y)/Not supported (N) /Experimental (E) |
| ------------------------------------ | ---- |
| PRIMARY KEY                          | Y    |
| Composite PRIMARY KEY                | Y    |
| UNIQUE KEY                           | Y   |
| Secondary KEY                        | Y, Syntax only implementation  |
| FOREIGN KEY                          | Y    |
| Enforced Constraints on Invalid Data | Y    |
| ENUM and SET Constraints             | N    |
| NOT NULL Constraint                  | Y    |
| AUTO INCREMENT Constraint            | Y     |

## Transactions

| Transactions             | Supported(Y)/Not supported (N) /Experimental (E) |
| ------------------------ | ---- |
| Pessimistic transactions | E    |
| Optimistic transactions  | Y    |
| Distributed Transaction  | Y    |
| Snapshot Isolation       | Y    |
| READ COMMITTED           | E    |

## Functions and Operators

| Functions and Operators Categories | Supported(Y)/Not supported (N) /Experimental (E)    |
| ---------------------------------- | ------------------- |
| Aggregate Functions       | Y                                  |
| Mathematical     | Y                                  |
| Datetime | Y                                  |
| String     | Y                                  |
| CAST       | Y                                  |
| Flow Control Functions   | E                                  |
| Window Functions       | Y                                  |
| JSON Functions       | Y                                  |
| Other Functions       | Y                                  |
| Operators        | Y                                  |

## PARTITION

| PARTITION         | Supported(Y)/Not supported (N) /Experimental (E) |
| ----------------- | ---------------------------------- |
| KEY(column_list)  | E                                  |
| HASH(expr)        | E                                  |
| RANGE(expr)       | E                                  |
| RANGE COLUMNS     | E                                  |
| LIST              | E                                  |
| LIST COLUMNS      | E                                  |

## Import and Export

| Import and Export    | Supported(Y)/Not supported (N) /Experimental (E) |
| ----------------- | ---------------------------------- |
| LOAD DATA | Y                                  |
| SOURCE     | Y                                  |
| Load data from S3 | Y                                  |
| modump| Y                                  |
| mysqldump | N                                  |

## Security and Access Control

| Security | Supported(Y)/Not supported (N) /Experimental (E) |
| -------------------------- | ---------------------- ------------ |
| Transport Layer Encryption TLS | Y |
| Encryption at rest | Y |
| Import from Object Storage | Y |
| Role-Based Access Control (RBAC) | Y |
| Multi-Account | Y |

## Backup and Restore

| Backup and Restore   | Supported(Y)/Not supported (N) /Experimental (E) |
| ------------ | ---------------------------------- |
| Logical Backup and Restore | Y, Only the modump tool is supported                |
| Physical Backup and Restore | N                                  |

## Management Tool

| Management Tool             | Supported(Y)/Not supported (N) /Experimental (E) |
| -------------------- | ---------------------------------- |
| Stand-alone mo_ctl deployment management | Y |
| Distributed mo_ctl deployment management | E, Enterprise Edition only |
| Visual management platform | E, Public cloud version only |
| System Logging | Y |
| System indicator monitoring | Y |
| Slow query log | Y |
| SQL record | Y |
| Kubernetes operator | Y |

## Deployment Method

| Deployment Method | Supported(Y)/Not supported (N) /Experimental (E) |
| -------------------- | ---------------------------- ------- |
| Stand-alone environment privatization deployment | Y |
| Distributed environment privatization deployment | Y, self-built Kubernetes and minIO object storage |
| Alibaba Cloud distributed self-built deployment | Y, ACK+OSS |
| Tencent Cloud Distributed Self-built Deployment | Y, TKE+COS |
| AWS distributed self-built deployment | Y, EKS+S3 |
| Public Cloud Serverless | Y, MatrixOne Cloud, Support AWS, Alibaba Cloud |
