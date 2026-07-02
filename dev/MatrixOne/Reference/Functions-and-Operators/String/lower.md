---
title: "LOWER()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "LOWER() Converts the given string to lowercase."
---
# **LOWER()**

> LOWER() Converts the given string to lowercase.

## **Function Description**

`LOWER()` Converts the given string to lowercase.

## **Function syntax**

```
> LOWER(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

```sql
mysql> select lower('HELLO');
+--------------+
| lower(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lower('A'),lower('B'),lower('C');
+----------+----------+----------+
| lower(A) | lower(B) | lower(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```