---
title: "CURRENT_USER_NAME()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "MatrixOne multi-account/role system management function (compat doc: System Management Functions)."
since: unknown
last_updated: 2026-05-08
llms_summary: "CURRENT_USER_NAME() is used to query the name of the user you are currently logged in as."
---
# **CURRENT_USER_NAME()**

> CURRENT_USER_NAME() is used to query the name of the user you are currently logged in as.

## **Description**

`CURRENT_USER_NAME()` is used to query the name of the user you are currently logged in as.

## **Syntax**

```
> CURRENT_USER_NAME()
```

## **Examples**

```sql
mysql> select current_user_name();
+---------------------+
| current_user_name() |
+---------------------+
| root                |
+---------------------+
1 row in set (0.01 sec)
```
