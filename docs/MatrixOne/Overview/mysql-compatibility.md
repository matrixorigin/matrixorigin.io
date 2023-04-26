# **MySQL Compatibility**

MatrixOne SQL syntax conforms with MySQL 8.0.23 version.

|  SQL Type   | SQL Syntax  |  Compability with MySQL8.0.23   |
|  ----  | ----  |  ----  |
| Data Definition Language(DDL)  | CREATE DATABASE | A database with Chinese name is not supported. |
|   |   | Names with Latins support limitedly.  |
|   |   | `CHARSET`, `COLLATE`, `ENCRYPTION` can be used but don't work. |
|   |  CREATE TABLE | Partition tables are not supported.  |
|   |   | Create table .. as clause is not supported now. |
|   |   | All column level constraints are not supported now. |
|   |   | KEY(column) is not supported yet.|
| | | AUTO_INCREMENT is supported limitedly. The custom starting value is not supported yet.|
|   | ALTER | `ALTER TABLE` is only partially supported  |
|   |DROP DATABASE|Same as MySQL.|
|   |DROP TABLE	| Same as MySQL.|
||CREAT VIEW|The `with check option` clause is not supported yet.|
||DROP VIEW|Same as MySQL.|
||CREAT SEQUENCE|Same as MySQL.|
||DROP SEQUENCE|Same as MySQL.|
| Data Manipulation Language (DML)  |UPDATA|Same as MySQL.|
||DELETE|Same as MySQL.|
||INSERT | LOW_PRIORITY, DELAYED, HIGH_PRIORITY are not supported now.  |
|   |   | INSERT INTO VALUES with function or expression is not supported now. |
|   |   | Batch Insert can be supported up to 160,000 rows.  |
|   |   | DELAYED is not supported now.  |
|   |   | Names with Latins support limitedly.  |
|   |   | The current SQL mode is just like only_full_group_by mode in MySQL.  |
|   | SELECT | Table alias is not supported in GROUP BY.  |
|   |   | Distinct is limitedly supported.  |
|   |   | SELECT...FOR UPDATE clause is not supported now.  |
|   |   | INTO OUTFILE is limitedly support. |
|   | LOAD DATA | csv or jsonline files can be loaded currently.  |
|   |   | The enclosed character should be "".  |
|   |   | `FIELDS TERMINATED BY` should be "," or "|
|   |   | `LINES TERMINATED BY` should be "\n". |
|   |   | `SET` is supported limitedly. Only `SET columns_name=nullif(expr1,expr2)` is supported. |
|   |   | Local key word is not supported now. |
|   |   | `ESCAPED BY` is not supported now. |
||JOIN|Same as MySQL.|
| | SUBQUERY | Non-scalar subquery is supported limitedly. |
| Data Control Language  |CREATE ACCOUNT| MatrixOne creates a cluster account, the syntax is the same as MySQL, and the account resource isolation logic is different from MySQL|
||CREATE ROLE| Same as MySQL.|
||CREATE USER|Same as MySQL.L|
||ALTER ACCOUNT|The syntax is the same as that of MySQL, currently only supports changing passwords and pausing and restoring account operations|
||ALTER USER|Same as MySQL. Currently only account administrators or system administrators are supported to modify user passwords, and only one user's password can be modified at a time.|
||DROP ACCOUNT|Same as MySQL.|
||DROP ROLE|Same as MySQL.|
||DROP USER|Same as MySQL.|
||GRANT|The syntax is the same as that of MySQL, authorization logic is different from MySQL|
||ROVOKE|The syntax is the same as that of MySQL, the logic of revoke permissions is different from MySQL. |
| Database Administration Statements  | SHOW | `SHOW` statement is supported limitedly, currently only supports `SHOW ACCOUNTS`/`SHOW DATABASES`/`SHOW CREATE TABLE`/`SHOW CREATE VIEW`/`SHOW TABLES`/`SHOW INDEX`/`SHOW COLLATION`/`SHOW COLUMNS`/`SHOW FUNCTION STATUS`/`SHOW GRANT`/`SHOW ROLES`/`SHOW SEQUENCE`/`SHOW VARIABLES`/`SHOW NODE LIST` |
||SHOW GRANTS FOR USERS| Only the permissions of directly authorized roles can be seen, and the permissions of inherited roles cannot be displayed|
| Utility Statements  | Explain | The result of explain a SQL is different with MySQL. |
|||`json` output is not supported yet.|
|   | PREPARED | Support `PREPARE`/`EXCUTE`/`DEALLOCATE` |
|   | Other statements | Not supported now.  |
| Data Types | BOOLEAN | Different from MySQL's boolean which is the same as int , MatrixOne's boolean is a new type, its value can only be true or false. |
||INT/BIGINT/SMALLINT/TINYINT/INT UNSIGNED/BIGINT UNSIGNED|Same as MySQL.|
||CHAR/VARCHAR/BINARY/VARBINARY/TEXT/BLOB/ENUM |Same as MySQL.|
|   | FLOAT/DOUBLE | The precision is a bit different with MySQL.  |
| | DECIMAL | The max precision is 38 digits. |
|   | DATE | Only 'YYYY-MM-DD' and 'YYYYMMDD' formats are supported.  |
|   | DATETIME | Only 'YYYY-MM-DD HH:MM:SS' and 'YYYYMMDD HH:MM:SS' formats are supported.  |
| | TIMESTAMP | Same as MySQL. |
| | JSON | Same as MySQL.  |
|   | Other types | Not supported now.  |
| Operators  | "+","-","*","/"|Same as MySQL.|
||	DIV, %, MOD|Same as MySQL.|
||LIKE|Same as MySQL.|
||IN | Supported for constant lists  |
||NOT, AND, &&,OR, "\|\|" | Same as MySQL.|
|   | CAST | Supported with different conversion rules. |
| Functions |  MAX, MIN, COUNT, AVG, SUM | Same as MySQL. |
||ANY_VALUE | ANY_VALUE is an aggregate function in MatrixOne. Cannot be used in group by or filter condition. |
||`REGEXP_INSTR()`,`REGEXP_LIKE()`,`REGEXP_REPLACE()`,`REGEXP_SUBSTR()`|The third parameter is not supported yet|
||TO_DATE|Only constants are supported for date entries|
|System command|SHOW GRANTS FOR USERS| Only the permissions of directly authorized roles can be displayed. The rights of inherited roles cannot be shown. |
