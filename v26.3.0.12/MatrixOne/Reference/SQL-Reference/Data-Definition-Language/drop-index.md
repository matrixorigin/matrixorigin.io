---
title: "DROP INDEX"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This statement deletes the index from the currently selected table and will report an error if the index does not exist unless the IF EXISTS modifier is used."
---
# **DROP INDEX**

> This statement deletes the index from the currently selected table and will report an error if the index does not exist unless the IF EXISTS modifier is used.

## **Description**

This statement deletes the index from the currently selected table and will report an error if the index does not exist unless the `IF EXISTS` modifier is used.

## **Syntax**

```
> DROP INDEX index_name ON tbl_name
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
