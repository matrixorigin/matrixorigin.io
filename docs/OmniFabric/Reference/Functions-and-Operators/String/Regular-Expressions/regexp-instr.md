# **REGEXP_INSTR()**

## **Description**

`REGEXP_INSTR()` returns the starting position in the string of the matched regular expression pattern. If no match is found, the function returns 0.

## **Syntax**

```
> REGEXP_INSTR(expr, pat[, pos[, occurrence[, return_option[, match_type]]]])
```

## Explanations

- `expr` is the string to match.

- `pat` is the regular expression to match in the string.

- `pos`: The position in expr at which to start the search. If omitted, the default is 1.

- `occurrence`: Which occurrence of a match to replace. If omitted, the default is 0 (which means *replace all occurrences*).

- `return_option`: This is an optional parameter specifying whether the returned position is where the pattern starts or ends. If 0 or omitted, the function returns the position at which the pattern begins. If 1, the function returns the position after the position where the pattern ends.

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
