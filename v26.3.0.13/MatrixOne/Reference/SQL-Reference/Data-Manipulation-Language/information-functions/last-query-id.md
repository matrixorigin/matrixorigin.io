---
title: "LAST_QUERY_ID"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "LAST_QUERY_ID()"
since: unknown
last_updated: 2026-05-08
llms_summary: "Returns the ID of a specified query in the current session."
---
# **LAST_QUERY_ID**

> Returns the ID of a specified query in the current session.

## **Description**

Returns the ID of a specified query in the current session. If no query is specified, the most recently-executed query is returned.

## **Syntax**

```
LAST_QUERY_ID( [ <num> ] )
```

### Arguments

**num**: Specifies the query to return, based on the position of the query (within the session).

Default: -1

### Usage Notes

Positive numbers start with the first query executed in the session. For example:

- LAST_QUERY_ID(1) returns the first query.

- LAST_QUERY_ID(2) returns the second query.

- LAST_QUERY_ID(6) returns the sixth query.

Negative numbers start with the most recently-executed query in the session. For example:

- LAST_QUERY_ID(-1) returns the most recently-executed query (equivalent to LAST_QUERY_ID()).

- LAST_QUERY_ID(-2) returns the second most recently-executed query.

## **Examples**

<!-- validator-ignore-exec -->
```sql
mysql> SELECT LAST_QUERY_ID(-1);
+--------------------------------------+
| last_query_id(-1)                    |
+--------------------------------------+
| af974680-b1b5-11ed-8eb9-5ad2460dea4f |
+--------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT LAST_QUERY_ID();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| 550e4d44-b1b5-11ed-8eb9-5ad2460dea4f |
+--------------------------------------+
1 row in set (0.00 sec)
```
