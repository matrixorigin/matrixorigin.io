# **MEDIAN()**

## **Description**

`MEDIAN()` returns the median value of a set of values, that is, returns the value in the middle after sorting a set of values. If the argument set contains an even number of values, the function returns the average of the two numbers in the middle. It can be used as an aggregate or analytical function.

## **Syntax**

```
> MEDIAN(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr | Required. Specify the name of the array whose median value is required, whose argument type is a numeric data type or can be implicitly converted to a numeric data type. |

## **Returned Value**

The function return value and type are the same as the return value and type of its argument.

## **Examples**

```sql
mysql> select median(null);
+--------------+
| median(null) |
+--------------+
|         NULL |
+--------------+
1 row in set (0.00 sec)

drop table if exists t1;
create table t1 (a int,b int);
insert into t1 values (1,null);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|      NULL |
+-----------+
1 row in set (0.01 sec)

insert into t1 values (1,1);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|         1 |
+-----------+
1 row in set (0.01 sec)

insert into t1 values (1,2);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|       1.5 |
+-----------+
1 row in set (0.01 sec)

mysql> select median(b) from t1 group by a order by a;
+-----------+
| median(b) |
+-----------+
|       1.5 |
+-----------+
1 row in set (0.00 sec)

insert into t1 values (2,1),(2,2),(2,3),(2,4);

mysql> select median(b) from t1 group by a order by a;
+-----------+
| median(b) |
+-----------+
|       1.5 |
|       2.5 |
+-----------+
2 rows in set (0.01 sec)
```
