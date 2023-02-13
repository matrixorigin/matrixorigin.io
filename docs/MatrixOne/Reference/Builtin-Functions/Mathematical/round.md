# **ROUND()**

## **Description**

The ROUND() function rounds a number to a specified number of decimal places.  
The function returns the nearest number of the specified order. In case when given number has equal distance to surrounding numbers, the function uses banker's rounding for float number types and rounds away from zero for the other number types (Decimal).

## **Syntax**

```
> ROUND(number, decimals)
> ROUND(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required.  The number to round, including any numeric data type supported now. |
| decimals| Optional. An integer that represents the number of decimal places you want to round to. Default value is 0. <br> **decimals>0** then the function rounds the value to the right of the decimal point. <br> **decimals<0** then the function rounds the value to the left of the decimal point. <br> **decimals=0** then the function rounds the value to integer.|

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

mysql> select a,round(b) from t1;
+------+----------+
| a    | round(b) |
+------+----------+
|    1 |        0 |
|    2 |        0 |
|    3 |        1 |
|    4 |       20 |
|    5 |       20 |
|    6 |       14 |
|    7 |       -0 |
|    8 |       -0 |
|    9 |       -1 |
|   10 |      -20 |
|   11 |      -20 |
|   12 |      -14 |
+------+----------+
12 rows in set (0.00 sec)

mysql> select a,round(b,-1) from t1;
+------+--------------+
| a    | round(b, -1) |
+------+--------------+
|    1 |            0 |
|    2 |            0 |
|    3 |            0 |
|    4 |           20 |
|    5 |           20 |
|    6 |           10 |
|    7 |           -0 |
|    8 |           -0 |
|    9 |           -0 |
|   10 |          -20 |
|   11 |          -20 |
|   12 |          -10 |
+------+--------------+
12 rows in set (0.01 sec)

mysql> select round(a*b) from t1;
+--------------+
| round(a * b) |
+--------------+
|            0 |
|            1 |
|            2 |
|           82 |
|          102 |
|           81 |
|           -4 |
|           -4 |
|           -5 |
|         -205 |
|         -226 |
|         -162 |
+--------------+
12 rows in set (0.01 sec)
```
