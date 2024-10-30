# **CREATE...FROM...PUBLICATION...**

## **Syntax description**

`CREATE...FROM...PUBLICATION...` means the subscriber subscribes to a publication created by the publisher to obtain the publisher's shared data.

## **Grammar structure**

```
CREATE DATABASE database_name
FROM account_name
PUBLICATION pubname;
```

## Grammar explanation

- database_name: The name of the database created by the subscriber.
- pubname: The publication name published by the publisher.
- account_name: The tenant name of the publication can be obtained.

## **Example**

```sql
create account acc01 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--Create a publication
create publication db_pub1 database db1 account acc01;
create publication tab_pub1 database db1 table t1,t2 account acc01;

--Connect tenant acc01
mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-25 17:06:06 | NULL     | NULL     |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-25 17:05:54 | NULL     | NULL     |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
2 rows in set (0.00 sec)

create database db_sub1 from sys publication db_pub1;
create database tab_sub1 from sys publication tab_pub1;

mysql> show subscriptions;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-25 17:06:06 | tab_sub1 | 2024-10-25 17:09:24 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-25 17:05:54 | db_sub1  | 2024-10-25 17:09:23 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)
```

!!! note
    If you need to cancel the subscription, you can directly delete the subscribed database name and use [`DROP DATABASE`](drop-database.md).