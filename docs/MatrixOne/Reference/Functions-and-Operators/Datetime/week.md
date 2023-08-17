# **WEEK()**

## **Description**

Used to calculate the week number for a given date. This function returns an integer representing the week number of the specified date. If `date` is `NULL`, return `NULL`.

## **Syntax**

```
> WEEK(date)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| date  | Required. `date` represents the date to calculate the week number. MatrixOne defaults the start day of the week to Monday, and the return value ranges from 0 to 53. |

## **Examples**

- Example 1:

```sql
mysql> SELECT WEEK('2008-02-20');
+------------------+
| week(2008-02-20) |
+------------------+
|                8 |
+------------------+
1 row in set (0.01 sec)
```

- Example 2:

```sql
drop table if exists t1;
CREATE TABLE t1(c1 DATETIME NOT NULL);
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('1999-12-31');
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('2006-12-25');
INSERT INTO t1 VALUES('2008-02-29');

mysql> SELECT WEEK(c1) FROM t1;
+----------+
| week(c1) |
+----------+
|       52 |
|       52 |
|       52 |
|       52 |
|        9 |
+----------+
5 rows in set (0.00 sec)
```

## **Constraints**

The `WEEK()` function of MatrixOne only supports the `date` parameter, and does not support the optional parameter `[, mode]`, which is different from MySQL.
