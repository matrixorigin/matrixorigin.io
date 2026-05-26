---
title: "GET_FORMAT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The GET_FORMAT() function returns the MySQL-style format string used by locale-specific date/time formatting for a given type (DATE, TIME, or DATETIME) and region (EUR, USA, JIS, ISO, or INTERNAL)."
---

# **GET_FORMAT()**

> The GET_FORMAT() function returns the MySQL-style format string used by locale-specific date/time formatting for a given type (DATE, TIME, or DATETIME) and region (EUR, USA, JIS, ISO, or INTERNAL).

## **Description**

The `GET_FORMAT()` function returns the MySQL-style format string used by locale-specific date/time formatting for a given type (`DATE`, `TIME`, or `DATETIME`) and region (`EUR`, `USA`, `JIS`, `ISO`, or `INTERNAL`). The returned string can be passed to `DATE_FORMAT()` or `STR_TO_DATE()`.

If the type or the region is not one of the supported values, the function returns `NULL`.

The full mapping implemented in MatrixOne is:

| Type | USA | EUR | JIS | ISO | INTERNAL |
| ---- | ---- | ---- | ---- | ---- | ---- |
| DATE | `%m.%d.%Y` | `%d.%m.%Y` | `%Y-%m-%d` | `%Y-%m-%d` | `%Y%m%d` |
| TIME | `%h:%i:%s %p` | `%H.%i.%s` | `%H:%i:%s` | `%H:%i:%s` | `%H%i%s` |
| DATETIME | `%Y-%m-%d %H.%i.%s` | `%Y-%m-%d %H.%i.%s` | `%Y-%m-%d %H:%i:%s` | `%Y-%m-%d %H:%i:%s` | `%Y%m%d%H%i%s` |

## **Syntax**

```
> GET_FORMAT({DATE | TIME | DATETIME}, {'EUR' | 'USA' | 'JIS' | 'ISO' | 'INTERNAL'})
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| type | Required. One of the literal keywords `DATE`, `TIME`, or `DATETIME`. |
| region | Required. A string literal selecting the locale: `'EUR'`, `'USA'`, `'JIS'`, `'ISO'`, or `'INTERNAL'`. |

## **Examples**

```sql
DROP DATABASE IF EXISTS get_format_demo;
CREATE DATABASE get_format_demo;
USE get_format_demo;

SELECT GET_FORMAT(DATE,     'USA')      AS date_usa,
       GET_FORMAT(DATE,     'ISO')      AS date_iso,
       GET_FORMAT(TIME,     'USA')      AS time_usa,
       GET_FORMAT(DATETIME, 'INTERNAL') AS dt_internal;

SELECT DATE_FORMAT('2023-10-05 12:34:56', GET_FORMAT(DATETIME, 'JIS')) AS formatted;

DROP DATABASE get_format_demo;
```
