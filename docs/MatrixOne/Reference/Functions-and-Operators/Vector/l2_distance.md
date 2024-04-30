# L2_DISTANCE()

## Description

The `L2_DISTANCE()` function is used to calculate the Euclidean distance between two vectors. It returns a value of the FLOAT64 type.

L2 distance, also known as Euclidean distance, is one of the most commonly used methods of measuring distance in vector spaces. It measures the straight-line distance between two points in multidimensional space. L2 distance has many practical applications, including fields such as machine learning, computer vision, and spatial analysis.

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/l2_distance.png width=50% heigth=50%/>
</div>

## Syntax

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
