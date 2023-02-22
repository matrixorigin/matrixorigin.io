# FOREIGN KEY integrity constraints

FOREIGN KEY constraints can keep related data consistent when cross-referencing associated data across tables.

When defining FOREIGN KEY, the following rules need to be followed:

- The parent table must already exist in the database or be a table currently being created. In the latter case, the parent table and the slave table are the same table, such a table is called a self-referential table, and this structure is called self-referential integrity.

- A primary key must be defined for the parent table.

- Specify the column name or combination of column names after the table name of the parent table. This column or combination of columns must be the primary or candidate key of the primary table. Currently, MatrixOne only supports single-column foreign key constraints.

- The number of columns in the foreign key must be the same as the number of columns in the primary key of the parent table.

- The data type of the column in the foreign key must be the same as the data type of the corresponding column in the primary key of the parent table.

## **Syntax**

```
> column_name data_type FOREIGN KEY;
```

## **Examples**

```sql
create table t1(a int primary key,b varchar(5));
create table t2(a int ,b varchar(5),c int, foreign key(c) references t1(a));
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.02 sec)

mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t2 values(3,'xxa',103);
Query OK, 1 row affected (0.01 sec)
```

**Example Explanation**: In the above example, column c of t2 can only refer to the value or null value of column a in t1, so the operation of inserting row 1 and row 2 of t1 can be successfully inserted, but row 3 103 in the row is not a value in column a of t1, which violates the foreign key constraint, so the insert fails.

## **Constraints**

MatrixOne does not currently support `alter table`, so it does not support deleting `FOREIGN KEY` constraints.
