# **MySQL Compatibility**

MatrixOne SQL syntax conforms with MySQL 8.0.23 version.

|  SQL Type   | SQL Syntax  |  Compability with MySQL8.0.23   |
|  ----  | ----  |  ----  |
| Data Definition Language（DDL)  | CREATE DATABASE | A database with Chinese name is not supported. |
|   |   | Names with Latins support limitedly.  |
|   |   | `CHARSET`, `COLLATE`, `ENCRYPTION` can be used but don't work. |
|   |  CREATE TABLE | Partition tables are not supported.  |
|   |   | Create table .. as clause is not supported now. |
|   |   | All column level constraints are not supported now. |
|   |   | KEY(column) is not supported yet.|
| | | AUTO_INCREMENT is supported limitedly. The custom starting value is not supported yet.|
|   | CREATE other projects | CREATE/DROP INDEX is not supported. |
|   | ALTER | Not supported now.  |
|   |DROP DATABASE| 	Same as MySQL.|
|   |DROP TABLE	| Same as MySQL.|
||CREAT VIEW|The `with check option` clause is not supported yet.|
| Data Manipulation Language (DML)  |UPDATA|Same as MySQL.|
||DELETE|Same as MySQL.|
||INSERT | LOW_PRIORITY, DELAYED, HIGH_PRIORITY are not supported now.  |
|   |   | INSERT INTO VALUES with function or expression is not supported now. |
|   |   | Batch Insert can be supported up to 160,000 rows.  |
|   |   | ON DUPLICATE KEY UPDATE is not supported  now.  |
|   |   | DELAYED is not supported now.  |
|   |   | Names with Latins support limitedly.  |
|   |   | The current SQL mode is just like only_full_group_by mode in MySQL.  |
|   | SELECT | Table alias is not supported in GROUP BY.  |
|   |   | Distinct is limitedly support.  |
|   |   | SELECT...FOR UPDATE clause is not supported now.  |
|   |   | INTO OUTFILE is limitedly support. |
|   | LOAD DATA | Only csv files can be loaded currently.  |
|   |   | The enclosed character should be "".  |
|   |   | FIELDS TERMINATED BY should be "," or "|
|   |   | LINES TERMINATED BY should be "\n". |
|   |   | SET is supported limitedly. Only `SET columns_name=nullif(expr1,expr2)` is supported. |
|   |   | Local key word is not supported now. |
|   |   | Relative path is limited supported now. Only based on mo-server file can be supported. |
||JOIN|Same as MySQL.|
| | SUBQUERY | Non-scalar subquery is not supported now. |
| Database Administration Statements  | SHOW | `SHOW` statement is supported limitedly.  |
| Utility Statements  | Explain | The result of explain a SQL is different with MySQL. |
|||`json` output is not supported yet.|
|   | Other statements | Not supported now.  |
| Data Types | Boolean | Different from MySQL's boolean which is the same as int , MatrixOne's boolean is a new type, its value can only be true or false. |
||Int/Bigint/Smallint/Tinyint|Same as MySQL.|
||char/varchar|Same as MySQL.|
|   | Float/double | The precision is a bit different with MySQL.  |
| | DECIMAL | The max precision is 38 digits. |
|   | Date | Only 'YYYY-MM-DD' and 'YYYYMMDD' formats are supported.  |
|   | Datetime | Only 'YYYY-MM-DD HH:MM:SS' and 'YYYYMMDD HH:MM:SS' formats are supported.  |
|   | Other types | Not supported now.  |
| Operators  | "+","-","*","/"|Same as MySQL.|
||	DIV, %, MOD|Same as MySQL.|
||LIKE|Same as MySQL.|
||IN | Supported for constant lists  |
||NOT, AND, &&,OR, "\|\|" | Same as MySQL.|
|   | CAST | Supported with different conversion rules. |
| Functions | any_value | Any_value is an aggregate function in MatrixOne. Cannot be used in group by or filter condition. |
||`REGEXP_INSTR()`，`REGEXP_LIKE()`，`REGEXP_REPLACE()`，`REGEXP_SUBSTR()`|The third parameter is not supported yet|
||to_date|Only constants are supported for date entries|
|System command|SHOW GRANTS FOR USERS| Only the permissions of directly authorized roles can be displayed. The rights of inherited roles cannot be shown. |
