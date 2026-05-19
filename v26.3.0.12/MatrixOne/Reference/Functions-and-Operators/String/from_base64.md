---
title: "FROM_BASE64()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "FROM_BASE64() is used to convert a Base64 encoded string back to raw binary data (or text data)."
---
# FROM\_BASE64()

> FROM_BASE64() is used to convert a Base64 encoded string back to raw binary data (or text data).

## Function Description

`FROM_BASE64()` is used to convert a Base64 encoded string back to raw binary data (or text data). Data that is Base64 encoded using the [`TO_BASE64()`](to_base64.md) function can be decoded. If the argument is NULL, the result is NULL.

## Function syntax

```
> FROM_BASE64(str)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| str | Required parameters. Base64 encoded string to convert. |

## Examples

```SQL
mysql> select from_base64('MjU1');
+-------------------+
| from_base64(MjU1) |
+-------------------+
| 255               |
+-------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64('abc'), FROM_BASE64(TO_BASE64('abc'));
+----------------+-----------------------------+
| to_base64(abc) | from_base64(to_base64(abc)) |
+----------------+-----------------------------+
| YWJj           | abc                         |
+----------------+-----------------------------+
1 row in set (0.00 sec)

mysql> select from_base64(null);
+-------------------+
| from_base64(null) |
+-------------------+
| NULL              |
+-------------------+
1 row in set (0.01 sec)
```