# Vector Type

## What is a vector?

In a database, vectors are usually a set of numbers that are arranged in a particular way to represent some data or feature. These vectors can be one-dimensional arrays, multi-dimensional arrays, or data structures with higher dimensions. In machine learning and data analysis, vectors are used to represent data points, features, or model parameters. They are typically used to process unstructured data, such as pictures, speech, text, etc., to transform the unstructured data into embedding vectors through machine learning models and subsequently process and analyze the data.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/vector_introduction.png?raw=true width=80% heigth=80%/>
</div>

## Matrixone support vector type

Traditional vector databases are specially designed to process high-dimensional vector data,which are basically unstructured and have certain limitations. They may not provide as rich support for non-vector fields (e.g., metadata or text descriptions) as traditional relational databases, and lack the ability to handle complex data relationships and transactions, as well as insufficient functionality for data integrity constraints and metadata management. Therefore, vector databases may not be suitable for scenarios requiring complex queries, diverse data type support, or strong data consistency guarantees.

MatrixOne, as a relational database with vector capabilities, provides powerful data management capabilities. MatrixOne combines the transactional consistency, data integrity, ease of integration, and rich tool ecosystem of traditional relational databases, while adding the ability to store high-dimensional vector data and efficiently search for similarities. This combination enables databases to uniformly manage and query structured and unstructured data, supporting complex AI and machine learning applications while maintaining data security and governance, reducing maintenance costs and system complexity, and providing flexible and comprehensive data solutions for modern applications.

Matrixone currently supports vectors of type `float32` and `float64`, called `vecf32` and `vecf64` respectively, and does not support numbers of type string and integer.

## Best Practices

- **Vector type conversion**: When converting a vector from one type to another, it is recommended to specify both dimensions. For example:

    ```sql
    SELECT b + CAST("[1,2,3]" AS vecf32(3)) FROM t1; 
    ```

    This approach ensures accuracy and consistency in vector type conversion.

- **Use binary format**: To improve overall insertion performance, consider using binary format instead of text format. Make sure the array is in small end-order format before converting to hexadecimal encoding. The following is sample Python code:

    ```python
    import binascii
    # 'value' is a NumPy object
    def to_binary(value): if value is None: return value

        # small endian floating point array
        value = np.asarray(value, dtype='<f')
 
        if value.ndim != 1:
            raise ValueError('Expected ndim to be 1')
 
        return binascii.b2a_hex(value)
    ```

    This approach can significantly improve the efficiency of data insertion.

- **Building RAG application**: See the [RAG Application Basics Example](../../Tutorial/rag-demo.md) example in the app development example for details.

- **Building a map (text) search application**: For more information, check out the [Example of a basic map search application](../../Tutorial/search-picture-demo.md) Foundation example in the app development example.

## Reference Documents

[Vector data type](../../Reference/Data-Types/vector-type.md)
