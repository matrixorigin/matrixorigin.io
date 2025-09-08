# CREATE INDEX USING HNSW

## Syntax Description

MatrixOne supports using the HNSW (Hierarchical Navigable Small World) algorithm in vector retrieval functionality to accelerate similarity searches for high-dimensional vectors.

## Syntax Structure

```
> CREATE INDEX index_name
USING HNSW
ON tbl_name (col,...)
OP_TYPE "vector_l2_ops"
[M <n>]
[EF_CONSTRUCTION <n>]
[EF_SEARCH <n>] ;
```

### Syntax Explanation

- `index_name`: Index name
- `HNSW`: Vector index type
- `OP_TYPE`: Distance metric to use. Currently supports vector_l2_ops
- M: Default value is 16. Controls the maximum number of neighbor connections per node in the HNSW graph. Higher values improve index quality but increase build time and storage overhead.
- EF_CONSTRUCTION: Default value is 128. Expansion factor during index construction, controlling the exploration width during graph building.
- EF_SEARCH: Default value is 64. Expansion factor during querying, controlling the number of candidate nodes visited during the search process.

## Example

```sql
-- Set parameter experimental_hnsw_index to 1 (default 0) to enable vector index
SET GLOBAL experimental_hnsw_index = 1;
DROP TABLE IF EXISTS t1;
CREATE TABLE vector_index_02(a bigint primary key, b vecf32(3), c int);
INSERT INTO vector_index_02 VALUES(1, "[1, 0, 1]", 3);
CREATE INDEX idx01 USING hnsw ON vector_index_02(b) OP_TYPE "vector_l2_ops" M 48 EF_CONSTRUCTION 64 EF_SEARCH 64;

mysql> SHOW CREATE TABLE vector_index_02;
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table           | Create Table                                                                                                                                                                                                                               |
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| vector_index_02 | CREATE TABLE `vector_index_02` (
`a` bigint NOT NULL,
`b` vecf32(3) DEFAULT NULL,
`c` int DEFAULT NULL,
PRIMARY KEY (`a`),
KEY `idx01` USING hnsw (`b`) m = 48 ef_construction = 64 ef_search = 64 op_type 'vector_l2_ops'
) |
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> DESC vector_index_02;
+-------+------------+------+------+---------+-------+---------+
| Field | Type       | Null | Key  | Default | Extra | Comment |
+-------+------------+------+------+---------+-------+---------+
| a     | BIGINT(64) | NO   | PRI  | NULL    |       |         |
| b     | VECF32(3)  | YES  | MUL  | NULL    |       |         |
| c     | INT(32)    | YES  |      | NULL    |       |         |
+-------+------------+------+------+---------+-------+---------+
3 rows in set (0.03 sec)
```

## Limitations

- Requires a bigint primary key as the primary key
- Only supports vecf32 vector type, does not support vecf64 vector type