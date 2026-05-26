---
title: "WEEK()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-19
llms_summary: "WEEK(date, [mode]) returns the week number for a given date, with an optional mode parameter (0-7) controlling week-numbering rules."
---
# **WEEK()**

> Returns the week number for a given date. An optional mode parameter controls the week start day and the return-value range.

## **Description**

`WEEK()` returns the week number for a given date or datetime expression. The optional `mode` parameter (0–7) controls the start day of the week and whether the return value is in the 0–53 or 1–53 range. If `date` is `NULL`, the function returns `NULL`.

## **Syntax**

```
> WEEK(date)
> WEEK(date, mode)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| date  | Required. The date or datetime expression to calculate the week number from. Supports `DATE`, `DATETIME`, `TIMESTAMP`, and string values. |
| mode | Optional. An integer 0–7 specifying the week start day and return-value range. Defaults to 0 (Sunday start, 0–53 range) if omitted. |

### Mode values

| Mode | First day of week | Range | Week 1 is the first week … |
| ---- | ---- | ---- | ---- |
| 0 | Sunday | 0–53 | with a Sunday in this year |
| 1 | Monday | 0–53 | with 4 or more days this year |
| 2 | Sunday | 1–53 | with a Sunday in this year |
| 3 | Monday | 1–53 | with 4 or more days this year |
| 4 | Sunday | 0–53 | with 4 or more days this year |
| 5 | Monday | 0–53 | with a Monday in this year |
| 6 | Sunday | 1–53 | with 4 or more days this year |
| 7 | Monday | 1–53 | with a Monday in this year |

## **Examples**

- Example 1:

<!-- validator-ignore-exec -->
```sql
mysql> SELECT WEEK('2008-02-20');
+------------------+
| week(2008-02-20) |
+------------------+
|                7 |
+------------------+
1 row in set (0.01 sec)
```

- Example 2:

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
CREATE TABLE t1(c1 DATETIME NOT NULL);
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('1999-12-31');
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('2006-12-25');
INSERT INTO t1 VALUES('2008-02-29');

mysql> SELECT WEEK(c1) FROM t1;
+----------+
| week(c1) |
+----------+
|       52 |
|        0 |
|        0 |
|       52 |
|        8 |
+----------+
5 rows in set (0.00 sec)
```

- Example 3:

```sql
DROP DATABASE IF EXISTS week_demo;
CREATE DATABASE week_demo;
USE week_demo;

-- Basic usage: returns week number, default mode 0
SELECT WEEK('2026-05-19');

-- With mode 1 (Monday start, 0-53 range)
SELECT WEEK('2026-05-19', 1);

-- With mode 2 (Sunday start, 1-53 range)
SELECT WEEK('2026-05-19', 2);

DROP DATABASE week_demo;
```

```sql
DROP DATABASE IF EXISTS week_tbl_demo;
CREATE DATABASE week_tbl_demo;
USE week_tbl_demo;

CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE
);
INSERT INTO events VALUES (1, '2026-01-01'), (2, '2026-05-19'), (3, '2026-12-31');

SELECT id, event_date, WEEK(event_date) AS wk FROM events;

DROP DATABASE week_tbl_demo;
```
