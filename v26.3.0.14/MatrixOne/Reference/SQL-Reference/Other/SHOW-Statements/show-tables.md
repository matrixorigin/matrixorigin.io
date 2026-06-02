---
title: "SHOW TABLES"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Output column header uses lowercase database name (Tables_in_<db> vs MySQL's Tables_in_<DB>)"
  - "MO does not display a parenthesized LIKE pattern in the column header unlike MySQL"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Shows the list of tables in the currently selected database."
---
# **SHOW TABLES**

> Shows the list of tables in the currently selected database.

## **Description**

Shows the list of tables in the currently selected database.

## **Syntax**

```
> SHOW TABLES  [LIKE 'pattern' | WHERE expr | FROM db_name | IN db_name]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
> SHOW TABLES;
+---------------------+
| Tables_in_database  |
+---------------------+
| clusters            |
| contributors        |
| databases           |
| functions           |
| numbers             |
| numbers_local       |
| numbers_mt          |
| one                 |
| processes           |
| settings            |
| tables              |
| tracing             |
+---------------------+
```
