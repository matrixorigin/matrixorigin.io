# Arithemetic Operators

MatrixOne supports the basic arithmetic operators like Add, Subtract, Multiply, Divide on vector. These operator performs element-wise arithemetic operation and return a new vector.

!!! note
    Sub(`-`), Multipy(`*`) and Divide(`/`) are all similar to the Add example.

## Add

### **Description**

This operator is used to add two vectors element-wise by using the + operator.

### **Syntax**

```
> SELECT vector1 + vector2 AS result_vector FROM table_name;
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
```

### **Constraints**

- Both the argument vectors should be of same dimension
- If operation is performed between vecf32 and vecf64, the result is cast to vecf64
- If one of the argument is VECTOR in textual format, then the other argument should be of VECTOR type. If both the arguments are TEXT, then Query Engine would treat it like string operation.

## Divide

### **Description**

This operator is used to divide two vectors element-wise by using the / operator.

## **Syntax**

```
> SELECT vector1 / vector2 AS result_vector FROM table_name;
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
```

### **Constraints**

- If one of the element in denominator vector is zero, then it will throw Division By Zero error.
-Both the argument vectors should be of same dimension
- If operation is performed between vecf32 and vecf64, the result is cast to vecf64
- If one of the argument is VECTOR in textual format, then the other argument should be of VECTOR type. If both the arguments are TEXT, then Query Engine would treat it like string operation.
