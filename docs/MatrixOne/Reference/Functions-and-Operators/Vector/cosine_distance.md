# COSINE_DISTANCE()

## Description

The `COSINE_DISTANCE()` function is used to calculate the cosine distance between two vectors.

Cosine Distance is a measure of the directional difference between two vectors, typically defined as 1 minus the cosine similarity ([Cosine Similarity](cosine_similarity.md)). The value of cosine distance ranges from 0 to 2. A value of 0 indicates that the directions of the two vectors are exactly the same (minimum distance). A value of 2 indicates that the directions of the two vectors are exactly opposite (maximum distance). In text analysis, cosine distance can be used to measure the similarity between documents. Since it only considers the direction of the vectors and not their magnitude, it is fair for comparisons between long and short texts.

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/cosine_distance.png width=50% heigth=50%/>
</div>

## Syntax

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

## Constraints

When using the `COSINE_DISTANCE()`, input vectors must not be zero vectors, as this would result in a division by zero, which is undefined in mathematics. In practical applications, we generally consider the cosine similarity between a zero vector and any other vector to be zero, because there is no directional similarity between them.