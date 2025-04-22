# **CEIL()**

## **Description**

The CEIL(X) function returns the smallest integer value not less than X.Synonymous with [`CEILING()`](ceiling.md).

## **Syntax**

```
> CEIL(X)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. Any numeric data type supported now. |

For exact-value numeric arguments, the return value has an exact-value numeric type. For floating-point arguments, the return value has a floating-point type.

## **Examples**

```sql
drop table if exists t1;
create table t1(a int ,b float);
insert into t1 values(1,0.5);
insert into t1 values(2,0.499);
insert into t1 values(3,0.501);
insert into t1 values(4,20.5);
insert into t1 values(5,20.499);
insert into t1 values(6,13.500);
insert into t1 values(7,-0.500);
insert into t1 values(8,-0.499);
insert into t1 values(9,-0.501);
insert into t1 values(10,-20.499);
insert into t1 values(11,-20.500);
insert into t1 values(12,-13.500);

mysql> select a,ceil(b) from t1;
+------+---------+
| a    | ceil(b) |
+------+---------+
|    1 |       1 |
|    2 |       1 |
|    3 |       1 |
|    4 |      21 |
|    5 |      21 |
|    6 |      14 |
|    7 |      -0 |
|    8 |      -0 |
|    9 |      -0 |
|   10 |     -20 |
|   11 |     -20 |
|   12 |     -13 |
+------+---------+
12 rows in set (0.01 sec)

mysql> select sum(ceil(b)) from t1;
+--------------+
| sum(ceil(b)) |
+--------------+
|            6 |
+--------------+
1 row in set (0.01 sec)
```
