---
title: "JQ()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "MatrixOne integration of the jq JSON query language; no MySQL equivalent."
since: unknown
last_updated: 2026-05-08
llms_summary: "The JQ() function is used to parse and transform JSON data based on jq expressions."
---
# **JQ()**

> The JQ() function is used to parse and transform JSON data based on jq expressions.

## **Function description**

The `JQ()` function is used to parse and transform JSON data based on jq expressions. Different from [`TRY_JQ()`](./try_jq.md), `TRY_JQ()` supports returning null value when an error occurs, while `JQ()` directly throws an exception when encountering an error.

## **Grammar structure**

```sql
select jq(jsonDoc, pathExpression);
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| jsonDoc | This is a column or expression containing JSON data. |
| pathExpression | Used to specify how to extract fields from JSON data |

## **Example**

<!-- validator-ignore-exec -->
```sql
mysql> select jq('{"foo": 128}', '.foo');
+------------------------+
| jq({"foo": 128}, .foo) |
+------------------------+
| 128                    |
+------------------------+
1 row in set (0.01 sec)

mysql> select jq(null, '.foo');
+----------------+
| jq(null, .foo) |
+----------------+
| NULL           |
+----------------+
1 row in set (0.00 sec)

mysql> select jq('{"id": "sample", "10": {"b": 42}}', '{(.id): .["10"].b}');
+-----------------------------------------------------------+
| jq({"id": "sample", "10": {"b": 42}}, {(.id): .["10"].b}) |
+-----------------------------------------------------------+
| {"sample":42}                                             |
+-----------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select jq('[1, 2, 3]', '.foo & .bar');
ERROR 1105 (HY000): unexpected token "&"
```