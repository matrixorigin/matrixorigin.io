# Vector Type

In a database, vectors are usually a set of numbers that are arranged in a particular way to represent some data or feature. These vectors can be one-dimensional arrays, multi-dimensional arrays, or data structures with higher dimensions. MatrixOne support vector data type.

In MatrixOne, vectors are designed as a data type similar to Array arrays in programming languages (MatrixOne does not currently support array types), but is a more specific array type. First, it is a one-dimensional array type, meaning it cannot be used to build a Matrix matrix. Also currently only vectors of type `float32` and `float64` are supported, called `vecf32` and `vecf64` respectively, not numbers of type string and integer.

When creating a vector column, we can specify the dimension size of the vector column, such as vecf32(3), which is the length size of the array of vectors and can support up to 65,535 dimensions.

## How to use vector types in SQL

The syntax for using vectors is the same as for regular table building, inserting data, querying data.

### Create a vector column

You can create two vector columns, one of type Float32 and the other of type Float64, as per the following SQL statement, and you can set the dimension of both vector columns to 3.

Currently vector types cannot be used as primary or unique keys.

```
create table t1(a int, b vecf32(3), c vecf64(3));
```

### Insert Vector

MatrixOne supports inserting vectors in two formats.

**Text Format**

```
insert into t1 values(1, "[1,2,3]", "[4,5,6]");
```

**binary format**

If you want to use a Python NumPy array, you can insert that NumPy array directly into MatrixOne by encoding the array in hexadecimal instead of converting it to comma-separated text format. This is faster when inserting vectors with higher dimensions.

```sql
insert into t1 (a, b) values (2, cast(unhex("7e98b23e9e10383b2f41133f") as blob));
 -- "7e98b23e9e10383b2f41133f" for small-endian hexadecimal encoding of []float32{0.34881967, 0.0028086076, 0.5752134}
 ```

### query vector

Vector columns can also be read in two formats.

**Text Format**

```sql
mysql> select a, b from t1;
+------+---------------------------------------+
| a    | b                                     |
+------+---------------------------------------+
|    1 | [1, 2, 3]                             |
|    2 | [0.34881967, 0.0028086076, 0.5752134] |
+------+---------------------------------------+
2 rows in set (0.00 sec)
```

**binary format**

Binary format is useful if you need to read the vector result set directly into a NumPy array with minimal conversion costs.

```sql
mysql> select hex(b) from t1;
+--------------------------+
| hex(b)                   |
+--------------------------+
| 0000803f0000004000004040 |
| 7e98b23e9e10383b2f41133f |
+--------------------------+
2 rows in set (0.00 sec)
```
