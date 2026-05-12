---
title: "DROP TABLE"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Deletes one or more tables. Starting with v3.0.11, a single DROP TABLE statement can list multiple tables separated by commas. Each listed table may be qualified with a database name; if no database is given, the current database is used. Privileges are checked independently..."
---
# **DROP TABLE**

> Deletes one or more tables. Starting with v3.0.11, a single DROP TABLE statement can list multiple tables separated by commas. Each listed table may be qualified with a database name; if no database is given, the current database is used. Privileges are checked independently...

## **Description**

Deletes one or more tables. Starting with v3.0.11, a single `DROP TABLE`
statement can list multiple tables separated by commas. Each listed table
may be qualified with a database name; if no database is given, the current
database is used. Privileges are checked independently for every target in
the list.

With `IF EXISTS`, tables that do not exist are silently skipped. Without
`IF EXISTS`, the statement fails with `no such table <db>.<name>` the first
time a missing table is encountered.

## **Syntax**

```
> DROP TABLE [IF EXISTS] [db.]name [, [db.]name ...]
```

## **Examples**

```sql
CREATE TABLE table01(a int);

mysql> DROP TABLE table01;
Query OK, 0 rows affected (0.01 sec)
```

```sql
create table t1(a int);
create table t2(a int);
create table t3(a int);

mysql> drop table if exists t1, t2, t3;
Query OK, 0 rows affected (0.02 sec)
```
