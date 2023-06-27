# **REGEXP_REPLACE()**

## **Description**

`REGEXP_REPLACE()` is used to replace a string matching a given regular expression pattern with the specified new string.

## **Syntax**

```
> REGEXP_REPLACE(expr, pat, repl[, pos[, occurrence[, match_type]]])
```

## Explanations

- `expr` is the string to replace.

- `pat` This is a regular expression, the function will find all strings that match this pattern.

- `repl` is the replacement string used to replace the found matching string.

- `pos`: The position in expr at which to start the search. If omitted, the default is 1.

- `occurrence`: Which occurrence of a match to replace. If omitted, the default is 0 (which means *replace all occurrences*).

- `match_type`: The optional `match_type` argument is a string that may contain any or all the following characters specifying how to perform matching:

    + `'c'`: Case-sensitive matching by default.
    + `'i'`: Case-insensitive matching.
    + `'n'`: The `.` character matches line terminators. The default is for `.` matching to stop at the end of a line.
    + `'m'`: Multiple-line mode. Recognize line terminators within the string. The default behavior is to match line terminators only at the start and end of the string expression.
    + `'u'`: Unix-only line endings. Only the newline character is recognized as a line ending by the ., ^, and $ match operators.

## **Examples**

```SQL
mysql> SELECT REGEXP_REPLACE('Hello, World!', 'World', 'Universe');
+------------------------------------------------+
| regexp_replace(Hello, World!, World, Universe) |
+------------------------------------------------+
| Hello, Universe!                               |
+------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT REGEXP_REPLACE('Cat Dog Cat Dog Cat','Cat', 'Tiger') 'Result';
+---------------------------+
| Result                    |
+---------------------------+
| Tiger Dog Tiger Dog Tiger |
+---------------------------+
1 row in set (0.01 sec)
```
