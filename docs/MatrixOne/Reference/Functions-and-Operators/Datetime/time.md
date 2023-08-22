# **TIME()**

## **Description**

Extracts the time part of the time or datetime expression expr and returns it as a string. Returns `NULL` if expr is `NULL`.

## **Syntax**

```
> TIME(expr)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required.  The date/datetime to extract the time from. |

## **Examples**

```sql
mysql> SELECT TIME('2003-12-31 01:02:03');
+---------------------------+
| time(2003-12-31 01:02:03) |
+---------------------------+
| 01:02:03                  |
+---------------------------+
1 row in set (0.01 sec)
```
