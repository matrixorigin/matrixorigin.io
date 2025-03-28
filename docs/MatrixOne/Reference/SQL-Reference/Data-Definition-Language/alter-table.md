# **ALTER TABLE**

## **Syntax Description**

`ALTER TABLE` is used to modify the structure of an existing table.

## **Syntax Structure**

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

### Syntax Explanation

Below are explanations for each parameter:

1. `ALTER TABLE tbl_name`: Modifies the table named `tbl_name`.
2. `alter_option`: Specifies one or more alteration options, separated by commas.
    - `table_options`: Used to set or modify table options, such as table comments (COMMENT).
    - `ADD [COLUMN] col_name column_definition [FIRST | AFTER col_name]`: Adds a new column to the table, optionally specifying its position (before or after another column).
    - `ADD [COLUMN] (col_name column_definition,...)`: Adds multiple columns simultaneously.
    - `ADD {[INDEX | KEY] [index_name] [index_option] ...`: Adds an index, optionally specifying the index name and options (e.g., comments).
    - `ADD [CONSTRAINT] UNIQUE [INDEX | KEY] [index_name][index_option] ...`: Adds a UNIQUE constraint or UNIQUE index.
    - `ADD [CONSTRAINT] FOREIGN KEY [index_name] (col_name,...) reference_definition`: Adds a FOREIGN KEY constraint.
    - `ADD [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (key_part,...)`: Adds a PRIMARY KEY constraint.
    - `CHANGE [COLUMN] old_col_name new_col_name column_definition [FIRST | AFTER col_name]`: Modifies a column's definition, name, and position.
    - `ALTER INDEX index_name {VISIBLE | INVISIBLE}`: Changes the visibility of an index.
    - `DROP [COLUMN] col_name`: Drops a column.
    - `DROP {INDEX | KEY} index_name`: Drops an index.
    - `DROP FOREIGN KEY fk_symbol`: Drops a FOREIGN KEY constraint.
    - `DROP PRIMARY KEY`: Drops the PRIMARY KEY.
    - `RENAME [TO | AS] new_tbl_name`: Renames the table.
    - `MODIFY [COLUMN] col_name column_definition [FIRST | AFTER col_name]`: Modifies a column's definition and position.
    - `RENAME COLUMN old_col_name TO new_col_name`: Renames a column.

3. `key_part`: Specifies the components of an index. For text columns, you can optionally specify a length for the index. If no length is specified, the entire column value is used, which may impact performance for large text or binary columns.
4. `index_option`: Specifies index options, such as comments (COMMENT).
5. `table_options`: Specifies table options, such as comments (COMMENT).
6. `table_option`: Specific table options, such as comments (COMMENT).

## **Examples**

- Example 1: Dropping a FOREIGN KEY constraint

```sql
-- Create table f1 with two integer columns: fa (PRIMARY KEY) and fb (UNIQUE KEY)
CREATE TABLE f1(fa INT PRIMARY KEY, fb INT UNIQUE KEY);
-- Create table c1 with two integer columns: ca and cb
CREATE TABLE c1 (ca INT, cb INT);
-- Add a FOREIGN KEY constraint named ffa to c1, linking column ca to f1.fa
ALTER TABLE c1 ADD CONSTRAINT ffa FOREIGN KEY (ca) REFERENCES f1(fa);
-- Insert a record into f1: (2, 2)
INSERT INTO f1 VALUES (2, 2);
-- Insert a record into c1: (1, 1)
INSERT INTO c1 VALUES (1, 1);
-- Insert a record into c1: (2, 2)
INSERT INTO c1 VALUES (2, 2);
-- Select all records from c1, ordered by ca
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    2 |    2 |
+------+------+
1 row in set (0.01 sec)
-- Drop the FOREIGN KEY constraint ffa from c1
ALTER TABLE c1 DROP FOREIGN KEY ffa;
-- Insert a record into c1: (1, 1)
INSERT INTO c1 VALUES (1, 1);
-- Select all records from c1, ordered by ca
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
2 rows in set (0.01 sec)
```

- Example 2: Adding a PRIMARY KEY

```sql
-- Create table t1 with columns a (INTEGER), b (CHAR(10)), c (DATE), d (DECIMAL(7,2)), and a UNIQUE KEY on (a, b)
CREATE TABLE t1(a INTEGER, b CHAR(10), c DATE, d DECIMAL(7,2), UNIQUE KEY(a, b));

-- View the structure of t1
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

-- Insert three records into t1
INSERT INTO t1 VALUES(1, 'ab', '1980-12-17', 800);
INSERT INTO t1 VALUES(2, 'ac', '1981-02-20', 1600);
INSERT INTO t1 VALUES(3, 'ad', '1981-02-22', 500);

-- Display all records from t1
mysql> select * from t1;
+------+------+------------+---------+
| a    | b    | c          | d       |
+------+------+------------+---------+
|    1 | ab   | 1980-12-17 |  800.00 |
|    2 | ac   | 1981-02-20 | 1600.00 |
|    3 | ad   | 1981-02-22 |  500.00 |
+------+------+------------+---------+
3 rows in set (0.01 sec)

-- Add a PRIMARY KEY named pk1 on columns (a, b)
mysql> alter table t1 add primary key pk1(a, b);
Query OK, 0 rows affected (0.02 sec)

-- View the modified structure of t1
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

-- Display all records from t1 after adding the PRIMARY KEY
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

- Example 3: Renaming a Column

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

-- Rename column a to x and change its data type to VARCHAR(20)
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

- Example 4: Renaming a Table

```sql
CREATE TABLE t1 (a INTEGER PRIMARY KEY, b CHAR(10));

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
+---------------+
1 row in set (0.01 sec)

mysql> alter table t1 rename to t2;
Query OK, 0 rows affected (0.03 sec)

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t2            |
+---------------+
1 row in set (0.01 sec)
```

## Limitations

1. The following clauses: `CHANGE [COLUMN]`, `MODIFY [COLUMN]`, `RENAME COLUMN`, `ADD [CONSTRAINT [symbol]] PRIMARY KEY`, `DROP PRIMARY KEY`, and `ALTER COLUMN ORDER BY` can be freely combined in an `ALTER TABLE` statement but are currently not supported with other clauses.
2. Temporary tables do not currently support structural modifications via `ALTER TABLE`.
3. Tables created with `CREATE TABLE ... CLUSTER BY...` cannot be modified using `ALTER TABLE`.