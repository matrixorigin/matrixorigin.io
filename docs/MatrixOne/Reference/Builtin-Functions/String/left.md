# **LEFT()**

## **Description**

This function `LEFT()` returns the leftmost *len* characters from the string str, or NULL if any argument is NULL.

This function is multibyte safe.

## **Syntax**

```
> LEFT(str,len)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. The string to extract from.|
| len | Required. The number of characters to extract. If this parameter is larger than the number of characters in string, this function will return string|

## **Examples**

```SQL
mysql> select left('abcde', 3) from dual;
+----------------+
| left(abcde, 3) |
+----------------+
| abc            |
+----------------+
1 row in set (0.00 sec)

drop table if exists t1;
CREATE TABLE t1 (str VARCHAR(100) NOT NULL, len INT);
insert into t1 values('abcdefghijklmn',3);
insert into t1 values('  ABCDEFGH123456', 3);
insert into t1 values('ABCDEF  GHIJKLMN', 20);
insert into t1 values('ABCDEFGHijklmn   ', -1);
insert into t1 values('ABCDEFGH123456', -35627164);
insert into t1 values('', 3);
mysql> select left(str, len) from t1;
+------------------+
| left(str, len)   |
+------------------+
| abc              |
|   A              |
| ABCDEF  GHIJKLMN |
|                  |
|                  |
|                  |
+------------------+
6 rows in set (0.01 sec)

mysql> select left('sdfsdfsdfsdf', len) from t1;
+-------------------------+
| left(sdfsdfsdfsdf, len) |
+-------------------------+
| sdf                     |
| sdf                     |
| sdfsdfsdfsdf            |
|                         |
|                         |
| sdf                     |
+-------------------------+
6 rows in set (0.01 sec)
```
