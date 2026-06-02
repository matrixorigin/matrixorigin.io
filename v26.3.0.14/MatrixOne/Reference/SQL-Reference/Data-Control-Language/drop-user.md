---
title: "DROP USER"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Removes the specified user from the system."
---
# **DROP USER**

> Removes the specified user from the system.

## **Description**

Removes the specified user from the system.

## **Syntax**

```
> DROP USER [IF EXISTS] user [, user] ...
```

## **Examples**

```sql
> drop user if exists userx;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    If the user is in a session, when the user is removed, the session is disconnected and MatrixOne can no longer be connected.
