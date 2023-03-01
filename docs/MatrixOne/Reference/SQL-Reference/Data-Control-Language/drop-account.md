# **DROP ACCOUNT**

## **Description**

Delete the account in your organization.

## **Syntax**

```
> DROP ACCOUNT  [IF EXISTS] account
```

## **Examples**

```sql
> drop account if exists tenant_test;
Query OK, 0 rows affected (0.12 sec)
```

!!! note
    If the account is in the session, when the account is removed, the session will be disconnected and MatrixOne can no longer be connected.
