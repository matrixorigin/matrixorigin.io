---
title: "CURRENT_ROLE()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Returns the role of the current session."
---
# **CURRENT_ROLE()**

> Returns the role of the current session.

## **Description**

Returns the role of the current session.

## **Syntax**

```
SELECT CURRENT_ROLE();
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| moadmin        |
+----------------+
1 row in set (0.00 sec)

-- Create a role and switch to the new role
create role use_role_1;
grant all on database * to use_role_1;
grant use_role_1 to root;
set role use_role_1;
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| use_role_1     |
+----------------+
1 row in set (0.00 sec)
```
