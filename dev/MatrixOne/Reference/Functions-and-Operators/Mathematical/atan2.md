---
title: "ATAN2()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: "The ATAN2() function returns the arctangent of Y divided by X, using the signs of both arguments to determine the quadrant of the result."
---
# **ATAN2()**

> Returns the arctangent of `Y / X` in radians. Unlike `ATAN(Y/X)`, `ATAN2(Y, X)` uses the signs of both arguments to determine the correct quadrant of the result.

## **Description**

The `ATAN2()` function returns the angle (in radians) between the positive x-axis and the point `(X, Y)`. Both `X` and `Y` can be any numeric type. The result is in the range `[-PI, PI]`.

## Syntax

```
> ATAN2(Y, X)
```

## Arguments

|  Arguments   | Description  |
|  ----  | ----  |
| Y | Required. The y-coordinate. |
| X | Required. The x-coordinate. |

## Examples

```sql
DROP DATABASE IF EXISTS atan2_tests;
CREATE DATABASE atan2_tests;
USE atan2_tests;

SELECT ATAN2(1, 1) AS quadrant1;
SELECT ATAN2(1, -1) AS quadrant2;
SELECT ATAN2(-1, -1) AS quadrant3;
SELECT ATAN2(-1, 1) AS quadrant4;
SELECT ATAN2(0, -1) AS pi_result;
SELECT ATAN2(NULL, 1) AS null_y;
SELECT ATAN2(1, NULL) AS null_x;

DROP DATABASE atan2_tests;
```
