# **l2_norm()**

## **Description**

The l2_norm function is used to  calculate the L2/Euclidean norm. The L2 norm is obtained by taking the square root of the sum of the squares of the vector elements.

![l2_normy](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/l2_norm.png?raw=true)

## **Syntax**

```
> SELECT l2_norm(vector) AS result FROM table_name;
```

## **Examples**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
+------+-----------+-----------+
1 row in set (0.00 sec)

mysql> select l2_norm(b) from vec_table;
+--------------------+
| l2_norm(b)         |
+--------------------+
| 3.7416573867739413 |
+--------------------+
1 row in set (0.01 sec)
```
