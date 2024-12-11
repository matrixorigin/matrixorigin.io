# **CROSS APPLY**

## **Syntax description**

`CROSS APPLY` is a special join operator in MatrixOne, mainly used to join each row of a table with another table function that returns a result set (such as a table-valued function). Unlike JOIN, CROSS APPLY allows a subquery or table-valued function on the right to depend on each row of the table on the left, returning different results for each row.

## **Grammar structure**

```
> SELECT <columns>
FROM <table_name>
CROSS APPLY <table_function> <alias>;
```

## **Example**

```sql
mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t1 values(1,3),(1,-1);
Query OK, 2 rows affected (0.00 sec)
mysql> select *from t1 cross apply generate_series(t1.a,t1.b,1)g;
+------+------+--------+
| a | b | result |
+------+------+--------+
| 1 | 3 | 1 |
| 1 | 3 | 2 |
| 1 | 3 | 3 |
+------+------+--------+
3 rows in set (0.02 sec)
```