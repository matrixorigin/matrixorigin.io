---
title: "BIN()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This function BIN() returns a string representation of the binary value of *N*, where *N* is a longlong (BIGINT) number."
---
# **BIN()**

> This function BIN() returns a string representation of the binary value of *N*, where *N* is a longlong (BIGINT) number.

## **Description**

This function ``BIN()`` returns a string representation of the binary value of *N*, where *N* is a ``longlong (BIGINT)`` number. Returns ``NULL`` if *N* is *NULL*.

## **Syntax**

```
> BIN(N)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| N | Required. UINT Type |

## **Examples**

```SQL
> SELECT bin(1314);
+-------------+
| bin(1314)   |
+-------------+
| 10100100010 |
+-------------+
1 row in set (0.01 sec)

> select bin(2e5);
+--------------------+
| bin(2e5)           |
+--------------------+
| 110000110101000000 |
+--------------------+
1 row in set (0.00 sec)
```

<!--end-->
