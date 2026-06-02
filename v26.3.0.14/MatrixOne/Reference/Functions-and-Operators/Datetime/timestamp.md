---
title: "TIMESTAMP()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MatrixOne TIMESTAMP range is '0001-01-01'–'9999-12-31' vs MySQL '1970-01-01'–'2038-01-19' (compat doc: Data Types)."
  - "Two-argument form TIMESTAMP(expr1, expr2) is not supported; MO only supports single-argument TIMESTAMP(expr)"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "With a single argument, this function returns the date or datetime expression expr as a datetime value."
---
# **TIMESTAMP()**

> With a single argument, this function returns the date or datetime expression expr as a datetime value.

## **Description**

With a single argument, this function returns the date or datetime expression expr as a datetime value. Returns `NULL` if expr is `NULL`.

## **Syntax**

```
> TIMESTAMP(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required.  The expr is an expression specifying the interval value to be added or subtracted from the starting date. The expr is evaluated as a string; it may start with a - for negative intervals. |

## **Examples**

```sql
mysql> SELECT TIMESTAMP('2003-12-31');
+----------------------------+
| timestamp(2003-12-31)      |
+----------------------------+
| 2003-12-31 00:00:00 |
+----------------------------+
1 row in set (0.00 sec)
```

```sql
CREATE TABLE t1(c1 DATE NOT NULL);
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('1999-12-31');
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('2006-12-25');
INSERT INTO t1 VALUES('2008-02-29');

mysql> SELECT TIMESTAMP(c1) FROM t1;
+----------------------------+
| timestamp(c1)              |
+----------------------------+
| 2000-01-01 00:00:00.000000 |
| 1999-12-31 00:00:00.000000 |
| 2000-01-01 00:00:00.000000 |
| 2006-12-25 00:00:00.000000 |
| 2008-02-29 00:00:00.000000 |
+----------------------------+
5 rows in set (0.00 sec)
```

## **Constraints**

`TIMESTAMP()` does not support double arguments for now, which means it doesn't support `TIMESTAMP(expr1,expr2)`.
