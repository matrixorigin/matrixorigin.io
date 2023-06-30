# **ALTER ACCOUNT**

## **Description**

Modify account information.

!!! note
    1. The cluster administrator (i.e., the root user) can modify the password of the account it creates.
    2. Accounts themselves can modify their own passwords.
    2. Only the cluster administrator (i.e., the root user) can perform **SUSPEND** ​​and **RECOVER (OPEN)** account operations.

## **Syntax**

```
> ALTER ACCOUNT [IF EXISTS]
account auth_option [COMMENT 'comment_string']

auth_option: {
ADMIN_NAME [=] 'admin_name'
IDENTIFIED BY 'auth_string'
}

status_option: {
OPEN
| SUSPEND
}
```

### Explanations

### auth_option

Modifies the default account name and authorization mode of the account, `auth_string` specifies the password explicitly.

### status_option

Set the state of the account. They are stored as VARCHAR in the mo_account table under the system database mo_catalog.

- SUSPEND: Suspend the account's service; that is, the account can no longer access MatrixOne after the suspension; users who are accessing the account can continue to access, and after closing the session, they will no longer be able to access MatrixOne.
- OPEN: Resume a suspended account, after which the account will usually access MatrixOne.

### comment

Account notes are stored as VARCHAR in the table *mo_account* in the system database *mo_catalog*.

`COMMENT` can be arbitrary quoted text, and the new `COMMENT` replaces any existing user comments. As follows:

```sql
mysql> desc mo_catalog.mo_account;
+----------------+--------------+------+------+---------+-------+---------+
| Field          | Type         | Null | Key  | Default | Extra | Comment |
+----------------+--------------+------+------+---------+-------+---------+
| account_id     | INT          | YES  |      | NULL    |       |         |
| account_name   | VARCHAR(300) | YES  |      | NULL    |       |         |
| status         | VARCHAR(300) | YES  |      | NULL    |       |         |
| created_time   | TIMESTAMP    | YES  |      | NULL    |       |         |
| comments       | VARCHAR(256) | YES  |      | NULL    |       |         |
| suspended_time | TIMESTAMP    | YES  |      | null    |       |         |
+----------------+--------------+------+------+---------+-------+---------+
6 rows in set (0.06 sec)
```

## **Examples**

- Example 1: Modify the information on the account

```sql
-- Create a account named "root1" with password "111"
mysql> create account acc1 admin_name "root1" identified by "111";
Query OK, 0 rows affected (0.42 sec)
-- Change the initial password "111" to "Abcd_1234@1234"
mysql> alter account acc1 admin_name "root1" identified by "Abcd_1234@1234";
Query OK, 0 rows affected (0.01 sec)
-- Modify the comment for account "root1"
mysql> alter account acc1 comment "new account";
Query OK, 0 rows affected (0.02 sec)
-- Check to verify that the "new account" comment has been added to the account "root1"
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status | suspended_time | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| acc1         | root1      | 2023-02-15 06:26:51 | open   | NULL           |        5 |          34 |       787 | 0.036 | new account    |
| sys          | root       | 2023-02-14 06:58:15 | open   | NULL           |        8 |          57 |      3767 | 0.599 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
3 rows in set (0.19 sec)
```

- Example 2: Modify the status of the account

```sql
-- Create a account named "root1" with password "111"
mysql> create account accx admin_name "root1" identified by "111";
Query OK, 0 rows affected (0.27 sec)
-- Modify the account status to "suspend", that is, suspend user access to MatrixOne.
mysql> alter account accx suspend;
Query OK, 0 rows affected (0.01 sec)
-- Check if the modification status is successful.
mysql> show accounts;
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status  | suspended_time      | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
| accx         | root1      | 2023-02-15 06:26:51 | suspend | 2023-02-15 06:27:15 |        5 |          34 |       787 | 0.036 | new accout     |
| sys          | root       | 2023-02-14 06:58:15 | open    | NULL                |        8 |          57 |      3767 | 0.599 | system account |
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
2 rows in set (0.15 sec)
```
