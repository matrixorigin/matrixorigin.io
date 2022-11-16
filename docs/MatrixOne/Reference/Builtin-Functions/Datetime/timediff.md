# **TIMEDIFF()**

## **Description**

`TIMEDIFF()` returns expr1 − expr2 expressed as a time value.

The result returned by `TIMEDIFF()` is limited to the range allowed for TIME values. Alternatively, you can use either of the functions `TIMESTAMPDIFF()` and `UNIX_TIMESTAMP()`, both of which return integers.

## **Syntax**

```
> TIMEDIFF(expr1,expr2)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required. expr1 and expr2 are strings which are converted to TIME or DATETIME expressions; these must be of the same type following conversion. Returns NULL if expr1 or expr2 is NULL.|

## **Examples**

```sql
> select timediff("22:22:22", "11:00:00");
+------------------------------+
| timediff(22:22:22, 11:00:00) |
+------------------------------+
| 11:22:22.000000              |
+------------------------------+
1 row in set (0.01 sec)

> select timediff(cast('22:22:22' as time), cast('-11:11:11' as time));
+-------------------------------------------------------------------+
| timediff(cast(22:22:22 as time(26)), cast(-11:11:11 as time(26))) |
+-------------------------------------------------------------------+
| 33:33:33                                                          |
+-------------------------------------------------------------------+
1 row in set (0.01 sec)

> select timediff(cast('22:22:22' as time), null);
+--------------------------------------------+
| timediff(cast(22:22:22 as time(26)), null) |
+--------------------------------------------+
| NULL                                       |
+--------------------------------------------+
1 row in set (0.00 sec)

> select timediff(CAST('2017-08-08 22:22:22' as datetime), CAST('2000-01-02 11:00:00' as datetime));
+------------------------------------------------------------------------------------------------+
| timediff(cast(2017-08-08 22:22:22 as datetime(26)), cast(2000-01-02 11:00:00 as datetime(26))) |
+------------------------------------------------------------------------------------------------+
| 154283:22:22                                                                                   |
+------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

> create table time_04 (t1 int,t2 time,t3 datetime,t4 timestamp);
> insert into time_04 values (1,"344:59:09","2020-09-12","2021-09-22 10:01:23.903");
> select * from time_04;
+------+-----------+---------------------+---------------------+
| t1   | t2        | t3                  | t4                  |
+------+-----------+---------------------+---------------------+
|    1 | 344:59:09 | 2020-09-12 00:00:00 | 2021-09-22 10:01:24 |
+------+-----------+---------------------+---------------------+
1 row in set (0.00 sec)
```
