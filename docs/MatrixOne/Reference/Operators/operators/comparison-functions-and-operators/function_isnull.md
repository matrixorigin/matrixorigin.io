# **ISNULL**

## **Description**

The `ISNULL()` function can be used instead of = to test whether a value is NULL. (Comparing a value to `NULL` using = always yields `NULL`.)

If expression is `NULL`, this function returns `true`. Otherwise, it returns `false`.

The `ISNULL()` function shares some special behaviors with the `IS NULL` comparison operator. See the description of [`IS NULL`](is-null.md).

## **Syntax**

```
> ISNULL(expr)
```

## **Examples**

- Example 1:

```sql
mysql> SELECT ISNULL(1+1);
+---------------+
| isnull(1 + 1) |
+---------------+
| false         |
+---------------+
1 row in set (0.02 sec)
```

- Example 2:

```sql
CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, birth_date DATE );

INSERT INTO students (name, birth_date) VALUES ('John Doe', '2000-05-15'), ('Alice Smith', NULL), ('Bob Johnson', '1999-10-20');

-- Use the ISNULL() function to find students whose birth date is not filled in:
mysql> SELECT * FROM students WHERE ISNULL(birth_date);
+------+-------------+------------+
| id   | name        | birth_date |
+------+-------------+------------+
|    2 | Alice Smith | NULL       |
+------+-------------+------------+
1 row in set (0.00 sec)

-- The ISNULL() function can also use IS NULL to achieve the same function, so the following queries are also equivalent:
mysql> SELECT * FROM students WHERE birth_date IS NULL;
+------+-------------+------------+
| id   | name        | birth_date |
+------+-------------+------------+
|    2 | Alice Smith | NULL       |
+------+-------------+------------+
1 row in set (0.01 sec)
```
