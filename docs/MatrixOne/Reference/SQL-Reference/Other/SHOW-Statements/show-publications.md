# **SHOW PUBLICATIONS**

## **Description**

Returns a list of all PUBLICATION names and corresponding database names.

For more information, you need have the authority of account administrator; check the system table mo_pubs for more parameters.

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
+------+----------+
| Name | Database |
+------+----------+
| pub3 | t        |
+------+----------+
1 row in set (0.00 sec)
```
