---
title: "YEARWEEK()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.12
last_updated: 2026-05-19
llms_summary: "YEARWEEK(date, [mode]) returns year and week number for a given date as YYYYWW format, with an optional mode parameter (0-7) controlling week numbering."
---
# YEARWEEK()

> Returns the year and week number for a given date or datetime expression as an integer in YYYYWW format. An optional mode parameter controls the week-numbering rules.

## Description

`YEARWEEK()` returns the year and week number for a `date` or `datetime` expression. The result is an integer in `YYYYWW` format — for example, `202623` for the 23rd week of 2026. The optional `mode` parameter (0–7) controls the start day of the week and whether the return value is in the 0–53 or 1–53 range.

## Syntax

```
> YEARWEEK(date)
> YEARWEEK(date, mode)
```

## Arguments

|  Arguments  | Description |
|  ----  | ----  |
| date | Required. The date or datetime expression to compute the year-week combination for. Supports `DATE`, `DATETIME`, `TIMESTAMP`, and string values. If `date` is `NULL`, returns `NULL`. |
| mode | Optional. An integer 0–7 specifying the week start day and return-value range. Defaults to 0 if omitted. See the mode table below. |

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

## Examples

```sql
DROP DATABASE IF EXISTS yearweek_demo;
CREATE DATABASE yearweek_demo;
USE yearweek_demo;

-- Basic usage: returns YYYYWW format
SELECT YEARWEEK('2026-05-15');
-- e.g. 202620

-- With mode 1 (Monday start, 0-53 range)
SELECT YEARWEEK('2026-05-15', 1);

CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE
);
INSERT INTO events VALUES (1, '2026-01-01'), (2, '2026-05-19'), (3, '2026-12-31');

SELECT id, event_date, YEARWEEK(event_date) AS yw FROM events;

DROP DATABASE yearweek_demo;
```

## Notes

- The return value is `year * 100 + week`. A date in week 52 of 2026 that falls a few days into January 2027 may return `202652`.
- When `date` is `NULL`, the function returns `NULL`.
