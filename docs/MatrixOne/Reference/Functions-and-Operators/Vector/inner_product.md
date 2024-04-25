# **inner_product()**

## **Description**

The INNER PRODUCT function is used to calculate the inner/dot product between two vectors, which is the result of multiplying corresponding elements of two vectors and then adding them together.

![inner_product](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/inner_product.png?raw=true)

## **Syntax**

```
> SELECT inner_product(vector1, vector2) AS result FROM table_name;
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

mysql> select inner_product(b,"[1,2,3]") from vec_table;
+---------------------------+
| inner_product(b, [1,2,3]) |
+---------------------------+
|                        14 |
+---------------------------+
1 row in set (0.00 sec)
```

## **Constraints**

Both the argument vector shoulds be of same dimensions.
