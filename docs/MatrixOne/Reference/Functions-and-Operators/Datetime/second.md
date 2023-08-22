# **SECOND()**

## **Description**

Returns the second for time, in the range 0 to 59, or NULL if time is NULL.

## **Syntax**

```
> SECOND(time)
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

mysql> select second(a),second(b) from t1;
+-----------+-----------+
| second(a) | second(b) |
+-----------+-----------+
|         0 |         0 |
|        11 |         0 |
|      NULL |        11 |
|         0 |      NULL |
|         9 |         0 |
|         0 |         0 |
|         0 |         0 |
+-----------+-----------+
7 rows in set (0.01 sec)

mysql> select * from t1 where second(a)>=second(b);
+---------------------+---------------------+
| a                   | b                   |
+---------------------+---------------------+
| 2022-07-01 00:00:00 | 2011-01-31 12:00:00 |
| 2011-01-31 12:32:11 | 1979-10-22 00:00:00 |
| 2022-06-01 14:11:09 | 2022-07-01 00:00:00 |
| 2022-12-31 00:00:00 | 2011-01-31 12:00:00 |
| 2022-06-12 00:00:00 | 2022-07-01 00:00:00 |
+---------------------+---------------------+
5 rows in set (0.00 sec)
```
