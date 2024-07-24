# **SHOW PUBLICATIONS**

## **Description**

Returns a list of all publish names, the database name of the publish, the publish creation time, the publish last modification time, a list of the tenant names specified by the publish (show "*" if all), and notes.

For more information, you need to have tenant administrator privileges and view the system table mo_pubs to see more parameters.

## **Syntax**

```
SHOW PUBLICATIONS;
```

## **Examples**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

mysql> show publications;
+-------------+----------+---------------------+-------------+-------------+----------+
| publication | database | create_time         | update_time | sub_account | comments |
+-------------+----------+---------------------+-------------+-------------+----------+
| pub3        | t        | 2024-04-23 10:10:59 | NULL        | acc0,acc1   |          |
+-------------+----------+---------------------+-------------+-------------+----------+
1 row in set (0.00 sec)
```
