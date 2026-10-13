---
title: "Data type fidelity across ecosystem tools"
doc_type: guide
description: "Preserve values across SQL drivers, DataFrames and file formats with explicit type mappings and acceptance checks."
---

# Data type fidelity across ecosystem tools

A successful connection or matching row count does not establish that an ETL pipeline preserves values. Check the source value, connector metadata, intermediate representation and destination value separately. A mapping that preserves a decimal as text is useful, but it does not provide native decimal arithmetic in the intermediate engine.

## Define the value contract

Record the MatrixOne version or commit, source version, driver and tool versions, SQL mode, session time zone, input schema and destination schema. State whether the pipeline uses default inference or explicit mappings. Qualify read and write directions independently.

For each field, choose an acceptance rule before loading data: exact integer or decimal value, identical binary bytes, temporal value and precision, or documented floating-point tolerance. State any normalization of JSON, SET members or CHAR trailing spaces. Keep both the original value and its normalized representation so a comparison does not hide a conversion.

## Choose explicit mappings

| SQL value | Intermediate representation | Acceptance rule |
|---|---|---|
| DECIMAL with precision above 38 | A decimal type supporting the declared precision, or an explicit decimal text column | Preserve sign, declared scale and every significant digit. Converting through float64 is insufficient. |
| BIGINT UNSIGNED | uint64, a sufficiently wide decimal, or exact integer text | Include `18446744073709551615` and values above `9007199254740992`. A signed int64 or float64 is insufficient. |
| BIT(64) | uint64, bytes with a declared byte order, or exact decimal text | Check high bits and the all-ones value; preserve NULL separately. |
| FLOAT and DOUBLE | float32 and float64 respectively | Record the chosen tolerance. Six significant digits for FLOAT are a semantic check, not a bitwise guarantee. |
| BINARY, VARBINARY and BLOB | Bytes or HEX with explicit decoding | Compare byte lengths and bytes, including `00`, `80` and `FF`. Do not decode arbitrary bytes as UTF-8. |
| TIME with negative values or values above 24 hours | Signed duration in integer microseconds or exact SQL time text | Preserve sign and fractional seconds. A time-of-day object cannot represent the full SQL duration domain. |
| DATE and DATETIME | A representation supporting the input range and precision | Test boundary years and microseconds; do not assume a DataFrame timestamp supports every SQL date. |
| TIMESTAMP | Timestamp with an explicit time-zone contract | Record source and sink session time zones and UTC conversion. A DATETIME check does not qualify TIMESTAMP behavior. |
| CHAR | Text with an explicit trailing-space policy | Preserve the original bytes if spaces matter; SQL comparison semantics may differ from byte equality. |
| ENUM and SET | Explicit member text or an agreed representation | Distinguish NULL, empty string and empty set. Record SET member ordering and enum-domain enforcement. |
| JSON | JSON document or exact document text | Distinguish SQL NULL, JSON `null`, empty string and the string `"null"`; declare whether object-key order matters. |
| UUID | Native UUID or validated UUID text | A test using CHAR(36) does not qualify the MatrixOne UUID type or driver UUID inference. |
| Unicode text | UTF-8 text with a declared normalization policy | Include non-ASCII text, emoji, quotes, delimiters and newlines. |

See [DECIMAL](../../Reference/Data-Types/fixed-point-types.md), [JSON](../../Reference/Data-Types/json-type.md), [SET](../../Reference/Data-Types/set-type.md) and [UUID](../../Reference/Data-Types/uuid-type.md) for SQL type behavior. Limits depend on the server release and on every intermediate engine.

### Exact decimal values

For a server supporting DECIMAL256, use an exact text input and inspect the returned decimal without converting it to a binary float:

```sql
SELECT CAST('9007199254740993.123456789012345678901234567890' AS DECIMAL(65,30)) AS exact_value;
```

The result must preserve the input value and 30 fractional digits. If a Python adapter uses `decimal.Decimal`, set a sufficient decimal context in each worker before transformations; a context adequate for ordinary monetary values may round a 65-digit value.

### Unsigned integer values

```sql
SELECT CAST('18446744073709551615' AS UNSIGNED) AS unsigned_value;
```

The result must remain the exact integer. Inspect both the driver value and the reflected column type before constructing a DataFrame or cloning a table definition. An explicit CAST-to-text read can preserve the value while leaving default metadata inference unqualified.

### Binary values

```sql
SELECT HEX(UNHEX('0000FF80')) AS binary_hex;
```

The expected result is `0000FF80`. HEX is an explicit transport encoding; decode it back to bytes before comparing the destination.

### SQL durations

```sql
SELECT CAST('-37:00:00.000001' AS TIME(6)) AS negative_duration;
```

The result represents minus 37 hours and one microsecond. When using integer microseconds, calculate the signed duration rather than taking only the positive seconds component of a language duration object.

### JSON null and invalid empty text

```sql
SELECT JSON_VALID('null') AS valid_json_null, JSON_VALID('') AS valid_empty_document;
```

The expected flags are `1` and `0`. JSON `null` is a valid document. Preserve SQL NULL separately, and test the connector's CSV/JSONLines null markers rather than assuming an empty field has the same meaning.

## Check values after loading

1. Keep a deterministic source dataset with stable keys and boundary values.
2. Read through the actual tool API and record its types, NULL handling and any explicit conversion.
3. Write through the intended sink, then read the destination through a fresh connection.
4. Compare the key set, row multiplicity and all field values. Use counts and hashes only after defining a deterministic ordering and typed encoding.
5. Repeat after batching, parallel partitions, retry and schema changes. Preserve failed inputs and intermediate files for diagnosis.

Validate malformed input as well as valid input: an incomplete final JSONLines record, decimal overflow, invalid enum member or out-of-range time should produce a documented result. A successful job must not silently omit records.

## Separate component failures from server failures

Run a minimal SQL probe and a MySQL control with the same logical values where the type domains overlap. Reproduce a file-format or Arrow transformation failure without SQL when possible. Preserve the original error before trying an adapter.

Historical compatibility reports include [Arrow/Parquet mapping profiles](https://github.com/matrixorigin/matrixone/issues/29845), [UInt64 metadata](https://github.com/matrixorigin/matrixone/issues/29846), [empty ENUM/SET file loading](https://github.com/matrixorigin/matrixone/issues/29840) and [decimal parsing](https://github.com/matrixorigin/matrixone/issues/29841). Check affected versions and fix availability; an issue link is not a statement that every current release has the problem.
