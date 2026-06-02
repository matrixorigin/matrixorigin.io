---
title: "ACOS()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The ACOS() function returns the arccosine(given in radians) of the input number."
---
# **ACOS()**

> The ACOS() function returns the arccosine(given in radians) of the input number.

## **Description**

The ACOS() function returns the arccosine(given in radians) of the input number.

## **Syntax**

```
> ACOS(number)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| number | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a float,b int);
insert into t1 values(0.5,1);
insert into t1 values(-0.5,-1);

mysql> select acos(a),acos(b) from t1;
+--------------------+-------------------+
| acos(a)            | acos(b)           |
+--------------------+-------------------+
| 1.0471975511965976 |                 0 |
| 2.0943951023931957 | 3.141592653589793 |
+--------------------+-------------------+
2 rows in set (0.01 sec)
```
