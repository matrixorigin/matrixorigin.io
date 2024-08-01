# Vector retrieval

## What is vector retrieval

Vector retrieval is the retrieval of K vectors (K-Nearest Neighbor, KNN) that are close to the query vectors in a given vector dataset by some measure. This is a technique for finding vectors similar to a given query vector in large-scale high-dimensional vector data. Vector retrieval has a wide range of applications in many AI fields, such as image retrieval, text retrieval, speech recognition, recommendation systems, and more. Vector retrieval is very different from traditional database retrieval.Scalar search on traditional database mainly targets structured data for accurate data query,while vector search mainly targets vector data after vectorization of unstructured data for similar retrieval,which can only approximate the best match.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/vector_vs_scalar.png?raw=true width=60% heigth=60%/>
</div>

Matrixone currently supports vector retrieval using the following distance measure functions:

- Cosine similarity function [`cosine_similarity`](../../Reference/Functions-and-Operators/Vector/cosine_similarity.md)
- Cosine distance function [`cosine_distance`](../../Reference/Functions-and-Operators/Vector/cosine_distance.md)
- L2 distance function [`l2_distance`](../../Reference/Functions-and-Operators/Vector/l2_distance.md)

!!! note Matrixone currently only supports fast KNN queries using vector indexes on the l2\_distance measure.

## Application scenarios for vector retrieval

Having vector capability in a database means that the database system has the ability to store, query, and analyze vector data. These vectors are often associated with complex data analysis, machine learning, and data mining tasks. Here are some application scenarios where the database has vector processing power:

- **Generative AI applications**: These databases can serve as the backend for generative AI applications, enabling them to obtain nearest neighbor results based on user-supplied queries, improving output quality and relevance.
- **Advanced object recognition**: They are invaluable for developing advanced object recognition platforms that recognize similarities between different data sets. This has practical applications in areas such as plagiarism detection, facial recognition and DNA matching.
- **Personalized recommendation systems**: Vector databases can enhance recommendation systems by integrating user preferences and choices. This will result in more accurate and targeted recommendations that improve the user experience and engagement.
- **Anomaly detection**: A vector database can be used to store feature vectors representing normal behavior. The anomaly can then be detected by comparing the input vector with the storage vector. This is useful in cybersecurity and industrial quality control.
- **Marketing optimization**: Through the analysis and mining of user data, vector database can realize personalized recommendations, customer segmentation and market trend forecasting, and other functions to provide enterprises with accurate marketing strategies.
- **Natural language processing**: Vector database can process large-scale text data, realize semantic similarity search, text classification, document clustering and other natural language processing tasks, widely used in intelligent customer service, public opinion analysis and other fields.
- **Semantic Search and** Retrieval: In applications involving large language models, vector databases can store and retrieve massive amounts of text vectors, and intelligent text matching and semantic search can be achieved by calculating similarities between vectors.

## Examples

The Iris dataset is a well-known multi-class taxonomic dataset that can be searched and downloaded online by itself. This dataset contains 150 samples divided into 3 categories: Iris Setosa (mountain iris), Iris Versicolour (chromatic iris) and Iris Virginica (virginian iris). Each sample has 4 characteristics: sepal length, sepal width, petal length, and petal width. Below we perform a KNN query (based on l2\_distance) on the Iris dataset to determine the type of sample by identifying the K samples that most closely resemble a particular sample based on its characteristics.

1. Create Iris tables and import data

    Prepare a table named `iris_table` and the corresponding Iris dataset data. The dataset has 150 rows of data, each row consisting of a four-dimensional eigenvector and species.

    ```sql
    CREATE TABLE iris_table(
        species varchar(100), --category 
        attributes vecf64(4) --feature
    ); 
    LOAD DATA INFILE '/your_path/iris.csv' INTO TABLE iris_table;
    ```

2. Use KNN to predict the category of this input feature

    ```sql
    mysql>  select * from iris_table order by l2_distance(attributes,"[4,3.3,3,0.9]") asc limit 1;
    +------------------+--------------------+
    | species          | attributes         |
    +------------------+--------------------+
    | Iris-versicolour | [4.9, 2.4, 3.3, 1] |
    +------------------+--------------------+
    1 row in set (0.00 sec)

    mysql>  select * from iris_table order by l2_distance(attributes,"[4,3.3,3,0.9]") asc limit 5;
    +------------------+----------------------+
    | species          | attributes           |
    +------------------+----------------------+
    | Iris-versicolour | [4.9, 2.4, 3.3, 1]   |
    | Iris-versicolour | [5.1, 2.5, 3, 1.1]   |
    | Iris-versicolour | [5, 2.3, 3.3, 1]     |
    | Iris-setosa      | [4.8, 3.4, 1.9, 0.2] |
    | Iris-versicolour | [5.2, 2.7, 3.9, 1.4] |
    +------------------+----------------------+
    5 rows in set (0.00 sec)
    ```

After searching, we can roughly determine that the sample type is discolored Iris.

To understand the role of vector retrieval in building RAG applications, refer to the [RAG Application Foundation](../../Tutorial/rag-demo.md) example in the View Application Development Example.

## Reference Documents

[Vector data type](../../Reference/Data-Types/vector-type.md)

[L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
