---
title: "BIT_LENGTH()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "Returns the length of the string str in bits."
---
# **BIT_LENGTH()**

> Returns the length of the string str in bits.

## **Description**

Returns the length of the string str in bits. Returns `NULL` if str is `NULL`.

## **Syntax**

```
> BIT_LENGTH(str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. String you want to calculate. |

## **Examples**

```SQL
> SELECT BIT_LENGTH('text');
+------------------+
| bit_length(text) |
+------------------+
|               32 |
+------------------+
1 row in set (0.00 sec)
```
