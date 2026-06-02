---
title: "TRUNCATE()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: "The TRUNCATE() function returns a number truncated to the specified number of decimal places, without rounding."
---
# **TRUNCATE()**

> Returns the input number truncated to the specified number of decimal places without rounding. Unlike `ROUND()`, `TRUNCATE()` simply drops the extra fractional digits.

## **Description**

The `TRUNCATE()` function returns the number `X` truncated to `D` decimal places. If `D` is 0, the result has no decimal point or fractional part. `D` can be negative to truncate (make zero) `D` digits left of the decimal point. Unlike `ROUND()`, `TRUNCATE()` does not perform any rounding.

## Syntax

```
> TRUNCATE(X, D)
```

## Arguments

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. The number to truncate. |
| D | Required. The number of decimal places to keep. |

## Examples

```sql
DROP DATABASE IF EXISTS truncate_tests;
CREATE DATABASE truncate_tests;
USE truncate_tests;

CREATE TABLE t1(a DOUBLE, b INT);
INSERT INTO t1 VALUES (4.567, 2), (4.567, 0), (-4.567, 2), (10.123456, 3), (-10.123456, 3);
SELECT a, b, TRUNCATE(a, b) AS truncated FROM t1;

DROP DATABASE truncate_tests;
```
