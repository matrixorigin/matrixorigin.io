# MD5()

## Function Description

`MD5 ()` Function A widely used hash function that generates a 32-character long hexadecimal MD5 hash of a string. It converts an input message of arbitrary length into a 128-bit (16-byte) hash, usually represented as a 32-bit hexadecimal string. Returns NULL if the argument is NULL.

## Function syntax

```
> MD5(str)
```

## Parameter interpretation

| Parameters | Description |
| -------- | ------------ |
| str | Required parameters. String to convert |

## Examples

```SQL
mysql> select md5("hello world");
+----------------------------------+
| md5(hello world)                 |
+----------------------------------+
| 5eb63bbbe01eeed093cb22bb8f5acdc3 |
+----------------------------------+
1 row in set (0.00 sec)

mysql> select md5(null);
+-----------+
| md5(null) |
+-----------+
| NULL      |
+-----------+
1 row in set (0.00 sec)
```