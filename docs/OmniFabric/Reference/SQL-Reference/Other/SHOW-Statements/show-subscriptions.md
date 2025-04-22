# **SHOW SUBSCRIPTIONS**

## **Syntax description**

Returns all publication names, publishing tenant names, published database names, published table names, comments, time published to the tenant, subscription name, time when the subscription was created, and subscription status (0: normal subscription possible; 1: publication exists , but no subscription rights; 2: Originally subscribed to the publication, but deleted the publication).

## **Grammar structure**

```
SHOW SUBSCRIPTIONS [ALL];
```

## **Grammar explanation**

-The **ALL**option allows you to see all subscriptions with permissions. For unsubscribed sub_time, sub_name is null. Without **ALL**, you can only see subscribed publication information.

## **Example**

```sql

--Execute in sys tenant

create account acc01 admin_name 'root' identified by '111';
create account acc02 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--Database level publishing
create publication db_pub1 database db1 account acc01,acc02;

--Table level publishing
create publication tab_pub1 database db1 table t1,t2 account acc01,acc02;

-- Executed in acc01 tenant
mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | NULL     | NULL     |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | NULL     | NULL     |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
2 rows in set (0.00 sec)

mysql> show subscriptions;
Empty set (0.00 sec)

create database db_sub1 from sys publication db_pub1;
create database tab_sub1 from sys publication tab_pub1;

mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | tab_sub1 | 2024-10-14 19:01:41 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | db_sub1  | 2024-10-14 19:01:30 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)

mysql> show subscriptions;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | tab_sub1 | 2024-10-14 19:01:41 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | db_sub1  | 2024-10-14 19:01:30 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)
```
