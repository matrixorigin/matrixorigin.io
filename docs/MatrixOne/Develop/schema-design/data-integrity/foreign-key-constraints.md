# FOREIGN KEY integrity constraints

FOREIGN KEY constraints can keep related data consistent when cross-referencing associated data across tables.

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
