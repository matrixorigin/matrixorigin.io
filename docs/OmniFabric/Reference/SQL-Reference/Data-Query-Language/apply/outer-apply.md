# **OUTER APPLY**

## **Syntax description**

`OUTER APPLY` is used to dynamically associate each row of the main table with the results of a function or subquery. (The content on the right can be dynamically generated based on the rows of the main table). Unlike [`CROSS APPLY`](./cross-apply.md), even if there is no data on the right side, the records of the main table will not be discarded, but the right column will be filled with NULL. (Similar to the effect of LEFT JOIN, but the right side is dynamically generated data).

## **Grammar structure**

```
> SELECT <columns>
FROM <table_name>
outer APPLY <table_function><alias>;
```

## **Example**

```sql
mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t1 values(1,3),(1,-1);
Query OK, 2 rows affected (0.00 sec)
mysql> select *from t1 outer apply generate_series(t1.a,t1.b,1)g;
+------+------+--------+
| a | b | result |
+------+------+--------+
| 1 | 3 | 1 |
| 1 | 3 | 2 |
| 1 | 3 | 3 |
| 1 | -1 | NULL |
+------+------+--------+
4 rows in set (0.01 sec)
```