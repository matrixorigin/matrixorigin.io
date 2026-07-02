---
title: "Rename Table"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "MO does not support RENAME TABLE across databases; when given cross-database syntax, MO renames the table within its current database instead of raising an error. MySQL 8.0 supports cross-database RENAME TABLE."
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "In MatrixOne, the RENAME TABLE statement is used to change the name of a table."
---
# **Rename Table**

> In MatrixOne, the RENAME TABLE statement is used to change the name of a table.

## **Syntax description**

In MatrixOne, the `RENAME TABLE` statement is used to change the name of a table. You can change the names of multiple tables at once.

Things to note:

- RENAME TABLE is an atomic operation. If any rename fails, all rename operations are rolled back.
- Cross-database RENAME TABLE is not supported. When cross-database syntax is used (e.g., `db1.tbl TO db2.tbl`), MatrixOne silently renames the table within the current database instead of raising an error. MySQL 8.0 supports cross-database RENAME TABLE. To move a table across databases, first copy the table to the target database and then delete the original table.
- Before renaming a table, make sure there are no active transactions or locks using the table.

## **Grammar structure**

```
> RENAME TABLE
    tbl_name TO new_tbl_name
    [, tbl_name2 TO new_tbl_name2] ...
```

## **Example**

<!-- validator-ignore-exec -->
```sql
create table old_table1(n1 int);
create table old_table2(n1 int);
create table old_table3(n1 int);

RENAME TABLE old_table1 TO new_table1;
RENAME TABLE old_table2 TO new_table2,old_table3 TO new_table3;

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| new_table1    |
| new_table2    |
| new_table3    |
+---------------+
3 rows in set (0.00 sec)
```
