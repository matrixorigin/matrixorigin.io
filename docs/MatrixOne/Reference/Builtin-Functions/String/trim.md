# **TRIM()**

## **Description**

This function `TRIM()` returns the string str with all remstr prefixes or suffixes removed. If none of the specifiers BOTH, LEADING, or TRAILING is given, BOTH is assumed. remstr is optional and, if not specified, spaces are removed.

This function is multibyte safe. It returns NULL if any of its arguments are NULL.

## **Syntax**

```
> TRIM([{BOTH | LEADING | TRAILING} [remstr] FROM] str), TRIM([remstr FROM] str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. CHAR and VARCHAR are both supported |

## **Examples**

```SQL
mysql> select trim(' abc '), trim('abc '), trim(' abc'), trim('abc');
+-------------+------------+------------+-----------+
| trim( abc ) | trim(abc ) | trim( abc) | trim(abc) |
+-------------+------------+------------+-----------+
| abc         | abc        | abc        | abc       |
+-------------+------------+------------+-----------+
1 row in set (0.00 sec)

drop table if exists t1;
create table t1(a varchar(100), b varchar(100));
insert into t1 values('abc', 'abc');
insert into t1 values('啊abc哦', '啊abc哦');
insert into t1 values('啊啊o', 'o');
insert into t1 values('啊啊o', '啊');
insert into t1 values('啊啊o', 'o啊');
mysql> select trim(both a from b) from t1;
+---------------------+
| trim(both a from b) |
+---------------------+
|                     |
|                     |
| o                   |
| 啊                  |
| o啊                 |
+---------------------+
5 rows in set (0.00 sec)

mysql> select trim(leading a from b) from t1;
+------------------------+
| trim(leading a from b) |
+------------------------+
|                        |
|                        |
| o                      |
| 啊                     |
| o啊                    |
+------------------------+
5 rows in set (0.01 sec)

mysql> select trim(trailing a from b) from t1;
+-------------------------+
| trim(trailing a from b) |
+-------------------------+
|                         |
|                         |
| o                       |
| 啊                      |
| o啊                     |
+-------------------------+
5 rows in set (0.00 sec)
```
