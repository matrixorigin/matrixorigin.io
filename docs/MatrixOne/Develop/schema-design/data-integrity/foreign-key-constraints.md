# FOREIGN KEY integrity constraints

FOREIGN KEY constraints can keep related data consistent when cross-referencing associated data across tables.

When defining FOREIGN KEY, the following rules need to be followed:

- The parent table must already exist in the database or be a table currently being created. In the latter case, the parent table and the slave table are the same table, such a table is called a self-referential table, and this structure is called self-referential integrity.

- A primary key must be defined for the parent table.

- Primary keys cannot contain null values, but null values are allowed in foreign keys. In other words, as long as every non-null value in the foreign key appears in the specified primary key, the content of the foreign key is correct.

- Specify the column name or combination of column names after the table name of the parent table. This column or combination of columns must be the primary or candidate key of the primary table.

- The number of columns in the foreign key must be the same as the number of columns in the primary key of the parent table.

- The data type of the column in the foreign key must be the same as the data type of the corresponding column in the primary key of the parent table.

- The foreign key's value must be consistent with the primary key's value in the main table.

## **Syntax**

```
> column_name data_type FOREIGN KEY;
```

## **Examples**

```sql
-- Create a table named t1, containing two columns: a and b. The column a is of type int and is set as the primary key, while the column b is of type varchar with a length of 5.
create table t1(a int primary key, b varchar(5));

-- Create a table named t2, containing three columns: a, b, and c. The column a is of type int, the column b is of type varchar with a length of 5. The column c is of type int, and is set as a foreign key, establishing a relationship with the column a in table t1.
create table t2(a int ,b varchar(5), c int, foreign key(c) references t1(a));

-- Insert two rows of data into table t1: (101, 'abc') and (102, 'def').
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

-- Insert two rows of data into table t2: (1, 'zs1', 101) and (2, 'zs2', 102), where 101 and 102 are the primary keys in table t1.
mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

-- Insert a row of data into table t2: (3, 'xyz', null), where null means that this row of data has no associated primary key in column c (the foreign key column).
mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

-- Attempt to insert a row of data into table t2: (3, 'xxa', 103). However, 103 does not exist in the primary keys of table t1, so the insertion fails due to violation of the foreign key constraint.
mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

```

**Example Explanation**: In the above example, column c of t2 can only refer to the value or null value of column a in t1, so the operation of inserting row 1 and row 2 of t1 can be successfully inserted, but row 3 103 in the row is not a value in column a of t1, which violates the foreign key constraint, so the insert fails.

## **Constraints**

MatrixOne does not currently support `alter table`, so it does not support deleting `FOREIGN KEY` constraints.
