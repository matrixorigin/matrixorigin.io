# Comments

This document describes the comment syntax supported by MatrixOne.

MatrixOne supports three comment styles:

- Use `#` character to comment a line.

   ```sql
   mysql> select 100-99;   # This comment continues to the end of line
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

- Use `--` to comment a line. The `--`  (double-dash) comment style requires the second dash to be followed by at least one whitespace or control character (such as a space, tab, newline, and so on).

   ```sql
   mysql> select 100-99;   -- This comment continues to the end of line
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

- From a `/*` sequence to the following `*/` sequence, as in the C programming language. This syntax enables a comment to extend over multiple lines because the beginning and closing sequences need not be on the same line.

   ```sql
   mysql> select 100 /* this is an in-line comment */ -99;
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

   Or:

   ```sql
   mysql> select 100
   /*
   this is an in-line comment
   */
   -99;
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

## MatrixOne specific comment syntax

- MatrixOne supports C comment style as below:

```sql
mysql> select 100-99;   // This comment continues to the end of line
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
1 row in set (0.03 sec)
```

Or:

```sql
mysql> // This comment continues to the line
    -> select 100-99;
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
```

- MatrixOne dose not support C comment style as below:

```sql
mysql> select 100 /*! Specific code */ -99;
ERROR 1064 (HY000): SQL parser error: You have an error in your SQL syntax; check the manual that corresponds to your MatrixOne server version for the right syntax to use. syntax error at line 1 column 28 near " code */ -99";
```

Or:

```sql
mysql> select 100 /*!50110 Specific code */ -99;
ERROR 1064 (HY000): SQL parser error: You have an error in your SQL syntax; check the manual that corresponds to your MatrixOne server version for the right syntax to use. syntax error at line 1 column 33 near " code */ -99";
```

## Constraints

MatrixOne does not support nested comments.
