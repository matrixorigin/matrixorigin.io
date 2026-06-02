---
title: "JSON Arrow Operators -> and ->>"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "The JSON arrow operators -> and ->> are shorthand for extracting values from a JSON document by path."
---

# **JSON Arrow Operators `->` and `->>`**

> The JSON arrow operators -> and ->> are shorthand for extracting values from a JSON document by path.

## **Description**

The JSON arrow operators `->` and `->>` are shorthand for extracting values from a JSON document by path. Both operators are rewritten by the parser to equivalent calls of the existing JSON functions; they produce the same result type and behavior as the underlying function call.

| Operator | Rewrites to | Returns |
| ---- | ---- | ---- |
| `json_col -> 'json_path'` | [`json_extract`](json_extract.md)`(json_col, 'json_path')` | A JSON value (may be a JSON scalar, object, or array). |
| `json_col ->> 'json_path'` | [`json_unquote`](json_unquote.md)`(`[`json_extract`](json_extract.md)`(json_col, 'json_path'))` | A `VARCHAR` string with any surrounding JSON quotes stripped. |

Because the rewrite happens at parse time, the operators are drop-in replacements for the function calls. The same path-expression rules as `JSON_EXTRACT()` apply: paths must start with `$`, dot-notation accesses object members, `[N]` indexes arrays, and `*` / `**` wildcards are supported.

Use `->` when the caller wants the extracted value as a JSON value (for example, to pass it to another JSON function). Use `->>` when the caller wants the unquoted string form (for example, to compare against a plain string literal).

## **Syntax**

```
> json_col ->  'json_path'
> json_col ->> 'json_path'
```

## **Arguments**

| Arguments | Description |
| ---- | ---- |
| json_col | Required. A JSON column or expression that produces JSON. |
| json_path | Required. A string literal containing a JSON path expression. See [`JSON_EXTRACT()`](json_extract.md) for the full path syntax. |

## **Examples**

```sql
DROP DATABASE IF EXISTS json_arrow_demo;
CREATE DATABASE json_arrow_demo;
USE json_arrow_demo;

CREATE TABLE t1 (id INT, payload JSON);
INSERT INTO t1 VALUES
  (1, '{"name": "Alice",   "age": 30, "tags": ["admin", "dev"]}'),
  (2, '{"name": "Bob",     "age": 25, "tags": ["dev"]}'),
  (3, '{"name": "Charlie", "age": 40, "tags": []}');

-- `->` returns the extracted value (still JSON); the string "Alice" is quoted.
SELECT id, payload -> '$.name' AS name_json FROM t1 ORDER BY id;

-- `->>` unquotes the result so it comes back as a bare VARCHAR.
SELECT id, payload ->> '$.name' AS name_str FROM t1 ORDER BY id;

-- Chained access into a nested array member.
SELECT id, payload ->> '$.tags[0]' AS primary_tag FROM t1 ORDER BY id;

-- The arrow form is equivalent to the function call form.
SELECT id,
       payload -> '$.age'                AS via_arrow,
       JSON_EXTRACT(payload, '$.age')    AS via_func
FROM t1 ORDER BY id;

DROP TABLE t1;
DROP DATABASE json_arrow_demo;
```

## **See also**

- [`JSON_EXTRACT()`](json_extract.md)
- [`JSON_UNQUOTE()`](json_unquote.md)
