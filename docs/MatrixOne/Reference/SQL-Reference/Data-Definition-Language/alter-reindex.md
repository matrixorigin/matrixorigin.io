# ALTER REINDEX

## Syntax Description

`ALTER TABLE ... ALTER REINDEX` is used to repartition data in a vector table.

When data records within a vector scale grow significantly, the original cluster center set may no longer be applicable. To do this, we have to re-index the data with the aim of identifying new cluster centers and repartitioning the dataset accordingly.

!!! note
    A data insertion operation cannot be performed on this table while the index is being reconstructed.

The ideal values for LISTS are:

- If total rows <1000000:lists=total rows/1000
- If total rows > 1000000:lists=sqrt (total rows)

## Syntax structure

```
> ALTER TABLE table_name ALTER REINDEX  index_name LISTS=XX
```

## Examples

```sql
SET GLOBAL experimental_ivf_index = 1;--The parameter experimental_ivf_index needs to be set to 1 (default 0) to use vector indexes.
drop table if exists t1;
create table t1(n1 int,n2  vecf32(3));
insert into t1 values(1,"[1,2,3]"),(2,"[2,3,4]"),(3,"[3,4,5]");
create index idx_t1 using ivfflat on t1(n2)  lists=2 op_type "vector_l2_ops";

mysql> show create table t1;
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                    |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`n1` INT DEFAULT NULL,
`n2` VECF32(3) DEFAULT NULL,
KEY `idx_t1` USING ivfflat (`n2`) lists = 2  op_type 'vector_l2_ops' 
) |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show index from t1;
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Index_params                            | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
| t1    |          1 | idx_t1   |            1 | n2          | A         |           0 | NULL     | NULL   | YES  | ivfflat    |         |               | {"lists":"2","op_type":"vector_l2_ops"} | YES     | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-----------------------------------------+---------+------------+
1 row in set (0.00 sec)

mysql> alter table t1 alter reindex idx_t1 ivfflat lists=100;
Query OK, 0 rows affected (0.03 sec)

mysql> show create table t1;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                      |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`n1` INT DEFAULT NULL,
`n2` VECF32(3) DEFAULT NULL,
KEY `idx_t1` USING ivfflat (`n2`) lists = 100  op_type 'vector_l2_ops' 
) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> show index from t1;
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-------------------------------------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Index_params                              | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-------------------------------------------+---------+------------+
| t1    |          1 | idx_t1   |            1 | n2          | A         |           0 | NULL     | NULL   | YES  | ivfflat    |         |               | {"lists":"100","op_type":"vector_l2_ops"} | YES     | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+-------------------------------------------+---------+------------+
1 row in set (0.01 sec)
```
