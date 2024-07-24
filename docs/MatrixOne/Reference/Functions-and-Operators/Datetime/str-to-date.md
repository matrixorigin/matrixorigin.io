# **STR\_TO\_DATE()**

## **Function Description**

The `STR_TO_DATE()` function converts a string to a date or datetime type in the specified date or time display format, synonymous with [`TO_DATE()`](to-date.md).

Format strings can contain text characters and format specifiers beginning with %. Literal characters and format specifiers in format must match str and expressions are supported. The `STR_TO_DATE` function returns NULL if str cannot be parsed in format or if either argument is NULL.

See the [`DATE_FORMAT()`](date-format.md) function description for format specifiers that can be used.

## **Function syntax**

```
> STR_TO_DATE(str,format)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | String to format as date (input string) |
| format | Format string to use |

## **Examples**

```sql
mysql> SELECT STR_TO_DATE('2022-01-06 10:20:30','%Y-%m-%d %H:%i:%s') as result;
+---------------------+
| result              |
+---------------------+
| 2022-01-06 10:20:30 |
+---------------------+
1 row in set (0.00 sec) 

mysql> SELECT STR_TO_DATE('09:30:17','%h:%i:%s');
+---------------------------------+
| str_to_date(09:30:17, %h:%i:%s) |
+---------------------------------+
| 09:30:17                        |
+---------------------------------+
1 row in set (0.00 sec)

-- Calculate the variance of the WicketsTaken columns
mysql> SELECT str_to_date('2008-01-01',replace('yyyy-MM-dd','yyyy-MM-dd','%Y-%m-%d')) as result;
+------------+
| result     |
+------------+
| 2008-01-01 |
+------------+
1 row in set (0.00 sec)

--The STR_TO_DATE function ignores the extra characters at the end of the input string str when parsing it according to the format string format
mysql> SELECT STR_TO_DATE('25,5,2022 extra characters','%d,%m,%Y'); 
+---------------------------------------------------+
| str_to_date(25,5,2022 extra characters, %d,%m,%Y) |
+---------------------------------------------------+
| 2022-05-25                                        |
+---------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT STR_TO_DATE('2022','%Y');
+-----------------------+
| str_to_date(2022, %Y) |
+-----------------------+
| NULL                  |
+-----------------------
```
