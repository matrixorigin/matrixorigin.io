---
title: "LOG()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "LOG(X) returns the natural logarithm of X."
---
# **LOG()**

> LOG(X) returns the natural logarithm of X.

## **Description**

LOG(X) returns the natural logarithm of X.

## **Syntax**

```
> LOG(X)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| X | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a float, b float);
insert into t1 values(2,8);

mysql> select log(a), log(b) from t1;
+--------------------+--------------------+
| log(a)             | log(b)             |
+--------------------+--------------------+
| 0.6931471805599453 | 2.0794415416798357 |
+--------------------+--------------------+
1 row in set (0.00 sec)
```

## **Constraints**

LOG(X) only support one parameter input for now.
