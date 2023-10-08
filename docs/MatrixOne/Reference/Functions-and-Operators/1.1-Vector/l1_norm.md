# **l1_norm()**

## **Description**

The l1_norm function is used to calculate the L1/Manhattan/TaxiCab norm. The L1 norm is obtained by summing the absolute value of vector elements.

![l1_normy](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/l1_norm.png?raw=true)

You can use L1 Norm to calculate L1 Distance.

```
l1_distance(a,b) = l1_norm(a-b)
```

Same is appicable for calculating L2 distance from L2_Norm.

## **Syntax**

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
