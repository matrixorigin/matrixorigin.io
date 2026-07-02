---
title: "MINUS"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql:
  - "MINUS keyword is MO-specific; MySQL 8.0.31+ uses EXCEPT for the same set-difference semantics (MINUS is not a recognized keyword in MySQL)"
  - "MINUS ALL is not yet implemented in MO; MySQL 8.0.31+ supports EXCEPT ALL with full duplicate-preserving semantics"
mo_only:
  - "MINUS keyword (MO's set-difference operator; MySQL 8.0.31+ offers equivalent functionality via EXCEPT)"
since: unknown
last_updated: 2026-05-08
llms_summary: "MINUS compares the result of two queries and returns the different rows in the first query that are not output by the second query."
---
# **MINUS**

> MINUS compares the result of two queries and returns the different rows in the first query that are not output by the second query.

## **Description**

`MINUS` compares the result of two queries and returns the different rows in the first query that are not output by the second query.

!!! note
    `MINUS ALL` (and `EXCEPT ALL`) are not yet implemented in MatrixOne. Using them produces the error "EXCEPT/MINUS ALL clause is not yet implemented". MySQL 8.0.31+ supports `EXCEPT ALL` with full duplicate-preserving semantics.

## **Syntax**

```
SELECT column_list_1 FROM table_1
MINUS
SELECT columns_list_2 FROM table_2;
```

## **Examples**

- Example 1

```sql
CREATE TABLE t1 (id INT PRIMARY KEY);
CREATE TABLE t2 (id INT PRIMARY KEY);
INSERT INTO t1 VALUES (1),(2),(3);
INSERT INTO t2 VALUES (2),(3),(4);

mysql> SELECT id FROM t1 MINUS SELECT id FROM t2;
+------+
| id   |
+------+
|    1 |
+------+
```

- Example 2

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
drop table if exists t2;
create table t1 (a smallint, b bigint, c int);
insert into t1 values (1,2,3);
insert into t1 values (1,2,3);
insert into t1 values (3,4,5);
insert into t1 values (4,5,6);
insert into t1 values (4,5,6);
insert into t1 values (1,1,2);
create table t2 (a smallint, b bigint, c int);
insert into t2 values (1,2,3);
insert into t2 values (3,4,5);
insert into t2 values (1,2,1);

mysql> select * from t1 minus select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    1 |    2 |
|    4 |    5 |    6 |
+------+------+------+

mysql> select a, b from t1 minus select b, c from t2;
+------+------+
| a    | b    |
+------+------+
|    3 |    4 |
|    1 |    1 |
|    1 |    2 |
+------+------+
```
