---
title: "SINH()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "MySQL 8.0 has no hyperbolic trigonometric functions; SINH() is a MatrixOne extension."
since: unknown
last_updated: 2026-05-08
llms_summary: "The SINH() function returns the hyperbolic sine of the input number(given in radians)."
---
# **SINH()**

> The SINH() function returns the hyperbolic sine of the input number(given in radians).

## **Description**

The SINH() function returns the hyperbolic sine of the input number(given in radians).

## **Syntax**

```
> SINH(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a int,b float);
insert into t1 values(1,3.14159), (-1,-3.14159);

mysql> select sinh(a), sinh(b) from t1;
+---------------------+---------------------+
| sinh(a)             | sinh(b)             |
+---------------------+---------------------+
|  1.1752011936438014 |  11.548709969588323 |
| -1.1752011936438014 | -11.548709969588323 |
+---------------------+---------------------+
2 rows in set (0.00 sec)
```
