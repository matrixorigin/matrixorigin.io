---
title: "SHOW INDEX"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Reflects MatrixOne index model — secondary index rows appear but may not accelerate queries"
  - "Index_type may be empty (MySQL typically shows BTREE)"
  - "Index_comment column is present (MySQL 8.0 also has Index_comment; difference is minor)"
  - "Index_params column is present (MySQL does not have this column)"
  - "Expression column shows the column name for non-functional key parts; MySQL shows NULL for non-functional key parts"
  - "MO SHOW INDEX returns 16 columns vs MySQL 15 columns (MO adds Index_params, lacks the extra Collation behavior)"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "SHOW INDEX returns table index information."
---
# **SHOW INDEX**

> SHOW INDEX returns table index information.

## **Description**

`SHOW INDEX` returns table index information.

`SHOW INDEX` returns the following fields:

|Fields | Description|
|---|---|
|Table|The name of the table.|
|Non_unique|0 if the index cannot contain duplicates, 1 if it can.|
|Key_name|The name of the index. If the index is the primary key, the name is always PRIMARY.|
|Seq_in_index|The column sequence number in the index, starting with 1.|
|Column_name|The column name. See also the description for the Expression column.|
|Collation|How the column is sorted in the index. This can have values A (ascending), D (descending), or NULL (not sorted).|
|Cardinality|An estimate of the number of unique values in the index. To update this number, run ANALYZE TABLE or (for MyISAM tables) myisamchk -a.<br>Cardinality is counted based on statistics stored as integers, so the value is not necessarily exact even for small tables. The higher the cardinality, the greater the chance that MySQL uses the index when doing joins.|
|Sub_part|The index prefix. That is, the number of indexed characters if the column is only partly indexed, NULL if the entire column is indexed. <br> **Note:** Prefix limits are measured in bytes. However, prefix lengths for index specifications in CREATE TABLE, ALTER TABLE, and CREATE INDEX statements are interpreted as number of characters for nonbinary string types (CHAR, VARCHAR, TEXT) and number of bytes for binary string types (BINARY, VARBINARY, BLOB). Take this into account when specifying a prefix length for a nonbinary string column that uses a multibyte character set.|
|Packed|Indicates how the key is packed. NULL if it is not.|
|Null|Contains YES if the column may contain NULL values and '' if not.|
|Index_type|The index method used (BTREE, FULLTEXT, HASH, RTREE). May be empty in MatrixOne.|
|Comment|Information about the index not described in its own column, such as disabled if the index is disabled.|
|Index_comment|The comment specified for the index when it was created (MatrixOne-specific column).|
|Index_params|Parameters used when the index was created (MatrixOne-specific column).|
|Visible|Whether the index is visible to the optimizer.|
|Expression|For a functional key part, Column_name is NULL and Expression indicates the expression. For a nonfunctional key part, Expression shows the column name (not NULL as in MySQL).|

## **Syntax**

```
> SHOW {INDEX | INDEXES}
    {FROM | IN} tbl_name
    [{FROM | IN} db_name]
```

### Explanations

An alternative to tbl_name FROM db_name syntax is db_name.tbl_name.

## **Examples**

<!-- validator-ignore-exec -->
```sql
CREATE TABLE show_01(sname varchar(30),id int);
mysql> show INDEX FROM show_01;
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------------+--------------+---------+------------+
| Table   | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment          | Index_comment | Index_params | Visible | Expression |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------------+--------------+---------+------------+
| show_01 |          0 | id         |            1 | id          | A         |           0 | NULL     | NULL   | YES  |            |                  |               |              | YES     | id         |
| show_01 |          0 | sname      |            1 | sname       | A         |           0 | NULL     | NULL   | YES  |            |                  |               |              | YES     | sname      |
| show_01 |          0 | __mo_rowid |            1 | __mo_rowid  | A         |           0 | NULL     | NULL   | NO   |            | Physical address |               |              | NO      | __mo_rowid |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------------+--------------+---------+------------+
3 rows in set (0.02 sec)
```
