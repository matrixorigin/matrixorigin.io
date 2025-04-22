# **VAR_POP**

## **Function Description**

`VAR_POP()` is an aggregate function that calculates the overall variance. Synonymous with `VARIANCE()`.

## **Function syntax**

```
> VAR_POP(expr)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| expr | Column names of columns of any numeric type |

## **Examples**

```sql
CREATE TABLE t1(PlayerName VARCHAR(100) NOT NULL,RunScored INT NOT NULL,WicketsTaken INT NOT NULL);
INSERT INTO t1 VALUES('KL Rahul', 52, 0 ),('Hardik Pandya', 30, 1 ),('Ravindra Jadeja', 18, 2 ),('Washington Sundar', 10, 1),('D Chahar', 11, 2 ),  ('Mitchell Starc', 0, 3);

-- Return Consistency
mysql> SELECT VAR_POP(RunScored) as Pop_Standard_Variance FROM t1;
+-----------------------+
| Pop_Standard_Variance |
+-----------------------+
|     284.8055555555555 |
+-----------------------+
1 row in set (0.01 sec)

-- Calculate the variance of the WicketsTaken columns
mysql> SELECT VAR_POP(WicketsTaken) as Pop_Std_Var_Wickets FROM t1;
+---------------------+
| Pop_Std_Var_Wickets |
+---------------------+
|  0.9166666666666665 |
+---------------------+
1 row in set (0.01 sec)
```
