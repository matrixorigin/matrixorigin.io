---
title: "ADDTIME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The ADDTIME() function adds expr2 to expr1 and returns the result."
---

# **ADDTIME()**

> The ADDTIME() function adds expr2 to expr1 and returns the result.

## **Description**

The `ADDTIME()` function adds `expr2` to `expr1` and returns the result. `expr1` is a `TIME`, `DATETIME`, or `TIMESTAMP` value (or a string that can be parsed as such); `expr2` is a `TIME` expression (optionally including a day part, such as `'1 1:1:1.000002'`). The return type follows the input type:

- When `expr1` is `TIME`, the result is `TIME`.
- When `expr1` is `DATETIME` or `TIMESTAMP`, the result is `DATETIME`.
- When `expr1` is a string, the result is `DATETIME` with scale 6 (microsecond precision).

The scale of the result is the larger of the scales of the two input values. The function returns `NULL` when either argument is `NULL` or cannot be parsed.

## **Syntax**

```
> ADDTIME(expr1, expr2)
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| expr1 | Required. A `TIME`, `DATETIME`, `TIMESTAMP`, or string value that will be added to. |
| expr2 | Required. A `TIME` value, or a string that can be parsed as a `TIME`. |

## **Examples**

```sql
DROP DATABASE IF EXISTS addtime_demo;
CREATE DATABASE addtime_demo;
USE addtime_demo;

SELECT ADDTIME('2007-12-31 23:59:59.999999', '1 1:1:1.000002') AS r1;
SELECT ADDTIME('01:00:00.999999', '02:00:00.999998')           AS r2;
SELECT ADDTIME(CAST('10:00:00' AS TIME), '01:30:00')            AS r3;

DROP DATABASE addtime_demo;
```
