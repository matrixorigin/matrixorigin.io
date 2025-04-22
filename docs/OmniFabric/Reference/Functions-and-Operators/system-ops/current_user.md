# **CURRENT_USER, CURRENT_USER()**

## **Description**

Returns the current user account; the returned account format is username@hostname. The return value is a string in the utf8mb3 character set.

## **Syntax**

```
SELECT CURRENT_USER();
```

## **Examples**

```sql
mysql> select current_user();
+----------------+
| current_user() |
+----------------+
| root@0.0.0.0   |
+----------------+
1 row in set (0.00 sec)
```
