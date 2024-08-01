# L2_DISTANCE()

## Function Description

The `L2_DISTANCE()` function is used to calculate the Euclidean distance between two vectors. Returns a value of type FLOAT64.

L2 distance, also known as Euclidean Distance, is one of the most commonly used distance measures in vector spaces. It measures the straight line distance between two points in multidimensional space. l2 distance has many practical applications, including areas such as machine learning, computer vision, and spatial analysis.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/l2_distance.png?raw=true width=50% heigth=50%/>
</div>

## Function syntax

```
> SELECT L2_DISTANCE(vector,  const_vector) FROM tbl;
```

## Examples

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]"),(2, "[1,1,1]", "[2,2,2]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
|    2 | [1, 1, 1] | [2, 2, 2] |
+------+-----------+-----------+
2 rows in set (0.00 sec)

mysql> select l2_distance(b,c) from vec_table;
+--------------------+
| l2_distance(b, c)  |
+--------------------+
|  5.196152422706632 |
| 1.7320508075688772 |
+--------------------+
2 rows in set (0.00 sec)
```
