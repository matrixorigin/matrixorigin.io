# **FORMAT()**

## **Description**

Formats the number X to a format like '#,###,###.##', rounded to D decimal places, and returns the result as a string.

## **Syntax**

```
> FORMAT(X,D[,locale])
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. X is the number need to format. If X is NULL, the function returns NULL. |
| D | Required. D is the number of decimal places to round. <br>If D is 0, the result has no decimal point or fractional part. <br>If D is NULL, the function returns NULL.|
| [,locale] |  Optional. The optional parameter enables a locale to be specified to be used for the result number's decimal point, thousands separator, and grouping between separators. If the locale is NULL or not specified, the default locale is 'en_US'. `[,locale]` supports locale parameters consistent with MySQL; see [MySQL Server Locale Support](https://dev.mysql.com/doc/refman/8.0/en/locale-support.html).|

## **Examples**

```SQL
mysql> SELECT FORMAT(12332.123456, 4);
+-------------------------+
| format(12332.123456, 4) |
+-------------------------+
| 12,332.1235             |
+-------------------------+
1 row in set (0.01 sec)

mysql> SELECT FORMAT(12332.1,4);
+--------------------+
| format(12332.1, 4) |
+--------------------+
| 12,332.1000        |
+--------------------+
1 row in set (0.00 sec)

mysql> SELECT FORMAT(12332.2,0);
+--------------------+
| format(12332.2, 0) |
+--------------------+
| 12,332             |
+--------------------+
1 row in set (0.00 sec)

mysql> SELECT FORMAT(12332.2,2,'de_DE');
+---------------------------+
| format(12332.2, 2, de_DE) |
+---------------------------+
| 12.332,20                 |
+---------------------------+
1 row in set (0.00 sec)

mysql> SELECT FORMAT(19999999.999999999,4);
+-------------------------------+
| format(19999999.999999999, 4) |
+-------------------------------+
| 20,000,000.0000               |
+-------------------------------+
1 row in set (0.01 sec)

mysql> SELECT FORMAT("-.12334.2","2", "en_US");
+-----------------------------+
| format(-.12334.2, 2, en_US) |
+-----------------------------+
| -0.12                       |
+-----------------------------+
1 row in set (0.00 sec)

mysql> SELECT FORMAT("-.12334.2","2", "de_CH");
+-----------------------------+
| format(-.12334.2, 2, de_CH) |
+-----------------------------+
| -0.12                       |
+-----------------------------+
1 row in set (0.01 sec)
```
