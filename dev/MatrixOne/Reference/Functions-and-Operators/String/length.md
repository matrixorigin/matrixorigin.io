---
title: "LENGTH()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The length() function returns the length of the string."
---
# **LENGTH()**

> The length() function returns the length of the string.

## **Description**

The length() function returns the length of the string.  

## **Syntax**

```
> LENGTH(str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required. String you want to calculate. |

## **Examples**

```sql
select a,length(a) from t1;
```

```
a	length(a)
a       1
ab      2
abc     3
```
