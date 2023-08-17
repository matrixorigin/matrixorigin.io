# **TO_SECONDS()**

## **Description**

The `TO_SECONDS(expr)` function is used to calculate the number of seconds between a given date or datetime `expr` and the year 0, January 1, 00:00:00. If `expr` is `NULL`, it returns `NULL`.

!!! note
    The dates `0000-00-00` and `0000-01-01` are considered invalid. MatrixOne year queries should start from `0001`. When querying `0000-00-00` and `0000-01-01`, `TO_SECONDS()` returns an error message:

    ```sql
    mysql> SELECT TO_SECONDS('0000-00-00');
    ERROR 20301 (HY000): invalid input: invalid datetime value 0000-00-00
    mysql> SELECT TO_SECONDS('0000-01-01');
    ERROR 20301 (HY000): invalid input: invalid datetime value 0000-01-01
    ```

Similar to the `TO_DAYS()` function, for example, when querying `SELECT TO_SECONDS('08-10-07');`, MatrixOne automatically fills the year 08 to 0008, which is different from MySQL. For more information, see [Two-Digit Years in Dates](../../Data-Types/date-time-data-types/year-type.md).

## **Syntax**

```
> TO_SECONDS(expr)
```

`expr` is a date or datetime value and can be of type `DATETIME`, `DATE`, or `TIMESTAMP`.

## **Examples**

```sql
mysql> SELECT TO_SECONDS('0001-01-01');
+------------------------+
| to_seconds(0001-01-01) |
+------------------------+
|               31622400 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('2023-07-12 08:30:00');
+---------------------------------+
| to_seconds(2023-07-12 08:30:00) |
+---------------------------------+
|                     63856369800 |
+---------------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('2007-10-07');
+------------------------+
| to_seconds(2007-10-07) |
+------------------------+
|            63358934400 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('97-10-07');
+----------------------+
| to_seconds(97-10-07) |
+----------------------+
|           3085257600 |
+----------------------+
1 row in set (0.00 sec)
```
