# **EXP()**

## **Description**

The EXP() function returns the value of e (the base of natural logarithms) raised to the power of X.

## **Syntax**

```
> EXP(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a int ,b float);
insert into t1 values(-4, 2.45);
insert into t1 values(6, -3.62);

mysql> select exp(a), exp(b) from t1;
+---------------------+----------------------+
| exp(a)              | exp(b)               |
+---------------------+----------------------+
| 0.01831563888873418 |   11.588347271798835 |
|   403.4287934927351 | 0.026782679557672436 |
+---------------------+----------------------+
2 rows in set (0.00 sec)
```
