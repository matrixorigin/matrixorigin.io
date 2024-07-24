# CREATE INDEX USING IVFFLAT

## Syntax Description

Vector indexes can be used to speed up KNN (K-Nearest Neighbors) queries on tables containing vector columns. Matrixone currently supports IVFFLAT vector indexes with [`l2_distance`](../../Functions-and-Operators/Vector/l2_distance.md) metric.

We can specify PROBE_LIMIT to determine the number of cluster centers to query. PROBE_LIMIT defaults to 1, that is, only 1 cluster center is scanned. But if you set it to a higher value, it scans for a larger number of cluster centers and vectors, which may degrade performance a little but increase accuracy. We can specify the appropriate number of probes to balance query speed and recall rate. The ideal values for PROBE_LIMIT are:

- If total rows <1000000:PROBE_LIMIT=total rows/10
- If total rows > 1000000:PROBE_LIMIT=sqrt (total rows)

## Syntax structure

```
> CREATE INDEX index_name
USING IVFFLAT
ON tbl_name (col,...)
LISTS=lists 
OP_TYPE "vector_l2_ops"
```

### Grammatical interpretation

- `index_name`: index name
- `IVFFLAT`: vector index type, currently supports vector_l2_ops
- `lists`: number of partitions required in index, must be greater than 0
- `OP_TYPE`: distance measure to use

__NOTE__:

- The ideal values for LISTS are:
    - If total rows <1000000:lists=total rows/1000
    - If total rows > 1000000:lists=sqrt (total rows)
- It is recommended that the index is not created until the data is populated. If a vector index is created on an empty table, all vector quantities will be mapped to a partition, and the amount of data continues to grow over time, causing the index to become larger and larger and query performance to degrade.

## Examples

```sql
--The parameter experimental_ivf_index needs to be set to 1 (default 0) to use vector indexes.
SET GLOBAL experimental_ivf_index = 1;
drop table if exists t1;
create table t1(coordinate vecf32(2),class char);
-- There are seven points, each representing its coordinates on the x and y axes, and each point's class is labeled A or B.
insert into t1 values("[2,4]","A"),("[3,5]","A"),("[5,7]","B"),("[7,9]","B"),("[4,6]","A"),("[6,8]","B"),("[8,10]","B");
--Creating Vector Indexes
create index idx_t1 using ivfflat on t1(coordinate)  lists=1 op_type "vector_l2_ops";

mysql> show create table t1;
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                           |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`coordinate` VECF32(2) DEFAULT NULL,
`class` CHAR(1) DEFAULT NULL,
KEY `idx_t1` USING ivfflat (`coordinate`) lists = 1  op_type 'vector_l2_ops' 
) |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show index from t1;
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Index_params                            | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
| t1    |          1 | idx_t1   |            1 | coordinate  | A         |           0 | NULL     | NULL   | YES  | ivfflat    |         |               | {"lists":"1","op_type":"vector_l2_ops"} | YES     | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
1 row in set (0.01 sec)

--Set the number of clustering centers to scan
SET @PROBE_LIMIT=1;
--Now, we have a new point with coordinates (4, 4) and we want to use a KNN query to predict the class of this point.
mysql> select * from t1 order by l2_distance(coordinate,"[4,4]") asc;
+------------+-------+
| coordinate | class |
+------------+-------+
| [3, 5]     | A     |
| [2, 4]     | A     |
| [4, 6]     | A     |
| [5, 7]     | B     |
| [6, 8]     | B     |
| [7, 9]     | B     |
| [8, 10]    | B     |
+------------+-------+
7 rows in set (0.01 sec)

--Based on the query results the category of this point can be predicted as A
```

## Limitations

Only one vector index on one vector column is supported at a time. If you need to build a vector index on multiple vector columns, you can execute the create statement multiple times.
