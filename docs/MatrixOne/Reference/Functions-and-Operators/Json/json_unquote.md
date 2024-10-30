# **JSON_UNQUOTE()**

## **Function description**

The `JSON_UNQUOTE()` function is used to extract an unquoted JSON value from a JSON string and return it as a string.

Specifically, the `JSON_UNQUOTE()` function takes a `JSON` string as input, extracts a `JSON` value from it, and returns it as a string. If the input `JSON` string does not contain a valid `JSON` value or the argument is `NULL`, the function returns `NULL`. If the argument is NULL, NULL is returned. If the value starts and ends with double quotes but is not a valid `JSON` string literal, an error occurs.

## **Grammar structure**

```sql
select JSON_UNQUOTE(string_value);
```

In strings, certain sequences have special meanings. These sequences start with a backslash (\) and are called escape characters. The rules are as follows. For all other escape sequences, backslashes are ignored. That is, escaped characters are interpreted as if they were not escaped. For example, \x is x. These sequences are case-sensitive. For example, \b is interpreted as backspace, and \B is interpreted as B.

|The character represented by the escape sequence|
|---|---|
|\"|Double quotes (") |
|\b|Backspace|
|\f|form feed character|
|\n|Line break|
|\r|Carriage return character|
|\t|tab|
|\\|Backslash (\) |
|\uXXXX|Unicode value XXXX UTF-8 byte|

## **Example**

```sql
mysql> SET @j = '"abc"';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_UNQUOTE(@j);
+-------+------------------+
| @j    | json_unquote(@j) |
+-------+------------------+
| "abc" | abc              |
+-------+------------------+
1 row in set (0.00 sec)

mysql> SET @j = '[1, 2, 3]';
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT @j, JSON_UNQUOTE(@j);
+-----------+------------------+
| @j        | json_unquote(@j) |
+-----------+------------------+
| [1, 2, 3] | [1, 2, 3]        |
+-----------+------------------+
1 row in set (0.00 sec)

mysql> SELECT JSON_UNQUOTE('"\\t\\u0032"');
+----------------------------+
| json_unquote("\\t\\u0032") |
+----------------------------+
|       2                         |
+----------------------------+
1 row in set (0.00 sec)
```