---
title: "DEALLOCATE PREPARE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "DEALLOCATE PREPARE on a non-existent statement silently succeeds; MySQL returns ERROR 1243 (Unknown prepared statement handler)."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "To deallocate a prepared statement produced with PREPARE, use a DEALLOCATE PREPARE statement that refers to the prepared statement name."
---
# **DEALLOCATE PREPARE**

> To deallocate a prepared statement produced with PREPARE, use a DEALLOCATE PREPARE statement that refers to the prepared statement name.

## **Description**

To deallocate a prepared statement produced with PREPARE, use a `DEALLOCATE PREPARE` statement that refers to the prepared statement name.

!!! note
    In MatrixOne, `DEALLOCATE PREPARE` on a non-existent statement name silently succeeds. MySQL returns `ERROR 1243 (Unknown prepared statement handler)` in this case.

Attempting to execute a prepared statement after deallocating it results in an error. If too many prepared statements are created and not deallocated by either the DEALLOCATE PREPARE statement or the end of the session, you might encounter the upper limit enforced by the max_prepared_stmt_count system variable.

## **Syntax**

```
{DEALLOCATE | DROP} PREPARE stmt_name
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
|stmt_name | The name of the prepared statement. |

## **Examples**

```sql
> CREATE TABLE numbers(pk INTEGER PRIMARY KEY, ui BIGINT UNSIGNED, si BIGINT);
> INSERT INTO numbers VALUES (0, 0, -9223372036854775808), (1, 18446744073709551615, 9223372036854775807);
> SET @si_min = -9223372036854775808;
> SET @si_max = 9223372036854775807;
> PREPARE s2 FROM 'SELECT * FROM numbers WHERE si=?';
Query OK, 0 rows affected (0.00 sec)

> EXECUTE s2 USING @si_min;
+------+------+----------------------+
| pk   | ui   | si                   |
+------+------+----------------------+
|    0 |    0 | -9223372036854775808 |
+------+------+----------------------+
1 row in set (0.01 sec)

> EXECUTE s2 USING @si_max;
+------+----------------------+---------------------+
| pk   | ui                   | si                  |
+------+----------------------+---------------------+
|    1 | 18446744073709551615 | 9223372036854775807 |
+------+----------------------+---------------------+
1 row in set (0.01 sec)

> DEALLOCATE PREPARE s2;
Query OK, 0 rows affected (0.00 sec)
```
