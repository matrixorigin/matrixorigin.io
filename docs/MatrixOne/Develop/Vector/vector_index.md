# vector index

Vector indexing is a technique for quickly finding and retrieving data in high-dimensional vector spaces, often used to process large-scale vector data sets. The core purpose of vector indexing is to efficiently find vectors similar to the query vector among a large number of vectors. It is often used in application scenarios such as image retrieval, recommendation systems, natural language processing, etc. Vector indexing is crucial in modern information retrieval and data analysis, especially when high-dimensional vector data needs to be processed. It can greatly improve the performance and response speed of the system.

Matrixone currently supports IVF_FLAT vector indexing for L2_distance.

## What is IVF_FLAT

IVF_FLAT (Inverted File with Flat) is a commonly used vector indexing technique for efficient similarity search in large-scale vector data. It combines the inverted file index (Inverted File Index) and the "Flat" vector storage method, which can speed up vector searches and is an effective method for processing large-scale vector data.

### Main principles

**Inverted Index**:

- IVF_FLAT first divides the vector data into several clusters through a process called "coarse quantizer".
- Each cluster has a center (centroid). When querying, first find the nearest cluster centers based on the query vector. These clusters store vector data that may contain the closest query vector.

**Flat retrieval**:

- After identifying the clusters that are most likely to contain the target, IVF_FLAT performs a one-to-one comparison (i.e., a "Flat" search) within these clusters to find the vector that is most similar to the query vector.
- This method reduces the number of vectors that need to be compared in full, thereby improving retrieval efficiency.

### Main features

- **Efficient**: By dividing large-scale data into multiple clusters and conducting detailed searches only within the most relevant clusters, IVF_FLAT greatly reduces the number of distance comparisons that need to be calculated and improves search speed.
- **Approximate Search**: IVF_FLAT is an approximate algorithm that, although it may not find exact nearest neighbors, can usually provide high enough accuracy for practical applications.
- **Scalability**: IVF_FLAT can be well expanded to scenarios where millions or even hundreds of millions of vector data are processed.

### Application scenarios

IVF_FLAT is widely used in image retrieval, recommendation systems, text retrieval, bioinformatics and other large-scale data processing tasks that require fast similarity search. By sharding and clustering large-scale data, it can effectively cope with the need for efficient retrieval under large data volumes.

## Example

Below we will give an example to randomly generate 2 million 128-dimensional vector data through a Python script, and compare the time difference in vector retrieval before and after creating a vector index.

### Step 1: Create data table

Prepare a table named `vec_table` to store vector data.

```sql
create table vec_table(
    n1 int primary key auto_increment,
    vec vecf32(128)
    );
```

### Step 2: Turn on the vector index option

Use the following SQL to enable vector indexing in the database, and reconnect to the database to take effect.

```sql
SET GLOBAL experimental_ivf_index = 1;
```

### Step 3: Build the python script

Create a python file named `vec_test.py`, define the vector data insertion function, vector retrieval function and function to create vector index, and then calculate the time spent on vector retrieval before and after creating the index.

```python
import numpy as np
import pymysql.cursors
import time
conn = pymysql.connect(
        host='127.0.0.1',
        port=6001,
        user='root',
        password = "111",
        db='vec',
        autocommit=False
        )
cursor = conn.cursor()

#Define the insert data function, the parameters are vector dimension, quantity, and number of items submitted in a single time
def insert_data(vector_dim,num_vectors,batch_size):
    vectors = np.random.rand(num_vectors, vector_dim)
    batch_data = []
    count = 0
    for vector in vectors:
        formatted_vector = '[' + ','.join(f"{x}" for x in vector) + ']'
        batch_data.append((formatted_vector,))
        count += 1

        if count % batch_size == 0:
            insert_sql = "INSERT INTO vec_table(vec) VALUES (%s)"
            cursor.executemany(insert_sql, batch_data)
            conn.commit()
            batch_data.clear()

    # If there is still unsubmitted data, perform final submission
    if batch_data:
        cursor.executemany("INSERT INTO vec_table(vec) VALUES (%s)", batch_data)
        conn.commit()

#Define the search function, the parameter is the vector dimension, and the number of items returned is retrieved
def vec_search(vector_dim,topk):
vector = np.random.rand(vector_dim)
    formatted_vector = '[' + ','.join(f"{x}" for x in vector) + ']'
    search_sql="select *from vec_table order by l2_distance(vec,%s) asc limit %s;"
    data_to_search=(formatted_vector,topk)
    start_time = time.time()
    cursor.execute(search_sql, data_to_search)
    end_time = time.time()
    execution_time = end_time -start_time
    print(f" {execution_time:.6f} seconds")

def vec_indx(n):
    index_sql = 'create index idx_vec using ivfflat on vec_table(vec) lists=%s op_type "vector_l2_ops"'
    cursor.execute(index_sql, n)
    conn.commit()

if __name__ == "__main__":
    insert_data(128, 2000000, 10000)
    print("Vector index not created SQL execution time:")
    vec_search(128,3)
    print("Creating vector index...")
    vec_indx(1000)
    print("Vector index SQL execution time created:")
    vec_search(128,3)
    cursor.close()
    conn.close()
```

### Step 4: Run the script

```bash
pythonvec_test.py
```

The console output is as follows:

```
Vector index not created SQL execution time:
0.780407 seconds
Creating vectors...
Vector index created SQL execution time:
0.015610 seconds
```

As you can see, after creating the index, the execution time of vector retrieval is significantly reduced.

## Reference documentation

[Vector data type](../../Reference/Data-Types/vector-type.md)
[Vector Index](../../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
[L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)