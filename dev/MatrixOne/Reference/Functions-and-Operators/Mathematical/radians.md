---
title: "RADIANS()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: "The RADIANS() function converts a value from degrees to radians by multiplying by PI()/180."
---
# **RADIANS()**

> Converts a numeric value from degrees to radians. Returns the argument multiplied by `PI()/180`. Returns NULL if the input is NULL.

## **Description**

The `RADIANS()` function converts the input number from degrees to radians. The conversion uses the formula `X * PI() / 180`.

## Syntax

```
> RADIANS(X)
```

## Arguments

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. The angle in degrees. Supports any numeric type. |

## Examples

```sql
DROP DATABASE IF EXISTS radians_tests;
CREATE DATABASE radians_tests;
USE radians_tests;

SELECT RADIANS(180) AS half_circle;
SELECT RADIANS(90) AS right_angle;
SELECT RADIANS(0) AS zero;
SELECT RADIANS(-180) AS neg_half_circle;
SELECT RADIANS(NULL) AS null_result;

DROP DATABASE radians_tests;
```
