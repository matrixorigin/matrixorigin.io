# **VARIANCE**

## **Description**

The VARIANCE(expr) function returns the population standard variance of expr. Variance is an essential concept in statistics, which is used to measure the degree of dispersion of a set of data values, that is, the difference between the data value and its mean value. If the variance value is large, the difference between the data values ​​is large; conversely, if the variance value is small, the difference between the data values ​​is slight.

## **Syntax**

```
> VARIANCE(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Any numerical expressions |

## **Examples**

```sql
CREATE TABLE t1(PlayerName VARCHAR(100) NOT NULL,RunScored INT NOT NULL,WicketsTaken INT NOT NULL);
INSERT INTO t1 VALUES('KL Rahul', 52, 0 ),('Hardik Pandya', 30, 1 ),('Ravindra Jadeja', 18, 2 ),('Washington Sundar', 10, 1),('D Chahar', 11, 2 ),  ('Mitchell Starc', 0, 3);

-- Calculate the variance of the RunScored column
> SELECT VARIANCE(RunScored) as Pop_Standard_Variance FROM t1;
+-----------------------+
| Pop_Standard_Variance |
+-----------------------+
|     284.8055555555555 |
+-----------------------+
1 row in set (0.01 sec)

-- Calculate the variance of the WicketsTaken column
mysql> SELECT VARIANCE(WicketsTaken) as Pop_Std_Var_Wickets FROM t1;
+---------------------+
| Pop_Std_Var_Wickets |
+---------------------+
|  0.9166666666666665 |
+---------------------+
1 row in set (0.01 sec)
```
