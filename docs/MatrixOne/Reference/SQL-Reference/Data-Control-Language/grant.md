# **GRANT**

## **Description**

The `GRANT` statement assigns privileges and roles to MatrixOne users and roles.

### GRANT Overview

System permissions are those of the initial System account administrator ( The corresponding user is the *root*). The System account administrator can create and delete other *accounts*, and manage *accounts*. A System account administrator cannot manage other resources of other *accounts*.

To use `GRANT` to GRANT permissions to other users or roles, you must first have the `WITH GRANT OPTION` permissions and the permissions you are granting. Use the' SHOW GRANTS' statement to find out the grant status of your current or another role. For more information, see [SHOW GRANTS](../Other/SHOW-Statements/show-grants.md).

The `REVOKE` statement is related to `GRANT` and enables administrators to remove account privileges. For more information on `REVOKE`, see [REVOKE](revoke.md).

Normally, a cluster has one root by default, the root first uses `CREATE ACCOUNT` to create a new account and define its nonprivilege characteristics such as its password, then account uses `CREATE USER` to create an user and uses `GRANT` to define its privileges. `ALTER ACCOUNT` may be used to change the nonprivilege characteristics of existing accounts. `ALTER USER` is used to change the privilege characteristics of existing users. For more information on privileges supported by MatrixOne, see [Privilege Control Types](../../access-control-type.md).

`GRANT` responds with `Query OK, 0 rows affected` when executed successfully. To determine what privileges result from the operation, use [SHOW GRANTS](../Other/SHOW-Statements/show-grants.md)

## **Syntax**

```
> GRANT
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON [object_type] priv_level
    TO user_or_role [, user_or_role] ...

GRANT role [, role] ...
    TO user_or_role [, user_or_role] ...
    [WITH ADMIN OPTION]

object_type: {
    TABLE
  | FUNCTION
  | PROCEDURE
}

priv_level: {
    *
  | *.*
  | db_name.*
  | db_name.tbl_name
  | tbl_name
  | db_name.routine_name
}
```

### Explanations

The `GRANT` statement enables *account* to grant privileges and roles, which can be granted to users and roles. These syntax restrictions apply:

- `GRANT` cannot mix granting both privileges and roles in the same statement. A given `GRANT` statement must grant either privileges or roles.

- The `ON` clause distinguishes whether the statement grants privileges or roles:

    + With `ON`, the statement grants privileges.

    + Without `ON`, the statement grants roles.

    + It is permitted to assign both privileges and roles to an account, but you must use separate GRANT statements, each with syntax appropriate to what is to be granted.

To grant a privilege with `GRANT`, you must have the `GRANT OPTION` privilege, and you must have the privileges that you are granting.

#### Database Privileges

Database privileges apply to all objects in a given database. To assign database-level privileges, use `ON db_name *` syntax:

```
grant all on database * to role1;
```

#### Table Privileges

Table privileges apply to all columns in a given table. To assign table-level privileges, use `ON db_name.tbl_name` syntax:

```
grant all on table *.* to role1;
```

#### Granting Roles

GRANT syntax without an ON clause grants roles rather than individual privileges. A role is a named collection of privileges. For example:

```
grant role3 to role_user;
```

Each role to be granted must exist, as well as each user account or role to which it is to be granted.

These privileges are required to grant roles:

- You have the privilege to grant or revoke any role to users or roles.

## **Examples**

```sql
> drop user if exists user_prepare_01;
> drop role if exists role_prepare_1;
> create user user_prepare_01 identified by '123456';
> create role role_prepare_1;
> create database if not exists p_db;
> grant create table ,drop table on database *.*  to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant connect on account * to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant insert,select on table *.* to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant role_prepare_1 to user_prepare_01;
Query OK, 0 rows affected (0.01 sec)
```
