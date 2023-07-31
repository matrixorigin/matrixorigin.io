# **CURRENT_ROLE()**

## **Description**

`CURRENT_ROLE_NAME()` is used to query the roles owned by the user you are currently logged in.

## **Syntax**

```
> CURRENT_ROLE()
```

## **Examples**

```sql
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| moadmin        |
+----------------+
1 row in set (0.00 sec)
```
