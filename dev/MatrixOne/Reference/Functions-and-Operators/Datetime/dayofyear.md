---
title: "DAYOFYEAR()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Returns the day of the year for date, in the range 1 to 366."
---
# **DAYOFYEAR()**

> Returns the day of the year for date, in the range 1 to 366.

## **Description**

Returns the day of the year for date, in the range 1 to 366.

## **Syntax**

```
> DAYOFYEAR(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required.  The date or datetime expression. Accepts date and datetime types. |

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
create table t1(a date, b datetime,c varchar(30));
insert into t1 values('2022-01-01','2022-01-01 01:01:01','2022-01-01 01:01:01');
insert into t1 values('2022-01-01','2022-01-01 01:01:01','2022-01-01 01:01:01');
insert into t1 values('20220101','2022-01-01 01:01:01','2022-13-13 01:01:01');
insert into t1 values('2022-01-02','2022-01-02 23:01:01','2022-01-01 23:01:01');
insert into t1 values('2021-12-31','2021-12-30 23:59:59','2021-12-30 23:59:59');
insert into t1 values('2022-06-30','2021-12-30 23:59:59','2021-12-30 23:59:59');

mysql> select distinct dayofyear(a) as dya from t1;
+------+
| dya  |
+------+
|    1 |
|    2 |
|  365 |
|  181 |
+------+
4 rows in set (0.00 sec)

mysql> select * from t1 where dayofyear(a)>120;
+------------+---------------------+---------------------+
| a          | b                   | c                   |
+------------+---------------------+---------------------+
| 2021-12-31 | 2021-12-30 23:59:59 | 2021-12-30 23:59:59 |
| 2022-06-30 | 2021-12-30 23:59:59 | 2021-12-30 23:59:59 |
+------------+---------------------+---------------------+
2 rows in set (0.01 sec)

mysql> select * from t1 where dayofyear(a) between 1 and 184;
+------------+---------------------+---------------------+
| a          | b                   | c                   |
+------------+---------------------+---------------------+
| 2022-01-01 | 2022-01-01 01:01:01 | 2022-01-01 01:01:01 |
| 2022-01-01 | 2022-01-01 01:01:01 | 2022-01-01 01:01:01 |
| 2022-01-01 | 2022-01-01 01:01:01 | 2022-13-13 01:01:01 |
| 2022-01-02 | 2022-01-02 23:01:01 | 2022-01-01 23:01:01 |
| 2022-06-30 | 2021-12-30 23:59:59 | 2021-12-30 23:59:59 |
+------------+---------------------+---------------------+
4 rows in set (0.00 sec)
```

## **Constraints**

The date type supports `yyyy-mm-dd` and `yyyy-mm-dd HH:MM:SS` formats as string literals. The `yyyymmdd` format is also supported when passed as a string (e.g., `'20220101'`), not as an unquoted integer.
