---
title: "IS NULL"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-22
llms_summary: "IS NULL and IS NOT NULL operators for testing whether a value is NULL."
---
# **IS NULL**

## **Description**

The `IS NULL` operator tests whether a value is `NULL`.

It returns `TRUE` if a `NULL` value is found, otherwise it returns `FALSE`. It can be used in a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement.

## **Syntax**

```
> expression IS NULL
```

## **Examples**

```sql
mysql> SELECT 1 IS NULL, 0 IS NULL, NULL IS NULL;
+-----------+-----------+--------------+
| 1 is null | 0 is null | null is null |
+-----------+-----------+--------------+
| false     | false     | true         |
+-----------+-----------+--------------+
1 row in set (0.01 sec)
```

```sql
create table t1 (a boolean,b bool);
insert into t1 values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);

mysql> select * from t1;
+-------+-------+
| a     | b     |
+-------+-------+
| false | true  |
| true  | false |
| true  | true  |
| false | false |
| NULL  | NULL  |
+-------+-------+
mysql> select * from t1 where a IS NULL;
+------+------+
| a    | b    |
+------+------+
| NULL | NULL |
+------+------+
1 row in set (0.01 sec)
```
