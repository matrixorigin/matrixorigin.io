---
title: "UUID()"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "UUID() generates UUIDv7 instead of MySQL UUIDv1"
  - "UUID() returns native UUID, not a character type"
mo_only:
  - "UUID(datetime) deterministic timestamp boundary"
since: unknown
last_updated: 2026-10-09
llms_summary: "Returns a native UUIDv7 value; use UUID_V1() for version 1 and CAST(... AS CHAR) for string semantics."
---
# **UUID()**

> Returns a native UUID version 7 value, displayed in canonical 36-character form.

## **Description**

`UUID()` and `UUID_V7()` generate UUIDv7 values according to [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html). MatrixOne stores the value as a native 16-byte `UUID`; SQL clients display it as `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee`.

UUIDv7 places the Unix timestamp in milliseconds before random bits, which supports time-ordered keys. Generated identifiers are intended to be unique, but do not use them as secrets or authorization tokens.

### MySQL compatibility

MySQL's `UUID()` generates version 1 and returns a character string. MatrixOne intentionally keeps version 7 and its native UUID type. Use `UUID_V1()` when a version 1 identifier is required, and `CAST(UUID_V1() AS CHAR)` when both version 1 and character expression semantics are required.

A plain `CREATE TABLE ... AS SELECT UUID()` creates a native UUID column. Native UUID comparisons parse text operands as UUID values: `UUID() IN ('fallback')` is an invalid UUID comparison. For arbitrary text comparisons, cast explicitly, for example `CAST(UUID() AS CHAR) IN ('fallback')`.

`UUID_TO_BIN(value)` preserves UUID byte order. The optional swap flag applies the same byte permutation for every UUID version; use the default or `0` for UUIDv7. Matching flags are required when decoding with `BIN_TO_UUID`.

`UUID(datetime)` and `UUID_V7(datetime)` produce a deterministic minimum UUID for the supplied timestamp, suitable as a range boundary. These forms do not generate fresh unique identifiers.

UUID is both a data type and a function. For more information on UUID data types, see [UUID Type](../../Data-Types/uuid-type.md).

## **Syntax**

```
> UUID()
> UUID(datetime)
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
create table t1(a INT,  b float);
insert into t1 values(12124, -4213.413), (12124, -42413.409);

mysql> SELECT length(uuid()) FROM t1;
+----------------+
| length(uuid()) |
+----------------+
|             36 |
|             36 |
+----------------+
2 rows in set (0.00 sec)

mysql> SELECT UUID();
+--------------------------------------+
| uuid()                               |
+--------------------------------------+
| 018f0000-0000-7000-8000-000000000001 |
+--------------------------------------+
1 row in set (0.00 sec)
```

## **Constraints**

MySQL's `UUID()` takes no arguments. MatrixOne additionally supports the deterministic datetime boundary form described above.
