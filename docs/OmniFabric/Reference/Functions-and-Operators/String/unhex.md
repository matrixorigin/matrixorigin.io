# **UNHEX()**

## **Description**

For a string argument str, `UNHEX()` interprets each pair of characters in the argument as a hexadecimal number and converts it to the byte represented by the number. The return value is a binary string.

The characters in the argument string must be legal hexadecimal digits: '0' .. '9', 'A' .. 'F', 'a' .. 'f'. If the argument contains any nonhexadecimal digits, or is itself NULL, the result is NULL.

## **Syntax**

```
> UNHEX(str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. Legal hexadecimal string. |

## **Examples**

```SQL
mysql> SELECT UNHEX('4d6174726978204f726967696e');
+-----------------------------------+
| unhex(4d6174726978204f726967696e) |
+-----------------------------------+
| Matrix Origin                     |
+-----------------------------------+
1 row in set (0.00 sec)

mysql> select unhex(NULL);
+-------------+
| unhex(null) |
+-------------+
| NULL        |
+-------------+
1 row in set (0.00 sec)
```
