# **REGEXP_SUBSTR()**

## **Description**

`REGEXP_SUBSTR()` is used to return the substring of the string `expr` that matches the regular expression pattern `pat`.

## **Syntax**

```
> REGEXP_SUBSTR(expr, pat[, pos[, occurrence[, match_type]]])
```

## Explanations

- `expr`: This is the original string in which to look for matches.

- `pat`: This is a regular expression pattern, the function will look for strings that match this pattern.

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
