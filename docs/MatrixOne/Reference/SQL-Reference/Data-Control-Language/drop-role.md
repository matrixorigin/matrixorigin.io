# **DROP ROLE**

## **Description**

Removes the specified role from the system.

## **Syntax**

```
> DROP ROLE [IF EXISTS] role [, role ] ...
```

## **Examples**

```sql
> drop role if exists rolex;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    If the user using this role is in a session, when the role is removed, the session will be disconnected immediately, and this role can no longer be used for operations.
