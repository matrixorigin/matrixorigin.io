---
title: "<=>"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "NULL-safe equality operator that returns 1 when both operands are equal (including two NULLs) and 0 otherwise, never returning NULL itself in MatrixOne comparisons."
---

# **<=>**

> The `<=>` operator compares two operands for equality but treats `NULL` as
> a comparable value. It returns `1` when both operands are equal (including
> when both are `NULL`), `0` when they differ or when exactly one side is
> `NULL`, and never returns `NULL` itself.

## Description

`<=>` performs a NULL-safe equality comparison. Unlike `=`, whose result is
`NULL` as soon as either operand is `NULL`, `<=>` always returns an integer
`0` or `1`. It is useful in predicates and join conditions when two rows
whose compared columns are both `NULL` should be considered equal.

The operator follows the same type coercion rules as `=`: numeric, string,
date/time, and decimal operands are converted to a common comparison type
before the equality test. For decimal operands, scales are aligned first.

## Syntax

```
> SELECT value1 <=> value2;
```

```
> SELECT column1 <=> column2 FROM table_name;
```

## Arguments

| Arguments | Description |
| ---- | ---- |
| value1 | Required. The left-hand operand. May be `NULL`. Accepts numeric, string, date/time, or DECIMAL values; the pair is coerced to a common comparison type before evaluation. |
| value2 | Required. The right-hand operand. May be `NULL`. When both operands are DECIMAL with different scales, the smaller scale is aligned to the larger one before the equality test. |

The result type is always a boolean integer: `1` when the two operands are
equal (including when both are `NULL`), `0` otherwise. The operator itself
never returns `NULL`.

## Examples

```sql
DROP DATABASE IF EXISTS null_safe_equal_demo;
CREATE DATABASE null_safe_equal_demo;
USE null_safe_equal_demo;

SELECT 1 <=> 1 AS a, 1 <=> 0 AS b, 1 <=> NULL AS c, NULL <=> NULL AS d;

SELECT 'a' <=> 'a' AS a, 'a' <=> 'b' AS b, 'a' <=> NULL AS c;

CREATE TABLE t1 (id INT PRIMARY KEY, val INT);
INSERT INTO t1 VALUES (1, 1), (2, 0), (3, NULL);

SELECT id, val,
       val <=> 1     AS eq_1,
       val <=> 0     AS eq_0,
       val <=> NULL  AS eq_null
FROM t1
ORDER BY id;

SELECT CAST(1.10 AS DECIMAL(10,2)) <=> CAST(1.1 AS DECIMAL(10,1)) AS dec_eq;

DROP TABLE t1;
DROP DATABASE null_safe_equal_demo;
```
