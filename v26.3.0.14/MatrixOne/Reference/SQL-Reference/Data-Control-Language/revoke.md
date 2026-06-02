---
title: "REVOKE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Recovery logic differs from MySQL — privileges return to the role/account graph"
  - "User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples"
  - "IGNORE UNKNOWN USER clause (MySQL 8.0.30+) not supported"
mo_only:
  - "`REVOKE ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart"
  - "`REVOKE ... ON DATABASE *` — MatrixOne-specific database-level revoke target"
  - "REVOKE ... ON VIEW db_name.view_name (separate VIEW object_type)"
since: unknown
last_updated: 2026-05-08
llms_summary: "Removes one or more privileges on a securable object from a role."
---
# **REVOKE**

> Removes one or more privileges on a securable object from a role.

## **Description**

Removes one or more privileges on a securable object from a role. The privileges that can be revoked are object-specific.

Starting with v3.0.11, `object_type` accepts `VIEW` in addition to `TABLE`,
`FUNCTION`, and `PROCEDURE`. `REVOKE ... ON TABLE ...` only affects table
grants and does not implicitly revoke equivalent view grants; revoke view
privileges with `ON VIEW`:

```
revoke select on view db1.v1 from role1;
```

## **Syntax**

```
> REVOKE [IF EXISTS]
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON object_type priv_level

> REVOKE [IF EXISTS] role [, role ] ...
    FROM user_or_role [, user_or_role ] ...

object_type: {
    TABLE
  | VIEW
  | FUNCTION
  | PROCEDURE
}
```

## **Examples**

```sql
> CREATE USER mouser IDENTIFIED BY '111';
Query OK, 0 rows affected (0.10 sec)

> CREATE ROLE role_r1;
Query OK, 0 rows affected (0.05 sec)

> GRANT role_r1 to mouser;
Query OK, 0 rows affected (0.04 sec)

> GRANT create table on database * to role_r1;
Query OK, 0 rows affected (0.03 sec)

> SHOW GRANTS for mouser@localhost;
+-------------------------------------------------------+
| Grants for mouser@localhost                           |
+-------------------------------------------------------+
| GRANT create table ON database * `mouser`@`localhost` |
| GRANT connect ON account  `mouser`@`localhost`        |
+-------------------------------------------------------+
2 rows in set (0.02 sec)

> REVOKE role_r1 from mouser;
Query OK, 0 rows affected (0.04 sec)

> SHOW GRANTS for mouser@localhost;
+------------------------------------------------+
| Grants for mouser@localhost                    |
+------------------------------------------------+
| GRANT connect ON account  `mouser`@`localhost` |
+------------------------------------------------+
1 row in set (0.02 sec)
```
