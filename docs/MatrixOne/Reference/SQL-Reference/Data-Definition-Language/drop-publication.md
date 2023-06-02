# **DROP PUBLICATION**

## **Description**

`DROP PUBLICATION` can delete the existed publication.

## **Syntax**

```
DROP PUBLICATION pubname;
```

## **Explanations**

- pubname: The name of an existing publication whose definition is to be deleted.

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

mysql> drop publication pub3;
Query OK, 0 rows affected (0.01 sec)

mysql> show publications;
Empty set (0.00 sec)  
```
