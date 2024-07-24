# Arithmetic operators

MatrixOne supports basic arithmetic operators such as addition, subtraction, multiplication, and division between vectors or between vectors and scalars. These operators perform element-by-element arithmetic and return a new vector.

!!! note
    Subtraction (`-`), multiplication (`*`), and division (`/`) are all similar to addition examples and will not be repeated.

## Add

### **Function Description**

`+` is used to add two elements together.

### **Function syntax**

```
> SELECT para1 + para2
```

### **Examples**

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

mysql> select b + "[1,2,3]" from vec_table;
+-------------+
| b + [1,2,3] |
+-------------+
| [2, 4, 6]   |
+-------------+
1 row in set (0.00 sec)

mysql> select b + 1 from vec_table;
+-----------+
| b + 1     |
+-----------+
| [2, 3, 4] |
+-----------+
1 row in set (0.01 sec)

mysql> select cast("[1,2,3]" as vecf32(3)) + 5.0;
+----------------------------------+
| cast([1,2,3] as vecf32(3)) + 5.0 |
+----------------------------------+
| [6, 7, 8]                        |
+----------------------------------+
1 row in set (0.00 sec)
```

### **Restrictions**

- When two vector type parameters are added, the dimensions of the vector should be the same.
- If two vector type parameters are added, of type vecf32 and vecf64, the result is converted to vecf64.
- When vector type and scalar type data are subtracted, vector type data needs to be subtracted.

## Divide

### **Function Description**

`/` Used to divide two vector elements.

## **Function syntax**

```
> SELECT para1 / para2
```

### **Examples**

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

mysql> select b/b from vec_table;
+-----------+
| b / b     |
+-----------+
| [1, 1, 1] |
+-----------+
1 row in set (0.00 sec)

mysql> select cast("[1,2,3]" as vecf32(3)) / b from vec_table;;
+--------------------------------+
| cast([1,2,3] as vecf32(3)) / b |
+--------------------------------+
| [1, 1, 1]                      |
+--------------------------------+
1 row in set (0.00 sec)

mysql> select b/2 from vec_table;
+---------------+
| b / 2         |
+---------------+
| [0.5, 1, 1.5] |
+---------------+
1 row in set (0.00 sec)
```

### **Restrictions**

- The denominator element is not allowed to be 0, otherwise an error is generated.
- The dimension should be the same when both parameters are vector types.
- If two vector type parameters are added, of type vecf32 and vecf64, the result is converted to vecf64.
- When vector type and scalar type data are divided, vector type data needs to be divisible.
