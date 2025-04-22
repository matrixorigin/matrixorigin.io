# **SHOW ROLES**

## **Description**

Lists the meta information of the roles created under your account, including role name, creator, creation time, and comments.

__Note:__ To query the role you are currently using, use the [`select current_role()`](../../../Functions-and-Operators/system-ops/current_role.md) statement.

## **Syntax**

```
> SHOW ROLES [LIKE 'pattern'];
```

## **Examples**

```sql
-- Show the roles currently under your account
mysql> show roles;
+-----------+---------+---------------------+----------+
| ROLE_NAME | CREATOR | CREATED_TIME        | COMMENTS |
+-----------+---------+---------------------+----------+
| moadmin   |       0 | 2023-04-19 06:37:58 |          |
| public    |       0 | 2023-04-19 06:37:58 |          |
+-----------+---------+---------------------+----------+
2 rows in set (0.01 sec)

-- create a new role named rolex
mysql> create role rolex;
Query OK, 0 rows affected (0.02 sec)

-- Show the roles currently under your account
mysql> show roles;
+-----------+---------+---------------------+----------+
| ROLE_NAME | CREATOR | CREATED_TIME        | COMMENTS |
+-----------+---------+---------------------+----------+
| rolex     |       1 | 2023-04-19 06:43:29 |          |
| moadmin   |       0 | 2023-04-19 06:37:58 |          |
| public    |       0 | 2023-04-19 06:37:58 |          |
+-----------+---------+---------------------+----------+
3 rows in set (0.01 sec)

-- Query the role you are currently using
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| moadmin        |
+----------------+
1 row in set (0.00 sec)
```
