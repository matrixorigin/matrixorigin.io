# CREATE TABLE AS SELECT

## Syntax Description

The `CREATE TABLE AS SELECT` command creates a new table by copying column definitions and column data from an existing table specified in the `SELECT` query. However, it does not copy constraints, indexes, views, or other non-data attributes of the original table.

## Syntax structure

```
> CREATE [TEMPORARY] TABLE [ IF NOT EXISTS ] table_name
[ (column_name [, ...] ) ] AS {query}

Query can be any select statement in MO syntax.

SELECT
[ALL | DISTINCT ]
select_expr [, select_expr] [[AS] alias] ...
[INTO variable [, ...]]
[FROM table_references
[WHERE where_condition]
[GROUP BY {col_name | expr | position}
[ASC | DESC]]
[HAVING where_condition]
[ORDER BY {col_name | expr | position}
[ASC | DESC]] [ NULLS { FIRST | LAST } ]
[LIMIT {[offset,] row_count | row_count OFFSET offset}]
```

## Grammatical interpretation

- ALL: Default option to return all matching rows, including duplicate rows.

- DISTINCT: Indicates that only unique rows are returned, i.e. duplicate rows are removed.

- select_expr: Indicates the column or expression to select.

- AS alias: Specifies an alias for the selected column or expression.

- [INTO variable[, ...]: Used to store query results in a variable instead of returning them to the client.

- [FROM table_references]: Specifies which table or tables to retrieve data from. table_references can be a table name or a complex expression (such as a join) with multiple tables.

- [WHERE where_condition]: Used to filter the result set to return only rows that satisfy the where_condition condition.

- [GROUP BY {col_name | expr | position} [ASC | DESC]]: Used to group result sets by one or more columns or expressions; ASC and DESC are used to specify how rows within a group are sorted.

- [HAVING where_condition]: Filter groups after they are grouped. Usually used with GROUP BY to filter out groups that do not meet the criteria.

- [ORDER BY {col_name | expr | position} [ASC | DESC] [NULLS {FIRST | LAST}]: Used to sort result sets; ASC and DESC are used to specify sorting methods.

- [NULLS {FIRST | LAST}]: Used to specify how to handle the position of NULL values in the sort.

- [LIMIT {[offset,] row_count | row_count OFFSET offset}]: Used to limit the number of rows returned. offset specifies which row of the result set to return from, with 0 being the first row. row_count Specifies the number of rows returned.

## Permissions

In `Matrixone`, executing the `CREATE TABLE AS SELECT` statement requires at least the following permissions:

- `CREATE` permissions: Users need to have permissions to create tables, which can be done with `CREATE` permissions.

- `INSERT` permission: Because the `CREATE TABLE AS SELECT` statement inserts the selected data into the new table, the user also needs to have permission to insert data into the target table. This can be done with `INSERT` privileges.

- `SELECT` permission: Users need to be able to select data from the source data table, so they need to have SELECT permission.

For more permission-related actions, check out the [Matrixone permission classification](../../access-control-type.md) and [grant instructions](../Data-Control-Language/grant.md).

## Examples

- Example 1

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> create table t2 as select *from t1;--Whole Table Replication
Query OK, 3 rows affected (0.02 sec)

mysql> desc t2;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t2;
+------------+------+
| a          | b    |
+------------+------+
|          1 | 1    |
|          2 | 2    |
| 2147483647 | max  |
+------------+------+
3 rows in set (0.00 sec)
```

- Example 2

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE table test as select a as alias_a from t1;--Specify an alias for the selection column
Query OK, 3 rows affected (0.02 sec)

mysql> desc test;
+---------+---------+------+------+---------+-------+---------+
| Field   | Type    | Null | Key  | Default | Extra | Comment |
+---------+---------+------+------+---------+-------+---------+
| alias_a | INT(32) | YES  |      | 123     |       |         |
+---------+---------+------+------+---------+-------+---------+
1 row in set (0.01 sec)

mysql> select * from test;
+------------+
| alias_a    |
+------------+
|          1 |
|          2 |
| 2147483647 |
+------------+
3 rows in set (0.01 sec)
```

- Example 3

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> create table t3 as select * from t1 where 1=2;--Copy only the fields, not the data
Query OK, 0 rows affected (0.01 sec)

mysql> desc t3;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t3;
Empty set (0.00 sec)
```

- Example 4

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE table t4(n1 int unique) as select max(a) from t1;--Use the original table data aggregation values as columns in the new table
Query OK, 1 row affected (0.03 sec)

mysql> desc t4;
+--------+---------+------+------+---------+-------+---------+
| Field  | Type    | Null | Key  | Default | Extra | Comment |
+--------+---------+------+------+---------+-------+---------+
| n1     | INT(32) | YES  | UNI  | NULL    |       |         |
| max(a) | INT(32) | YES  |      | NULL    |       |         |
+--------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t4;
+------+------------+
| n1   | max(a)     |
+------+------------+
| NULL | 2147483647 |
+------+------------+
1 row in set (0.00 sec)
```

- Example 5

```sql
create table t5(n1 int,n2 int,n3 int);
insert into t5 values(1,1,1),(1,1,1),(3,3,3);

mysql> create table t5_1 as select distinct n1 from t5;--Remove duplicate lines
Query OK, 2 rows affected (0.02 sec)

mysql> select * from t5_1;
+------+
| n1   |
+------+
|    1 |
|    3 |
+------+
2 rows in set (0.00 sec)
```

- Example 6

```sql
create table t6(n1 int,n2 int,n3 int);
insert into t6 values(1,1,3),(2,2,2),(3,3,1);

mysql> create table t6_1 as select * from t6 order by n3;--Sorting the result set
Query OK, 3 rows affected (0.01 sec)

mysql> select * from t6_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    3 |    3 |    1 |
|    2 |    2 |    2 |
|    1 |    1 |    3 |
+------+------+------+
3 rows in set (0.01 sec)
```

- Example 7

```sql
create table t7(n1 int,n2 int,n3 int);
insert into t7 values(1,1,3),(1,2,2),(2,3,1),(2,3,1),(3,3,1);

mysql> CREATE TABLE t7_1 AS SELECT n1 FROM t7 GROUP BY n1 HAVING count(n1)>1;--Grouping of result sets
Query OK, 2 rows affected (0.02 sec)

mysql> 
mysql> select * from t7_1;
+------+
| n1   |
+------+
|    1 |
|    2 |
+------+
2 rows in set (0.01 sec)
```

- Example 8

```sql
create table t8(n1 int,n2 int,n3 int);
insert into t8 values(1,1,1),(2,2,2),(3,3,3);

mysql> CREATE TABLE t8_1 AS SELECT * FROM t8 limit 1 offset 1;--Specifies to return from the second row of the result set, and the number of rows to return is 1.

mysql> select * from t8_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    2 |    2 |    2 |
+------+------+------+
1 row in set (0.00 sec)
```

- Example 9

```sql
create table t9 (a int primary key, b varchar(5) unique key);
create table t9_1 (
a int primary key,
b varchar(5) unique,
c int , 
d int,
foreign key(c) references t9(a),
INDEX idx_d(d)
);
insert into t9 values (101,'abc'),(102,'def');
insert into t9_1 values (1,'zs1',101,1),(2,'zs2',102,1);

mysql> create table t9_2 as select * from t9_1;

mysql> show create table t9_1;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                   |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_1  | CREATE TABLE `t9_1` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d` (`d`),
CONSTRAINT `018f27eb-0b33-7289-a3c2-af479b1833b1` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show create table t9_2;--If the source table has constraints or indexes, the new table created by CTAS will not have the constraints and indexes of the original table by default.
+-------+-------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                      |
+-------+-------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL
) |
+-------+-------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

--If you want the new table to come with the original table with constraints and indexes, you can build the table by adding the
ALTER TABLE t9_2 ADD PRIMARY KEY (a);
ALTER TABLE t9_2 ADD UNIQUE KEY (b);
ALTER TABLE  t9_2 ADD FOREIGN KEY (c) REFERENCES t9 (a);
ALTER TABLE t9_2 ADD INDEX idx_d3 (d);

mysql> show create table t9_2;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                    |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d3` (`d`),
CONSTRAINT `018f282d-4563-7e9d-9be5-79c0d0e8136d` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

```