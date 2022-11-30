# **ATAN()**

## **Description**

The ATAN() function returns the arctangent(given in radians) of the input number.

## **Syntax**

```
> ATAN(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a int,b float);
insert into t1 values(1,3.14159);
insert into t1 values(0,1);

mysql> select atan(a),atan(tan(b)) from t1;
+--------------------+--------------------------+
| atan(a)            | atan(tan(b))             |
+--------------------+--------------------------+
| 0.7853981633974483 | -0.000002535181590113463 |
|                  0 |                        1 |
+--------------------+--------------------------+
2 rows in set (0.00 sec)
```
