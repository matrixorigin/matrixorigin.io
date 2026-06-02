---
title: "CONCAT()"
doc_type: reference
mysql_compat: partial
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This function CONCAT() returns the string that results from concatenating the arguments."
---
# **CONCAT()**

> This function CONCAT() returns the string that results from concatenating the arguments.

## **Description**

This function `CONCAT()` returns the string that results from concatenating the arguments. May have one or more arguments. If all arguments are nonbinary strings, the result is a nonbinary string. If the arguments include any binary strings, the result is a binary string.

`CONCAT()` returns `NULL` if any argument is `NULL`.

## **Syntax**

```
>
CONCAT(str1,str2,...)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str1,str2,... | Required. The str to add together. <br>Note: If any of the strs is a NULL value, it returns NULL. |

## **Examples**

```SQL
mysql> SELECT CONCAT('My', 'S', 'QL');
+-------------------+
| concat(My, S, QL) |
+-------------------+
| MySQL             |
+-------------------+
1 row in set (0.01 sec)

mysql> SELECT CONCAT('My', NULL, 'QL');
+----------------------+
| concat(My, null, QL) |
+----------------------+
| NULL                 |
+----------------------+
1 row in set (0.00 sec)
```
