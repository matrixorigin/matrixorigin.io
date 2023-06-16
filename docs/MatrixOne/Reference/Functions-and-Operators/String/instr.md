# **INSTR()**

## **Description**

`INSTR()` function is used to return the position of the first occurrence of a substring in a given string. This function is multibyte safe, which means it is compatible with various character encodings and can correctly handle multibyte characters (such as characters encoded in UTF-8).

The `INSTR()` function primarily uses data cleaning and transformation, such as when you need to search for a specific substring within a text field or split a text field based on a specific character. This can be particularly useful when dealing with data that follows a specific pattern or format, like email addresses, phone numbers, etc.

Regarding case sensitivity, `INSTR()` function is case-sensitive only if at least one argument is a binary string. For non-binary strings, `INSTR()` is case-insensitive. However, to make a case-sensitive comparison, you can use the `BINARY` keyword to cast the string into a binary format.

For example:

```sql
SELECT INSTR(BINARY 'abc', 'A') AS Match;
```

The above query will return 0 because, in binary format, 'A' and 'a' are considered different characters.

## **Syntax**

```
> INSTR(str,substr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. The string is the string to search in.|
| substr | Required. The substring is the string you are looking for.|

## **Examples**

- Example 1

```sql
mysql> SELECT INSTR('foobarbar', 'bar');
+-----------------------+
| instr(foobarbar, bar) |
+-----------------------+
|                     4 |
+-----------------------+
1 row in set (0.01 sec)
```

- Example 2

```sql
-- Using the INSTR function to find the first occurrence of 'o' in the string 'Hello World' will return 5, as 'o' first appears at the 5th position in 'Hello World'.
mysql> SELECT INSTR('Hello World', 'o');
+-----------------------+
| instr(Hello World, o) |
+-----------------------+
|                     5 |
+-----------------------+
1 row in set (0.01 sec)
```

- Example 3

```sql
-- Create a table named t1, which contains two VARCHAR type columns a and b
CREATE TABLE t1(a VARCHAR, b VARCHAR);

-- Insert three rows of data into the table t1
INSERT INTO t1 VALUES('axa','x'),('abababa','qq'),('qwer','er');

-- Select each row from table t1, then use the INSTR function to find the position at which the string in column b first appears in column a
mysql> select instr(a,b) from t1;
+-------------+
| instr(a, b) |
+-------------+
|           2 |
|           0 |
|           3 |
+-------------+
3 rows in set (0.01 sec)

-- Select each row from table t1, then use the INSTR function to find the position at which NULL first appears in column a
-- Since NULL is an unknown value, this query will return NULL
mysql> select instr(a,null) from t1;
+----------------+
| instr(a, null) |
+----------------+
|           NULL |
|           NULL |
|           NULL |
+----------------+
3 rows in set (0.00 sec)
```
