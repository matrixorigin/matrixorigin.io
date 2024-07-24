# **CREATE...FROM...PUBLICATION...**

## **Grammar description**

`CREATE...FROM...PUBLICATION...` is a subscription by a subscriber to a publication created by the publisher to get the publisher's shared data.

## **Grammar structure**

```
CREATE DATABASE database_name
FROM account_name
PUBLICATION pubname;
```

## Interpretation of grammar

- database_name: The name of the database created by the subscriber.
- pubname: The published name of the publisher.
- account_name: Gets the tenant name for this publication.

## **Examples**

```sql
-- Suppose the system administrator creates a tenant, acc1, as a subscriber.
create account acc1 admin_name 'root' identified by '111';

-- Assuming session 1 is the publisher, the publisher first publishes a database to the tenant
create database sys_db_1;
use sys_db_1;
create table sys_tbl_1(a int primary key );
insert into sys_tbl_1 values(1),(2),(3);
create view v1 as (select * from sys_tbl_1);
create publication sys_pub_1 database sys_db_1;
mysql> show publications;
+-------------+----------+---------------------+-------------+-------------+----------+
| publication | database | create_time         | update_time | sub_account | comments |
+-------------+----------+---------------------+-------------+-------------+----------+
| sys_pub_1   | sys_db_1 | 2024-04-24 11:54:36 | NULL        | *           |          |
+-------------+----------+---------------------+-------------+-------------+----------+
1 row in set (0.01 sec)

-- A new session is opened, assuming that session 2 is a subscriber who subscribes to the published database
mysql -h 127.0.0.1 -P 6001 -u acc1:root -p  --Login to Tenant Account

create database sub1 from sys publication sys_pub_1;
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| sub1               |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

mysql> show subscriptions;
+-----------+-------------+--------------+---------------------+----------+---------------------+
| pub_name  | pub_account | pub_database | pub_time            | sub_name | sub_time            |
+-----------+-------------+--------------+---------------------+----------+---------------------+
| sys_pub_1 | sys         | sys_db_1     | 2024-04-24 11:54:36 | sub1     | 2024-04-24 11:56:05 |
+-----------+-------------+--------------+---------------------+----------+---------------------+
1 row in set (0.01 sec)

mysql> use sub1;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+----------------+
| Tables_in_sub1 |
+----------------+
| sys_tbl_1      |
| v1             |
+----------------+
2 rows in set (0.01 sec)

mysql> desc sys_tbl_1;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | NO   | PRI  | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
1 row in set (0.01 sec)

mysql> select * from sys_tbl_1 order by a;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.01 sec)
-- Subscription Success
```

!!! note
    If you need to unsubscribe, you can simply delete the subscribed database name and use [`DROP DATABASE`](drop-database.md).
