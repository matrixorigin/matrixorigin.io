---
title: "BIT_AND"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Aggregate function. The BIT_AND(expr) function returns the bitwise AND of all bits in expr."
---
# **BIT_AND**

> Aggregate function. The BIT_AND(expr) function returns the bitwise AND of all bits in expr.

## **Description**

Aggregate function.

The BIT_AND(expr) function returns the bitwise AND of all bits in expr.

## **Syntax**

```
> BIT_AND(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | UINT data types |

## **Examples**

```sql
> drop table if exists t1;
> CREATE TABLE t1 (id CHAR(1), number INT);
> INSERT INTO t1 VALUES
      ('a',111),('a',110),('a',100),
      ('a',000),('b',001),('b',011);

> select id, BIT_AND(number) FROM t1 GROUP BY id;
+------+-----------------+
| id   | bit_and(number) |
+------+-----------------+
| a    |               0 |
| b    |               1 |
+------+-----------------+
```
