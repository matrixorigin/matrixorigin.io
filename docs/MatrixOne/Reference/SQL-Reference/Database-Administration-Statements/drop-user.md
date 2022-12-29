# **DROP USER**

## **Description**

Removes the specified user from the system.

## **Syntax**

```
> DROP USER [IF EXISTS] user [, user] ...
```

## **Examples**

```sql
> drop user if exists userx;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    If the user is in a session, when the user is removed, the session is disconnected and MatrixOne can no longer be connected.
