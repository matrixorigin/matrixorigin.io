# **CURRENT_ROLE_NAME()**

## **Description**

`CURRENT_ROLE_NAME()` is used to query the name of the role owned by the user you are currently logged in.

## **Syntax**

```
> CURRENT_ROLE_NAME()
```

## **Examples**

```sql
mysql> select current_role_name();
+---------------------+
| current_role_name() |
+---------------------+
| moadmin             |
+---------------------+
1 row in set (0.00 sec)
```
