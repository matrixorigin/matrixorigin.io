---
title: "UPPER()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "UPPER() is used to convert a given string to uppercase."
---
# **UPPER()**

> UPPER() is used to convert a given string to uppercase.

## **Function Description**

`UPPER()` is used to convert a given string to uppercase.

## **Function syntax**

```
> UPPER(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

```sql
mysql> select upper('hello');
+--------------+
| upper(hello) |
+--------------+
| HELLO        |
+--------------+
1 row in set (0.03 sec)

mysql> select upper('a'),upper('b'),upper('c');
+----------+----------+----------+
| upper(a) | upper(b) | upper(c) |
+----------+----------+----------+
| A        | B        | C        |
+----------+----------+----------+
1 row in set (0.03 sec)
```
