---
title: "CURRENT_ROLE_NAME()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "MatrixOne multi-account/role system management function (compat doc: System Management Functions)."
since: unknown
last_updated: 2026-05-08
llms_summary: "CURRENT_ROLE_NAME() is used to query the name of the role owned by the user you are currently logged in."
---
# **CURRENT_ROLE_NAME()**

> CURRENT_ROLE_NAME() is used to query the name of the role owned by the user you are currently logged in.

## **Description**

`CURRENT_ROLE_NAME()` is used to query the name of the role owned by the user you are currently logged in.

## **Syntax**

```
> CURRENT_ROLE_NAME()
```

## **Examples**

```sql
mysql> select current_role_name();
+---------------------+
| current_role_name() |
+---------------------+
| moadmin             |
+---------------------+
1 row in set (0.00 sec)
```
