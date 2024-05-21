# Vectors

## What Are Vectors

A vector is a numerical representation that encodes data content, such as text or audio, using embedding models. These vectors can be effectively stored and queried alongside relational data. Vector queries encompass tasks like locating nearest neighbors, which can significantly improve search retrievals, as seen in applications like facial recognition or enhancing Generative AI results.

## Vector database Use Cases

The database's capability to manage vectors reflects its capacity to store, retrieve, and analyze vector-based data. These vectors often play a pivotal role in complex data analysis, machine learning, and mining projects. Vector databases offer a wide range of versatile use cases:

- **Generative AI Applications**: These databases can serve as a backend for Generative AI applications, enabling them to fetch the nearest neighbor results in response to user-provided queries, enhancing the output quality and relevance.

- **Advanced Object Recognition**: They are invaluable for developing advanced object recognition platforms that discern similarities among diverse datasets. This has practical applications in plagiarism detection, facial recognition, and DNA matching.

- **Personalized Recommendation Systems**: Vector databases can be leveraged to augment recommendation systems by incorporating user preferences and choices. This leads to more accurate and tailored recommendations, improving the user experience and engagement.

- **Anomaly Detection**: Vector databases can store feature vectors representing normal behavior. Anomalies can then be detected by comparing incoming vectors to the stored ones. This is useful in cybersecurity and industrial quality control.

## Before you start

Before reading this document, make sure that the following tasks are completed:

- Build a MatrixOne Cluster in MatrixOne.
- Read the [Database Schema Design Overview](overview.md).
- The database has been created.

## How to Use Vectors

The syntax for using vectors is the same as that for regular table creation, data insertion, and data querying:

### Creating

Using the following SQL statement, you can create two vector columns, one of type Float32 and the other of type Float64. You can also set the dimensions for both vector columns to 3.

```
create table t1(a int, b vecf32(3), c vecf64(3));
```

### Inserting

MatrixOne supports inserting vectors in two formats.

**Textual Format**

```sql
insert into t1 values(1, "[1,2,3]", "[4,5,6]");
```

**Binary Format**

Suppose you are working with Python NumPy arrays. In that case, you can directly insert the NumPy array into MatrixOne by performing hexadecimal encoding on the array instead of converting it into a comma-separated textual format. This approach is faster when inserting vectors with higher dimensions.

```sql
insert into t1 (a, b) values (2, cast(unhex("7e98b23e9e10383b2f41133f") as blob));

-- "7e98b23e9e10383b2f41133f" represents the hexadecimal encoding of the little-endian []float32{0.34881967, 0.0028086076, 0.5752134}
```

### Querying

Vector columns can also be read in two formats.

**Textual Format**

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

**Binary Format**

The binary format is very useful if you need to directly read the vector result set into a NumPy array with minimal conversion cost.

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

## Example - Top K Queries

Top K queries are a database query operation that retrieves the top K data items or records from a database. These queries find application in various scenarios, including recommendation systems, search engines, and data analysis, among other fields.

First, we create a table named `t1` that contains vector data `b` and insert some sample data. Then, we perform top K queries using the given SQL statements for `l1_distance`, `l2_distance`, cosine similarity, and cosine distance, limiting the results to the top 5 matches.

```sql
-- Sample table 't1' with vector data 'b'
CREATE TABLE t1 (
    id int,
    b vecf64(3)
);

-- Insert some sample data
INSERT INTO t1 (id,b) VALUES (1, '[1,2,3]'), (2, '[4,5,6]'), (3, '[2,1,1]'), (4, '[7,8,9]'), (5, '[2,2,2]'), (6, '[3,1,2]');

mysql> select * from t1;
+------+-----------+
| id   | b         |
+------+-----------+
|    1 | [1, 2, 3] |
|    2 | [4, 5, 6] |
|    3 | [2, 1, 1] |
|    4 | [7, 8, 9] |
|    5 | [2, 2, 2] |
|    6 | [3, 1, 2] |
+------+-----------+
6 rows in set (0.01 sec)

-- Top K Queries using l1_distance
mysql> SELECT * FROM t1 ORDER BY l1_norm(b - '[3,1,2]') LIMIT 5;
+------+-----------+
| id   | b         |
+------+-----------+
|    6 | [3, 1, 2] |
|    5 | [2, 2, 2] |
|    3 | [2, 1, 1] |
|    1 | [1, 2, 3] |
|    2 | [4, 5, 6] |
+------+-----------+
5 rows in set (0.00 sec)

-- Top K Queries using l2_distance
mysql> SELECT * FROM t1 ORDER BY l2_distance(b,'[3,1,2]') LIMIT 5;
+------+-----------+
| id   | b         |
+------+-----------+
|    6 | [3, 1, 2] |
|    5 | [2, 2, 2] |
|    3 | [2, 1, 1] |
|    1 | [1, 2, 3] |
|    2 | [4, 5, 6] |
+------+-----------+
5 rows in set (0.00 sec)

-- Top K Queries using cosine similarity
mysql> SELECT * FROM t1 ORDER BY cosine_similarity(b, '[3,1,2]') LIMIT 5;
+------+-----------+
| id   | b         |
+------+-----------+
|    1 | [1, 2, 3] |
|    2 | [4, 5, 6] |
|    4 | [7, 8, 9] |
|    5 | [2, 2, 2] |
|    3 | [2, 1, 1] |
+------+-----------+
5 rows in set (0.00 sec)

-- Top K Queries using cosine distance
mysql> SELECT * FROM t1 ORDER BY cosine_distance(b, '[3,1,2]') LIMIT 5;
+------+-----------+
| id   | b         |
+------+-----------+
|    6 | [3, 1, 2] |
|    3 | [2, 1, 1] |
|    5 | [2, 2, 2] |
|    4 | [7, 8, 9] |
|    2 | [4, 5, 6] |
+------+-----------+
5 rows in set (0.00 sec)
```

These queries demonstrate retrieving the top 5 vectors most similar to the given vector `[3,1,2]` using different distance and similarity measures. With these queries, you can find the data that best matches your target vector based on different measurement criteria.

## Best Practices

- **Casting between Vectors:** When casting a vector from one type to another, it is also advisable to specify the dimension. For instance:

    ```
    SELECT b + CAST("[1,2,3]" AS vecf32(3)) FROM t1;
    ```

    This practice ensures accuracy and consistency in vector-type conversions.

- **Utilizing Binary Format:** To enhance overall insertion performance, consider using binary rather than textual format. Ensure the array is in little-endian format before converting it into hexadecimal encoding. Here's a sample Python code:

    ```python
    import binascii
    
    # 'value' is a NumPy object
    def to_binary(value):
        if value is None:
            return value
    
       # Little-endian float array
       value = np.asarray(value, dtype='<f')

       if value.ndim != 1:
           raise ValueError('expected ndim to be 1')

       return binascii.b2a_hex(value)
    ```

    This approach can significantly improve data insertion efficiency.

## Constriants

- Currently, MatrixOne Vector type supports float32 and float64 types.
- Vector cannot be Primary Key or Unique Key.
- Vector maximum dimension is 65535.

## Reference

For more documentation on vector functions, see:

- [inner_product()](../../Reference/Functions-and-Operators/Vector/inner_product.md)
- [l1_norm()](../../Reference/Functions-and-Operators/Vector/l1_norm.md)
- [l2_norm()](../../Reference/Functions-and-Operators/Vector/l2_norm.md)
- [l2_distance()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
- [cosine_similarity()](../../Reference/Functions-and-Operators/Vector/cosine_similarity.md)
- [cosine_distance()](../../Reference/Functions-and-Operators/Vector/cosine_distance.md)
- [vector_dims()](../../Reference/Functions-and-Operators/Vector/vector_dims.md)
- [normalize_l2()](../../Reference/Functions-and-Operators/Vector/normalize_l2.md)
- [Arithemetic Operators](../../Reference/Functions-and-Operators/Vector/arithmetic.md)
- [Misc Functions](../../Reference/Functions-and-Operators/Vector/misc.md)
