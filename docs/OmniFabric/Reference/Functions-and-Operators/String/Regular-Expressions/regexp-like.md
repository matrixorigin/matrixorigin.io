# **REGEXP_LIKE()**

## **Description**

Returns `TRUE` if the string expr matches the regular expression specified by the pattern pat, `FALSE` otherwise. If expr or pat is `NULL`, the return value is `NULL`.

`REGEXP` and `RLIKE` are synonyms for `REGEXP_LIKE()`.

## **Syntax**

```
> REGEXP_LIKE(expr, pat[, match_type])
```

## Explanations

- `expr` is the string to search for.

- `pat` is a regular expression to look for in the string.

- `match_type`: The optional `match_type` argument is a string that may contain any or all the following characters specifying how to perform matching:

    + `'c'`: Case-sensitive matching by default.
    + `'i'`: Case-insensitive matching.
    + `'n'`: The `.` character matches line terminators. The default is for `.` matching to stop at the end of a line.
    + `'m'`: Multiple-line mode. Recognize line terminators within the string. The default behavior is to match line terminators only at the start and end of the string expression.
    + `'u'`: Unix-only line endings. Only the newline character is recognized as a line ending by the ., ^, and $ match operators.

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

mysql> SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE');
+-----------------------------------+
| regexp_like(CamelCase, CAMELCASE) |
+-----------------------------------+
| false                             |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE', 'i');
+--------------------------------------+
| regexp_like(CamelCase, CAMELCASE, i) |
+--------------------------------------+
| true                                 |
+--------------------------------------+
1 row in set (0.01 sec)
```
