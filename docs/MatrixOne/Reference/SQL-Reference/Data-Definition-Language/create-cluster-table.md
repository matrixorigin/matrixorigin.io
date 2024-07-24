# **CREATE CLUSTER TABLE**

## **Grammar description**

A cluster table is a table created by the system library `mo_catalog` under a system tenant that takes effect simultaneously under other tenants. DDL and DML operations can be performed on the table under the system tenant, other tenants can only query or create views based on the table.

This document describes how to set up cluster tables in a MatrixOne database.

## **Grammar structure**

```
> CREATE CLUSTER TABLE [IF NOT EXISTS] tbl_name
    (create_definition,...)
    [table_options]
    [partition_options]
```

## **Instructions for use**

- Creating cluster tables is limited to the sys tenant administrator role.

- The cluster table for the sys tenant contains all the data and may only see some data under other tenants.

- In the cluster table, the `account_id` field is automatically generated and represents the id of the visible tenant who specified the data when inserting or LOADING DATA. Only one visible tenant can be selected per data. If you want multiple tenants to be able to view the data, you need to insert the specified different tenant id multiple times, and the field data is not returned by queries in other tenants.

- Cluster tables cannot be exterior or temporary and have exactly the same table structure under all tenants.

## Examples

```sql
--Create two tenants, test1 and test2
mysql> create account test1 admin_name = 'root' identified by '111' open comment 'tenant_test';
Query OK, 0 rows affected (0.44 sec)

mysql> create account test2 admin_name = 'root' identified by '111' open comment 'tenant_test';
Query OK, 0 rows affected (0.51 sec)

--Create a cluster table under the sys tenant
mysql> use mo_catalog;
Database changed
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.00 sec)

mysql> create cluster table t1(a int);
Query OK, 0 rows affected (0.01 sec)

--View tenant id
mysql> select * from mo_account;
+------------+--------------+--------+---------------------+----------------+---------+----------------+
| account_id | account_name | status | created_time        | comments       | version | suspended_time |
+------------+--------------+--------+---------------------+----------------+---------+----------------+
|          0 | sys          | open   | 2024-01-11 08:56:57 | system account |       1 | NULL           |
|          6 | test1        | open   | 2024-01-15 03:15:40 | tenant_test    |       7 | NULL           |
|          7 | test2        | open   | 2024-01-15 03:15:48 | tenant_test    |       8 | NULL           |
+------------+--------------+--------+---------------------+----------------+---------+----------------+
3 rows in set (0.01 sec)

--Inserting data into clustered table t1 is only visible to test1 tenants
mysql> insert into t1 values(1,6),(2,6),(3,6);
Query OK, 3 rows affected (0.01 sec)

--Looking at the data for t1 in the sys tenant, you can see all the data including the `account_id` field
mysql> select * from t1;
+------+------------+
| a    | account_id |
+------+------------+
|    1 |          6 |
|    2 |          6 |
|    3 |          6 |
+------+------------+
3 rows in set (0.00 sec)

--Looking at the data for t1 in the test1 tenant, you can see data that is not in the `account_id` field
mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.01 sec)

--Viewing the data for t1 in the test2 tenant will not show any data
mysql> select * from t1;
Empty set (0.01 sec)

--Creating a t1-based view in a test1 tenant
mysql> create view t1_view as select * from mo_catalog.t1;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from t1_view;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

--Create a t1-based view in the test2 tenant
mysql> create view t1_view as select * from mo_catalog.t1;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from t1_view;
Empty set (0.01 sec)
```
