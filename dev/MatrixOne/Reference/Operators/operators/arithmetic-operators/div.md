# **DIV**

## **Description**

The `DIV` operator is used for integer division. Discards from the division result any fractional part to the right of the decimal point.

`DIV` accepts signed and unsigned integer types as well as `DECIMAL(64)` /
`DECIMAL(128)` operands. For decimal inputs, MatrixOne aligns the scales of
the two operands and then performs truncating integer division, returning a
`BIGINT`-range integer. If the result exceeds `BIGINT` range, an error
occurs. Division by zero (integer or decimal) returns `NULL`.

## **Examples**

```sql
mysql> SELECT 5 DIV 2, -5 DIV 2, 5 DIV -2, -5 DIV -2;
+---------+----------+----------+-----------+
| 5 div 2 | -5 div 2 | 5 div -2 | -5 div -2 |
+---------+----------+----------+-----------+
|       2 |       -2 |       -2 |         2 |
+---------+----------+----------+-----------+
1 row in set (0.00 sec)
```

```sql
create table t2(c1 int, c2 int);
insert into t2 values (-3, 2);
insert into t2 values (1, 2);

mysql> select c1 DIV 3 from t2;
+----------+
| c1 div 3 |
+----------+
|       -1 |
|        0 |
+----------+
2 rows in set (0.00 sec)

mysql> select c1 DIV c2 from t2;
+-----------+
| c1 div c2 |
+-----------+
|        -1 |
|         0 |
+-----------+
2 rows in set (0.00 sec)
```
