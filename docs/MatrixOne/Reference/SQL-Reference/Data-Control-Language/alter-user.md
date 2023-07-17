# **ALTER USER**

## **Description**

Modify the attributes and passwords of database users.

!!! note
    1. Accounts can modify the passwords of the users they create and only modify the passwords of one user at a time. The modified passwords will take effect on the next login, and the current session will not be interrupted.
    2. Users can modify their own passwords, and the modified passwords will take effect on the next login, and the current session will not be interrupted.

## **Syntax**

```
ALTER USER [IF EXISTS]
    user auth_option

auth_option: {
    IDENTIFIED BY 'auth_string'}
```

### Explanations

### auth_option

Specifies the default user name and authorization mode of the account, `auth_string` specifies the password explicitly.

## **Examples**

```sql
-- Create a user named "admin_1" with password "123456"
mysql> create user admin_1 identified by '123456';
Query OK, 0 rows affected (0.02 sec)

-- Modify the user's initial password "123456" to "111111"
mysql> alter user 'admin_1' identified by '111111';
Query OK, 0 rows affected (0.02 sec)

-- Check if the password was changed successfully
mysql> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|       0 | localhost | root      | 111                   | unlock | 2023-04-19 06:37:58 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       1 | localhost | root      | 111                   | unlock | 2023-04-19 06:37:58 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       2 | localhost | admin_1   | 111111                | unlock | 2023-04-21 06:21:31 | NULL         | PASSWORD   |       1 |     0 |            1 |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
3 rows in set (0.01 sec)
```

<!--select admin_1, mr.role_name  from mo_catalog.mo_role mr, mo_catalog.mo_user mu, mo_catalog.mo_user_grant mur
where mr.role_id =mur.role_id and mu.user_id = mur.user_id
order by mu.user_id asc, mr.role_id ;-->
