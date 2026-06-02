---
title: "SHA1()/SHA()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The SHA1()/SHA() function is an encrypted hash function that calculates and returns the SHA-1 hash value for a given string."
---
# SHA1()/SHA()

> The SHA1()/SHA() function is an encrypted hash function that calculates and returns the SHA-1 hash value for a given string.

## Function Description

The `SHA1()/SHA()` function is an encrypted hash function that calculates and returns the SHA-1 hash value for a given string. It converts an input message of any length into a fixed length (160 bits, or 20 bytes) hash value, typically expressed as 40 hexadecimal characters. Returns NULL if the argument is NULL.

## Function syntax

```
> SHA1/SHA(str)
```

## Parameter interpretation

| Parameters | Description |
| -------- | ------------ |
| str | Required parameters. String to encrypt |

## Examples

```SQL
mysql> select sha1("hello world");
+------------------------------------------+
| sha1(hello world)                        |
+------------------------------------------+
| 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed |
+------------------------------------------+
1 row in set (0.00 sec)

mysql> select sha("hello world");
+------------------------------------------+
| sha(hello world)                         |
+------------------------------------------+
| 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed |
+------------------------------------------+
1 row in set (0.00 sec)

mysql> select sha1(null);
+------------+
| sha1(null) |
+------------+
| NULL       |
+------------+
1 row in set (0.00 sec)
```
