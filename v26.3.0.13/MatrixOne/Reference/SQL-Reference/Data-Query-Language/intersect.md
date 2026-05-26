---
title: "INTERSECT"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "INTERSECT was added in MySQL 8.0.31; MO INTERSECT and INTERSECT ALL semantics match MySQL 8.0 (both return identical results for common test cases including duplicate handling)"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "INTERSECT returns only the different rows of two or more queries."
---
# **INTERSECT**

> INTERSECT returns only the different rows of two or more queries.

## **Description**

`INTERSECT` returns only the different rows of two or more queries.

## **Syntax**

```
SELECT column_list FROM table_1
INTERSECT
SELECT column_list FROM table_2;
```

## **Examples**

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

mysql> select * from t1 intersect select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    2 |    3 |
|    3 |    4 |    5 |
+------+------+------+
2 rows in set (0.01 sec)

mysql> select a, b from t1 intersect select b, c from t2;
+------+------+
| a    | b    |
+------+------+
|    4 |    5 |
+------+------+
1 row in set (0.01 sec)
```
