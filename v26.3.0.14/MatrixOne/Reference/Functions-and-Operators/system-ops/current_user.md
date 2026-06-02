---
title: "CURRENT_USER, CURRENT_USER()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "The host part may be returned as 'localhost' or the resolved client host rather than MySQL's explicit 'username@host' format."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Returns the current user account; the returned account format is username@hostname."
---
# **CURRENT_USER, CURRENT_USER()**

> Returns the current user account; the returned account format is username@hostname.

## **Description**

Returns the current user account; the returned account format is username@hostname. The return value is a string in the utf8mb3 character set.

## **Syntax**

```
SELECT CURRENT_USER();
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> select current_user();
+----------------+
| current_user() |
+----------------+
| root@localhost  |
+----------------+
1 row in set (0.00 sec)
```
