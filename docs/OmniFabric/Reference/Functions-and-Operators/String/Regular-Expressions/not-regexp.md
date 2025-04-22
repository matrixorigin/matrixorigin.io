# **NOT REGEXP**

## **Description**

`NOT REGEXP` is used to test whether a string does not match a specified regular expression.

If `column_name` does not match `pattern`, it returns `TRUE`. If it matches, it returns `FALSE`.

## **Syntax**

```
> column_name NOT REGEXP pattern
```

## Explanations

- `column_name` is the column to match.

- `pattern` is the regular expression to apply.

## **Examples**

```SQL
CREATE TABLE example (
         id INT AUTO_INCREMENT,
         text VARCHAR(255),
         PRIMARY KEY(id)
         );


INSERT INTO example (text)
  VALUES ('Hello1'),
         ('Hello2'),
         ('World'),
         ('HelloWorld'),
         ('Hello_World'),
         ('example'),
         ('example1'),
         ('example2');

mysql> SELECT * FROM example WHERE text NOT REGEXP '[0-9]';
+------+-------------+
| id   | text        |
+------+-------------+
|    3 | World       |
|    4 | HelloWorld  |
|    5 | Hello_World |
|    6 | example     |
+------+-------------+
4 rows in set (0.00 sec)
```
