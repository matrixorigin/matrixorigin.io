# MatrixOne database statistics

MatrixOne database statistics refer to the related information of tables and columns obtained through sampling and statistics of the database, for example, the number of tables, the number of columns of tables, the storage space occupied by tables, and so on. When MatrixOne database generates an execution plan, it needs to estimate based on statistical information to calculate the optimal execution plan.

The statistics dimensions of the MatrixOne database are as follows:

## The number of tables in the database

This command shows the total number of tables in the specified database.

**Syntax**:

```
SHOW TABLE_NUMBER FROM {DATABASE_NAME}
```

### Example

- **Example 1**: Check the total number of tables in the system database mo_catalog:

```sql
mysql> show table_number from mo_catalog;
+--------------------------------+
| Number of tables in mo_catalog |
+--------------------------------+
|                             11 |
+--------------------------------+

-- Verify which tables in mo_catalog
mysql> use mo_catalog;
mysql> show tables;
+----------------------------+
| Tables_in_mo_catalog       |
+----------------------------+
| mo_user                    |
| mo_account                 |
| mo_role                    |
| mo_user_grant              |
| mo_role_grant              |
| mo_role_privs              |
| mo_user_defined_function   |
| mo_columns                 |
| mo_mysql_compatbility_mode |
| mo_tables                  |
| mo_database                |
+----------------------------+
11 rows in set (0.01 sec)
```

- **Example 2**: Create a new database, and create new tables, check the number of tables in the specific database:

```
create database demo_1;
use demo_1;
-- Create three new tables
CREATE TABLE t1(a bigint, b varchar(10), c varchar(10));
CREATE TABLE t2(a bigint, b int);
CREATE TABLE t3(a int, b varchar(10), c varchar(10));

-- Query out that there are three tables in the database demo_1
mysql> show table_number from demo_1;
+----------------------------+
| Number of tables in demo_1 |
+----------------------------+
|                          3 |
+----------------------------+
1 row in set (0.01 sec)
```

## The number of columns in the table

This command shows the total number of columns in the specified table.

**Syntax**:

```
SHOW COLUMN_NUMBER FROM {[DATABASE_NAME.]TABLE_NAME}
```

### Example

```sql
use mo_catalog;
use mo_user;
mysql> show column_number from mo_user;
+------------------------------+
| Number of columns in mo_user |
+------------------------------+
|                           11 |
+------------------------------+

-- Or use the following command
mysql> show column_number from mo_catalog.mo_user;
+------------------------------+
| Number of columns in mo_user |
+------------------------------+
|                           11 |
+------------------------------+

-- Verify which columns in the table
mysql> desc mo_catalog.mo_user;
+-----------------------+--------------+------+------+---------+-------+---------+
| Field                 | Type         | Null | Key  | Default | Extra | Comment |
+-----------------------+--------------+------+------+---------+-------+---------+
| user_id               | INT          | YES  |      | NULL    |       |         |
| user_host             | VARCHAR(100) | YES  |      | NULL    |       |         |
| user_name             | VARCHAR(300) | YES  |      | NULL    |       |         |
| authentication_string | VARCHAR(100) | YES  |      | NULL    |       |         |
| status                | VARCHAR(8)   | YES  |      | NULL    |       |         |
| created_time          | TIMESTAMP    | YES  |      | NULL    |       |         |
| expired_time          | TIMESTAMP    | YES  |      | NULL    |       |         |
| login_type            | VARCHAR(16)  | YES  |      | NULL    |       |         |
| creator               | INT          | YES  |      | NULL    |       |         |
| owner                 | INT          | YES  |      | NULL    |       |         |
| default_role          | INT          | YES  |      | NULL    |       |         |
+-----------------------+--------------+------+------+---------+-------+---------+
11 rows in set (0.01 sec)
```

## The maximum and minimum values ​​contained in all columns in the table

This command shows the maximum and minimum values ​​of each column in the specified table.

__Note:__ If the data types of the column values ​​in the specified table are inconsistent, the sorting rules are: numbers are sorted according to the size of numbers; dates are sorted according to time; characters are sorted according to ASCII code; when several data types are mixed, then First convert to character type, and then sort according to ASCII code.

**Syntax**:

```
SHOW TABLE_VALUES FROM {[DATABASE_NAME.]TABLE_NAME}
```

### Example

```sql
create table t1(
col1 int,
col2 float,
col3 varchar
);
insert into t1 values(1,1.11,'1.111'),(2,2.22,'1.222'),(3,0,'abc');

mysql> show table_values from t1;
+-----------+-----------+-----------+-----------+-----------+-----------+
| max(col1) | min(col1) | max(col2) | min(col2) | max(col3) | min(col3) |
+-----------+-----------+-----------+-----------+-----------+-----------+
|         3 |         1 |      2.22 |         0 | abc       | 1.111     |
+-----------+-----------+-----------+-----------+-----------+-----------+
```

## The total number of rows of data in the table

This command shows the total number of rows of data in a table in the database.

**Syntax**:

```
SELECT MO_TABLE_ROWS({DATABASE_NAME},{TABLE_NAME})
```

### Example

```sql
-- Query the total number of rows of mo_tables in mo_catalog
mysql> select mo_table_rows('mo_catalog','mo_tables');
+--------------------------------------+
| mo_table_rows(mo_catalog, mo_tables) |
+--------------------------------------+
|                                   64 |
+--------------------------------------+
```

## The space occupied by the table in storage

This command shows the storage space occupied by a specific table in the database can be obtained, and the unit is the number of bytes.

**Syntax**:

```
SELECT MO_TABLE_SIZE({DATABASE_NAME},{TABLE_NAME})
```

### Example

```sql
-- Query the storage space occupied by the table mo_tables in the database mo_catalog
mysql> select mo_table_size('mo_catalog','mo_tables');
+--------------------------------------+
| mo_table_size(mo_catalog, mo_tables) |
+--------------------------------------+
|                                16128 |
+--------------------------------------+
```
