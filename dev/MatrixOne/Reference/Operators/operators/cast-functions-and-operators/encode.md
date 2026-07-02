---
title: "ENCODE()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "ENCODE() was deprecated in MySQL 5.7 and removed in MySQL 8.0; MatrixOne continues to support it"
since: unknown
last_updated: 2026-05-21
llms_summary: "ENCODE() encryption function. Deprecated in MySQL 5.7, removed in MySQL 8.0, still available in MatrixOne."
---

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

<!-- validator-ignore-exec -->
```SQL
mysql> SELECT ENCODE('hello', 'mysecretkey');
+----------------------------+
| ENCODE(hello, mysecretkey) |
+----------------------------+
| ?;?                         |
+----------------------------+
1 row in set (0.00 sec)
```