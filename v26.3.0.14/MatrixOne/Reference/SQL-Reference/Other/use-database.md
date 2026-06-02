---
title: "USE"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The USE statement tells MatrixOne to use the named database as the default (current) database for subsequent statements."
---
# **USE**

> The USE statement tells MatrixOne to use the named database as the default (current) database for subsequent statements.

## **Description**

The USE statement tells MatrixOne to use the named database as the default (current) database for subsequent statements.

## **Syntax**

```
> USE db_name
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
USE db1;
SELECT COUNT(*) FROM mytable;
```