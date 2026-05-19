---
title: "PERCENT_RANK()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "PERCENT_RANK() returns the relative rank of the current row within its window partition as a value in the range [0, 1]."
---

# **PERCENT_RANK()**

> PERCENT_RANK() returns the relative rank of the current row within its window partition as a value in the range [0, 1].

## **Description**

`PERCENT_RANK()` returns the relative rank of the current row within its window partition as a value in the range [0, 1]. It is defined as:

```
PERCENT_RANK = (rank - 1) / (total rows in partition - 1)
```

where `rank` follows the same tie-handling behavior as `RANK()`: rows that tie on the `ORDER BY` expression share the same rank, and the next rank is skipped. When the partition has only one row, the result is `0`. The function takes no arguments and `DISTINCT` is rejected.

## **Syntax**

```
> PERCENT_RANK() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- The `PARTITION BY` clause is optional and divides the dataset into partitions; the percent rank is computed independently inside each partition.
- The `ORDER BY` clause defines how rows are sorted before the rank is computed.

## **Examples**

```sql
DROP DATABASE IF EXISTS percent_rank_demo;
CREATE DATABASE percent_rank_demo;
USE percent_rank_demo;

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
       PERCENT_RANK() OVER (PARTITION BY department ORDER BY amount) AS pr
FROM sales;

DROP TABLE sales;
DROP DATABASE percent_rank_demo;
```
