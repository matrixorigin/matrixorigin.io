# **cosine\_similarity()**

## **Function Description**

`cosine_similarity()` is a cosine similarity that measures the cosine value of the angle between two vectors, indicating their similarity by how close they are in multidimensional space, where 1 means exactly similar and -1 means completely different. Cosine similarity is calculated by dividing the inner product of two vectors by the product of their l2 norm.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/cosine_similarity.png?raw=true width=50% heigth=50%/>
</div>

## **Function syntax**

```
> SELECT cosine_similarity(vector1, vector2) AS similarity FROM table_name;
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

mysql> select cosine_similarity(b,"[1,2,3]") from vec_table;
+-------------------------------+
| cosine_similarity(b, [1,2,3]) |
+-------------------------------+
|                             1 |
+-------------------------------+
1 row in set (0.00 sec)
```

## **Restrictions**

- Two parameter vectors must have the same dimension.
- The value for cosine similarity is between -1 and 1.
- Input vectors are not allowed to be 0 vectors because this results in a division by zero, which is mathematically undefined. In practice, we usually consider the cosine similarity of a zero vector to any other vector to be 0 because there is no similarity in any direction between them.
