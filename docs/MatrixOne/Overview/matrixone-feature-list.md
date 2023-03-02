# MatrixOne Features

This document lists the features supported by MatrixOne for the latest version.

## Data definition language (DDL)

| Data definition Language(DDL) | Supported(Y)/Not supported (N)  |
| ----------------------------- | ---- |
| CREATE DATABASE               | Y    |
| DROP DATABASE                 | Y    |
| RENAME DATABASE               | N    |
| CREATE TABLE                  | Y    |
| ALTER TABLE                   | N    |
| RENAME TABLE                  | N    |
| DROP TABLE                    | Y    |
| CREATE INDEX                  | Y    |
| DROP INDEX                    | Y    |
| MODIFY COLUMN                 | N    |
| PRIMARY KEY                   | Y    |
| CREATE VIEW                   | Y    |
| ALTER VIEW                    | Y    |
| DROP VIEW                     | Y    |
| CREATE OR REPLACE VIEW        | N    |
| TRUNCATE                      | N    |
| SEQUENCE                      | N    |
| AUTO_INCREMENT                | Y    |
| Temporary tables              | Y    |

## SQL statements

| SQL Statement                       | Supported(Y)/Not supported (N)  |
| ----------------------------------- | ---- |
| SELECT                              | Y    |
| INSERT                              | Y    |
| UPDATE                              | Y    |
| DELETE                              | Y    |
| REPLACE                             | N    |
| INSERT ON DUPLICATE KEY             | N    |
| LOAD DATA INFILE                    | Y    |
| SELECT INTO OUTFILE                 | Y    |
| INNER/LEFT/RIGHT/OUTER JOIN         | Y    |
| UNION, UNION ALL                    | Y    |
| EXCEPT, INTERSECT                   | Y    |
| GROUP BY, ORDER BY                  | Y    |
| Common Table Expressions(CTE)       | Y    |
| START TRANSACTION, COMMIT, ROLLBACK | Y    |
| EXPLAIN                             | Y    |
| EXPLAIN ANALYZE                     | Y    |
| Stored Procedure                    | N    |
| Trigger                             | N    |
| Event Scheduler                     | N    |
| PARTITION BY                        | Y    |
| LOCK TABLE                          | N    |

## Data types

| Data type categories | Data types        | Supported(Y)/Not supported (N)  |
| -------------------- | ----------------- | ---- |
| Integer Numbers      | TINYINT           | Y    |
|                      | SMALLINT          | Y    |
|                      | INT               | Y    |
|                      | BIGINT            | Y    |
|                      | TINYINT UNSIGNED  | Y    |
|                      | SMALLINT UNSIGNED | Y    |
|                      | INT UNSIGNED      | Y    |
|                      | BIGINT UNSIGNED   | Y    |
| Real Numbers         | FLOAT             | Y    |
|                      | DOUBLE            | Y    |
| String Types         | CHAR              | Y    |
|                      | VARCHAR           | Y    |
|                      | TINYTEXT          | Y    |
|                      | TEXT              | Y    |
|                      | MEDIUMTEXT        | Y    |
|                      | LONGTEXT          | Y    |
| Binary Types         | TINYBLOB          | Y    |
|                      | BLOB              | Y    |
|                      | MEDIUMBLOB        | Y    |
|                      | LONGBLOB          | Y    |
| Time and Date Types  | Date              | Y    |
|                      | Time              | Y    |
|                      | DateTime          | Y    |
|                      | Timestamp         | Y    |
| Boolean Type         | BOOL              | Y    |
| Decimal Type         | DECIMAL           | Y    |
| JSON Type            | JSON              | Y    |

## Indexing and constraints

| Indexing and constraints             | Supported(Y)/Not supported (N)  |
| ------------------------------------ | ---- |
| PRIMARY KEY                          | Y    |
| Composite PRIMARY KEY                | Y    |
| UNIQUE KEY                           | Y   |
| Secondary KEY                        | Y, Syntax only implementation  |
| FOREIGN KEY                          | Y    |
| Enforced Constraints on Invalid Data | Y    |
| ENUM and SET Constraints             | N    |
| NOT NULL Constraint                  | Y    |

## Transactions

| Transactions             | Supported(Y)/Not supported (N)  |
| ------------------------ | ---- |
| 1PC                      | Y    |
| Pessimistic transactions | N    |
| Optimistic transactions  | Y    |
| Distributed Transaction  | Y    |
| Snapshot Isolation       | Y    |

## Functions and Operators

| Functions and Operators Categories | Name                |
| ---------------------------------- | ------------------- |
| Aggregate functions                | AVG()                |
|                                    | MAX()               |
|                                    | MIN()               |
|                                    | Median()            |
|                                    | SUM()               |
|                                    | ANY_VALUE()         |
|                                    | BIT_OR()            |
|                                    | BIT_AND()           |
|                                    | BIT_XOR()           |
|                                    | STD()               |
|                                    | VARIANCE()          |
|                                    | GROUP_CONCAT()      |
|                                    | SLEEP()             |
| Mathematical functions             | ABS()               |
|                                    | SIN()               |
|                                    | COS()               |
|                                    | TAN()               |
|                                    | COT()               |
|                                    | ACOS()              |
|                                    | ATAN()              |
|                                    | SINH()              |
|                                    | FLOOR()             |
|                                    | ROUND()             |
|                                    | CEIL()              |
|                                    | POWER()             |
|                                    | PI()                |
|                                    | LOG()               |
|                                    | LN()                |
|                                    | UUID()              |
|                                    | EXP()               |
| Datetime functions                 | DATE_FORMAT()       |
|                                    | YEAR()              |
|                                    | MONTH()             |
|                                    | DATE()              |
|                                    | WEEKDAY()           |
|                                    | TIMESTAMP()         |
|                                    | DAYOFYEAR()         |
|                                    | EXTRACT()           |
|                                    | DATE_ADD()          |
|                                    | DATE_SUB()          |
|                                    | TO_DATE()           |
|                                    | DAY()               |
|                                    | UNIX_TIMESTAMP()    |
|                                    | FROM_UNIXTIME()     |
|                                    | UTC_TIMESTAMP()     |
|                                    | NOW()               |
|                                    | CURRENT_TIMESTAMP() |
|                                    | DATEDIFF()          |
|                                    | TIMEDIFF()          |
|                                    | CURDATE()           |
| String functions                   | BIN()               |
|                                    | BIT_LENGTH()        |
|                                    | HEX()               |
|                                    | CONCAT()            |
|                                    | CONCAT_WS()         |
|                                    | FIND_IN_SET()       |
|                                    | FORMAT()            |
|                                    | OCT()               |
|                                    | EMPTY()             |
|                                    | LENGTH()            |
|                                    | BIT_LENGTH()        |
|                                    | LENGTHUTF8()        |
|                                    | CHAR_LENGTH()       |
|                                    | LEFT()              |
|                                    | TRIM()              |
|                                    | LTRIM()             |
|                                    | RTRIM()             |
|                                    | LPAD()              |
|                                    | RPAD()              |
|                                    | STARTSWITH()        |
|                                    | ENDSWITH()          |
|                                    | SUBSTRING()         |
|                                    | SPACE()             |
|                                    | REVERSE()           |
|                                    | SUBSTRING_INDEX()   |
|                                    | FIELD()             |
| Operators                          | %, MOD              |
|                                    | +                   |
|                                    | -                   |
|                                    | /                   |
|                                    | Div                 |
|                                    | =                   |
|                                    | &                   |
|                                    | >>                  |
|                                    | <<                  |
|                                    | ^                   |
|                                    | \|                  |
|                                    | ~                   |
|                                    | CAST()              |
|                                    | CONVERT()           |
|                                    | >                   |
|                                    | >=                  |
|                                    | <                   |
|                                    | <>, !=              |
|                                    | <=                  |
|                                    | =                   |
|                                    | LIKE                |
|                                    | BETWEEN ... AND ... |
|                                    | IN()                |
|                                    | IS/IS NOT           |
|                                    | IS/IS NOT NULL      |
|                                    | NOT BETWEEN ... AND ... |
|                                    | LIKE                |
|                                    | NOT LIKE            |
|                                    | COALESCE()          |
|                                    | CASE...WHEN         |
|                                    | IF                  |
|                                    | AND                 |
|                                    | OR                  |
|                                    | XOR                 |
|                                    | NOT                 |
