---
title: "YEAR Type"
doc_type: reference
mysql_compat: partial
differs_from_mysql: ["WHERE comparisons on YEAR columns require explicit CAST to SIGNED (MySQL converts implicitly)"]
mo_only: []
since: unknown
last_updated: 2026-05-21
llms_summary: "YEAR data type with 1901-2155 range and MySQL-compatible 2-digit year mapping (00-69→2000-2069, 70-99→1970-1999). WHERE comparisons require explicit CAST to SIGNED."
---
# YEAR Type

The YEAR type is a 1-byte data type used to represent year values. It can be declared as YEAR with an implicit display width of 4 characters or equivalently as `YEAR(4)` with an explicit display width of 4.

MatrixOne displays YEAR values in the format YYYY, ranging from the year 1901 to 2155.

YEAR accepts input values in various formats:

- As 4-digit strings in the range '1901' to '2155'.
- As 4-digit numbers in the range 1901 to 2155.
- As 1- or 2-digit strings in the range '0' to '99'. Values in the range '1' to '69' are converted to 2001–2069, values in the range '70' to '99' are converted to 1970–1999, and '0' or '00' yields 0000.
- The result of functions that return a value acceptable in the context of YEAR, such as the `NOW()` function.

## Two-Digit Years in Dates

Due to the lack of century information, two-digit years in dates need to be sufficiently clear. To ensure internal storage consistency, MatrixOne must interpret these date values as four-digit numbers.

For DATETIME, DATE, and TIMESTAMP types, MatrixOne follows these rules to interpret dates with ambiguous year values:

- Year values in the range 00-69 are converted to 2000-2069.
- Year values in the range 70-99 are converted to 1970-1999.

Below are examples of dates involving two-digit years:

1. Interpreting dates in DATETIME type:

Let's assume we have a column named `event_date` with DATETIME type, containing the following date values:

| event_date         |
|--------------------|
| 2023-07-12 08:30   |
| 99-01-15 13:45     |
| 23-05-06 09:00     |

According to the rules, the two-digit year values in these dates are interpreted as:

- 99-01-15 is interpreted as January 15th, 1999.
- 23-05-06 is interpreted as May 6th, 2023.

2. Interpreting dates in DATE type:

Let's assume we have a column named `birth_date` with DATE type containing the following date values:

| birth_date         |
|--------------------|
| 95-08-21           |
| 04-11-30           |
| 88-03-17           |

According to the rules, the two-digit year values in these dates are interpreted as:

- 95-08-21 is interpreted as August 21st, 1995.
- 04-11-30 is interpreted as November 30th, 2004.
- 88-03-17 is interpreted as March 17th, 1988.

3. Interpreting dates in YEAR type:

Let's assume we have a column named `graduation_year` with YEAR type containing the following year values:

| graduation_year    |
|--------------------|
| 65                 |
| 78                 |
| 03                 |

According to the rules, the two-digit year values in these dates are interpreted as:

- 65 is interpreted as the year 2065.
- 78 is interpreted as the year 1978.
- 03 is interpreted as the year 2003.

## Examples

```
DROP DATABASE IF EXISTS year_demo_db;
CREATE DATABASE year_demo_db;
USE year_demo_db;

-- Create a table with a YEAR column
CREATE TABLE t_year (id INT, y YEAR);

-- Insert 4-digit year values
INSERT INTO t_year VALUES (1, 2024), (2, 1901), (3, 2155), (4, 1970), (5, 2000);

-- Insert 4-digit string year values
INSERT INTO t_year VALUES (6, '2024'), (7, '1901'), (8, '2155');

-- Insert 2-digit string year values ('1'-'69' -> 2001-2069, '70'-'99' -> 1970-1999)
INSERT INTO t_year VALUES (9, '0'), (10, '24'), (11, '69');
INSERT INTO t_year VALUES (12, '70'), (13, '99');

-- Special value 0 -> 0000
INSERT INTO t_year VALUES (14, 0);

-- NULL value
INSERT INTO t_year VALUES (15, NULL);

SELECT * FROM t_year ORDER BY id;

-- CAST operations
SELECT CAST(y AS SIGNED) FROM t_year WHERE id = 1;
SELECT CAST(2024 AS YEAR);
SELECT CAST(0 AS YEAR);
SELECT CAST('24' AS YEAR);
SELECT CAST('70' AS YEAR);
SELECT CAST(y AS CHAR(4)) FROM t_year WHERE id = 1;

-- Comparison and range queries (NOTE: YEAR columns require CAST to SIGNED for WHERE comparisons)
SELECT * FROM t_year WHERE CAST(y AS SIGNED) = 2024 ORDER BY id;
SELECT * FROM t_year WHERE CAST(y AS SIGNED) > 2000 ORDER BY id;
SELECT * FROM t_year WHERE y IS NULL;

-- YEAR(4) syntax (supported for compatibility)
CREATE TABLE t_year4 (a YEAR(4) NOT NULL);
DROP TABLE t_year4;

DROP TABLE t_year;
DROP DATABASE year_demo_db;
```
