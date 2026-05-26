---
title: "TIMESTAMPADD()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The TIMESTAMPADD() function adds an integer interval of the specified unit to a date, datetime, or timestamp expression datetime_expr and returns the result."
---

# **TIMESTAMPADD()**

> The TIMESTAMPADD() function adds an integer interval of the specified unit to a date, datetime, or timestamp expression datetime_expr and returns the result.

## **Description**

The `TIMESTAMPADD()` function adds an integer `interval` of the specified `unit` to a date, datetime, or timestamp expression `datetime_expr` and returns the result.

The return type is aligned with the input type:

- When `datetime_expr` is `DATE` and `unit` is a date unit (`DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`), the result is `DATE`.
- When `datetime_expr` is `DATE` and `unit` is a time unit (`HOUR`, `MINUTE`, `SECOND`, `MICROSECOND`), the result is `DATETIME` (MySQL-compatible promotion).
- When `datetime_expr` is `DATETIME`, the result is `DATETIME`.
- When `datetime_expr` is `TIMESTAMP`, the result is `TIMESTAMP`.
- When `datetime_expr` is a string, the result is returned as a string.

`MICROSECOND` results carry scale 6; other time units carry scale 0. If either `interval` or `datetime_expr` is `NULL`, or if the addition would overflow the maximum representable datetime, the function returns `NULL`.

## **Syntax**

```
> TIMESTAMPADD(unit, interval, datetime_expr)
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| unit | Required. One of `MICROSECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`. |
| interval | Required. An integer; may be negative to subtract. |
| datetime_expr | Required. A `DATE`, `DATETIME`, `TIMESTAMP`, or string expression. |

## **Examples**

```sql
DROP DATABASE IF EXISTS timestampadd_demo;
CREATE DATABASE timestampadd_demo;
USE timestampadd_demo;

SELECT TIMESTAMPADD(DAY,    5,  DATE '2023-01-01')                  AS r1;
SELECT TIMESTAMPADD(HOUR,   2,  CAST('2023-01-01' AS DATE))          AS r2;
SELECT TIMESTAMPADD(MINUTE, 30, CAST('2023-01-01 10:00:00' AS DATETIME)) AS r3;
SELECT TIMESTAMPADD(MICROSECOND, 500, CAST('2023-01-01 10:00:00' AS DATETIME)) AS r4;
SELECT TIMESTAMPADD(MONTH,  -3, CAST('2023-05-15' AS DATE))          AS r5;

DROP DATABASE timestampadd_demo;
```
