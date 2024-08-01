# COSINE\_DISTANCE()

## Function Description

The `COSINE_DISTANCE()` function is used to calculate the cosine distance between two vectors.

Cosine Distance is a measure of the difference in direction between two vectors, usually defined as 1 minus [Cosine Similarity](cosine_similarity.md). The value of the cosine distance ranges from 0 to 2. 0 means that both vectors are in exactly the same direction (minimum distance). 2 means that the two vectors are in exactly the opposite direction (maximum distance). In text analysis, cosine distance can be used to measure similarities between documents. Since it considers only the direction of the vector and not the length, it is fair for comparisons between long and short text.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/cosine_distance.png?raw=true width=50% heigth=50%/>
</div>

## Function syntax

```
> SELECT COSINE_DISTANCE(vector1, vector2) FROM tbl;
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
1 row in set (0.01 sec)

mysql> select cosine_distance(b,c) from vec_table;
+-----------------------+
| cosine_distance(b, c) |
+-----------------------+
|    0.0253681538029239 |
+-----------------------+
1 row in set (0.00 sec)

mysql> select cosine_distance(b,"[1,2,3]") from vec_table;
+-----------------------------+
| cosine_distance(b, [1,2,3]) |
+-----------------------------+
|                           0 |
+-----------------------------+
1 row in set (0.00 sec)

mysql> select cosine_distance(b,"[-1,-2,-3]") from vec_table;
+--------------------------------+
| cosine_distance(b, [-1,-2,-3]) |
+--------------------------------+
|                              2 |
+--------------------------------+
1 row in set (0.00 sec)
```

## Limitations

Input vectors are not allowed to be 0 vectors when using the `COSINE_DISTANCE()` function, as this results in a division by zero, which is mathematically undefined. In practice, we usually consider the cosine similarity of a zero vector to any other vector to be 0 because there is no similarity in any direction between them.