# **CREATE TEMPORARY TABLE**

## **Description**

Creates a new temporary table. A temporary table is a special type of table that is visible only within the current session and is dropped automatically when the session is closed.

## **Syntax**

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] tbl_name
    (create_definition,...)
    [table_options]
    [partition_options]

create_definition: {
    col_name column_definition
  | [CONSTRAINT [symbol]] PRIMARY KEY
      [index_type] (key_part,...)
      [index_option] ...
}

column_definition: {
    data_type [NOT NULL | NULL] [DEFAULT {literal | (expr)} ]
      [AUTO_INCREMENT] [UNIQUE [KEY]] [[PRIMARY] KEY]
      [COMMENT 'string']
}
```

## **Explanations**

- **Visibility**: A temporary table is visible only within the current session. Different sessions can use the same temporary table name without conflict.
- **Shadowing**: If a temporary table has the same name as an existing regular table, the regular table is "shadowed" or hidden by the temporary table within that session. Operations like `SELECT`, `INSERT`, `SHOW CREATE TABLE`, `SHOW COLUMNS`, and `DESC` will target the temporary table rather than the regular one.
- **Lifecycle**: Temporary tables are automatically dropped when the session ends. You can also explicitly drop them using `DROP TABLE` or `DROP TEMPORARY TABLE`.
- **Database Scope**: Dropping a database automatically drops any temporary tables created within that database in the current session.
- **Limited ALTER Support**: Currently, temporary tables only support index-related `ALTER TABLE` operations (e.g., `ADD INDEX`, `DROP INDEX`). Other structural modifications are not yet supported.

## **Examples**

- **Example 1: Create and use a temporary table**

```sql
CREATE TEMPORARY TABLE temp_t_unique_1 (a INT, b VARCHAR(10));
INSERT INTO temp_t_unique_1 VALUES (1, 'abc');

mysql> SELECT * FROM temp_t_unique_1;
+------+------+
| a    | b    |
+------+------+
|    1 | abc  |
+------+------+

-- The table will be automatically dropped when the session ends.
```

- **Example 2: Shadowing a regular table**

Note: The following behavior (shadowing) depends on the session-level mapping.

```
-- Regular table
CREATE TABLE t1_shadow_test (a INT);
INSERT INTO t1_shadow_test VALUES (1);

-- Temporary table with same name
CREATE TEMPORARY TABLE t1_shadow_test (b INT);
INSERT INTO t1_shadow_test VALUES (2);

mysql> SELECT * FROM t1_shadow_test;
+------+
| b    |
+------+
|    2 |
+------+
-- The temporary table shadows the regular table.

mysql> DESC t1_shadow_test;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| b     | INT(32) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
```

## **Constraints**

1. Temporary tables currently do not support `FOREIGN KEY` constraints.
2. Except for index-related operations, other `ALTER TABLE` operations (like changing columns or renaming the table) are not supported for temporary tables.
