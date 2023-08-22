# PRIMARY KEY integrity constraints

PRIMARY KEY constraints can be used to ensure that a key value uniquely identifies each data row in a table.
And at most, one `PRIMARY KEY` constraint can be defined on each database table.

**Rules**

When defining PRIMARY KEY, the following rules need to be followed:

- **Uniqueness:** The value of the primary key column must be unique; each row in the table must have a different primary key value.

- **Non-nullness:** The values ​​of the primary key columns cannot be null, i.e., they cannot contain NULL values.

- **Immutability:** The value of the primary key column cannot be changed or updated after insertion. This is to keep the primary key unique. If you need to change the primary key value, you usually need to delete the original row first and then insert a new one with the new primary key value.

- **Minimality:** The primary key can be composed of a single column or a combination of multiple columns. Composite primary keys can uniquely identify rows, but their composite values ​​must be unique and cannot have repeated combinations.

- **Referential integrity:** The primary key is usually used as a reference for the foreign key (Foreign Key).

- **Automatically create indexes:** Primary key columns will automatically create indexes to improve retrieval performance.

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

MatrixOne does not currently support deleting `PRIMARY KEY` constraints.
