# **SHOW SUBSCRIPTIONS**

## **Description**

Returns all publish names, publish tenant names, published database names, times published to that tenant, subscription names, and times when that subscription was created.

## **Syntax**

```
SHOW SUBSCRIPTIONS [ALL];
```

## **Syntax explanation**

- The **ALL** option allows you to see all subscriptions with permissions, unsubscribed sub_time, sub_name is null, without **ALL** you can only see the published information of subscribed ones.

## **Examples**

```sql
mysql> show subscriptions all;
+----------+-------------+--------------+---------------------+----------+----------+
| pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time |
+----------+-------------+--------------+---------------------+----------+----------+
| pub3     | sys         | t            | 2024-04-23 11:11:06 | NULL     | NULL     |
+----------+-------------+--------------+---------------------+----------+----------+
1 row in set (0.01 sec)

mysql> show subscriptions;
Empty set (0.00 sec)

mysql>  create database sub3 from sys publication pub3;
Query OK, 1 row affected (0.02 sec)

mysql> show subscriptions all;
+----------+-------------+--------------+---------------------+----------+---------------------+
| pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
+----------+-------------+--------------+---------------------+----------+---------------------+
| pub3     | sys         | t            | 2024-04-23 11:11:06 | sub3     | 2024-04-23 11:12:11 |
+----------+-------------+--------------+---------------------+----------+---------------------+
1 row in set (0.00 sec)

mysql> show subscriptions;
+----------+-------------+--------------+---------------------+----------+---------------------+
| pub_name | pub_account | pub_database | pub_time            | sub_name | sub_time            |
+----------+-------------+--------------+---------------------+----------+---------------------+
| pub3     | sys         | t            | 2024-04-23 11:11:06 | sub3     | 2024-04-23 11:12:11 |
+----------+-------------+--------------+---------------------+----------+---------------------+
1 row in set (0.01 sec)

```