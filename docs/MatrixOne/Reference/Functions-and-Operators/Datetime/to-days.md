# **TO_DAYS()**

## **Description**

`TO_DAYS()` is used to calculate the number of days between a given date and the start date of the Gregorian calendar (January 1, 0000). If the `date` is `NULL`, it returns `NULL`.

!!! note
    The dates '0000-00-00' and '0000-01-01' are considered invalid. When querying `0000-00-00` and `0000-01-01`, `TO_DAYS()` will return an error message:

     ```sql
     mysql> SELECT TO_DAYS('0000-00-00');
     ERROR 20301 (HY000): invalid input: invalid datetime value 0000-00-00
     mysql> SELECT TO_DAYS('0000-01-01');
     ERROR 20301 (HY000): invalid input: invalid datetime value 0000-01-01
     ```

For dates with two-digit years, for example, when querying `SELECT TO_DAYS('08-10-07');`, MatrixOne automatically completes the year 08 to 0008, which is different from MySQL. For more information, see [Two-Digit Years in Dates](../../Data-Types/date-time-data-types/year-type.md)

## **Syntax**

```
> TO_DAYS(date)
```

## **Examples**

```sql
-- The query will return an integer representing the number of days between the date '2023-07-12' and the start date of the Gregorian calendar.
mysql> SELECT TO_DAYS('2023-07-12');
+---------------------+
| to_days(2023-07-12) |
+---------------------+
|              739078 |
+---------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_DAYS('2008-10-07'), TO_DAYS('08-10-07');
+---------------------+-------------------+
| to_days(2008-10-07) | to_days(08-10-07) |
+---------------------+-------------------+
|              733687 |              3202 |
+---------------------+-------------------+
1 row in set (0.00 sec)
```
