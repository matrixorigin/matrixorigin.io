# **GENERATE_SERIES()**

## **Function description**

GENERATE_SERIES() can generate a sequence from the start value to the end value, usually used in the following scenarios:

1. Generate continuous numbers: Used to generate a series of integers, such as 1 to 10.
2. Generate date and time series: time series at daily, hourly and other intervals can be generated.
3. Combined table query: used to dynamically generate or expand data.

## **Function syntax**

```
>select *from generate_series(start, stop [, step]) g
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| start | starting value |
| stop | end value |
| step | step size, default is 1|

## **Example**

-Example 1:

```sql
--Generate a sequence of 1-5 integers
mysql> select *from generate_series(5) g;
+--------+
| result |
+--------+
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
+--------+
5 rows in set (0.01 sec)

--Generate a sequence of 2-5 integers
mysql> select *from generate_series(2, 5) g;
+--------+
| result |
+--------+
| 2 |
| 3 |
| 4 |
| 5 |
+--------+
4 rows in set (0.00 sec)

--Generate a sequence of 1-5 integers and specify a step size of 2
mysql> select *from generate_series(1, 5,2) g;
+--------+
| result |
+--------+
| 1 |
| 3 |
| 5 |
+--------+
3 rows in set (0.01 sec)

--Generate date sequence
mysql> select *from generate_series('2020-02-28 00:00:00','2021-03-01 00:01:00', '1 year') g;
+---------------------+
| result |
+---------------------+
| 2020-02-28 00:00:00 |
| 2021-02-28 00:00:00 |
+---------------------+
2 rows in set (0.00 sec)
```