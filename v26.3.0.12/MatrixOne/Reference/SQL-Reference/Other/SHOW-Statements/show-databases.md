---
title: "SHOW DATABASES"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "SHOW DATABASES lists the databases on the MatrixOne."
---
# **SHOW DATABASES**

> SHOW DATABASES lists the databases on the MatrixOne.

## **Description**

`SHOW DATABASES` lists the databases on the MatrixOne. `SHOW SCHEMAS` is a synonym for `SHOW DATABASES`. The LIKE clause, if present, indicates which database names to match. The WHERE clause can be given to select rows using more general conditions.

MatrixOne implements databases as directories in the data directory, so this statement simply lists directories in that location.

Database information is also available from the `INFORMATION_SCHEMA` SCHEMATA table.

## **Syntax**

```
> SHOW {DATABASES | SCHEMAS}
    [LIKE 'pattern' | WHERE expr]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
create database demo_1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| mo_task            |
| information_schema |
| mysql              |
| system_metrics     |
| system             |
| demo_1         |
| mo_catalog         |
+--------------------+
7 rows in set (0.00 sec)
```
