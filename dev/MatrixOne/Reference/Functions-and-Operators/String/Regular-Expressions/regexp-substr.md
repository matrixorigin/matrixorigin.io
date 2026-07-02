---
title: "REGEXP_SUBSTR()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "match_type parameter not yet supported; passing it causes ERROR 20203"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "REGEXP_SUBSTR() is used to return the substring of the string expr that matches the regular expression pattern pat."
---
# **REGEXP_SUBSTR()**

> REGEXP_SUBSTR() is used to return the substring of the string expr that matches the regular expression pattern pat.

## **Description**

`REGEXP_SUBSTR()` is used to return the substring of the string `expr` that matches the regular expression pattern `pat`.

## **Syntax**

```
> REGEXP_SUBSTR(expr, pat[, pos[, occurrence]])
```

## Explanations

- `expr`: This is the original string in which to look for matches.

- `pat`: This is a regular expression pattern, the function will look for strings that match this pattern.

- `pos`: The position in expr at which to start the search. If omitted, the default is 1.

- `occurrence`: Which occurrence of a match to search for. If omitted, the default is 1 (returns the first match).

## **Examples**

```SQL
mysql> SELECT REGEXP_SUBSTR('1a 2b 3c', '[0-9]a');
+---------------------------------+
| regexp_substr(1a 2b 3c, [0-9]a) |
+---------------------------------+
| 1a                              |
+---------------------------------+
1 row in set (0.00 sec)

mysql> SELECT REGEXP_SUBSTR('Lend for land', '^C') Result;
+--------+
| Result |
+--------+
| NULL   |
+--------+
1 row in set (0.00 sec)
```
