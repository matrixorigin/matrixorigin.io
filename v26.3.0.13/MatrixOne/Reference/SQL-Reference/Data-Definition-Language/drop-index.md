---
title: "DROP INDEX"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MO accepts DROP INDEX IF EXISTS syntax (MySQL 8.0 does not), but IF EXISTS does not suppress errors for missing indexes; it returns internal error 20101 instead of a silent skip"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This statement deletes the index from the currently selected table and will report an error if the index does not exist unless the IF EXISTS modifier is used."
---
# **DROP INDEX**

> This statement deletes the index from the currently selected table. The `IF EXISTS` syntax is accepted but has a known issue: it does not suppress errors for missing indexes and instead returns internal error 20101. MySQL 8.0 does not support `IF EXISTS` for `DROP INDEX` at all.

## **Description**

This statement deletes the index from the currently selected table.

The `IF EXISTS` modifier is syntactically accepted but has a known limitation: if the specified index does not exist, `IF EXISTS` does not suppress the error; instead an internal error 20101 is returned. Use caution, as this differs from standard MySQL `IF EXISTS` behavior (which would silently ignore missing objects). Note that MySQL 8.0 does not support `IF EXISTS` for `DROP INDEX` at all.

## **Syntax**

```
> DROP INDEX [IF EXISTS] index_name ON tbl_name
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
create table t5(a int, b int, unique key(a));
mysql> show create table t5;
+-------+----------------------------------------------------------------------------------------+
| Table | Create Table                                                                           |
+-------+----------------------------------------------------------------------------------------+
| t5    | CREATE TABLE `t5` (
`a` INT DEFAULT NULL,
`b` INT DEFAULT NULL,
UNIQUE KEY `a` (`a`)
) |
+-------+----------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

create index b on t5(b);
mysql> show create table t5;
+-------+-------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                          |
+-------+-------------------------------------------------------------------------------------------------------+
| t5    | CREATE TABLE `t5` (
`a` INT DEFAULT NULL,
`b` INT DEFAULT NULL,
UNIQUE KEY `a` (`a`),
KEY `b` (`b`)
) |
+-------+-------------------------------------------------------------------------------------------------------+
1 row in set (0.02 sec)

drop index b on t5;
mysql> show create table t5;
+-------+----------------------------------------------------------------------------------------+
| Table | Create Table                                                                           |
+-------+----------------------------------------------------------------------------------------+
| t5    | CREATE TABLE `t5` (
`a` INT DEFAULT NULL,
`b` INT DEFAULT NULL,
UNIQUE KEY `a` (`a`)
) |
+-------+----------------------------------------------------------------------------------------+
1 row in set (0.02 sec)
```
