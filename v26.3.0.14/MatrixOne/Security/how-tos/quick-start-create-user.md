# Create a new account, use the new account, creates users, create roles, and grant the privilege

When initializing access to the MatrixOne cluster, the system will automatically generate a default account, which is the cluster administrator. The default user name of the cluster administrator is *root*. *root* is both a cluster administrator and a system account administrator. *root* can create and manage other common accounts (non-system account administrators).

This document will guide you through creating a new account, switching to the new account to log in, using the new account account to create users, creating roles, creating permissions, and granting user privileges.

## Before you start

- MatrixOne cluster has been depolyed and connected.
- You have obtained the cluster administrator user name and password (The default user name and password are root and 111 respectively).

## Steps

### Step 1: Create a new account

1. Log into MatrixOne with the cluster administrator's username (root by default) and password:

    ```
    mysql -h 127.0.0.1 -P 6001 -u root -p
    ```

2. Create a new account *a1*; the username and password of account *a1* are: admin, test123:

    ```
    create account a1 ADMIN_NAME 'admin' IDENTIFIED BY 'test123';
    ```

    Check all accounts information in the cluster (only root can view):

    ```
    mysql> select * from mo_catalog.mo_account;
    +------------+--------------+--------+---------------------+----------------+----------------+
    | account_id | account_name | status | created_time        | comments       | suspended_time |
    +------------+--------------+--------+---------------------+----------------+----------------+
    |          1 | a1           | open   | 2022-12-19 14:47:19 |                | NULL           |
    |          0 | sys          | open   | 2022-12-07 11:00:58 | system account | NULL           |
    +------------+--------------+--------+---------------------+----------------+----------------+
    ```

### Step 2: Log in to the new account account, create users, create roles and grant the privilege

1. You can reopen a new session with admin login to account *a1*:

    ```
    mysql -h 127.0.0.1 -P 6001 -u a1:admin -p
    ```

2. Now you can check the default users and roles under the account as *a1*:

    ```
    mysql> select * from mo_catalog.mo_role;
    +---------+--------------+---------+-------+---------------------+----------+
    | role_id | role_name    | creator | owner | created_time        | comments |
    +---------+--------------+---------+-------+---------------------+----------+
    |       2 | accountadmin |       0 |     0 | 2022-12-19 14:47:20 |          |
    |       1 | public       |       0 |     0 | 2022-12-19 14:47:20 |          |
    +---------+--------------+---------+-------+---------------------+----------+
    2 rows in set (0.01 sec)

    mysql> select * from mo_catalog.mo_user;
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    | user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    |       2 | localhost | admin     | test123               | unlock | 2022-12-19 14:47:20 | NULL         | PASSWORD   |       0 |     0 |            2 |
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    1 row in set (0.00 sec)
    ```

    After account a1 is successfully created, it has account administrator privileges by default so that you can view the system table information under account a1. In the *mo_user* table, it can be observed that there is currently a user account named *admin*, which is specified when creating a account; in addition, there are two default roles, *accountadmin* and *public*:

    - *accountadmin* has the highest authority of the account, and the account named *admin* is granted by default;
    - The system will authorize the *public* role for each new ordinary user by default, and the initial permission of the *public* role is `connect`, that is, to connect to MatrixOne.

    In addition, you can also view the privilege sets of these default roles in the system table:

    ```
    mysql> select * from mo_catalog.mo_role_privs;
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    | role_id | role_name    | obj_type | obj_id | privilege_id | privilege_name     | privilege_level | operation_user_id | granted_time        | with_grant_option |
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    |       2 | accountadmin | account  |      0 |            3 | create user        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            4 | drop user          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            5 | alter user         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            6 | create role        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            7 | drop role          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            9 | create database    | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           10 | drop database      | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           11 | show databases     | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           12 | connect            | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           13 | manage grants      | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           14 | account all        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           18 | show tables        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           20 | create table       | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           23 | drop table         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           26 | alter table        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           21 | create view        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           24 | drop view          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           27 | alter view         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           28 | database all       | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           29 | database ownership | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           30 | select             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           31 | insert             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           32 | update             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           33 | truncate           | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           34 | delete             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           35 | reference          | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           36 | index              | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           37 | table all          | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           38 | table ownership    | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           41 | values             | t               |                 0 | 2022-12-19 14:47:20 | true              |
    |       1 | public       | account  |      0 |           12 | connect            | *               |                 0 | 2022-12-19 14:47:20 | true              |
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    ```

3. In account *a1*, create a new user and role:

    - Username and password for user *u1* are: u1, user123
    - Username and password for user *u2* are: u2, user456
    - Role *r1* is named: r1
    - Role *r2* is named: r2

    ```
    create user u1 identified by 'user123';
    create user u2 identified by 'user456';
    create role r1;
    create role r2;
    ```

4. Create database *db1* and create table *t1* in *db1*:

    ```
    create database db1;
    create table db1.t1(c1 int,c2 varchar);
    ```

5. Grant `select` privilege on *db1.t1* to *r1* and `insert` privilege to *r2*:

    ```
    grant select on table db1.t1 to r1;
    grant insert on table db1.t1 to r2;
    ```

6. Grant role *r1* to user *u1*; grant role *r2* to user *u2*:

    ```
    grant r1 to u1;
    grant r2 to u2;
    ```

    At this point, the newly created user, role, and object permission relationship is shown in the following figure:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/security/role-user.png?raw=true)

### Step 3: Verify the privilege is valid

Log in to account *a1* with users *u1* and *u2*, respectively, to verify that the privileges are in effect.

Since *u2* has been granted the *r2* role, and *r2* has been granted the `insert` privilege of *db1.t1*, so *u2* has the `insert` privilege of *db1.t1*, that is, *db1.t1* insert data.

Use *u1* to log into *a1* to verify that the privilege is valid:

```
mysql -h 127.0.0.1 -P 6001 -u a1:u2:r2 -p

mysql> insert into db1.t1 values (1,'shanghai'),(2,'beijing');
Query OK, 2 rows affected (0.04 sec)

mysql> select * from db1.t1;
ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
```

*u2* can successfully insert data into the table *db1.t1*, but cannot view the data in the table *db1.t1*.

Similarly, you can use *u1* to log in to *a1* for privilege verification:

```
mysql -h 127.0.0.1 -P 6001 -u a1:u1:r1 -p

mysql> select * from db1.t1;
+------+----------+
| c1   | c2       |
+------+----------+
|    1 | shanghai |
|    2 | beijing  |
+------+----------+
2 rows in set (0.01 sec)

mysql> insert into db1.t1 values (3,'guangzhou');
ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
```

As shown in the above code, *u1* can successfully query the data of table *db1.t1*, but cannot insert data into it.

!!! note
    For more information about system tables, see [MatrixOne System Database and Tables](../../Reference/System-tables.md)
