# Privileges Management Overview

## Manage Account

- Prerequisites: Account management is only possible with a cluster administrator (the default account is the *root*).

The roles and permissions corresponding to the *root* are shown in the following table:

| **Username** | **Explanation** | **Role** | **Privilege** | **Description** |
| --- | --- | --- | --- | --- |
| root | Cluster administrator | MOADMIN | Create, edit, delete accounts | Automatically generated and granted after cluster creation |
| root | System account administrator | MOADMIN | Manage all resources under the system account, including users, roles, databases/tables/views, authorization management |Automatically generated and granted after the cluster is created |

### Create Account

**SQL Statement**

```
create account <account_name> admin_name='<user_name>' identified by '<password>';
```

**Parameter Description**

|Parameter|Description|
|---|---|
|account_name| account name|
|user_name|The administrator username of the newly created account, which will be automatically granted the highest privilege role of the account, namely `ACCOUNTADMIN`|
|password|Newly created account administrator password|

For more information, see [CREATE ACCOUNT](../../Reference/SQL-Reference/Data-Control-Language/create-account.md).

### Select Account

**SQL Statement**

```
select * from mo_catalog.mo_account;
```

### Delect Account

**SQL Statement**

```
drop account if exists <account_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|account_name|The name of the account to be deleted|

!!! note
    After the account is deleted, it cannot be restored, including all data under the account account. Please use it with caution.

For more information, see [DROP ACCOUNT](../../Reference/SQL-Reference/Data-Control-Language/drop-account.md).

## Manage User

### Create User

- Prerequisites: Has the `CREATE USER` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Create a username and password for a user in the current account.

**SQL Statement**

```
create user <user_name> identified by '<password>';
```

**Parameter Description**

|Parameter|Description|
|---|---|
|user_name|The name of a new user|
|password|The password of a new user|

For more information, see [CREATE USER](../../Reference/SQL-Reference/Data-Control-Language/create-user.md).

### View User

- Prerequisites: Has the privilege to view users.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: View all the users in the current account.

**SQL Statement**

```
select * from mo_catalog.mo_user;
```

### Delete User

- Prerequisites: Has the `DROP USER` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Delete the specified user in the current account.

**SQL Statement**

```
drop user if exist <user_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|user_name|The name of the user to be deleted|

!!! note
    When deleting a user, you need to stop the user's current session first, otherwise the deletion will fail.

For more information, see [DROP USER](../../Reference/SQL-Reference/Data-Control-Language/drop-user.md).

## Manage Role

### Create Role

- Prerequisites: Has the `CREATE ROLE` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Create a custom role in the current account.

**SQL Statement**

```
create role <role_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|role_name|The name of a new role|

For more information, see [CREATE ROLE](../../Reference/SQL-Reference/Data-Control-Language/create-role.md).

### View Role

- Prerequisites: Has the privilege to view role.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: View all the roles in the current account.

**SQL Statement**

```
select * from mo_catalog.mo_role;
```

### Switch Role

- Prerequisites: Has the `SET ROLE` privilege. By default, all users have this privilege.

- Introduction: Switch the role of the user in the account, and obtain the privilege of the secondary role to execute the corresponding SQL.

**SQL Statement**

```
set role <role_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|role_name|The name of the role to be switched|

For more information, see [SET ROLE](../../Reference/SQL-Reference/Other/Set/set-role.md).

### Delete Role

- Prerequisites: Has the `DROP ROLE` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Delete the specified role in the current account.

**SQL Statement**

```
drop role if exists <role_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|role_name|The name of the role to be deleted|

!!! note
    When deleting a specified role, the roles of authorized users will be recovered simultaneously.

For more information, see [DROP ROLE](../../Reference/SQL-Reference/Data-Control-Language/drop-role.md).

## Manage Privilege

### Grant an object privilege to a role

- Prerequisites: Has the `MANAGE GRANTS` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Grant an object privilege to a role.

**SQL Statement**

```
grant <privilege> on <object_type> <object_name> to <role_name>
```

**Parameter Description**

|Parameter|Description|
|---|---|
|privilege|Privilege Name|
|object_type|The type of object|
|object_name|The name of object|
|role_name|The name of the role which is granted|

For more information, see [GRANT](../../Reference/SQL-Reference/Data-Control-Language/grant.md).

### Grant certain kind of object privileges to a role

- Prerequisites: Has the `MANAGE GRANTS` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Grant the privilege on all databases/tables to a role.

**SQL Statement**

```
grant <privilege> on database * to <role_name>;
grant <privilege> on table *.* to <role_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|privilege|Privilege Name|
|role_name|The name of the role which is granted|

!!! note
    Although this operation is relatively simple when authorizing multiple objects of the same category, it is also prone to permission leakage, so please use it with caution.

For more information, see [GRANT](../../Reference/SQL-Reference/Data-Control-Language/grant.md).

### Grant a role to a user

- Prerequisites: Has the `MANAGE GRANTS` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Grant a role to a user.

**SQL Statement**

```
grant <role_name> to <user_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|role_name|The name of the role which is granted|
|user_name|The name of the user which is granted|

For more information, see [GRANT](../../Reference/SQL-Reference/Data-Control-Language/grant.md).

### One role inherit the privileges of another role

- Prerequisites: Has the `MANAGE GRANTS` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Let role_b inherit all privileges of role_a.

**SQL Statement**

```
grant <role_a> to <role_b>;
```

!!! note
    The permissions are inherited dynamically. If the permissions of role_a change, the permissions inherited by role_b will also change dynamically. MatrixOne does not allow role ring inheritance; that is, role1 inherits role2, role2 inherits role3, but  role3 can not inherits role1.

For more information, see [GRANT ROLE](../../Reference/SQL-Reference/Data-Control-Language/grant.md).

### Show the privilege of user

- Prerequisites: Has the `SHOW GRANTS` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Show all privileges currently owned by the specified user.

**SQL Statement**

```
show grants for <user_name>@<localhost>
```

**Parameter Description**

|Parameter|Description|
|---|---|
|user_name|The name of user which is granted.|

For more information, see [SHOW GRANTS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-grants.md).

### Revoke the role of user

- Prerequisites: Has the `REVOKE` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Remove a role from a user.

**SQL Statement**

```
revoke <role_name> from <user_name>
```

**Parameter Description**

|Parameter|Description|
|---|---|
|role_name|The name of role which is granted.|
|user_name|The name of user which is granted.|

For more information, see [REVOKE](../../Reference/SQL-Reference/Data-Control-Language/revoke.md).

### Revoke privilege of roles

- Prerequisites: Has the `REVOKE` privilege.

    · The default role with this privilege is `MOADMIN` or `ACCOUNTADMIN`: the cluster administrator (the default account is *root*), and the tenant administrator created by the cluster administrator has the privilege by default.

- Introduction: Revoke privileges on an object in a role.

**SQL Statement**

```
revoke <privilege> on <object_type> <object_name> to <role_name>;
```

**Parameter Description**

|Parameter|Description|
|---|---|
|privilege|Privilege|
|object_type|The type of the object|
|object_name|The name of the object|
|role_name|A role that needs to be granted|

For more information, see [REVOKE](../../Reference/SQL-Reference/Data-Control-Language/revoke.md).
