---
title: "REGEXP_INSTR()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "match_type parameter not yet supported; passing it causes ERROR 20203"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "REGEXP_INSTR() returns the starting position in the string of the matched regular expression pattern."
---
# **REGEXP_INSTR()**

> REGEXP_INSTR() returns the starting position in the string of the matched regular expression pattern.

## **Description**

`REGEXP_INSTR()` returns the starting position in the string of the matched regular expression pattern. If no match is found, the function returns 0.

## **Syntax**

```
> REGEXP_INSTR(expr, pat[, pos[, occurrence[, return_option]]])
```

## Explanations

- `expr` is the string to match.

- `pat` is the regular expression to match in the string.

- `pos`: The position in expr at which to start the search. If omitted, the default is 1.

- `occurrence`: Which occurrence of a match to search for. If omitted, the default is 1 (returns the first match).

- `return_option`: This is an optional parameter specifying whether the returned position is where the pattern starts or ends. If 0 or omitted, the function returns the position at which the pattern begins. If 1, the function returns the position after the position where the pattern ends.

## **Examples**

```SQL
mysql> SELECT REGEXP_INSTR('Hello, my number is 12345.', '[0-9]+');
+--------------------------------------------------+
| regexp_instr(Hello, my number is 12345., [0-9]+) |
+--------------------------------------------------+
|                                               21 |
+--------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT REGEXP_INSTR('apple', 'z+');
+-------------------------+
| regexp_instr(apple, z+) |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.00 sec)

mysql> SELECT REGEXP_INSTR('Hello, World!', 'World');
+------------------------------------+
| regexp_instr(Hello, World!, World) |
+------------------------------------+
|                                  8 |
+------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT REGEXP_INSTR('Hello, World! World!', 'World', 1, 2);
+-------------------------------------------------+
| regexp_instr(Hello, World! World!, World, 1, 2) |
+-------------------------------------------------+
|                                              15 |
+-------------------------------------------------+
1 row in set (0.00 sec)
```
