# NORMALIZE_L2()

## Function Description

The `NORMALIZE_L2()` function performs Euclidean normalization on vectors.

The L2 norm is the square root of the sum of the squares of the vector elements, so the purpose of L2 normalization is to make the length (or norm) of the vector 1, which is often referred to as a unit vector. This normalization method is particularly useful in machine learning, especially when dealing with feature vectors. It can help standardize the scale of features and thus improve the performance of algorithms.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/normalize_l2.png?raw=true width=50% heigth=50%/>
</div>

## Function syntax

```
> SELECT NORMALIZE_L2(vector_column) FROM tbl;
```

## Examples

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

mysql> select normalize_l2(b) from vec_table;
+-------------------------------------+
| normalize_l2(b)                     |
+-------------------------------------+
| [0.26726124, 0.5345225, 0.80178374] |
+-------------------------------------+
1 row in set (0.00 sec)
```
