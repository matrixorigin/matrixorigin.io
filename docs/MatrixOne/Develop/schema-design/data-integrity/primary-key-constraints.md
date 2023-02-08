# PRIMARY KEY integrity constraints

PRIMARY KEY constraints can be used to ensure that a key value uniquely identifies each data row in a table.
And at most, one `PRIMARY KEY` constraint can be defined on each database table.

## **Syntax**

```
> column_name data_type PRIMARY KEY;
```

## **Examples**

```sql
mysql> create table t1(a int primary key, b int, c int, primary key(b,c));
ERROR 20301 (HY000): invalid input: more than one primary key defined
mysql> create table t2(a int, b int, c int, primary key(b,c));
Query OK, 0 rows affected (0.01 sec)

mysql> create table t3(a int, b int, c int, primary key(a));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t2 values(1,1,1);
Query OK, 1 row affected (0.02 sec)

mysql> insert into t2 values(1,1,2);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t3 values(1,1,1);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t3 values(2,1,1);
Query OK, 1 row affected (0.01 sec)
```

**Example Explanation**: In the above example, t1 contains two sets of primary keys, so the creation fails. t2 and t3 have only one set of primary keys so they can be created. None of the four insert statements violated the constraints, and all were executed successfully.

## **Constraints**

MatrixOne does not currently support `alter table`, so it does not support deleting `PRIMARY KEY` constraints.
