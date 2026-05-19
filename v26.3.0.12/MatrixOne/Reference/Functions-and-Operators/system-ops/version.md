---
title: "VERSION"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The VERSION() function is used to retrieve the version information of the current database management system."
---
# **VERSION**

> The VERSION() function is used to retrieve the version information of the current database management system.

## **Description**

The `VERSION()` function is used to retrieve the version information of the current database management system. This function typically returns a string containing the version number of the database management system. For example, 0.8 indicates that the version of the MatrixOne database is 0.8.

## **Syntax**

```
> VERSION()
```

## **Example**

<!-- validator-ignore-exec -->
```sql
mysql> select version();
+-----------+
| version() |
+-----------+
| 0.8       |
+-----------+
1 row in set (0.00 sec)
```
