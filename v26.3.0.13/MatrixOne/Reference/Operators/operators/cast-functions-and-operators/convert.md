---
title: "CONVERT"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "CONVERT('non-numeric', SIGNED) raises an error instead of returning 0 or NULL"
  - "CONVERT(datetime_typed_value, CHAR) may fail in some cases (MySQL 8.0 supports it universally)"
mo_only: []
since: unknown
last_updated: 2026-05-21
llms_summary: "CONVERT() function for type conversion. Same limitations as CAST: non-numeric strings cannot be converted to numeric types, and some DATETIME-to-CHAR conversions may fail."
---
# **CONVERT**

## **Description**

The `CONVERT()` function converts a value into the specified datatype or character set.

## **Syntax**

```
> CONVERT(value, type)

```

Or:

```
> CONVERT(value USING charset)
```

## **Parameter Values**

|  Parameter   | Description  |
|  ----  | ----  |
| value  | Required. The value to convert. |
| datatype  | Required. The datatype to convert to. |
| charset |	Required. The character set to convert to. |

Currently, `convert` can support following conversion:

* Conversion between numeric types, mainly including SIGNED, UNSIGNED, FLOAT, and DOUBLE type.
* Numeric types to character CHAR type.
* Numeric character types to numerical types(negative into SIGNED).

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> select convert(150,char(5));
+-------------------+
| cast(150 as char) |
+-------------------+
| 150               |
+-------------------+
1 row in set (0.01 sec)
```

```sql
CREATE TABLE t1(a tinyint);
INSERT INTO t1 VALUES (127);

mysql> SELECT 1 FROM
  -> (SELECT CONVERT(t2.a USING UTF8) FROM t1, t1 t2 LIMIT 1) AS s LIMIT 1;
+------+
| 1    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

## **Constraints**

* Non-numeric character types cannot be converted to numeric types.
* Converting a DATETIME type value to CHAR may fail in some cases (CONVERT(NOW(), CHAR) works but CONVERT(a_datetime_column, CHAR) may not).
