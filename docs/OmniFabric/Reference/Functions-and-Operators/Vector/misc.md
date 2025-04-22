# Mathematical class functions

Vectors support the following mathematical functions:

## SQRT

### **Function Description**

The `sqrt` function is used to calculate the square root of each element in a vector.

### **Function syntax**

```
> SELECT sqrt(vector_column) FROM table_name;
```

#### Return Type

Returns a new vector of type vecf64 containing the square root of each element in the original vector.

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

mysql> select sqrt(b) from vec_table;
+---------------------------------------------+
| sqrt(b)                                     |
+---------------------------------------------+
| [1, 1.4142135623730951, 1.7320508075688772] |
+---------------------------------------------+
1 row in set (0.00 sec)
```

### **Restrictions**

- Elements of a vector cannot be negative.

## ABS

### **Function Description**

The `abs` function is used to calculate the absolute value of a vector.

### **Function syntax**

```
> SELECT ABS(vector_column) FROM table_name;
```

#### Return Type

Returns a new vector of the same type containing the absolute value of each element in the original vector.

### **Examples**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[-1,-2,3]", "[4,5,6]");
  mysql> select * from vec_table;
  +------+-------------+-----------+
  | a    | b           | c         |
  +------+-------------+-----------+
  |    1 | [-1, -2, 3] | [4, 5, 6] |
  +------+-------------+-----------+
  1 row in set (0.00 sec)

mysql> select abs(b) from vec_table;
+-----------+
| abs(b)    |
+-----------+
| [1, 2, 3] |
+-----------+
1 row in set (0.01 sec)
```

## CAST

### **Function Description**

The cast function is used to explicitly convert a vector from one vector type to another.

### **Function syntax**

```
> SELECT CAST(vector AS vector_type) FROM table_name;
```

#### Parameters

- `vector`: Enter the vector.
- `vector_type`: new vector type.

#### Return Type

New `vector_type` vector.

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

mysql> select b + cast("[1,2,3]" as vecf32(3)) from vec_table;
+--------------------------------+
| b + cast([1,2,3] as vecf32(3)) |
+--------------------------------+
| [2, 4, 6]                      |
+--------------------------------+
1 row in set (0.00 sec)
```

## SUMMATION

### **Function Description**

The `summation` function returns the sum of all the elements in the vector.

### **Function syntax**

```
> SELECT SUMMATION(vector_column) FROM table_name;
```

#### Return Type

Returns a FLOAT64 value, the sum of all the elements in the vector.

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

mysql> select summation(b) from vec_table;
+--------------+
| summation(b) |
+--------------+
|            6 |
+--------------+
1 row in set (0.00 sec)
```