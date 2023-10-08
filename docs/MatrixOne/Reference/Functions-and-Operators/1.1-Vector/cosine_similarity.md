# **cosine_similarity()**

## **Description**

Cosine similarity measures the cosine of the angle between two vectors, indicating their similarity by how closely they align in a multi-dimensional space, with 1 denoting perfect similarity and -1 indicating perfect dissimilarity. Consine similarity is calculated by dividing Inner Product of two vectors, by the product of their l2 norms.

![cosine_similarity](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/cosine_similarity.png?raw=true)

## **Syntax**

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

## **Constraints**

- Both the argument vectors should have same dimensions
- Cosine similarity value lies between -1 and 1.
