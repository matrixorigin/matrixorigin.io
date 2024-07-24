# **vector_dims()**

## **Function Description**

The `vector_dims` function is used to determine the dimension of a vector.

## **Function syntax**

```
> SELECT vector_dims(vector) AS dimension_count FROM table_name;
```

## **Examples**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]");
insert into vec_table values(2, "[7,8,9]", "[1,2,3]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
|    2 | [7, 8, 9] | [1, 2, 3] |
+------+-----------+-----------+
2 row in set (0.00 sec)

mysql> select vector_dims(b) from vec_table;
+----------------+
| vector_dims(b) |
+----------------+
|              3 |
|              3 |
+----------------+
2 row in set (0.01 sec)
```
