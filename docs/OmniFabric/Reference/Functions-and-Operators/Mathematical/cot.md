# **COT()**

## **Description**

The COT() function returns the cotangent of input number(given in radians).

## **Syntax**

```
> COT(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## **Examples**

```sql
mysql> SELECT COT(12);
+---------------------+
| cot(12)             |
+---------------------+
| -1.5726734063976895 |
+---------------------+
1 row in set (0.00 sec)
```

```sql
drop table if exists t1;
create table t1(a int,b float);
insert into t1 values(1,3.14159);
insert into t1 values(-1,12);

mysql> select cot(a), cot(b) from t1;
+---------------------+---------------------+
| cot(a)              | cot(b)              |
+---------------------+---------------------+
|  0.6420926159343306 |  -394449.0619219334 |
| -0.6420926159343308 | -1.5726734063976895 |
+---------------------+---------------------+
2 rows in set (0.01 sec)
```
