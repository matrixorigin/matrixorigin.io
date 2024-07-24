# TO\_BASE64()

## Function Description

The `TO_BASE64()` function is used to convert a string to a Base64 encoded string. If the argument is not a string, it is converted to a string before conversion. If the argument is NULL, the result is NULL.

You can decode a Base64 encoded string using the [`FROM_BASE64()`](from_base64.md) function.

## Function syntax

```
> TO_BASE64(str)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| str | Required parameters. To convert to a Base64 encoded string |

## Examples

```SQL
mysql> SELECT TO_BASE64('abc');
+----------------+
| to_base64(abc) |
+----------------+
| YWJj           |
+----------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64(255);
+----------------+
| to_base64(255) |
+----------------+
| MjU1           |
+----------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64(null);
+-----------------+
| to_base64(null) |
+-----------------+
| NULL            |
+-----------------+
1 row in set (0.01 sec)
```