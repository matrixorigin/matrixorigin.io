---
title: "INTERVAL"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "INTERVAL is internally implemented as a two-argument function rather than as a true SQL keyword; documented syntax INTERVAL(expr,unit) differs from MySQL's INTERVAL expr unit keyword-style notation"
  - "Malformed dates in DATE_ADD/DATE_SUB raise errors rather than returning NULL (MySQL 8.0 returns NULL)"
mo_only: []
since: unknown
last_updated: 2026-05-22
llms_summary: "The INTERVAL values are used mainly for date and time calculations in expressions such as DATE_ADD() and DATE_SUB()."
---
# **INTERVAL**

## **Description**

- The `INTERVAL` values are used mainly for date and time calculations. The `INTERVAL` in expressions represents a temporal interval.

- Temporal intervals are used for certain functions, such as `DATE_ADD()` and `DATE_SUB()`.

- Temporal arithmetic also can be performed in expressions using INTERVAL together with the `+` or `-` operator:

    ```
    date + INTERVAL expr unit
    date - INTERVAL expr unit
    ```

    + INTERVAL expr unit is permitted on either side of the `+` operator if the expression on the other side is a date or datetime value.
    + For the `-` operator, INTERVAL expr unit is permitted only on the right side, because it makes no sense to subtract a date or datetime value from an interval.

## **Syntax**

```
> INTERVAL (expr,unit)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
|expr| represents a quantity.|
|unit| the unit for interpreting the quantity; it is a specifier such as HOUR, DAY, or WEEK.|

Note: The `INTERVAL` keyword and the `unit` specifier are not case-sensitive.

- **Temporal Interval Expression and Unit Arguments**

| **_unit_ Value** | **Expected _expr_ Format** |
| --- | --- |
| MICROSECOND | MICROSECONDS |
| SECOND | SECONDS |
| MINUTE | MINUTES |
| HOUR | HOURS |
| DAY | DAYS |
| WEEK | WEEKS |
| MONTH | MONTHS |
| QUARTER | QUARTERS |
| YEAR | YEARS |
| SECOND_MICROSECOND | 'SECONDS.MICROSECONDS' |
| MINUTE_MICROSECOND | 'MINUTES:SECONDS.MICROSECONDS' |
| MINUTE_SECOND | 'MINUTES:SECONDS' |
| HOUR_MICROSECOND | 'HOURS:MINUTES:SECONDS.MICROSECONDS' |
| HOUR_SECOND | 'HOURS:MINUTES:SECONDS' |
| HOUR_MINUTE | 'HOURS:MINUTES' |
| DAY_MICROSECOND | 'DAYS HOURS:MINUTES:SECONDS.MICROSECONDS' |
| DAY_SECOND | 'DAYS HOURS:MINUTES:SECONDS' |
| DAY_MINUTE | 'DAYS HOURS:MINUTES' |
| DAY_HOUR | 'DAYS HOURS' |
| YEAR_MONTH | 'YEARS-MONTHS' |

We permits any punctuation delimiter in the expr format. Those shown in the table are the suggested delimiters.

## **Examples**

### Example 1

- Temporal intervals are used for `DATE_ADD()` and `DATE_SUB()`:

```SQL
mysql> SELECT DATE_SUB('2018-05-01',INTERVAL 1 YEAR);
+---------------------------------------+
| DATE_SUB(2018-05-01, INTERVAL 1 year) |
+---------------------------------------+
| 2017-05-01                            |
+---------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_ADD('2020-12-31 23:59:59', INTERVAL 1 SECOND);
+--------------------------------------------------+
| DATE_ADD(2020-12-31 23:59:59, INTERVAL 1 second) |
+--------------------------------------------------+
| 2021-01-01 00:00:00                              |
+--------------------------------------------------+
1 row in set (0.01 sec)

mysql> SELECT DATE_ADD('2018-12-31 23:59:59', INTERVAL 1 DAY);
+-----------------------------------------------+
| DATE_ADD(2018-12-31 23:59:59, INTERVAL 1 day) |
+-----------------------------------------------+
| 2019-01-01 23:59:59                           |
+-----------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_ADD('2100-12-31 23:59:59', INTERVAL '1:1' MINUTE_SECOND);
+-----------------------------------------------------------+
| DATE_ADD(2100-12-31 23:59:59, INTERVAL 1:1 minute_second) |
+-----------------------------------------------------------+
| 2101-01-01 00:01:00                                       |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_SUB('2025-01-01 00:00:00', INTERVAL '1 1:1:1' DAY_SECOND);
+------------------------------------------------------------+
| DATE_SUB(2025-01-01 00:00:00, INTERVAL 1 1:1:1 day_second) |
+------------------------------------------------------------+
| 2024-12-30 22:58:59                                        |
+------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_ADD('1900-01-01 00:00:00', INTERVAL '-1 10' DAY_HOUR);
+--------------------------------------------------------+
| DATE_ADD(1900-01-01 00:00:00, INTERVAL -1 10 day_hour) |
+--------------------------------------------------------+
| 1899-12-30 14:00:00                                    |
+--------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_SUB('1998-01-02', INTERVAL 31 DAY);
+---------------------------------------+
| DATE_SUB(1998-01-02, INTERVAL 31 day) |
+---------------------------------------+
| 1997-12-02                            |
+---------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_ADD('1992-12-31 23:59:59.000002', INTERVAL '1.999999' SECOND_MICROSECOND);
+----------------------------------------------------------------------------+
| DATE_ADD(1992-12-31 23:59:59.000002, INTERVAL 1.999999 second_microsecond) |
+----------------------------------------------------------------------------+
| 1993-01-01 00:00:01.000001                                                 |
+----------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

### Example 2

- Using INTERVAL together with the `+` or `-` operator

```sql
mysql> SELECT '2018-12-31 23:59:59' + INTERVAL 1 SECOND;
+-----------------------------------------+
| 2018-12-31 23:59:59 + INTERVAL 1 second |
+-----------------------------------------+
| 2019-01-01 00:00:00                     |
+-----------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT INTERVAL 1 DAY + '2018-12-31';
+-----------------------------+
| INTERVAL 1 day + 2018-12-31 |
+-----------------------------+
| 2019-01-01                  |
+-----------------------------+
1 row in set (0.00 sec)

mysql> SELECT '2025-01-01' - INTERVAL 1 SECOND;
+--------------------------------+
| 2025-01-01 - INTERVAL 1 second |
+--------------------------------+
| 2024-12-31 23:59:59            |
+--------------------------------+
1 row in set (0.00 sec)
```

### Example 3

If you add to or subtract from a date value something that contains a time part, the result is automatically converted to a datetime value:

```sql
mysql> SELECT DATE_ADD('2023-01-01', INTERVAL 1 DAY);
+--------------------------------------+
| DATE_ADD(2023-01-01, INTERVAL 1 day) |
+--------------------------------------+
| 2023-01-02                           |
+--------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATE_ADD('2023-01-01', INTERVAL 1 HOUR);
+---------------------------------------+
| DATE_ADD(2023-01-01, INTERVAL 1 hour) |
+---------------------------------------+
| 2023-01-01 01:00:00                   |
+---------------------------------------+
1 row in set (0.01 sec)
```

### Example 4

If you add MONTH, YEAR_MONTH, or YEAR and the resulting date has a day that is larger than the maximum day for the new month, the day is adjusted to the maximum days in the new month:

```sql
mysql> SELECT DATE_ADD('2019-01-30', INTERVAL 1 MONTH);
+----------------------------------------+
| DATE_ADD(2019-01-30, INTERVAL 1 month) |
+----------------------------------------+
| 2019-02-28                             |
+----------------------------------------+
1 row in set (0.00 sec)
```

### Example 5

Date arithmetic operations require complete dates and do not work with incomplete dates such as '2016-07-00' or badly malformed dates. Unlike MySQL 8.0, which returns NULL for malformed dates, MatrixOne raises an error:

<!-- validator-ignore-exec -->
```sql
mysql> SELECT DATE_ADD('2016-07-00', INTERVAL 1 DAY);
ERROR 20301 (HY000): invalid input: invalid datetime value 2016-07-00

mysql> SELECT '2005-03-32' + INTERVAL 1 MONTH;
ERROR 20301 (HY000): invalid input: invalid datetime value 2005-03-32
```
