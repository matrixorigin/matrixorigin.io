# UNIQUE KEY integrity constraints

The UNIQUE KEY constraint can be used to ensure that the values ​​of the columns or column groups of the data rows to be inserted or updated are unique and that the values ​​of a column or a column set in any two rows of the table are not repeated. The unique key must also be non-Null.

## **Syntax**

```
> column_name data_type UNIQUE KEY;
```

## **Examples**

```sql
create table t1(a int unique key, b int, c int, unique key(b,c));
mysql> insert into t1 values(1,1,1);
Query OK, 1 row affected (0.01 sec)
mysql> insert into t1 values(2,1,1);
ERROR 20307 (HY000): Duplicate entry '3a15013a1501' for key '__mo_index_idx_col'
mysql> insert into t1 values(1,1,2);
ERROR 20307 (HY000): Duplicate entry '1' for key '__mo_index_idx_col'
```

**Example Explanation**: In the above example, there are two unique key constraints in column a and columns (b,c). When inserting data, the second insert statement violates the unique constraint of (b,c) and duplicates the value of the first insert, so the insert fails. The third insert statement violates the constraint on column a, so the insert fails.
