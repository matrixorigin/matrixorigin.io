---
title: "SERIAL()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "SERIAL() is a MO-specific serialization function with no MySQL 8.0 counterpart"
since: unknown
last_updated: 2026-05-21
llms_summary: "MatrixOne-specific SERIAL() serialization function. No MySQL 8.0 equivalent."
---

# SERIAL()

## Function Description

The `SERIAL()` function is used to serialize a concatenation string, combining single or multiple columns/values into a binary format with a return type of `VARCHAR`. It is similar to [`CONCAT()`](../../../Functions-and-Operators/String/concat.md), but type information for values cannot be captured in `CONCAT()`. Typically used with the [`SERIAL_EXTRACT()`](../../../Functions-and-Operators/Other/serial_extract.md) function.

Returns NULL if any of the parameters in `SERIAL()` is NULL. To handle NULL values, use [`SERIAL_FULL()`](serial_full.md).

## Function syntax

```
> SERIAL(para)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| para | Column/Value to Serialize|

## Examples

<!-- validator-ignore-exec -->
```sql
create table t1(a varchar(3), b int);
insert into t1 values("ABC",1);
insert into t1 values("DEF",NULL);

mysql> select serial(a,b) from t1; -- The query returns the serialized result of the combination of columns a and b. The output is NULL when there is a NULL value.
+--------------+
| serial(a, b) |
+--------------+
| FABC :    |
| NULL         |
+--------------+
2 rows in set (0.00 sec)

mysql> select serial(a,'hello') from t1; -- The query returns the result of serializing the combination of column a and the value hello.
+------------------+
| serial(a, hello) |
+------------------+
| FABC Fhello    |
| FDEF Fhello    |
+------------------+
2 rows in set (0.00 sec)
```
