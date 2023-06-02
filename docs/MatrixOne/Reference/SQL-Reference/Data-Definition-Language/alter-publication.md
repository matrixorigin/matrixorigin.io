# **ALTER PUBLICATION**

## **Description**

`ALTER PUBLICATION` can change the attributes of a publication.

You must own the publication to use ALTER PUBLICATION. Adding a table to a publication additionally requires owning that table.

## **Syntax**

```
ALTER PUBLICATION pubname ACCOUNT 
    { ALL
    | account_name, [, ... ]
    | ADD account_name, [, ... ]
    | DROP account_name, [, ... ]
    [ COMMENT 'string']
```

## **Explanations**

- pubname: The name of an existing publication whose definition is to be altered.
- account_name: The user name of the owner of the publication.

## **Examples**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;
mysql> alter publication pub3 account add accx;
show create publication pub3;
Query OK, 0 rows affected (0.00 sec)

mysql> show create publication pub3;
+-------------+-----------------------------------------------------------------------+
| Publication | Create Publication                                                    |
+-------------+-----------------------------------------------------------------------+
| pub3        | CREATE PUBLICATION `pub3` DATABASE `t` ACCOUNT `acc0`, `acc1`, `accx` |
+-------------+-----------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show publications;
+------+----------+
| Name | Database |
+------+----------+
| pub3 | t        |
+------+----------+
1 row in set (0.00 sec)
```
