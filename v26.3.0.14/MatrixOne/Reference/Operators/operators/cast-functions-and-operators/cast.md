---
title: "CAST"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "CAST('non-numeric' AS SIGNED) raises an error instead of returning 0 or NULL (MySQL 8.0 returns 0 with a warning)"
  - "CAST(datetime_typed_value AS CHAR) may fail in some cases (MySQL 8.0 supports it universally)"
mo_only: []
since: unknown
last_updated: 2026-05-21
llms_summary: "CAST() function for type conversion. Mostly MySQL-compatible; non-numeric strings cannot be cast to numeric types, and some DATETIME-to-CHAR casts may fail."
---
# **CAST**

## **Description**

The CAST() function converts a value (of any type) into the specified datatype.

## **Syntax**

```
> CAST(value AS datatype)

```

## **Parameter Values**

|  Parameter   | Description  |
|  ----  | ----  |
| value  | Required. The value to convert |
| datatype  | Required. The datatype to convert to |

Currently, `cast` can support following conversion:

* Conversion between numeric types, mainly including SIGNED, UNSIGNED, FLOAT, and DOUBLE type.
* Numeric types to character CHAR type.
* Numeric character types to numerical types(negative into SIGNED).
* Time type (including Date, Datetime, Timestamp, and Time) is converted to INT type, with decimal point rounding
* Time types (including Date, Datetime, Timestamp, and Time) are converted to fixed-point types with decimal places

 A detailed data type conversion rule can be refered to [Data Conversion Rule](../../../Data-Types/data-type-conversion.md).

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
CREATE TABLE t1 (a int,b float,c char(1),d varchar(15));
INSERT INTO t1 VALUES (1,1.5,'1','-2');

mysql> SELECT CAST(a AS FLOAT) a_cast,CAST(b AS UNSIGNED) b_cast,CAST(c AS SIGNED) c_cast, CAST(d AS SIGNED) d_cast from t1;
+--------+--------+--------+--------+
| a_cast | b_cast | c_cast | d_cast |
+--------+--------+--------+--------+
| 1.0000 |      1 |      1 |     -2 |
+--------+--------+--------+--------+

mysql> SELECT CAST(a AS CHAR) a_cast, CAST(b AS CHAR) b_cast,CAST(c AS DOUBLE) c_cast, CAST(d AS FLOAT) d_cast from t1;
+--------+--------+--------+---------+
| a_cast | b_cast | c_cast | d_cast  |
+--------+--------+--------+---------+
| 1      | 1.5    | 1.0000 | -2.0000 |
+--------+--------+--------+---------+
```

## **Constraints**

* Non-numeric character types cannot be converted to numeric types.
* Casting a DATETIME type value to CHAR may fail in some cases (CAST(NOW() AS CHAR) works but CAST(a_datetime_column AS CHAR) may not).
