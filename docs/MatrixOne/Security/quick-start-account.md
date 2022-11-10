# Quick Start: Creating Account, User and Role

This document will describe how to quickly create account, users and roles using the `root`.

## Before you start

- You have already installed and launched the MatrixOne Cluster.
- You have already connected the  MatrixOne Cluster.
- You need to use the `root` to log into the MatrixOne cluster.

   + Root name: root
   + Password: 111

## Create an Account

Use the `root` to log into the MatrixOne cluster. The `root` has the `MOADMIN` role by default and has permission to create an account. You can use the `root` to do the following:

1. Create an account named `a1`.
2. Specify `a1` as the administrator named `admin`.
3. Set the password as: `test123`.

The code example is as follows:

```sql
> mysql -h 127.0.0.1 -P 6001 -u root -p
> create account a1 ADMIN_NAME 'admin' IDENTIFIED BY 'test123';
```

### Use `a1` to access MatrixOne

在 MatrixOne 中，租户（Account)之间的访问控制体系和数据都是完全隔离的，所以在访问不同的 租户（Account)时，需要分别做登录鉴权。

你可以使用刚才创建的管理员用户访问 `a1`，代码示例如下：

In MatrixOne, the access control system and data between accounts are completely isolated, so when accessing different accounts, separate login authentication is required.

You can use the `a1` to access MatrixOne, the code example is as follows:

```
> mysql -h 127.0.0.1 -P 6001 -u a1:admin -p
```

### Check the `mo_role`, `mo_user` and `mo_user_grant`

Through the `mo_role` table, you can see that two system roles, `accountadmin` and `public`, are initialized by default in `a1`, and their creator is `1`, the Owner is `0`, and the corresponding login account is ` root`, the role is `MOADMIN`.

The code example is as follows:

```sql
> select * from mo_catalog.mo_role;
+---------+--------------+---------+-------+---------------------+----------+
| role_id | role_name    | creator | owner | created_time        | comments |
+---------+--------------+---------+-------+---------------------+----------+
|       2 | accountadmin |       1 |     0 | 2022-11-08 06:30:42 |          |
|       1 | public       |       1 |     0 | 2022-11-08 06:30:42 |          |
+---------+--------------+---------+-------+---------------------+----------+

Through the `mo_user` table and the `mo_user_grant` table, you can know that the `admin` has two roles, `accountadmin` and `public`, and the default role is `accountadmin`. The code example is as follows:

```sql
> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|       2 | localhost | admin     | test123               | unlock | 2022-11-08 06:30:42 | NULL         | PASSWORD   |       1 |     0 |            2 |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
> select * from mo_catalog.mo_user_grant;
+---------+---------+---------------------+-------------------+
| role_id | user_id | granted_time        | with_grant_option |
+---------+---------+---------------------+-------------------+
|       2 |       2 | 2022-11-08 06:30:42 | true              |
|       1 |       2 | 2022-11-08 06:30:42 | true              |
+---------+---------+---------------------+-------------------+
```

Privileges held by the `accountadmin` role can be viewed by looking at the `mo_role_privs` table. The code example is as follows:

```sql
> select * from mo_catalog.mo_role_privs;
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
| role_id | role_name    | obj_type | obj_id | privilege_id | privilege_name     | privilege_level | operation_user_id | granted_time        | with_grant_option |
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
|       2 | accountadmin | account  |      0 |            3 | create user        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            4 | drop user          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            5 | alter user         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            6 | create role        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            7 | drop role          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            9 | create database    | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           10 | drop database      | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           11 | show databases     | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           12 | connect            | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           13 | manage grants      | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           14 | account all        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           18 | show tables        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           20 | create table       | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           23 | drop table         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           26 | alter table        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           21 | create view        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           24 | drop view          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           27 | alter view         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           28 | database all       | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           29 | database ownership | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           30 | select             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           31 | insert             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           32 | update             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           33 | truncate           | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           34 | delete             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           35 | reference          | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           36 | index              | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           37 | table all          | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           38 | table ownership    | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           41 | values             | t               |                 1 | 2022-11-08 06:30:42 | true              |
|       1 | public       | account  |      0 |           12 | connect            | *               |                 1 | 2022-11-08 06:30:42 | true              |
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
```

## Custom users and roles

User data can be managed more flexibly with custom users and roles. The following content will describe how to create custom users and roles.

1. Create a database named `db1` and a table named `t1`. The code example is as follows:

    ```sql
    > create database db1;
    > create table db1.t1(c1 int,c2 varchar);
    ```

2. To check the `owner` of table `t1`, you can see that the `owner` is `accountadmin` in the following code example:

    The code example is as follows:

    ```sql
    > select * from mo_catalog.mo_tables where relname='t1';
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    | rel_id | relname | reldatabase | reldatabase_id | relpersistence | relkind | rel_comment | rel_createsql                           | created_time        | creator | owner | account_id | partitioned              | viewdef          |
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    |   1085 | t1      | db1         |           1009 | p              | r       |             | create table db1.t1 (c1 int,c2 varchar) | 2022-11-08 19:02:06 |       2 |     2 |          1 | 0x                       | 0x               |
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    > select * from mo_role;
    +---------+--------------+---------+-------+---------------------+----------+
    | role_id | role_name    | creator | owner | created_time        | comments |
    +---------+--------------+---------+-------+---------------------+----------+
    |       2 | accountadmin |       1 |     0 | 2022-11-08 06:30:42 |          |
    |       1 | public       |       1 |     0 | 2022-11-08 06:30:42 |          |
    +---------+--------------+---------+-------+---------------------+----------+
    ```

3. Create new users `u1`, `u2`, new roles `r1`, `r2`. The code example is as follows:

    ```sql
    > create user u1 identified by 'user123';
    > create user u2 identified by 'user123';
    > create role r1;
    > create role r2;
    ```

4. Grants `select` permission on `db1.t1` to role `r1` and `insert` permission to role `r2`. The code example is as follows:

    ```sql
    > grant select on table db1.t1 to r1;
    > grant insert on table db1.t1 to r2;
    ```

5. Check the table `mo_role_privs` to see if the authorization is successful. The code example is as follows:

    ```sql
    > select * from mo_role_privs where role_name='r1' or role_name='r2';
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    | role_id | role_name | obj_type | obj_id | privilege_id | privilege_name | privilege_level | operation_user_id | granted_time        | with_grant_option |
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    |       4 | r2        | table    |   1085 |           31 | insert         | d.t             |                 2 | 2022-11-08 11:30:20 | false             |
    |       3 | r1        | table    |   1085 |           30 | select         | d.t             |                 2 | 2022-11-08 11:26:20 | false             |
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    ```

6. Assign role `r1` to `u1` and role `r2` to `u2`. The code example is as follows:

    ```sql
    > grant r1 to u1;
    > grant r2 to u2;
    ```

7. Check the table `mo_user_grant` to check whether the authorization is successful. The code example is as follows:

    ```sql
    > select * from mo_user_grant where user_id = 3 or user_id = 4;
    +---------+---------+---------------------+-------------------+
    | role_id | user_id | granted_time        | with_grant_option |
    +---------+---------+---------------------+-------------------+
    |       1 |       3 | 2022-11-08 10:22:07 | true              |
    |       1 |       4 | 2022-11-08 11:08:11 | true              |
    |       3 |       3 | 2022-11-08 11:13:55 | false             |
    |       4 |       4 | 2022-11-08 11:14:01 | false             |
    +---------+---------+---------------------+-------------------+
    ```

8. It can be seen that the user `u1` has been granted the `r1` role, and `r1` has been granted the `select` permission of `db1.t1`, so `u1` has the `select` permission of `db1.t1`, that is It means that the user `u1` can view the data of `db1.t1`; similarly, the user `u2` has the `insert` operation authority, which means that the user `u2` can insert data into `db1.t1`.

![](https://github.com/matrixorigin/artwork/blob/main/docs/security/custom-user.png?raw=true)

9. Log in to the database under account `a1` using `u1` and `u2`, respectively, and check whether the permissions take effect. The code example is as follows:

    ```sql
    > mysql -h 127.0.0.1 -P 6001 -u a1:u2:r2 -p
    > insert into db1.t1 values (1,'shanghai'),(2,'beijing');
    Query OK, 2 rows affected (0.05 sec)
    > select * from db1.t1;
    ERROR 20101 (HY000): internal error: do not have privilege to execute the statement

    > mysql -h 127.0.0.1 -P 6001 -u a1:u1:r1 -p
    > select * from db1.t1;
    +------+----------+
    | c1   | c2       |
    +------+----------+
    |    1 | shanghai |
    |    2 | beijing  |
    +------+----------+
    > insert into db1.t1 values (3,'guangzhou');
    ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
    ```
