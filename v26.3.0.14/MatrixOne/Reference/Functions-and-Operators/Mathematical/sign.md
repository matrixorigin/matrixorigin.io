---
title: "SIGN()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: "The SIGN() function returns the sign of a number: -1 for negative, 0 for zero, and 1 for positive."
---
# **SIGN()**

> Returns the sign of the input number as -1, 0, or 1 for negative, zero, and positive values respectively. Returns NULL if the input is NULL.

## **Description**

The `SIGN()` function returns the sign of the input number. It returns -1 if the number is negative, 0 if the number is zero, and 1 if the number is positive.

## Syntax

```
> SIGN(number)
```

## Arguments

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## Examples

```sql
DROP DATABASE IF EXISTS sign_tests;
CREATE DATABASE sign_tests;
USE sign_tests;

CREATE TABLE t1(a INT, b DOUBLE);
INSERT INTO t1 VALUES (5, 5.5), (0, 0.0), (-5, -5.5), (100, 100.5), (-100, -100.5);
SELECT a, SIGN(a) AS sign_a, b, SIGN(b) AS sign_b FROM t1;

DROP DATABASE sign_tests;
```
