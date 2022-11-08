# Setting custom variable

In MatrixOne, you can customize variables using the `SET` command and use them in SQL. The specific syntax is as follows:

```sql
SET variable = expr, [variable = expr ..,]
```

## Example

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
