---
title: "SHOW CREATE DATABASE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Output omits CHARACTER SET, COLLATE, and ENCRYPTION clauses present in MySQL 8.0 SHOW CREATE DATABASE output"
mo_only: []
since: unknown
last_updated: 2026-05-20
llms_summary: "SHOW CREATE DATABASE shows the CREATE DATABASE statement that creates the named database."
---
# **SHOW CREATE DATABASE**

> SHOW CREATE DATABASE shows the `CREATE DATABASE` statement that creates the named database.

## **Description**

`SHOW CREATE DATABASE` shows the `CREATE DATABASE` statement that creates the named database. If the `SHOW` statement includes an `IF NOT EXISTS` clause, the output too includes such a clause.

## **Syntax**

```
> SHOW CREATE DATABASE db_name
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop database if exists demo_1;
create database demo_1;

mysql> show create database demo_1;
+----------+-------------------------------------+
| Database | Create Database                     |
+----------+-------------------------------------+
| demo_1   | CREATE DATABASE `demo_1`            |
+----------+-------------------------------------+
1 row in set (0.00 sec)
```
