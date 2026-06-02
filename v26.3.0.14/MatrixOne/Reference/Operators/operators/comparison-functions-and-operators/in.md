---
title: "IN"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-21
llms_summary: "IN operator for checking membership in a list of values. Supports subqueries, tuple comparisons, and NULL values. Fully compatible with MySQL 8.0."
---
# **IN**

## **Description**

The `IN` operator allows you to specify multiple values in a `WHERE` clause. And it's a shorthand for multiple `OR` conditions.

## **Syntax**

```
> SELECT column1, column2, ...
FROM table_name
WHERE column_name IN (value1, value2, ...);
```

## **Examples**

``` sql
create table t2(a int,b varchar(5),c float, d date, e datetime);
insert into t2 values(1,'a',1.001,'2022-02-08','2022-02-08 12:00:00');
insert into t2 values(2,'b',2.001,'2022-02-09','2022-02-09 12:00:00');
insert into t2 values(1,'c',3.001,'2022-02-10','2022-02-10 12:00:00');
insert into t2 values(4,'d',4.001,'2022-02-11','2022-02-11 12:00:00');

mysql> select * from t2 where a in (2,4);
a	b	c	d	e
2	b	2.0010	2022-02-09	2022-02-09 12:00:00
4	d	4.0010	2022-02-11	2022-02-11 12:00:00

mysql> select * from t2 where a not in (2,4);
a	b	c	d	e
1	a	1.0010	2022-02-08	2022-02-08 12:00:00
1	c	3.0010	2022-02-10	2022-02-10 12:00:00

mysql> select * from t2 where b not in ('e',"f");
a	b	c	d	e
1	a	1.0010	2022-02-08	2022-02-08 12:00:00
2	b	2.0010	2022-02-09	2022-02-09 12:00:00
1	c	3.0010	2022-02-10	2022-02-10 12:00:00
4	d	4.0010	2022-02-11	2022-02-11 12:00:00

mysql> select * from t2 where e not in ('2022-02-09 12:00:00') and a in (4,5);
a	b	c	d	e
4	d	4.0010	2022-02-11	2022-02-11 12:00:00
```
