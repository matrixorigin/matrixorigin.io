# **FLOOR()**

## **Description**

The FLOOR() function returns the largest round number that is less than or equal to the number.

## **Syntax**

```
> FLOOR(number, decimals)
> FLOOR(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |
| decimals| Optional. An integer that represents the number of decimal places. By default it is zero, which means to round to an integer.<br>**decimals** may also be negative.|

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

mysql> select a,floor(b) from t1;
+------+----------+
| a    | floor(b) |
+------+----------+
|    1 |        0 |
|    2 |        0 |
|    3 |        0 |
|    4 |       20 |
|    5 |       20 |
|    6 |       13 |
|    7 |       -1 |
|    8 |       -1 |
|    9 |       -1 |
|   10 |      -21 |
|   11 |      -21 |
|   12 |      -14 |
+------+----------+
12 rows in set (0.01 sec)

mysql> select sum(floor(b)) from t1;
+---------------+
| sum(floor(b)) |
+---------------+
|            -6 |
+---------------+
1 row in set (0.00 sec)

mysql> select a,sum(floor(b)) from t1 group by a order by a;
+------+---------------+
| a    | sum(floor(b)) |
+------+---------------+
|    1 |             0 |
|    2 |             0 |
|    3 |             0 |
|    4 |            20 |
|    5 |            20 |
|    6 |            13 |
|    7 |            -1 |
|    8 |            -1 |
|    9 |            -1 |
|   10 |           -21 |
|   11 |           -21 |
|   12 |           -14 |
+------+---------------+
12 rows in set (0.00 sec)
```
