---
title: "Data Type Conversion"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "BOOLEAN → DECIMAL cast is not supported; other common conversions are supported"
mo_only: []
since: unknown
last_updated: 2026-05-21
llms_summary: "MatrixOne supports explicit CAST and implicit coercion between most data types; refer to the compatibility table for supported conversions."
---

## **Data Type Conversion**

MatrixOne supports the conversion between different data types, the supported and unsupported conversions are listed in the following table.

* **Castable**: explicit conversion with  `cast` function.
* **Coercible**: implicit conversion without `cast` function.

| Source Data Type             | Target Data Type | **Castable** | **Coercible** |
| ---------------------------- | ---------------- | ------------ | ------------- |
| BOOLEAN                      | INTEGER          | ✔            | ✔             |
|                              | DECIMAL          | ❌            | ❌             |
|                              | VARCHAR          | ✔            | ✔             |
| DATE                         | TIMESTAMP        | ✔            | ✔             |
|                              | DATETIME         | ✔            | ✔             |
|                              | VARCHAR          | ✔            | ✔             |
| DATETIME                     | TIMESTAMP        | ✔            | ✔             |
|                              | DATE             | ✔            | ✔             |
|                              | VARCHAR          | ✔            | ✔             |
| FLOAT(Floating-point number) | INTEGER          | ✔            | ✔             |
|                              | DECIMAL          | ✔            | ✔             |
|                              | VARCHAR          | ✔            | ✔             |
| INTEGER                      | BOOLEAN          | ✔            | ✔             |
|                              | FLOAT            | ✔            | ✔             |
|                              | TIMESTAMP        | ✔            | ✔             |
|                              | VARCHAR          | ✔            | ✔             |
|                              | DECIMAL          | ✔            | ✔             |
| TIMESTAMP                    | DATE             | ✔            | ✔             |
|                              | DATETIME         | ✔            | ✔             |
|                              | VARCHAR          | ✔            | ✔             |
| VARCHAR                      | BOOLEAN          | ✔            | ✔             |
|                              | DATE             | ✔            | ✔             |
|                              | FLOAT            | ✔            | ✔             |
|                              | INTEGER          | ✔            | ✔             |
|                              | DECIMAL          | ✔            | ✔             |
|                              | TIMESTAMP        | ✔            | ✔             |
|                              | DATETIME         | ✔            | ✔             |
