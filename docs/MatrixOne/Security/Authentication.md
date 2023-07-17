# Authentication and Authorization

When accessing the MatrixOne database, users need to undergo authentication and authorization. Currently, MatrixOne only supports username-password authentication. The database verifies the identity of the user accessing the data, confirms whether the user can be associated with a database user, and checks the validity of the provided password.

## Syntax

In MatrixOne, a user's login identity comprises `acccount_name`, `user_name`, `host`, and `password`. The complete syntax is as follows:

```
mysql -h host -p password -u accountname:username -P port
```

The `-h`, `-p`, and `-P` parameters are the same as those used in MySQL. The difference lies in:

* `-u` represents the user. In MatrixOne's user system, users are a concept below the tenant `account`. Therefore, when logging in, you need to specify the tenant `account_name` first and then specify the user `username` within the tenant to complete the login. If `account_name` is not specified, the default is the system tenant `sys`.

Example:

```
> mysql -h 127.0.0.1 -P6001 -utenant1:u1 -p111
```

!!! note
    For the standalone version of MatrixOne, you can configure the connection string as parameters in the [mo_ctl tool](../Maintain/mo_ctl.md) to simplify the login process.

## Query Current User

After logging in, you can retrieve information about the current user using the `user()` or `current_user()` functions.

```
mysql> select user();
+--------------------+
| user()             |
+--------------------+
| tenant1:u1@0.0.0.0 |
+--------------------+
1 row in set (0.00 sec)
mysql> select current_user();
+--------------------+
| current_user()     |
+--------------------+
| tenant1:u1@0.0.0.0 |
+--------------------+
1 row in set (0.00 sec)
```

!!! note
    MatrixOne currently does not support IP whitelisting. Therefore, regardless of the location you log in, the user will always be shown as 0.0.0.0.

## Query All Users

Each user identity is unique, and users with the `accountadmin` role in a tenant can view all users within that tenant.

```
mysql> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string                     | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|   10001 | localhost | u1        | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-10 06:43:44 | NULL         | PASSWORD   |       0 |     0 |            1 |
|       0 | localhost | root      | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-08 03:17:27 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       1 | localhost | root      | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-08 03:17:27 | NULL         | PASSWORD   |       0 |     0 |            0 |
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
3 rows in set (0.01 sec)
```

!!! note
    The location and table structure of user records in MatrixOne differs from MySQL. In MatrixOne, user metadata is not stored in the `mysql.user` table but in the `mo_catalog.mo_user` table.

## Constraints

1. MatrixOne currently does not enforce password complexity requirements. It is recommended that users set strong passwords. For password modification operations, refer to [Password Management](password-mgmt.md).
2. The initial password for the initial user (`root` user of the `sys` tenant) in MatrixOne is 111. After users modify their passwords, they need to remember the new password. Once a password is forgotten, MatrixOne currently does not provide a means to retrieve or bypass security verification to reset the password. Reinstallation of MatrixOne is required.
