# Cluster Center

## What is a Cluster Center

When using clustering algorithms, especially K-means, the number of clusters K represents the number of clusters into which you want to divide the data set. Each cluster is represented by its centroid, which is the central point or average position of all data points within the cluster.

In the K-means algorithm, the choice of K has a great influence on the clustering results. Choosing the right K value can help you better understand the structure and pattern of your data. If the K value is not chosen properly, it can cause the following problems:

- The K value is too small: it can cause different clusters to merge together, losing important patterns in the data.
- K-values are too large: may result in over-segmentation of data, with each cluster containing very few data points, which may mask general trends in the data.

Matrixone provides a cluster center query to determine the K cluster centers of a vector column.

## Application scenarios for clustering centers

Clustering plays an important role in data analysis and machine learning. Here are some of the main application scenarios for clustering centers:

- Market segmentation: In market analysis, clustering centers can help identify different customer group characteristics to customize marketing strategies for each group.

- Image segmentation: In image processing, clustering centers are used to distinguish different regions or objects in an image, often used for image compression and segmentation.

- Social network analysis: Cluster centers allow the identification of groups of users with similar behaviors or interests in social networks.

- Anomaly detection: Cluster centers can help identify anomalies in the data, as anomalies are often far from all cluster centers.

- Astronomical data analysis: In astronomy, clustering centers can be used to identify the characteristics of clusters of galaxies or star clusters.

## involve algorithms

Determining the clustering center of a vector dataset in Matrixone involves the following algorithms:

- Random: In random initialization, the algorithm randomly selects n\_clusters of observations from the data set as the initial centroid. This method is simple and fast, but may result in the quality of the clustering results depending on the selection of the initial centroid, as random selection may not fall in a dense region of the data.

- K-means++ (k-means++ initialization): k-means++ is a more advanced initialization method designed to improve the inadequacy of random initialization by selecting the initial centroid through a multi-step process to increase the probability that the selected centroid points represent the overall distribution of data.

- Regular Kmeans: A widely used clustering method designed to divide data points into K clusters so that data points within clusters are as similar as possible and data points between clusters as different as possible. This method measures similarity between data points based on Euclidean distance, so it is better suited for processing data in plane space.

- Spherical Kmeans: An algorithm for clustering data points. The process of calculating the center of a cluster by the Spherical K-means algorithm involves normalizing the data points. Especially suitable for high-dimensional and sparse high-dimensional and sparse, or data where the directionality of the data points is more important than the distance, such as text data, geographic location or user interest models.

## Examples

### Example 1

Suppose we have annual shopping data for a set of customers, including their annual income and total annual consumption. We want to use this data to understand our customers' consumption behavior and break it down into different consumer behavior groups.

#### Steps

1. Create customer table and insert data

    Prepare a table named `customer_table` that inserts 10 pieces of customer data. The two-dimensional vector represents the customer's annual revenue and total annual consumption.

    ```sql
    CREATE TABLE customer_table(id int auto_increment PRIMARY KEY,in_ex vecf64(2));
    INSERT INTO customer_table(in_ex) VALUES("[120,50]"),("[80,25]"),("[200,100]"),("[100,40]"),("[300,120]"),("[150,75]"),("[90,30]"),("[250,90]"),("[75,20]"),("[150,60]");

    mysql> select * from customer_table;
    +------+------------+
    | id   | in_ex      |
    +------+------------+
    |    1 | [120, 50]  |
    |    2 | [80, 25]   |
    |    3 | [200, 100] |
    |    4 | [100, 40]  |
    |    5 | [300, 120] |
    |    6 | [150, 75]  |
    |    7 | [90, 30]   |
    |    8 | [250, 90]  |
    |    9 | [75, 20]   |
    |   10 | [150, 60]  |
    +------+------------+
    10 rows in set (0.01 sec)
    ```

2. Determining the Cluster Center

    ```sql
    mysql> SELECT cluster_centers(in_ex kmeans '2,vector_l2_ops,random,false') AS centers FROM customer_table;
    +------------------------------------------------------------------------+
    | centers                                                                |
    +------------------------------------------------------------------------+
    | [ [109.28571428571428, 42.857142857142854],[250, 103.33333333333333] ] |
    +------------------------------------------------------------------------+
    1 row in set (0.00 sec)
    ```

3. Check Cluster Center

    A good cluster usually appears as a distinctly separated group in the visualization. As can be seen from the figure below, the cluster center selection is more appropriate.

    <div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/cluster-center.png?raw=true width=60% heigth=60%/>
    </div>

By identifying cluster centers, we can divide our customers into two groups: those with middle income and middle consumption levels (cluster center A) and those with higher income and higher consumption levels (cluster center B). Merchants can tailor their product positioning to each group's consumption characteristics, such as offering better value for money for Cluster Center A and high-end or luxury brands for Cluster Center B.

### Example 2

A music streaming service wants to divide users into groups based on their preferences for different music types in order to offer personalized playlists. They collected user preference ratings (1 for disinterested and 5 for very fond) for five music types: rock, pop, jazz, classical, and hip-hop.

#### Steps

1. Build music type table and insert data

    Prepare a table named `music_table` that inserts 5 pieces of user data. The five-dimensional vectors correspond to user preference scores for five genres of music: rock, pop, jazz, classical and hip-hop.

    ```sql
    CREATE TABLE music_table(id int,grade vecf64(5));
    INSERT INTO music_table VALUES(1,"[5,2,3,1,4]"),(2,"[3,5,2,1,4]"),(3,"[4,3,5,1,2]"),(4,"[2,5,4,3,1]"),(5,"[5,4,3,2,5]");

    mysql> select * from music_table;
    +------+-----------------+
    | id   | grade           |
    +------+-----------------+
    |    1 | [5, 2, 3, 1, 4] |
    |    2 | [3, 5, 2, 1, 4] |
    |    3 | [4, 3, 5, 1, 2] |
    |    4 | [2, 5, 4, 3, 1] |
    |    5 | [5, 4, 3, 2, 5] |
    +------+-----------------+
    5 rows in set (0.01 sec)
    ```

2. View vector normalization results

    ```sql
    mysql> select normalize_l2(grade) from music_table;
    +---------------------------------------------------------------------------------------------------------+
    | normalize_l2(grade)                                                                                     |
    +---------------------------------------------------------------------------------------------------------+
    | [0.6741998624632421, 0.26967994498529685, 0.40451991747794525, 0.13483997249264842, 0.5393598899705937] |
    | [0.40451991747794525, 0.6741998624632421, 0.26967994498529685, 0.13483997249264842, 0.5393598899705937] |
    | [0.5393598899705937, 0.40451991747794525, 0.6741998624632421, 0.13483997249264842, 0.26967994498529685] |
    | [0.26967994498529685, 0.6741998624632421, 0.5393598899705937, 0.40451991747794525, 0.13483997249264842] |
    | [0.562543950463012, 0.4500351603704096, 0.3375263702778072, 0.2250175801852048, 0.562543950463012]      |
    +---------------------------------------------------------------------------------------------------------+
    5 rows in set (0.01 sec)
    ```

3. Determining the Cluster Center

    ```sql
    mysql> SELECT cluster_centers(grade kmeans '2,vector_l2_ops,kmeansplusplus,true') AS centers FROM music_table;
    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | centers                                                                                                                                                                                                          |
    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | [ [0.3370999312316211, 0.6741998624632421, 0.40451991747794525, 0.26967994498529685, 0.3370999312316211],[0.5920345676322826, 0.3747450076112172, 0.4720820500729982, 0.16489917505683388, 0.4571945951396342] ] |
    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    1 row in set (0.00 sec)
    ```

4. Check Cluster Center

    Use t-SNE to reduce high-dimensional data to 2D and visualize clustering results. As can be seen from the figure below, the data points are clearly separated by cluster centers in the space after dimension reduction, which increases confidence in the correctness of the cluster centers.

    <div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/tutorial/Vector/cluster_center2.png?raw=true width=70% heigth=70%/>
    </div>

By determining the cluster centers, we can divide users into two groups: Cluster 1 is primarily composed of users who prefer rock and hip hop music, which may represent a group of users seeking modern and rhythmic music. Cluster 2 is composed of users who prefer pop and jazz music, which may represent a group of users who prefer melodic and relaxed atmosphere music. Media companies can push out styles of music for users based on their preferences.

## Reference Documents

[Vector data type](../../Reference/Data-Types/vector-type.md)

[CLUSTER_CENTERS()](../../Reference/Functions-and-Operators/Vector/cluster_centers.md)

[L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)

[NORMALIZE_L2()](MatrixOne/Reference/Functions-and-Operators/Vector/normalize_l2.md)
