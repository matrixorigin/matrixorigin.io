# **CONVERT_TZ()**

## **Function Description**

The `CONVERT_TZ()` function is used to convert a given datetime from one time zone to another. If the argument is invalid, the function returns NULL.

## **Function syntax**

```
> CONVERT_TZ(dt,from_tz,to_tz)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---------------- |
| dt | Required parameters. The given datetime to convert. |
| from_tz | Required parameters. Identification of the current time zone |
| to_tz | Required parameters. Identification of the new time zone |

## **Examples**

```sql
mysql> SELECT CONVERT_TZ('2004-01-01 12:00:00','GMT','MET');
+-------------------------------------------+
| convert_tz(2004-01-01 12:00:00, GMT, MET) |
+-------------------------------------------+
| 2004-01-01 13:00:00                       |
+-------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT CONVERT_TZ('2004-01-01 12:00:00','+00:00','+10:00');
+-------------------------------------------------+
| convert_tz(2004-01-01 12:00:00, +00:00, +10:00) |
+-------------------------------------------------+
| 2004-01-01 22:00:00                             |
+-------------------------------------------------+
1 row in set (0.01 sec)

mysql> select convert_tz('2023-12-31 10:28:00','+08:00', 'America/New_York') as dtime;
+---------------------+
| dtime               |
+---------------------+
| 2023-12-30 21:28:00 |
+---------------------+
1 row in set (0.00 sec)

mysql> select convert_tz(NULL,'-05:00', '+05:30') as dtime;
+-------+
| dtime |
+-------+
| NULL  |
+-------+
1 row in set (0.00 sec)
```
