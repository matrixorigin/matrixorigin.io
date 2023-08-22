# **CURRENT_USER_NAME()**

## **Description**

`CURRENT_USER_NAME()` is used to query the name of the user you are currently logged in as.

## **Syntax**

```
> CURRENT_USER_NAME()
```

## **Examples**

```sql
mysql> select current_user_name();
+---------------------+
| current_user_name() |
+---------------------+
| root                |
+---------------------+
1 row in set (0.01 sec)
```
