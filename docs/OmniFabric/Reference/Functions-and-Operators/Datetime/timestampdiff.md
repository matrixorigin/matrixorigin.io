# **TIMESTAMPDIFF()**

## **Description**

Returns `datetime_expr2` − `datetime_expr1`, where datetime_expr1 and datetime_expr2 are date or datetime expressions. One expression may be a date and the other a datetime; a date value is treated as a datetime having the time part '00:00:00' where necessary. The unit for the result (an integer) is given by the unit argument. The legal values for unit are the same as those listed in the description of the `TIMESTAMPADD()` function.

This function returns `NULL` if datetime_expr1 or datetime_expr2 is `NULL`.

## **Syntax**

```
> TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| unit| is a string representing the unit of the time interval. This can be `MICROSECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH` or `YEAR` etc. |
| datetime_expr1,datetime_expr2 | Mandatory parameters. datetime_expr1 and datetime_expr2 expressions need to be of the same type. datetime_expr1 and datetime_expr2 are strings converted to `TIME` or `DATETIME` expressions. Returns `NULL` if datetime_expr1 or datetime_expr2 is `NULL`. |

## **Examples**

- Example 1:

```sql
mysql> SELECT TIMESTAMPDIFF( MICROSECOND, '2017-12-01 12:15:12','2018-01-01 7:18:20');
+---------------------------------------------------------------------+
| timestampdiff(microsecond, 2017-12-01 12:15:12, 2018-01-01 7:18:20) |
+---------------------------------------------------------------------+
|                                                       2660588000000 |
+---------------------------------------------------------------------+
1 row in set (0.00 sec)
```

- Example 2:

```sql
drop table if exists t1;
create table t1(a date,  b date);
insert into t1 values('2019-11-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2019-10-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2020-10-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2021-11-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2022-01-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2018-01-01 12:15:12', '2019-11-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2019-10-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2020-10-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2021-11-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2022-01-01 12:15:12');

mysql> SELECT a, b, TIMESTAMPDIFF(MICROSECOND, a, b) from t1;
+------------+------------+----------------------------------+
| a          | b          | timestampdiff(microsecond, a, b) |
+------------+------------+----------------------------------+
| 2019-11-01 | 2018-01-01 |                  -57801600000000 |
| 2019-10-01 | 2018-01-01 |                  -55123200000000 |
| 2020-10-01 | 2018-01-01 |                  -86745600000000 |
| 2021-11-01 | 2018-01-01 |                 -120960000000000 |
| 2022-01-01 | 2018-01-01 |                 -126230400000000 |
| 2018-01-01 | 2019-11-01 |                   57801600000000 |
| 2018-01-01 | 2019-10-01 |                   55123200000000 |
| 2018-01-01 | 2020-10-01 |                   86745600000000 |
| 2018-01-01 | 2021-11-01 |                  120960000000000 |
| 2018-01-01 | 2022-01-01 |                  126230400000000 |
+------------+------------+----------------------------------+
10 rows in set (0.00 sec)
```
