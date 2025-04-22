# **ENCODE()**

## **Function description**

The `ENCODE()` function is used to symmetrically encrypt a string. It encodes a string by combining a secret key, and the same key is required for decoding. Need to cooperate with [`DECODE()`](./decode.md) to decrypt.

## **Function syntax**

```
> ENCODE (str, pass_str);
```

## **Parameter explanation**

| Parameters     | Description |
| ---------------| ----------------------------------|
| str            | The raw string to encode.           |
| pass_str       | Password string (key) used for encryption.    |

## **Example**

```SQL
mysql> SELECT ENCODE('hello', 'mysecretkey');
+----------------------------+
| ENCODE(hello, mysecretkey) |
+----------------------------+
| ?;?                         |
+----------------------------+
1 row in set (0.00 sec)
```