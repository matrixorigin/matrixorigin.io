# **l1_norm()**

## **Function Description**

The `l1_norm` function is used to calculate the `l1`/Manhattan/TaxiCab norm. The `l1` norm is obtained by summing the absolute values of the vector elements.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/l1_norm.png?raw=true width=50% heigth=50%/>
</div>

You can use the `l1` norm to calculate the `l1` distance.

```
l1_distance(a,b) = l1_norm(a-b)
```

The same calculation applies to calculating the `l2` distance from `l2_Norm`.

## **Function syntax**

```
> SELECT l1_norm(vector) AS result FROM table_name;
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

mysql> select l1_norm(b) from vec_table;
+------------+
| l1_norm(b) |
+------------+
|          6 |
+------------+
1 row in set (0.00 sec)
```
