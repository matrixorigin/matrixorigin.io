# **SHOW PUBLICATIONS**

## **Syntax description**

Returns information such as all publication names, published database/table names, publication creation time, publication latest modification time, and a list of tenant names specified by the publication (if all, "*" is displayed).

To view more information, you need to have tenant administrator rights and view the system table mo_pubs to view more parameters.

## **Grammar structure**

```
SHOW PUBLICATIONS;
```

## **Example**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

mysql> show publications;
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
| publication | database | tables | sub_account | subscribed_accounts | create_time         | update_time | comments |
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
| pub3        | t        | *      | acc0,acc1   |                     | 2024-10-25 16:36:04 | NULL        |          |
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
1 row in set (0.00 sec)
```
