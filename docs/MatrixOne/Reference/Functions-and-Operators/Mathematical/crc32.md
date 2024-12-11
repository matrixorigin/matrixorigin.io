# **CRC32()**

## **Function description**

The CRC32() function is used to calculate the CRC32 checksum of a string. If the argument passed to CRC32() is NULL, the function returns NULL.

## **Function syntax**

```
> CRC32(string)
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| string | Required parameter, input string to calculate CRC32 checksum |

## **Example**

```sql
mysql> SELECT CRC32('hello world');
+--------------------+
| CRC32(hello world) |
+--------------------+
| 222957957 |
+--------------------+
1 row in set (0.00 sec)

mysql> SELECT CRC32('HELLOW WORLD');
+---------------------+
| CRC32(HELLOW WORLD) |
+---------------------+
| 1290240849 |
+---------------------+
1 row in set (0.00 sec)

mysql> SELECT CRC32(NULL);
+-------------+
| CRC32(null) |
+-------------+
| NULL |
+-------------+
1 row in set (0.00 sec)
```