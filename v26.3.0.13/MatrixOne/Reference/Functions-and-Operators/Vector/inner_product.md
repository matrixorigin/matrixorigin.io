---
title: "inner_product()"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\")."
since: unknown
last_updated: 2026-05-08
llms_summary: "The INNER PRODUCT function is used to calculate the inner/dot product between two vectors."
---
# **inner_product()**

> The INNER PRODUCT function is used to calculate the inner/dot product between two vectors.

## **Function Description**

The `INNER PRODUCT` function is used to calculate the inner/dot product between two vectors. It is the result of multiplying the corresponding elements of two vectors and then adding them.

![inner_product](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/inner_product.png?raw=true)

## **Function syntax**

```
> SELECT inner_product(vector1, vector2) AS result FROM table_name;
```

## **Examples**

<!-- validator-ignore-exec -->
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
|                       -14 |
+---------------------------+
1 row in set (0.00 sec)
```

## **Known Issues**

On MO 3.0.12, `inner_product()` returns the **negation** of the correct dot product (wrong sign). For example, `inner_product([1,2,3], [4,5,6])` returns `-32` instead of `32`. Verify results before using in production.

## **Restrictions**

Two parameter vectors must have the same dimension.
