---
title: "CASE"
doc_type: reference
mysql_compat: full
differs_from_mysql:
  - "This page describes the CASE operator (expression), not the stored-program CASE statement. MatrixOne does not support stored programs, so the stored-program CASE STATEMENT is unavailable; the CASE OPERATOR behaves compatibly."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The CASE statement for stored programs implements a complex conditional construct."
---
# **CASE Operator**

> The CASE operator evaluates conditions and returns a value, similar to an if-then-else construct in expressions.

## **Description**

The CASE operator evaluates a set of conditions and returns a result. It can be used in SELECT, WHERE, ORDER BY, and other SQL clauses. MatrixOne does not support stored programs, so the stored-program `CASE` statement (which uses `END CASE` syntax) is not available; this page documents the CASE operator (expression).

Note: There is also a CASE operator, which differs from the `CASE` statement described here. See [Flow Control Functions](../../Operators/operators/flow-control-functions/case-when.md). The `CASE` statement cannot have an `ELSE NULL` clause, and it is terminated with `END CASE` instead of `END`.

If no `when_value` or `search_condition` matches the value tested and the `CASE` statement contains no `ELSE` clause, a `Case` not found for `CASE` statement error results.

Each `statement_list` consists of one or more SQL statements; an empty `statement_list` is not permitted.

## **Syntax**

### **Syntax 1**

```
CASE case_value
    WHEN when_value THEN statement_list
    [WHEN when_value THEN statement_list] ...
    [ELSE statement_list]
END CASE
```

For the first syntax, `case_value` is an expression. This value is compared to the `when_value` expression in each `WHEN` clause until one of them is equal. When an equal `when_value` is found, the corresponding `THEN` clause `statement_list` executes. If no `when_value` is equal, the `ELSE` clause `statement_list` executes, if there is one.

This syntax cannot be used to test for equality with `NULL` because `NULL = NULL` is false.

### **Syntax 2**

```
CASE
    WHEN search_condition THEN statement_list
    [WHEN search_condition THEN statement_list] ...
    [ELSE statement_list]
END CASE

```

For the second syntax, each `WHEN` clause search_condition expression is evaluated until one is true, at which point its corresponding THEN clause `statement_list` executes. If no `search_condition` is equal, the `ELSE` clause `statement_list` executes, if there is one.

## **Examples**

```sql
CREATE TABLE t1(c0 INTEGER, c1 INTEGER, c2 INTEGER);
INSERT INTO t1 VALUES(1, 1, 1), (1, 1, 1);

mysql> SELECT CASE AVG (c0) WHEN any_value(c1) * any_value(c2) THEN 1 END FROM t1;
+------------------------------------------------------------+
| case avg(c0) when any_value(c1) * any_value(c2) then 1 end |
+------------------------------------------------------------+
|                                                          1 |
+------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> SELECT CASE any_value(c1) * any_value(c2) WHEN SUM(c0) THEN 1 WHEN AVG(c0) THEN 2 END FROM t1;
+--------------------------------------------------------------------------------+
| case any_value(c1) * any_value(c2) when sum(c0) then 1 when avg(c0) then 2 end |
+--------------------------------------------------------------------------------+
|                                                                              2 |
+--------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> SELECT CASE any_value(c1) WHEN any_value(c1) + 1 THEN 1 END, ABS(AVG(c0)) FROM t1;
+------------------------------------------------------+--------------+
| case any_value(c1) when any_value(c1) + 1 then 1 end | abs(avg(c0)) |
+------------------------------------------------------+--------------+
|                                                 NULL |            1 |
+------------------------------------------------------+--------------+
1 row in set (0.00 sec)
```
