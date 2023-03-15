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
|expr1,expr2  | Required. expr1 and expr2 are strings which are converted to TIME or DATETIME expressions; these must be of the same type following conversion. Returns NULL if expr1 or expr2 is NULL.|

## **Examples**

```sql
mysql> select timediff("22:22:22", "11:00:00");
+------------------------------+
| timediff(22:22:22, 11:00:00) |
+------------------------------+
| 11:22:22.000000              |
+------------------------------+
1 row in set (0.01 sec)

mysql> select timediff(cast('22:22:22' as time), null);
+--------------------------------------------+
| timediff(cast(22:22:22 as time(26)), null) |
+--------------------------------------------+
| NULL                                       |
+--------------------------------------------+
1 row in set (0.00 sec)

mysql> select timediff(CAST('2017-08-08 22:22:22' as datetime), CAST('2000-01-02 11:00:00' as datetime));
+------------------------------------------------------------------------------------------------+
| timediff(cast(2017-08-08 22:22:22 as datetime(26)), cast(2000-01-02 11:00:00 as datetime(26))) |
+------------------------------------------------------------------------------------------------+
| 154283:22:22                                                                                   |
+------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

```sql
create table time_01(t1 time,t2 time,t3 time);
insert into time_01 values("-838:59:59.0000","838:59:59.00","22:00:00");
insert into time_01 values("0:00:00.0000","0","0:00");
insert into time_01 values(null,NULL,null);
insert into time_01 values("23","1122","-1122");
insert into time_01 values("101412","4","-101219");
insert into time_01 values("24:59:09.932823","24:02:00.93282332424","24:20:34.00000000");
insert into time_01 values("2022-09-08 12:00:01","019","23403");

mysql> select * from time_01;
+------------+-----------+-----------+
| t1         | t2        | t3        |
+------------+-----------+-----------+
| -838:59:59 | 838:59:59 | 22:00:00  |
| 00:00:00   | 00:00:00  | 00:00:00  |
| NULL       | NULL      | NULL      |
| 00:00:23   | 00:11:22  | -00:11:22 |
| 10:14:12   | 00:00:04  | -10:12:19 |
| 24:59:10   | 24:02:01  | 24:20:34  |
| 12:00:01   | 00:00:19  | 02:34:03  |
+------------+-----------+-----------+
7 rows in set (0.00 sec)

mysql> select timediff(t1,t2) from time_01;
+------------------+
| timediff(t1, t2) |
+------------------+
| -1677:59:58      |
| 00:00:00         |
| NULL             |
| -00:10:59        |
| 10:14:08         |
| 00:57:09         |
| 11:59:42         |
+------------------+
7 rows in set (0.00 sec)
```
