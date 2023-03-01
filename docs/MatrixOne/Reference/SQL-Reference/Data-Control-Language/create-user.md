# **CREATE USER**

## **Description**

Creates a new user in the system.

To use `CREATE USER`, you must have the `CREATE USER` privilege.

- The default role with `CREATE USER` privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

## **Syntax**

```
> CREATE USER [IF NOT EXISTS]
    user auth_option [, user auth_option] ...
    [DEFAULT ROLE rolename]  
    [COMMENT 'comment_string' | ATTRIBUTE 'json_object']

auth_option: {
    IDENTIFIED BY 'auth_string'
}
```

### Explanations

An user when first created has no privileges and a default role of NONE. To assign privileges or roles, use the [GRANT](grant.md) statement.

The basic SQL statement of `CREAT USER` is as follows:

```
create user user_name identified by 'password';
```

#### IDENTIFIED BY 'auth_string'

`CREATE USER` permits these `auth_option` syntaxes:

- 'auth_string': 'auth_string' value (the default is password) will be stored in  the *mo_user* system table.

#### DEFAULT ROLE

The DEFAULT ROLE clause defines which roles become active when the user connects to MatrixOne and authenticates, or when the user executes the `SET ROLE` statement during a session.

```
create user user_name identified by 'password' default role role_rolename;
```

The `DEFAULT ROLE` clause permits a list of one or more comma-separated role names. These roles must exist at the time `CREATE USER` is executed; otherwise the statement raises an error, and the user is not created.

## **Examples**

```sql
> create user userx identified by '111';
Query OK, 0 rows affected (0.04 sec)
```

## **Constraints**

MatrxiOne does not supports `CREATE USER COMMENT` and `CREATE USER ATTRIBUTE` now.
