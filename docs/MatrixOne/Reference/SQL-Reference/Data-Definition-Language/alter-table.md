# **ALTER TABLE**

## **Description**

`ALTER TABLE` is used to modify the existing data table structure.

## **Syntax**

```
ALTER TABLE tbl_name
    [alter_option [, alter_option] ...]

alter_option: {
    table_options
  | ADD [COLUMN] col_name column_definition
        [FIRST | AFTER col_name]
  | ADD [COLUMN] (col_name column_definition,...)
  | ADD {[INDEX | KEY] [index_name]
        [index_option] ...
  | ADD [CONSTRAINT] UNIQUE [INDEX | KEY]
        [index_name][index_option] ...
  | ADD [CONSTRAINT] FOREIGN KEY
        [index_name] (col_name,...)
        reference_definition
    }
  | ALTER INDEX index_name {VISIBLE | INVISIBLE}
  | DROP [COLUMN] col_name
  | DROP {INDEX | KEY} index_name
  | DROP FOREIGN KEY fk_symbol
  | RENAME [TO | AS] new_tbl_name
}

key_part: {col_name [(length)] | (expr)} [ASC | DESC]
index_option: {
  COMMENT[=]'string'
}
table_options:
    table_option [[,] table_option] ...
table_option: {
  COMMENT [=] 'string'
}
```

### **Explanations**

The explanations of each parameter are as the following:

1. `ALTER TABLE tbl_name`: Indicates modifying a table named `tbl_name`.
2. `alter_option`: Indicates that one or more change options can be executed, separated by commas.
    - `table_options`: Used to set or modify table options, such as table comments (COMMENT).
    - `ADD [COLUMN] col_name column_definition [FIRST | AFTER col_name]`: Adds a new column to the table, specifying the position of the new column (before or after a particular column).
    - `ADD [COLUMN] (col_name column_definition, ...)`: Adds multiple new columns simultaneously.
    - `ADD {[INDEX | KEY] [index_name] [index_option] ...`: Adds an index, specifying the index name and index options (such as comments).
    - `ADD [CONSTRAINT] UNIQUE [INDEX | KEY] [index_name][index_option] ...`: Adds a UNIQUE constraint or UNIQUE index.
    - `ADD [CONSTRAINT] FOREIGN KEY [index_name] (col_name, ...) reference_definition`: Adds a FOREIGN KEY constraint.
    - `ALTER INDEX index_name {VISIBLE | INVISIBLE}`: Changes the visibility of an index.
    - `DROP [COLUMN] col_name`: Drops a column.
    - `DROP {INDEX | KEY} index_name`: Drops an index.
    - `DROP FOREIGN KEY fk_symbol`: Drops a FOREIGN KEY constraint.
    - `RENAME [TO | AS] new_tbl_name`: Renames the table.

3. `key_part`: Represents the components of an index, which can be column names (when creating an index on a text column, you might specify a length for the index to only consider a certain number of characters in that column. If you create an index using a column name without specifying a length, the index will use the entire column value as an index component. In some cases, this may result in reduced performance, especially when dealing with large text or binary data columns. Specifying a length is usually unnecessary for smaller data types, such as integers or dates.).
4. `index_option`: Represents index options, such as comments (COMMENT).
5. `table_options`: Represents table options, such as table comments (COMMENT).
6. `table_option`: Specific table options, such as comments (COMMENT).

## **Examples**

```sql
-- Create table f1 with two integer columns: fa (primary key) and fb (unique key)
CREATE TABLE f1(fa INT PRIMARY KEY, fb INT UNIQUE KEY);
-- Create table c1 with two integer columns: ca and cb
CREATE TABLE c1 (ca INT, cb INT);
-- Add a foreign key constraint named ffa to table c1, associating column ca of table c1 with column fa of table f1
ALTER TABLE c1 ADD CONSTRAINT ffa FOREIGN KEY (ca) REFERENCES f1(fa);
-- Insert a record into table f1: (2, 2)
INSERT INTO f1 VALUES (2, 2);
-- Insert a record into table c1: (1, 1)
INSERT INTO c1 VALUES (1, 1);
-- Insert a record into table c1: (2, 2)
INSERT INTO c1 VALUES (2, 2);
-- Select all records from table c1 and order by column ca
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    2 |    2 |
+------+------+
1 row in set (0.01 sec)
-- Drop the foreign key constraint named ffa from table c1
ALTER TABLE c1 DROP FOREIGN KEY ffa;
-- Insert a record into table c1: (1, 1)
INSERT INTO c1 VALUES (1, 1);
-- Select all records from table c1 and order by column ca
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
2 rows in set (0.01 sec)
```

## Constraints

MatrixOne currently only supports the `ALTER INDEX index_name {VISIBLE | INVISIBLE}` syntax.
