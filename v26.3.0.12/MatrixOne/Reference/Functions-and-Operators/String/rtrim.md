---
title: "RTRIM()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This function RTRIM() returns the string with trailing space characters removed."
---
# **RTRIM()**

> This function RTRIM() returns the string with trailing space characters removed.

## **Description**

This function RTRIM() returns the string with trailing space characters removed.

## **Syntax**

```
> RTRIM(str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required.  CHAR and VARCHAR both are supported.|

## **Examples**

```sql
> drop table if exists t1;
> create table t1(a char(8),b varchar(10));
> insert into t1 values('matrix  ','matrixone ');
> select rtrim(a),rtrim(b) from t1;

+----------+-----------+
| rtrim(a) | rtrim(b)  |
+----------+-----------+
| matrix   | matrixone |
+----------+-----------+
```
