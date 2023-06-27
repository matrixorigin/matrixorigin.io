# **FIELD()**

## **Description**

`FIELD()` returns the index (position) of str in the str1, str2, str3, ... list.

## **Syntax**

```
> FIELD(str,str1,str2,str3,...)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. The value to search for in the list, case insensitive.|
| str1,str2,str3,... | Required. A list of values to search for, case insensitive.|

## **Returned Value**

If all arguments to `FIELD()` are strings, all arguments are compared as strings. If all arguments are numbers, they are compared as numbers. Otherwise, the arguments are compared as double.

- The `FIELD()` function returns the corresponding position index if the specified value is found in the list. Indexes returned by the `FIELD()` function start at 1.

- If more than one specified value is found in the list, the `FIELD()` function returns only the index of the first one.

- Returns 0 if str is not found.

- If str is `NULL`, the return value is 0 because `NULL` fails equality comparison with any value.

## **Examples**

- Example 1:

```sql
mysql> SELECT FIELD('Bb', 'Aa', 'Bb', 'Cc', 'Dd', 'Ff');
+-------------------------------+
| field(Bb, Aa, Bb, Cc, Dd, Ff) |
+-------------------------------+
|                             2 |
+-------------------------------+
1 row in set (0.00 sec)

mysql> SELECT FIELD('Gg', 'Aa', 'Bb', 'Cc', 'Dd', 'Ff');
+-------------------------------+
| field(Gg, Aa, Bb, Cc, Dd, Ff) |
+-------------------------------+
|                             0 |
+-------------------------------+
1 row in set (0.00 sec)
```

- Example 2:

```sql
drop table if exists t;
create table t(
    i int,
    f float,
    d double
);
insert into t() values (1, 1.1, 2.2), (2, 3.3, 4.4), (0, 0, 0), (0, null, 0);

mysql> select * from t;
+------+------+------+
| i    | f    | d    |
+------+------+------+
|    1 |  1.1 |  2.2 |
|    2 |  3.3 |  4.4 |
|    0 |    0 |    0 |
|    0 | NULL |    0 |
+------+------+------+
4 rows in set (0.01 sec)

mysql> select field(1, i, f, d) from t;
+-------------------+
| field(1, i, f, d) |
+-------------------+
|                 1 |
|                 0 |
|                 0 |
|                 0 |
+-------------------+
4 rows in set (0.01 sec)

mysql> select field(i, f, d, 0, 1, 2) from t;
+-------------------------+
| field(i, f, d, 0, 1, 2) |
+-------------------------+
|                       4 |
|                       5 |
|                       1 |
|                       2 |
+-------------------------+
4 rows in set (0.01 sec)

mysql> select field('1', f, d, 0, 1, 2) from t;
+-------------------------+
| field(1, f, d, 0, 1, 2) |
+-------------------------+
|                       4 |
|                       4 |
|                       4 |
|                       4 |
+-------------------------+
4 rows in set (0.01 sec)
```
