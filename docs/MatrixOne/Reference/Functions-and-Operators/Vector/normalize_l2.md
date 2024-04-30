# NORMALIZE_L2()

## Description

The`NORMALIZE_L2()` function performs Euclidean normalization (L2 normalization) on a vector.

The L2 norm is the square root of the sum of the squares of the vector's elements. Therefore, the purpose of L2 normalization is to make the length (or norm) of the vector equal to 1, which is often referred to as a unit vector. This method of normalization is particularly useful in machine learning, especially when dealing with feature vectors. It can help standardize the scale of features, thereby improving the performance of the algorithm.

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/normalize_l2.png width=50% heigth=50%/>
</div>

## Syntax

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
