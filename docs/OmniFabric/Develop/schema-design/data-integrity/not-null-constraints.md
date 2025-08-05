# NOT NULL integrity constraints

The NOT NULL constraint can restrict a column from containing NULL values.

## **Syntax**

```
> column_name data_type NOT NULL;
```

You cannot insert a `NULL` value into a column that contains a `NOT NULL` constraint or update an old value to `NULL`.

## **Examples**

```sql
create table t1(a int not null,b int);
mysql> insert into t1 values(null,1);
ERROR 3819 (HY000): constraint violation: Column 'a' cannot be null
mysql> insert into t1 values(1,null);
Query OK, 1 row affected (0.01 sec)
mysql> update t1 set a=null where a=1;
ERROR 3819 (HY000): constraint violation: Column 'a' cannot be null
```

**Example Explanation**: In the above example, because there is a non-null constraint in column a, the execution of the first insert statement will fail, the second statement satisfies the non-null constraint in column a, and there is no non-null constraint in column b so that it can be inserted successfully. The update statement fails because it triggers the non-null constraint of column a.
