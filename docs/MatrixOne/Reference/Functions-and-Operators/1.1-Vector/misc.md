# Misc Function

Other support functions on vector include.

## SQRT

### **Description**

The sqrt function is used to calculate the square root of each element in a vector.

### **Syntax**

```
> SELECT sqrt(vector_column) FROM table_name;
```

#### Return Type

Return a new vector of type vecf64, containing the square root of each element in the original vector.   

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

### **Constraints**

- Elements of the vector cannot have -ve.

## ABS

### **Description**

The abs function is used to calculate the absolute value of a vector.

### **Syntax**

```
> SELECT ABS(vector_column) FROM table_name;
```

#### Return Type

Return a new vector of same type, containing the absolute values of each element in the original vector.

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

mysql> select abs(b) from vec_table;
+-----------+
| abs(b)    |
+-----------+
| [1, 2, 3] |
+-----------+
1 row in set (0.01 sec)
```

## CAST

### **Description**

The cast function is used to explicitly convert vector from one vector type to another.

### **Syntax**

```
> SELECT CAST(vector AS vector_type) FROM table_name;
```

#### Arguments

- `vector`: input vector
- `vector_type`: new vector type

#### Return Type

The new vector_type vector.

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

mysql> select abs(cast("[-1,-2,3]" as vecf32(3)));
+-----------------------------------+
| abs(cast([-1,-2,3] as vecf32(3))) |
+-----------------------------------+
| [1, 2, 3]                         |
+-----------------------------------+
1 row in set (0.00 sec)
```

## SUMMATION

### **Description**

The summation function returns the sum of all the elements in a vector.

### **Syntax**

```
> SELECT SUMMATION(vector_column) FROM table_name;
```
#### Return Type

Returns a FLOAT64 value, which is the sum of all the elements in the vector.

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
