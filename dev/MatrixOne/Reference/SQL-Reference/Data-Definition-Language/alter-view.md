---
title: "ALTER VIEW"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "WITH CHECK OPTION is accepted in CREATE VIEW (syntax only, views are read-only) but rejected as a syntax error in ALTER VIEW"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "ALTER VIEW is used to alter an existing view."
---
# **ALTER VIEW**

> ALTER VIEW is used to alter an existing view.

## **Description**

`ALTER VIEW` is used to alter an existing view.

If any of the views named in the syntax parameter list do not exist, the statement reports an error and cannot change those views that do not exist.

Starting with v3.0.11, `ALTER VIEW` accepts an optional `SQL SECURITY` clause
that replaces the view's stored security type. See
[CREATE VIEW](create-view.md) for the meaning of `DEFINER` and `INVOKER`.
If the clause is omitted, the stored security type is recomputed from the
current session variable `view_security_type`.

## **Syntax**

```
> ALTER [SQL SECURITY { DEFINER | INVOKER }] VIEW view_name [(column_list)]
  AS select_statement
  [WITH [CASCADED | LOCAL] CHECK OPTION]
```

## **Examples**

```sql
drop table if exists t1;
create table t1 (a int);
insert into t1 values(1),(2),(3),(4);
create view v5 as select * from t1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
|    4 |
+------+
4 rows in set (0.01 sec)

alter view v5 as select * from t1 where a=1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

alter view v5 as select * from t1 where a > 2;

mysql> select * from v5;
+------+
| a    |
+------+
|    3 |
|    4 |
+------+
2 rows in set (0.00 sec)
```
