# **SIN()**

## **Description**

The SIN() function returns the sine of input number(given in radians).

## **Syntax**

```
> SIN(number)
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
insert into t1 values(-1,1.57);

mysql> select sin(a),sin(b) from t1;
+---------------------+--------------------------+
| sin(a)              | sin(b)                   |
+---------------------+--------------------------+
|  0.8414709848078965 | 0.0000025351815901107472 |
| -0.8414709848078965 |       0.9999996829736023 |
+---------------------+--------------------------+
2 rows in set (0.01 sec)
```
