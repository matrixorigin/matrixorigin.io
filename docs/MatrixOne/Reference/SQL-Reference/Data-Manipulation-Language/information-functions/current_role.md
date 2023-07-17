# **CURRENT_ROLE()**

## **Description**

Returns the role of the current session.

## **Syntax**

```
SELECT CURRENT_ROLE();
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

-- Create a role and switch to the new role
create role use_role_1;
grant all on database * to use_role_1;
grant use_role_1 to root;
set role use_role_1;
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| use_role_1     |
+----------------+
1 row in set (0.00 sec)
```
