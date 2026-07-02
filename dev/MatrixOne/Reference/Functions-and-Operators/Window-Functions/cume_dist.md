---
title: "CUME_DIST()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "CUME_DIST() returns the cumulative distribution of the current row within its window partition."
---

# **CUME_DIST()**

> CUME_DIST() returns the cumulative distribution of the current row within its window partition.

## **Description**

`CUME_DIST()` returns the cumulative distribution of the current row within its window partition. The value is a `DOUBLE` in the range (0, 1] and is defined as:

```
CUME_DIST = (number of rows with value <= current row's value) / (total rows in partition)
```

Rows that tie on the `ORDER BY` expression share the same value. The function takes no arguments and `DISTINCT` is rejected.

## **Syntax**

```
> CUME_DIST() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- The `PARTITION BY` clause is optional and divides the dataset into partitions; the cumulative distribution is computed independently inside each partition.
- The `ORDER BY` clause defines how rows are sorted before the distribution is computed.

## **Examples**

```sql
DROP DATABASE IF EXISTS cume_dist_demo;
CREATE DATABASE cume_dist_demo;
USE cume_dist_demo;

CREATE TABLE sales (
  department VARCHAR(20),
  employee   VARCHAR(20),
  amount     INT
);
INSERT INTO sales VALUES
  ('Marketing', 'John',    1000),
  ('Marketing', 'Jane',    1200),
  ('Sales',     'Alex',     900),
  ('Sales',     'Bob',     1100),
  ('HR',        'Alice',    800),
  ('HR',        'Charlie',  850);

SELECT department, employee, amount,
       CUME_DIST() OVER (PARTITION BY department ORDER BY amount) AS cd
FROM sales;

DROP TABLE sales;
DROP DATABASE cume_dist_demo;
```
