---
title: "DEGREES()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: "The DEGREES() function converts a value from radians to degrees by multiplying by 180/PI()."
---
# **DEGREES()**

> Converts a numeric value from radians to degrees. Returns the argument multiplied by `180/PI()`. Returns NULL if the input is NULL.

## **Description**

The `DEGREES()` function converts the input number from radians to degrees. The conversion uses the formula `X * 180 / PI()`.

## Syntax

```
> DEGREES(X)
```

## Arguments

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. The angle in radians. Supports any numeric type. |

## Examples

```sql
DROP DATABASE IF EXISTS degrees_tests;
CREATE DATABASE degrees_tests;
USE degrees_tests;

SELECT DEGREES(PI()) AS half_circle;
SELECT DEGREES(PI()/2) AS right_angle;
SELECT DEGREES(0) AS zero;
SELECT DEGREES(-PI()) AS neg_half_circle;
SELECT DEGREES(NULL) AS null_result;

DROP DATABASE degrees_tests;
```
