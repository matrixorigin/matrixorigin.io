---
title: "DROP ROLE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Removes the specified role from the system."
---
# **DROP ROLE**

> Removes the specified role from the system.

## **Description**

Removes the specified role from the system.

## **Syntax**

```
> DROP ROLE [IF EXISTS] role [, role ] ...
```

## **Examples**

```sql
> drop role if exists rolex;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    If the user using this role is in a session, when the role is removed, the session will be disconnected immediately, and this role can no longer be used for operations.
