# **DATEDIFF()**

## **Description**

`DATEDIFF()` returns expr1 − expr2 expressed as a value in days from one date to the other. expr1 and expr2 are date or date-and-time expressions. Only the date parts of the values are used in the calculation.

## **Syntax**

```
> DATEDIFF(expr1,expr2)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr1,expr2  | Required. expr1 and expr2 are date or date-and-time expressions. Only the date parts of the values are used in the calculation. |

## **Examples**

```sql
mysql> SELECT DATEDIFF('2007-12-31 23:59:59','2007-12-30');
+-------------------------------------------+
| datediff(2007-12-31 23:59:59, 2007-12-30) |
+-------------------------------------------+
|                                         1 |
+-------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT DATEDIFF('2010-11-30 23:59:59','2010-12-31');
+-------------------------------------------+
| datediff(2010-11-30 23:59:59, 2010-12-31) |
+-------------------------------------------+
|                                       -31 |
+-------------------------------------------+
1 row in set (0.00 sec)
```

```sql
create table t1(a INT,  b date);
insert into t1 values(1, "2012-10-11");
insert into t1 values(2, "2004-04-24");
insert into t1 values(3, "2008-12-04");
insert into t1 values(4, "2012-03-23");
insert into t1 values(5, "2000-03-23");
insert into t1 values(6, "2030-03-23");
insert into t1 values(7, "2040-03-23");

mysql> SELECT a, DATEDIFF('2022-10-9', b) from t1;
+------+------------------------+
| a    | datediff(2022-10-9, b) |
+------+------------------------+
|    1 |                   3650 |
|    2 |                   6742 |
|    3 |                   5057 |
|    4 |                   3852 |
|    5 |                   8235 |
|    6 |                  -2722 |
|    7 |                  -6375 |
+------+------------------------+
7 rows in set (0.01 sec)
```
