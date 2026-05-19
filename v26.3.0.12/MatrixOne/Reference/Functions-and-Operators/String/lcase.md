---
title: "LCASE()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "LCASE() is used to convert a given string to lowercase, a synonym for LOWER()."
---
# **LCASE()**

> LCASE() is used to convert a given string to lowercase, a synonym for LOWER().

## **Function Description**

`LCASE()` is used to convert a given string to lowercase, a synonym for [`LOWER()`](lower.md).

## **Function syntax**

```
> LCASE(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> select lcase('HELLO');
+--------------+
| lcase(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lcase('A'),lcase('B'),lcase('C');
+----------+----------+----------+
| lcase(A) | lcaser(B) | lcase(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```
