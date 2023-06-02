# **SHOW SUBSCRIPTIONS**

## **Description**

Returns a list of all subscription library names and source account names.

## **Syntax**

```
SHOW SUBSCRIPTIONS;
```

## **Examples**

```sql
Create database sub1 from sys publication pub1;

mysql> create database sub1 from sys publication sys_pub_1;
Query OK, 1 row affected (0.02 sec)

mysql> show subscriptions;
+------+--------------+
| Name | From_Account |
+------+--------------+
| sub1 | sys          |
+------+--------------+
1 row in set (0.01 sec)
```
