# CLUSTER\_CENTERS

## Function Description

The `CLUSTER_CENTERS()` function can be used to determine the K cluster centers of a vector column. Returns a row of JSON array strings containing all cluster centers.

## Syntax structure

```
SELECT cluster_centers(col kmeans 'k, op_type, init_type, normalize')  FROM tbl;
```

## Parameter interpretation

| Parameters | Description |
|  ----  | ----  |
| col | Required. To determine the vector columns of the clustering centers.|
| k | Required. The number of clusters into which the dataset is to be divided, greater than 0 and less than or equal to the total number of rows.|
| op_type| Required. The distance function to be used during the clustering calculation. Currently vector_l2_ops is supported.|
| init_type | Required. The initialized clustering center algorithm to be used. Currently we support random and kmeansplusplus (K-means++).|
| normalize | Required. Boolean value, the clustering algorithm to use, true for Spherical Kmeans, false for Regular Kmeans.|

## Examples

```sql
drop table if exists points;
CREATE TABLE points (id int auto_increment PRIMARY KEY,coordinate vecf32(2));
insert into points(coordinate) VALUES
 ("[-7.68905443,6.62034649]"),
 ("[-9.57651383,-6.93440446]"),
 ("[6.82968177,1.1648714]"),
 ("[-2.90130578,7.55077118]"),
 ("[-5.67841327,-7.28818497]"),
 ("[-6.04929137,-7.73619342]"),
 ("[-6.27824322,7.22746302]");
SET GLOBAL experimental_ivf_index = 1;--The parameter experimental_ivf_index needs to be set to 1 (default 0) to use vector indexes.
--create index idx_t1 using ivfflat on points(coordinate)  lists=1 op_type "vector_l2_ops";

-- Each point represents its coordinates on the x and y axes, querying the clustering centers, using Regular Kmeans
--K-means++
mysql>  SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,false') AS centers FROM points;
+----------------------------------------------------+
| centers                                            |
+----------------------------------------------------+
| [ [-2.5097303, 5.640863],[-7.101406, -7.3195944] ] |
+----------------------------------------------------+
1 row in set (0.01 sec)

--KMeans
mysql>  SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,random,false') AS centers FROM points;
+----------------------------------------------------+
| centers                                            |
+----------------------------------------------------+
| [ [-6.362137, -0.09336702],[6.829682, 1.1648715] ] |
+----------------------------------------------------+
1 row in set (0.00 sec)

-- Each point represents latitude and longitude coordinates to query the clustering center using Spherical Kmeans
mysql> SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,true') AS centers FROM points;
+------------------------------------------------------+
| centers                                              |
+------------------------------------------------------+
| [ [0.70710677, 0.70710677],[0.83512634, 0.5500581] ] |
+------------------------------------------------------+
1 row in set (0.00 sec)

--Cluster centers within JSON-type data can be taken out in combination with CROSS JOIN and UNNEST syntax.
mysql> SELECT value FROM  (
    -> SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,false') AS centers FROM  points
    -> ) AS subquery 
    -> CROSS JOIN  UNNEST(subquery.centers) AS u;
+-------------------------+
| value                   |
+-------------------------+
| [-2.5097303, 5.640863]  |
| [-7.101406, -7.3195944] |
+-------------------------+
2 rows in set (0.00 sec)
```
