# **COS()**

## **Description**

The COS() function returns the cosine of input number(given in radians).

## **Syntax**

```
> COS(number)
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

mysql> select cos(a),cos(b) from t1;
+--------------------+----------------------+
| cos(a)             | cos(b)               |
+--------------------+----------------------+
| 0.5403023058681398 |  -0.9999999999967865 |
| 0.5403023058681398 | 0.000796274258662553 |
+--------------------+----------------------+
2 rows in set (0.01 sec)
```
