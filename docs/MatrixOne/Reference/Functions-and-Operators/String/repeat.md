# **REPEAT()**

## **Description**

Returns a string consisting of the string str repeated count times. If count is less than 1, returns an empty string. Returns `NULL` if str or count is `NULL`.

## **Syntax**

```
> REPEAT(str,count)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. The string to repeat.|
| count | Required. The number of times to repeat.|

## **Examples**

```sql
mysql> SELECT repeat('abc', -1);
+-----------------+
| repeat(abc, -1) |
+-----------------+
|                 |
+-----------------+
1 row in set (0.00 sec)

mysql> SELECT repeat('abc', 1), repeat('abc', 2), repeat('abc', 3);
+----------------+----------------+----------------+
| repeat(abc, 1) | repeat(abc, 2) | repeat(abc, 3) |
+----------------+----------------+----------------+
| abc            | abcabc         | abcabcabc      |
+----------------+----------------+----------------+
1 row in set (0.00 sec)
```
