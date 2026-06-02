---
title: "LAST_INSERT_ID()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Multi-row INSERT returns the last inserted auto-increment value; MySQL returns the first inserted value."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The LAST_INSERT_ID() function returns the AUTO_INCREMENT id of the last row that has been inserted or updated in a table."
---
# **LAST_INSERT_ID()**

> The LAST_INSERT_ID() function returns the AUTO_INCREMENT id of the last row that has been inserted or updated in a table.

## **Description**

The LAST_INSERT_ID() function returns the AUTO_INCREMENT id of the last row that has been inserted or updated in a table.

When the argument is `NULL`, `LAST_INSERT_ID()` returns a value representing the first automatically generated value successfully inserted for an `AUTO_INCREMENT` column as a result of the most recently executed `INSERT` statement; if you haven't inserted a column before, then the return value start at 1, and if you've inserted a column before, then the return value of the `AUTO_INCREMENT` column increases by 1.

The value of `LAST_INSERT_ID()` remains unchanged if no rows are successfully inserted.

In MySQL, if you insert multiple rows using a single INSERT statement, LAST_INSERT_ID() returns the value generated for the first inserted row only. For example:

<!-- validator-ignore-exec -->
```sql
mysql> CREATE TABLE t (id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, name VARCHAR(10) NOT NULL);
mysql> INSERT INTO t VALUES (NULL, 'Bob');
mysql> SELECT * FROM t;
+----+------+
| id | name |
+----+------+
|  1 | Bob  |
+----+------+

mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                1 |
+------------------+

mysql> INSERT INTO t VALUES (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');

mysql> SELECT * FROM t;
+----+------+
| id | name |
+----+------+
|  1 | Bob  |
|  2 | Mary |
|  3 | Jane |
|  4 | Lisa |
+----+------+

mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                2 |
+------------------+
```

But in MatrixOne, we have a different behavior; if you insert multiple rows using a single INSERT statement, LAST_INSERT_ID() returns the value generated for the last inserted row. Like the example above, when you execute `INSERT INTO t VALUES (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');`, the `LAST_INSERT_ID()` will return 4.

## **Syntax**

```
LAST_INSERT_ID(), LAST_INSERT_ID(expr)
```

## **Examples**

```sql
create table t1(a int auto_increment primary key);
insert into t1 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|                1 |
+------------------+
1 row in set (0.02 sec)

insert into t1 values(11);
insert into t1 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|               12 |
+------------------+
1 row in set (0.02 sec)

insert into t1 values(null);
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|               13 |
+------------------+
1 row in set (0.02 sec)

create table t2(a int auto_increment primary key);
insert into t2 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|                1 |
+------------------+
1 row in set (0.02 sec)

insert into t2 values(100);
insert into t2 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|              101 |
+------------------+
1 row in set (0.02 sec)
```
