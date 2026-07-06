---
title: "TIME_FORMAT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "Formats a TIME value according to a format string, using the same specifiers as DATE_FORMAT() but limited to time-related components."
---
# TIME_FORMAT()

> Formats a `TIME` value according to a format string. Uses the same specifiers as `DATE_FORMAT()`, but only time-related specifiers (`%H`, `%i`, `%s`, `%r`, `%T`, `%p`, `%f`, `%h`, `%k`, `%l`, `%I`, `%S`) are meaningful. Returns NULL if either argument is NULL.

## Function Description

The `TIME_FORMAT()` function formats a `TIME` value using format specifiers. It is the time-specific counterpart to `DATE_FORMAT()`, suitable for formatting time values without date components.

Supported format specifiers:

- `%H`: Hour (00–23)
- `%h` / `%I`: Hour (01–12)
- `%k`: Hour (0–23, without leading zero)
- `%l`: Hour (1–12, without leading zero)
- `%i`: Minutes (00–59)
- `%s` / `%S`: Seconds (00–59)
- `%p`: `AM` or `PM`
- `%r`: Time in 12-hour format (`hh:mm:ss AM/PM`)
- `%T`: Time in 24-hour format (`hh:mm:ss`)
- `%f`: Microseconds (000000–999999)

## Syntax

```
> TIME_FORMAT(time, format)
```

## Arguments

| Arguments | Description |
| ---- | ---- |
| time | Required. A `TIME` value to format. |
| format | Required. A format string containing time specifiers. Returns NULL if NULL. |

## Examples

```sql
DROP DATABASE IF EXISTS time_format_demo;
CREATE DATABASE time_format_demo;
USE time_format_demo;

SELECT TIME_FORMAT('15:30:45', '%H:%i:%s') AS basic;
SELECT TIME_FORMAT('15:30:45', '%T') AS t_format;
SELECT TIME_FORMAT('23:59:59', '%H:%i:%s') AS max_time;
SELECT TIME_FORMAT('15:30:45', '%h:%i:%s %p') AS hour12;
SELECT TIME_FORMAT('15:30:45', '%r') AS r_format;
SELECT TIME_FORMAT('00:00:00', '%r') AS midnight;
SELECT TIME_FORMAT('15:30:45.123456', '%H:%i:%s.%f') AS with_ms;
SELECT TIME_FORMAT(NULL, '%H:%i:%s') AS null_time;

CREATE TABLE t1(t TIME);
INSERT INTO t1 VALUES ('15:30:45'), ('00:00:00'), ('23:59:59'), ('12:34:56');
SELECT t, TIME_FORMAT(t, '%H:%i:%s') AS formatted FROM t1;
DROP TABLE t1;

DROP DATABASE time_format_demo;
```
