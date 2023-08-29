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
  | ADD [CONSTRAINT [symbol]] PRIMARY KEY
        [index_type] (key_part,...)
  | CHANGE [COLUMN] old_col_name new_col_name column_definition
        [FIRST | AFTER col_name]
  | ALTER INDEX index_name {VISIBLE | INVISIBLE}
  | DROP [COLUMN] col_name
  | DROP {INDEX | KEY} index_name
  | DROP FOREIGN KEY fk_symbol
  | DROP PRIMARY KEY
  | RENAME [TO | AS] new_tbl_name
  | MODIFY [COLUMN] col_name column_definition
        [FIRST | AFTER col_name]
  | RENAME COLUMN old_col_name TO new_col_name
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
    - `ADD [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (key_part,...)`: Add a primary key constraint.
    - `CHANGE [COLUMN] old_col_name new_col_name column_definition [FIRST | AFTER col_name]`: Modify the column definition, column name and order.
    - `ALTER INDEX index_name {VISIBLE | INVISIBLE}`: Changes the visibility of an index.
    - `DROP [COLUMN] col_name`: Drops a column.
    - `DROP {INDEX | KEY} index_name`: Drops an index.
    - `DROP FOREIGN KEY fk_symbol`: Drops a FOREIGN KEY constraint.
    - `DROP PRIMARY KEY`: Delete the primary key.
    - `RENAME [TO | AS] new_tbl_name`: Renames the table.
    - `MODIFY [COLUMN] col_name column_definition [FIRST | AFTER col_name]`: Modify column definition and order.
    - `RENAME COLUMN old_col_name TO new_col_name`: Rename a column.

3. `key_part`: Represents the components of an index, which can be column names (when creating an index on a text column, you might specify a length for the index to only consider a certain number of characters in that column. If you create an index using a column name without specifying a length, the index will use the entire column value as an index component. In some cases, this may result in reduced performance, especially when dealing with large text or binary data columns. Specifying a length is usually unnecessary for smaller data types, such as integers or dates.).
4. `index_option`: Represents index options, such as comments (COMMENT).
5. `table_options`: Represents table options, such as table comments (COMMENT).
6. `table_option`: Specific table options, such as comments (COMMENT).

## **Examples**

- Example 1:

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

- Example 2:

```sql
-- Create a new table 't1' with columns a, b, c, and d. Column 'a' is of type INTEGER, 'b' is of type CHAR(10), 'c' is of type DATE, and 'd' is of type DECIMAL(7,2). A unique key is added on columns 'a' and 'b'.
CREATE TABLE t1(a INTEGER, b CHAR(10), c DATE, d DECIMAL(7,2), UNIQUE KEY(a, b));

-- Describe the structure of the 't1' table.
mysql> desc t1;
+-------+--------------+------+------+---------+-------+---------+
| Field | Type         | Null | Key  | Default | Extra | Comment |
+-------+--------------+------+------+---------+-------+---------+
| a     | INT(32)      | YES  |      | NULL    |       |         |
| b     | CHAR(10)     | YES  |      | NULL    |       |         |
| c     | DATE(0)      | YES  |      | NULL    |       |         |
| d     | DECIMAL64(7) | YES  |      | NULL    |       |         |
+-------+--------------+------+------+---------+-------+---------+
4 rows in set (0.01 sec)

-- Insert three rows into the 't1' table.
INSERT INTO t1 VALUES(1, 'ab', '1980-12-17', 800);
INSERT INTO t1 VALUES(2, 'ac', '1981-02-20', 1600);
INSERT INTO t1 VALUES(3, 'ad', '1981-02-22', 500);

-- Display all the rows from the 't1' table.
mysql> select * from t1;
+------+------+------------+---------+
| a    | b    | c          | d       |
+------+------+------------+---------+
|    1 | ab   | 1980-12-17 |  800.00 |
|    2 | ac   | 1981-02-20 | 1600.00 |
|    3 | ad   | 1981-02-22 |  500.00 |
+------+------+------------+---------+
3 rows in set (0.01 sec)

-- Alter the 't1' table to add a primary key 'pk1' on columns 'a' and 'b'.
mysql> alter table t1 add primary key pk1(a, b);
Query OK, 0 rows affected (0.02 sec)

-- Describe the modified structure of the 't1' table after adding the primary key.
mysql> desc t1;
+-------+--------------+------+------+---------+-------+---------+
| Field | Type         | Null | Key  | Default | Extra | Comment |
+-------+--------------+------+------+---------+-------+---------+
| a     | INT(32)      | NO   | PRI  | null    |       |         |
| b     | CHAR(10)     | NO   | PRI  | null    |       |         |
| c     | DATE(0)      | YES  |      | null    |       |         |
| d     | DECIMAL64(7) | YES  |      | null    |       |         |
+-------+--------------+------+------+---------+-------+---------+
4 rows in set (0.01 sec)

-- Display all the rows from the 't1' table after adding the primary key.
mysql> select * from t1;
+------+------+------------+---------+
| a    | b    | c          | d       |
+------+------+------------+---------+
|    1 | ab   | 1980-12-17 |  800.00 |
|    2 | ac   | 1981-02-20 | 1600.00 |
|    3 | ad   | 1981-02-22 |  500.00 |
+------+------+------------+---------+
3 rows in set (0.00 sec)
```

- Example 3:

```sql
CREATE TABLE t1 (a INTEGER PRIMARY KEY, b CHAR(10));
mysql> desc t1;
+-------+----------+------+------+---------+-------+---------+
| Field | Type     | Null | Key  | Default | Extra | Comment |
+-------+----------+------+------+---------+-------+---------+
| a     | INT(32)  | NO   | PRI  | NULL    |       |         |
| b     | CHAR(10) | YES  |      | NULL    |       |         |
+-------+----------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

insert into t1 values(1, 'ab');
insert into t1 values(2, 'ac');
insert into t1 values(3, 'ad');

mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    1 | ab   |
|    2 | ac   |
|    3 | ad   |
+------+------+
3 rows in set (0.01 sec)

-- Modify table 't1', change column 'a' name to 'x', and change datatype to VARCHAR(20).
mysql> alter table t1 change a x VARCHAR(20);
Query OK, 0 rows affected (0.01 sec)

mysql> desc t1;
+-------+-------------+------+------+---------+-------+---------+
| Field | Type        | Null | Key  | Default | Extra | Comment |
+-------+-------------+------+------+---------+-------+---------+
| x     | VARCHAR(20) | NO   | PRI  | null    |       |         |
| b     | CHAR(10)    | YES  |      | null    |       |         |
+-------+-------------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t1;
+------+------+
| x    | b    |
+------+------+
| 1    | ab   |
| 2    | ac   |
| 3    | ad   |
+------+------+
3 rows in set (0.00 sec)
```

## Constraints

1. The clauses: `CHANGE [COLUMN]`, `MODIFY [COLUMN]`, `RENAME COLUMN`, `ADD [CONSTRAINT [symbol]] PRIMARY KEY`, `DROP PRIMARY KEY`, and `ALTER COLUMN ORDER BY` can be freely combined in `ALTER TABLE`, these are not supported to be used with other clauses for the time being.
2. Temporary tables currently do not support using `ALTER TABLE` to modify the table structure.
3. Tables created using `CREATE TABLE ... CLUSTER BY...` do not allow modifications to the table structure using `ALTER TABLE`.
