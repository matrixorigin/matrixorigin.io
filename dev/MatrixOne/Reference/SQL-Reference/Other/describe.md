---
title: "DESCRIBE / DESC"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "DESCRIBE/DESC output includes an extra `Comment` column (7 columns total vs MySQL's 6)."
  - "Type names are displayed in uppercase with display widths (e.g., `INT(32)`, `FLOAT(0)`, `TIMESTAMP(0)`) instead of MySQL's lowercase without widths (e.g., `int`, `float`, `timestamp`)."
  - "Column name filter (`DESC tbl_name col_name`) is non-functional; all columns are returned."
  - "Wild pattern (`DESC tbl_name 'pattern'`) not supported; produces syntax error."
  - "For TIMESTAMP columns with DEFAULT CURRENT_TIMESTAMP, MO does not show `DEFAULT_GENERATED` in the Extra column as MySQL does."
mo_only: []
since: unknown
last_updated: 2026-05-20
llms_summary: "DESCRIBE and DESC provide information about columns in a table."
---
# **DESCRIBE / DESC**

> DESCRIBE and DESC provide information about columns in a table.

## **Description**

The `DESCRIBE` statement provides information about the columns in a table. `DESC` is a synonym for `DESCRIBE`. In MatrixOne, the output includes a 7th column `Comment` (which MySQL does not have), and type names are displayed in uppercase with display widths (e.g., `INT(32)`, `FLOAT(0)`) instead of MySQL's lowercase format without widths (e.g., `int`, `float`).

## **Syntax**

```
{DESCRIBE | DESC} tbl_name [col_name | wild]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
create table t1(
    col1 int comment 'First column',
    col2 float,
    col3 varchar(100)
);

> desc t1;
+-------+--------------+------+------+---------+-------+---------------+
| Field | Type         | Null | Key  | Default | Extra | Comment       |
+-------+--------------+------+------+---------+-------+---------------+
| col1  | INT(32)      | YES  |      | NULL    |       | First column  |
| col2  | FLOAT(0)     | YES  |      | NULL    |       |               |
| col3  | VARCHAR(100) | YES  |      | NULL    |       |               |
+-------+--------------+------+------+---------+-------+---------------+
3 rows in set (0.00 sec)

!!! note
    Column name filtering (e.g., `DESC t1 col1`) is not supported in MatrixOne; specifying a column name still returns all columns.

> desc t1 col1;
+-------+--------------+------+------+---------+-------+---------------+
| Field | Type         | Null | Key  | Default | Extra | Comment       |
+-------+--------------+------+------+---------+-------+---------------+
| col1  | INT(32)      | YES  |      | NULL    |       | First column  |
| col2  | FLOAT(0)     | YES  |      | NULL    |       |               |
| col3  | VARCHAR(100) | YES  |      | NULL    |       |               |
+-------+--------------+------+------+---------+-------+---------------+
3 rows in set (0.00 sec)
```
