---
title: "DROP VIEW"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MO does not support dropping multiple views in a single statement; only a single view per DROP VIEW. MySQL 8.0 supports dropping multiple views (e.g., DROP VIEW v1, v2)."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "DROP VIEW removes one or more views."
---
# **DROP VIEW**

> DROP VIEW removes a single view. Dropping multiple views in one statement is not supported in MatrixOne.

## **Description**

`DROP VIEW` removes a single view. MatrixOne does not support dropping multiple views in one statement; attempting to do so causes error 20105 ("not supported: drop multiple (N) view"). MySQL 8.0 supports dropping multiple views in a single `DROP VIEW` statement.

If any views named in the argument list do not exist, the statement fails with an error indicating by name which nonexisting views it was unable to drop, and no changes are made.

The `IF EXISTS` clause prevents an error from occurring for views that don't exist. When this clause is given, a `NOTE` is generated for each nonexistent view.

## **Syntax**

```
> DROP VIEW [IF EXISTS]
    view_name [, view_name] ...
```

## **Examples**

```sql
CREATE TABLE t1(c1 INT PRIMARY KEY, c2 INT);
CREATE VIEW v1 AS SELECT * FROM t1;

mysql> DROP VIEW v1;
Query OK, 0 rows affected (0.02 sec)
```
