# **TAN()**

## **Description**

The TAN() function returns the tangent of input number(given in radians).

## **Syntax**

```
> TAN(number)
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
insert into t1 values(-1,-3.14159);

mysql> select tan(a),tan(b) from t1;
+--------------------+--------------------------+
| tan(a)             | tan(b)                   |
+--------------------+--------------------------+
|  1.557407724654902 | -0.000002535181590118894 |
| -1.557407724654902 |  0.000002535181590118894 |
+--------------------+--------------------------+
2 rows in set (0.01 sec)

```
