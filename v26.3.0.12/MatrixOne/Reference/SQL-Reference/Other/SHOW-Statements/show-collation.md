---
title: "SHOW COLLATION"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Only utf8mb4_bin is effective; other collations appear but are inert"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This statement lists collations supported by MatrixOne."
---
# **SHOW COLLATION**

> This statement lists collations supported by MatrixOne.

## **Description**

This statement lists collations supported by MatrixOne. By default, the output from SHOW COLLATION includes all available collations. The LIKE clause, if present, indicates which collation names to match. The WHERE clause can be given to select rows using more general conditions.

## **Syntax**

```
> SHOW COLLATION
    [LIKE 'pattern' | WHERE expr]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> show collation;
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)

mysql> show collation like '%';
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)

mysql> show collation where 'Charset'='utf8mb4';
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)
```
