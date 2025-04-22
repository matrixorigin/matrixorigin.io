# **HOUR()**

## **Description**

Returns the hour for time. The range of the return value is 0 to 23 for time-of-day values. However, the range of TIME values actually is much larger, so HOUR can return values greater than 23. Returns NULL if time is NULL.

## **Syntax**

```
> HOUR(time)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| time  | Required. A value that represents time or timestamp. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a datetime, b timestamp);
insert into t1 values("2022-07-01", "2011-01-31 12:00:00");
insert into t1 values("2011-01-31 12:32:11", "1979-10-22");
insert into t1 values(NULL, "2022-08-01 23:10:11");
insert into t1 values("2011-01-31", NULL);
insert into t1 values("2022-06-01 14:11:09","2022-07-01 00:00:00");
insert into t1 values("2022-12-31","2011-01-31 12:00:00");
insert into t1 values("2022-06-12","2022-07-01 00:00:00");

mysql> select hour(a),hour(b) from t1;
+---------+---------+
| hour(a) | hour(b) |
+---------+---------+
|       0 |      12 |
|      12 |       0 |
|    NULL |      23 |
|       0 |    NULL |
|      14 |       0 |
|       0 |      12 |
|       0 |       0 |
+---------+---------+
7 rows in set (0.00 sec)

mysql> select * from t1 where hour(a)>hour(b);
+---------------------+---------------------+
| a                   | b                   |
+---------------------+---------------------+
| 2011-01-31 12:32:11 | 1979-10-22 00:00:00 |
| 2022-06-01 14:11:09 | 2022-07-01 00:00:00 |
+---------------------+---------------------+
2 rows in set (0.01 sec)
```
