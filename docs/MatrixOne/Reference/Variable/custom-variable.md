# Setting custom variable

In MatrixOne, custom variables are a mechanism for storing and manipulating values. Custom variables can be set through the the'SET'statement, and the value can be kept unchanged throughout the session. You can customize variables through the `SET` command and use it in SQL. The specific syntax is as follows:

```sql
SET @variable_name = value;
```

`@variable_name` is the name of the custom variable, and `value` is the value to be assigned to the variable. Once defined, the variable can be used in the SQL statement instead of the actual value.

For example, the following statement will define a variable named `@max_salary` and set it to 100000:

```sql
SET @max_salary = 100000;
--View the value set by the @max_salary variable
mysql> select @max_salary;
+-------------+
| @max_salary |
+-------------+
| 100000      |
+-------------+
1 row in set (0.01 sec)
```

When using a custom variable, you can include it in an SQL statement and reference it as `@variable_name`. For example, the following statement will return all employee records whose salary is less than `@max_salary`:

```sql
SELECT * FROM employees WHERE salary < @max_salary;
```

You can affect the result of an SQL query by changing the value of a custom variable. For example, the following statement will change the value of `@max_salary` and return a new query result:

```sql
SET @max_salary = 80000;
SELECT * FROM employees WHERE salary < @max_salary;
```

It should be noted that custom variables only remain valid in the current session, and when the session ends, the variables will be deleted and released. In addition, variable names must start with the `@` symbol and are case-sensitive.

## Simple Example

Now let's define two variables, a and b:

```
> SET  @a=2, @b=3;
Query OK, 0 rows affected (0.00 sec)

> select @a;
+------+
| @a   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

> select @b;
+------+
| @b   |
+------+
|    3 |
+------+
1 row in set (0.00 sec)
```

Using custom variables in SQL:

```
> create table t1(a int,b varchar(1));
Query OK, 0 rows affected (0.02 sec)

> insert into t1 values(@a,@b);
Query OK, 1 row affected (0.02 sec)

> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    2 | 3    |
+------+------+
1 row in set (0.01 sec)
```

!!! note
    The variables a and b are both ints here. If you want a string of 2 or 3, it is recommended to use `SET @a ='2', @b='3';`.

## MySQL compatibility

MatrixOne supports the session level, which is the same as MySQL support.
