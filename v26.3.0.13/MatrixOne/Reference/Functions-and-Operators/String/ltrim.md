---
title: "LTRIM()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "This function LTRIM() returns the string with leading space characters removed."
---
# **LTRIM()**

> This function LTRIM() returns the string with leading space characters removed.

## **Description**

This function LTRIM() returns the string with leading space characters removed.

## **Syntax**

```
> LTRIM(str)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| str | Required.  CHAR and VARCHAR both are supported.|

## **Examples**

```sql
> drop table if exists t1;
> create table t1(a char(8),b varchar(10));
> insert into t1 values('  matrix',' matrixone');
> select ltrim(a),ltrim(b) from t1;

+----------+-----------+
| ltrim(a) | ltrim(b)  |
+----------+-----------+
| matrix   | matrixone |
+----------+-----------+
```
