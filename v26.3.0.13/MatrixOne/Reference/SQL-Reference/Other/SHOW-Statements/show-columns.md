---
title: "SHOW COLUMNS"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MO SHOW COLUMNS (without FULL) already includes the `Comment` column; MySQL only shows Comment with FULL"
  - "MO SHOW FULL COLUMNS returns Collation and Privileges columns but Collation is always NULL"
  - "MO accepts EXTENDED keyword (SHOW EXTENDED COLUMNS) and FIELDS synonym (SHOW FIELDS), both returning same columns as SHOW COLUMNS"
  - "MO Type column includes display width (e.g. INT(32)) while MySQL shows just int"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "SHOW COLUMNS displays information about the columns in a given table."
---
# **SHOW COLUMNS**

> SHOW COLUMNS displays information about the columns in a given table.

## **Description**

`SHOW COLUMNS` displays information about the columns in a given table.

In MatrixOne, the `Comment` column is always included in the output, even without the `FULL` keyword. (In MySQL, `Comment` is only shown with `FULL`.) MatrixOne also supports `SHOW EXTENDED COLUMNS` and the `SHOW FIELDS` synonym, both of which return the same columns as `SHOW COLUMNS`.

## **Syntax**

```
> SHOW [FULL] {COLUMNS}
    {FROM | IN} tbl_name
    [{FROM | IN} db_name]
    [LIKE 'pattern' | WHERE expr]
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
create table t1(
col1 int comment 'First column',
col2 float comment '"%$^&*()_+@!',
col3 varchar comment 'ZD5lTndyuEzw49gxR',
col4 bool comment ''
);
mysql> show columns from t1;
+-------+----------------+------+------+---------+-------+-------------------+
| Field | Type           | Null | Key  | Default | Extra | Comment           |
+-------+----------------+------+------+---------+-------+-------------------+
| col1  | INT            | YES  |      | NULL    |       | First column      |
| col2  | FLOAT          | YES  |      | NULL    |       | "%$^&*()_+@!      |
| col3  | VARCHAR(65535) | YES  |      | NULL    |       | ZD5lTndyuEzw49gxR |
| col4  | BOOL           | YES  |      | NULL    |       |                   |
+-------+----------------+------+------+---------+-------+-------------------+
4 rows in set (0.02 sec)
```
