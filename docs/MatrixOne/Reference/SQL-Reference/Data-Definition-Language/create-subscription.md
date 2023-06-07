# **CREATE...FROM...PUBLICATION...**

## **Description**

`CREATE...FROM...PUBLICATION...` is when the subscriber subscribes to a publication created by the publisher to obtain the publisher's shared data.

## **Syntax**

```
CREATE DATABASE database_name
FROM account_name
PUBLICATION pubname;
```

## **Explanations**

- database_name: The name of the database created by the subscriber.
- pubname: The name of the publication that the publisher has published.
- account_name: The account name of the publication can be obtained.

## **Examples**

```sql
--Suppose the system administrator creates a account acc1 as the subscriber
create account acc1 admin_name 'root' identified by '111';

--Assuming session 1 is the publisher, the publisher first publishes a database to the account
create database sys_db_1;
use sys_db_1;
create table sys_tbl_1(a int primary key );
insert into sys_tbl_1 values(1),(2),(3);
create view v1 as (select * from sys_tbl_1);
create publication sys_pub_1 database sys_db_1;
mysql> show publications;
+-----------+----------+
| Name      | Database |
+-----------+----------+
| sys_pub_1 | sys_db_1 |
+-----------+----------+
1 row in set (0.01 sec)

--Open a new session again, assuming that session 2 is the subscriber and the subscriber subscribes to the published database
mysql -h 127.0.0.1 -P 6001 -u acc1:root -p  -- Log into the account
create database sub1 from sys publication pub1;

mysql> create database sub1 from sys publication sys_pub_1;
Query OK, 1 row affected (0.02 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| system             |
| system_metrics     |
| information_schema |
| mysql              |
| mo_catalog         |
| sub1               |
+--------------------+
6 rows in set (0.00 sec)

mysql> show subscriptions;
+------+--------------+
| Name | From_Account |
+------+--------------+
| sub1 | sys          |
+------+--------------+
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
-- Subscribe successfully
```

!!! note
    If you need to unsubscribe, you can directly delete the subscribed database. Refer to ['DROP DATABASE`](drop-database.md ).
