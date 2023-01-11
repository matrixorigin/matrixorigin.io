# **SET ROLE**

## **Description**

Specifies the active/current primary role or secondary role for the session.

The authorization to perform any SQL action other than creating objects can be provided by secondary roles.

## **Syntax**

```
> SET SECONDARY ROLE {
    NONE
  | ALL  
}
SET ROLE role
```

### Explanations

A role is a collection of permissions, and a user can correspond to multiple roles.

For example, user1 has the primary role role1, secondary roles role2 and role3, role1 is granted the permissions pri1 and pri2; role2 is given the permission pri3; role3 is given the permission pri4, the permission comparison representation is as follows:

|User name|Role name|Privilege name|
|---|---|---|
|user1|role1|pri1,pri2|
||role2|pri3|
||role3|pri4|

For a more intuitive understanding, you can refer to the following example:

|User|Role|Privilege Name|
|---|---|---|
|Tom|Application Developer|Read Data, Write Data|
||O&M expert|Read data|
||Database Administrator|Administrator Privileges|

At this time, Tom's main role is an application developer, and Tom needs to call *administrator authority*, then Tom can use two methods:

- To switch his role to *database administrator*, use the `SET ROLE role` statement.
- To use all privileges of primary and secondary roles, use the `SET SECONDARY ROLE ALL` statement.

The two statements are explained as follows:

#### SET SECONDARY ROLE ALL

The union of all roles of the user.

#### SET SECONDARY ROLE NONE

Kicking all roles except the PRIMARY ROLE from the current session.

#### SET ROLE role

Switching the current ROLE to a new role.

## **Examples**

```sql
> drop role if exists use_role_1,use_role_2,use_role_3,use_role_4,use_role_5;
> drop user if exists use_user_1,use_user_2;
> drop database if exists use_db_1;
> create role use_role_1,use_role_2,use_role_3,use_role_4,use_role_5;
> create database use_db_1;
> create user use_user_1 identified by '123456' default role use_role_1;
##grant the `select`, `insert` and `update` privileges of all tables to use_role_1
> grant select ,insert ,update on table *.* to use_role_1;
#grant all the privileges of database to use_role_2
> grant all on database * to use_role_2;
#grant the use_role_2 to use_user_1
> grant use_role_2 to use_user_1;
#create table named `use_table_1`
> create table use_db_1.use_table_1(a int,b varchar(20),c double );
#set user use_user_1 primary and secondary roles are all available
> set secondary role all;
#show the privileges of `use_user_1`
> show grants for 'use_user_1'@'localhost';
+-----------------------------------------------------------+
| Grants for use_user_1@localhost                           |
+-----------------------------------------------------------+
| GRANT select ON table *.* `use_user_1`@`localhost`        |
| GRANT insert ON table *.* `use_user_1`@`localhost`        |
| GRANT update ON table *.* `use_user_1`@`localhost`        |
| GRANT connect ON account  `use_user_1`@`localhost`        |
| GRANT database all ON database * `use_user_1`@`localhost` |
+-----------------------------------------------------------+
5 rows in set (0.01 sec)
#It can be seen that the `use_user_1` has the default privilege to connect to MatrixOne; it also has the `select`, `insert` and `update` privileges on all tables, and also has all the privileges on the database
```
