# EXPLAIN Output Format

## Output Structure

The syntax structure execution result is a textual description of the plan selected for the `statement`, optionally annotated with execution statistics.

The following is an example of an output structure using query analysis of a dataset in [TPCH]( ../../../../Test/performance-testing/TPCH-test-with-matrixone.md):

```
explain SELECT * FROM customer WHERE c_nationkey = (SELECT n_nationkey FROM nation
WHERE customer.c_nationkey  = nation.n_nationkey  AND nation.n_nationkey > 5);
```

```
mysql> explain SELECT * FROM customer WHERE c_nationkey = (SELECT n_nationkey FROM nation
    -> WHERE customer.c_nationkey  = nation.n_nationkey  AND nation.n_nationkey > 5);
+----------------------------------------------------------------------+
| QUERY PLAN                                                           |
+----------------------------------------------------------------------+
| Project                                                              |
|   ->  Filter                                                         |
|         Filter Cond: (customer.c_nationkey = nation.n_nationkey)     |
|         ->  Join                                                     |
|               Join Type: SINGLE   hashOnPK                           |
|               Join Cond: (customer.c_nationkey = nation.n_nationkey) |
|               ->  Table Scan on tpch.customer                        |
|               ->  Table Scan on tpch.nation                          |
|                     Filter Cond: (nation.n_nationkey > 5)            |
|                     Block Filter Cond: (nation.n_nationkey > 5)      |
+----------------------------------------------------------------------+
10 rows in set (0.01 sec)
```

EXPLAIN 输出一个名
EXPLAIN outputs a tree structure named `QUERY PLAN`, with each leaf node containing the node type, affected objects. We will now only use node type information to simplify the presentation of the example above. The `QUERY PLAN` tree visualizes the entire process of a SQL query, showing the nodes through which it operates.

```
Project
└── Filter
    └── Join
        └── Table Scan
        └──	Table Scan
```

## Node Type

MatrixOne supports the following node types.

| Node name                      | meaning             |
|: -------------------------- |: --------------- |
| Values Scan	              | Scanning of processed values|
| Table Scan	              | Scanning data from a table|
| External Scan	              | Handling external data scanning|
| Source Scan	              | Processing a data scan of the source table
| Project	                  | Projective operations on data|
| Sink	                      | Distribute the same data to one / more objects|
| Sink Scan                   | Read data distributed by other objects|
| Recursive Scan	          | In the loop CTE syntax, the data at the end of each loop is processed to determine whether to open the next round of looping |
| CTE Scan	                  | Loop CTE syntax to read the data at the beginning of each loop |
| Aggregate	                  | Aggregation of data|
| Filter	                  | Filtering of data|
| Join	                      | Concatenation of data|
| Sample                      |	SAMPLE Sampling function to sample the data|
| Sort	                      | Sorting data|
| Partition                   | Sorting data in the range window and slicing by value|
| Union	                      | Combining result sets for two or more queries|
| Union All	                  | Combination of result sets for two or more queries, including duplicate rows|
| Window	                  | Perform range window calculations on data|
| Time Window	              | Perform time window calculations on data|
| Fill	                      | Handling NULL values in the time window|
| Insert	                  | Insertion of data|
| Delete	                  | Deletion of data|
| Intersect                   | Combination of rows that exist for two or more queries|
| Intersect All	              | Combination of rows that exist for two or more queries, including duplicate rows.|
| Minus	                      | Compares the results of two queries and returns the rows that exist in the first query but not in the second query|
| Table Function              | Reading data through table functions|
| PreInsert	                  | Organize the data to be written|
| PreInsert UniqueKey	      | Organize the data to be written to the unique key hidden table|
| PreInsert SecondaryKey	  | Organize the data to be written to the secondary index hidden table|
| PreDelete	                  | Organize the data that needs to be deleted from the partitioned table.|
| On Duplicate Key	          | Updates to duplicate data|
| Fuzzy Filter for duplicate key	| De-duplication of written/updated data|
| Lock	                      |Locking the data of an operation|

## Example

### VALUES Scan & Project

```sql
mysql> explain  select abs(-1);
+-------------------------------+
| QUERY PLAN                    |
+-------------------------------+
| Project                       |
|   ->  Values Scan "*VALUES*"  |
+-------------------------------+
2 rows in set (0.00 sec)
```

### Table Scan

```sql
mysql> explain select * from customer;
+-----------------------------------+
| QUERY PLAN                        |
+-----------------------------------+
| Project                           |
|   ->  Table Scan on tpch.customer |
+-----------------------------------+
2 rows in set (0.01 sec)
```

### External Scan

```sql
mysql> create external table extable(n1 int)infile{"filepath"='yourpath/xx.csv'} ;
Query OK, 0 rows affected (0.03 sec)

mysql> explain select * from extable;
+------------------------------------+
| QUERY PLAN                         |
+------------------------------------+
| Project                            |
|   ->  External Scan on db1.extable |
+------------------------------------+
2 rows in set (0.01 sec)
```

### Sink & Lock & Delete & Insert & PreInsert & Sink Scan

```sql
mysql> create table t3(n1 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t3 values(1);
Query OK, 1 row affected (0.01 sec)

mysql> explain update t3 set n1=2;
+-----------------------------------------------+
| QUERY PLAN                                    |
+-----------------------------------------------+
| Plan 0:                                       |
| Sink                                          |
|   ->  Lock                                    |
|         ->  Project                           |
|               ->  Project                     |
|                     ->  Table Scan on tpch.t3 |
| Plan 1:                                       |
| Delete on tpch.t3                             |
|   ->  Sink Scan                               |
|         DataSource: Plan 0                    |
| Plan 2:                                       |
| Insert on tpch.t3                             |
|   ->  Project                                 |
|         ->  PreInsert on tpch.t3              |
|               ->  Project                     |
|                     ->  Sink Scan             |
|                           DataSource: Plan 0  |
+-----------------------------------------------+
17 rows in set (0.00 sec)
```

### Recursive Scan & CTE Scan & Filter

```sql
mysql> create table t4(n1 int,n2 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t4 values(1,1),(2,2),(3,3);
Query OK, 3 rows affected (0.01 sec)

mysql> explain WITH RECURSIVE t4_1(n1_1) AS (
    ->     SELECT n1 FROM t4 
    ->     UNION all
    ->     SELECT n1_1 FROM t4_1 WHERE n1_1=1
    -> )
    -> SELECT * FROM t4_1;
+---------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                        |
+---------------------------------------------------------------------------------------------------+
| Plan 0:                                                                                           |
| Sink                                                                                              |
|   ->  Project                                                                                     |
|         ->  Table Scan on tpch.t4                                                                 |
| Plan 1:                                                                                           |
| Sink                                                                                              |
|   ->  Project                                                                                     |
|         ->  Filter                                                                                |
|               Filter Cond: (t4_1.n1_1 = 1), mo_check_level((t4_1.__mo_recursive_level_col < 100)) |
|               ->  Recursive Scan                                                                  |
|                     DataSource: Plan 2                                                            |
| Plan 2:                                                                                           |
| Sink                                                                                              |
|   ->  CTE Scan                                                                                    |
|         DataSource: Plan 0, Plan 1                                                                |
| Plan 3:                                                                                           |
| Project                                                                                           |
|   ->  Sink Scan                                                                                   |
|         DataSource: Plan 2                                                                        |
+---------------------------------------------------------------------------------------------------+
19 rows in set (0.00 sec)
```

### Aggregate  

```sql
mysql>  explain  SELECT count(*) FROM NATION group by N_NAME;
+-------------------------------------------+
| QUERY PLAN                                |
+-------------------------------------------+
| Project                                   |
|   ->  Aggregate                           |
|         Group Key: nation.n_name          |
|         Aggregate Functions: starcount(1) |
|         ->  Table Scan on tpch.nation     |
+-------------------------------------------+
5 rows in set (0.01 sec)
```

### Join

```sql
mysql>  create table t5(n1 int);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t5 values(1),(2),(3);
Query OK, 3 rows affected (0.01 sec)

mysql> create table t6(n1 int);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t5 values(3),(4),(5);
Query OK, 3 rows affected (0.01 sec)

mysql> explain SELECT * FROM t5 LEFT JOIN t6 ON t5.n1 = t6.n1;
+------------------------------------+
| QUERY PLAN                         |
+------------------------------------+
| Project                            |
|   ->  Join                         |
|         Join Type: LEFT            |
|         Join Cond: (t5.n1 = t6.n1) |
|         ->  Table Scan on tpch.t5  |
|         ->  Table Scan on tpch.t6  |
+------------------------------------+
6 rows in set (0.00 sec)
```

### Sample

```sql
mysql> explain SELECT SAMPLE(c_address, 90 percent) FROM customer;
+-----------------------------------------------------+
| QUERY PLAN                                          |
+-----------------------------------------------------+
| Project                                             |
|   ->  Sample                                        |
|         Sample 90.00 Percent by: customer.c_address |
|         ->  Table Scan on tpch.customer             |
+-----------------------------------------------------+
4 rows in set (0.00 sec)
```

### SORT

```sql
mysql> explain select * from customer order by c_custkey;
+-----------------------------------------------+
| QUERY PLAN                                    |
+-----------------------------------------------+
| Project                                       |
|   ->  Sort                                    |
|         Sort Key: customer.c_custkey INTERNAL |
|         ->  Table Scan on tpch.customer       |
+-----------------------------------------------+
4 rows in set (0.00 sec)
```

### Partition & Window

```sql
mysql>CREATE TABLE t7(n1 int,n2 int);
Query OK, 0 rows affected (0.01 sec)

mysql>  INSERT INTO t7 values(1,3),(2,2),(3,1);
Query OK, 3 rows affected (0.01 sec)

mysql> explain SELECT SUM(n1) OVER(PARTITION BY n2) AS sn1 FROM t7;
+----------------------------------------------------------+
| QUERY PLAN                                               |
+----------------------------------------------------------+
| Project                                                  |
|   ->  Window                                             |
|         Window Function: sum(t7.n1); Partition By: t7.n2 |
|         ->  Partition                                    |
|               Sort Key: t7.n2 INTERNAL                   |
|               ->  Table Scan on tpch.t7                  |
+----------------------------------------------------------+
6 rows in set (0.01 sec)
```

### Time window & Fill

```sql
mysql> CREATE TABLE sensor_data (ts timestamp(3) primary key, temperature FLOAT);
Query OK, 0 rows affected (0.01 sec)

mysql> INSERT INTO sensor_data VALUES('2023-08-01 00:00:00', 25.0);
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO sensor_data VALUES('2023-08-01 00:05:00', 26.0);
Query OK, 1 row affected (0.01 sec)

mysql> explain select _wstart, _wend from sensor_data  interval(ts, 10, minute)  fill(prev);
+---------------------------------------------------+
| QUERY PLAN                                        |
+---------------------------------------------------+
| Project                                           |
|   ->  Fill                                        |
|         Fill Columns:                             |
|         Fill Mode: Prev                           |
|         ->  Time window                           |
|               Sort Key: sensor_data.ts            |
|               Aggregate Functions: _wstart, _wend |
|               ->  Table Scan on db2.sensor_data   |
+---------------------------------------------------+
8 rows in set (0.00 sec)
```

### Intersect

```sql
mysql> explain select * from t5 intersect select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Intersect                         |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Intersect All

```sql
mysql> explain select * from t5 intersect all select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Intersect All                     |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Minus

```sql
mysql> explain select * from t5 minus  select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Minus                             |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Table Function

```sql
mysql>  explain select * from unnest('{"a":1}') u;
+-------------------------------------+
| QUERY PLAN                          |
+-------------------------------------+
| Project                             |
|   ->  Table Function on unnest      |
|         ->  Values Scan "*VALUES*"  |
+-------------------------------------+
3 rows in set (0.10 sec)
```

### PreInsert UniqueKey & Fuzzy Filter for duplicate key

```sql
mysql> CREATE TABLE t8(n1 int,n2 int UNIQUE key);
Query OK, 0 rows affected (0.01 sec)

mysql> explain INSERT INTO t8(n2) values(1);
+---------------------------------------------------------------------------------+
| QUERY PLAN                                                                      |
+---------------------------------------------------------------------------------+
| Plan 0:                                                                         |
| Sink                                                                            |
|   ->  PreInsert on tpch.t8                                                      |
|         ->  Project                                                             |
|               ->  Project                                                       |
|                     ->  Values Scan "*VALUES*"                                  |
| Plan 1:                                                                         |
| Sink                                                                            |
|   ->  Lock                                                                      |
|         ->  PreInsert UniqueKey                                                 |
|               ->  Sink Scan                                                     |
|                     DataSource: Plan 0                                          |
| Plan 2:                                                                         |
| Insert on tpch.__mo_index_unique_018e2d16-6629-719d-82b5-036222e9658a           |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 1                                                      |
| Plan 3:                                                                         |
| Fuzzy Filter for duplicate key                                                  |
|   ->  Table Scan on tpch.__mo_index_unique_018e2d16-6629-719d-82b5-036222e9658a |
|         Filter Cond: (__mo_index_idx_col = 1)                                   |
|         Block Filter Cond: (__mo_index_idx_col = 1)                             |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 1                                                      |
| Plan 4:                                                                         |
| Insert on tpch.t8                                                               |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 0                                                      |
+---------------------------------------------------------------------------------+
27 rows in set (0.01 sec)
```

### PreInsert SecondaryKey

```sql
mysql>  CREATE TABLE t9 ( n1 int , n2 int, KEY key2 (n2) USING BTREE);
Query OK, 0 rows affected (0.02 sec)

mysql>  explain INSERT INTO t9(n2) values(2);
+--------------------------------------------------------------------------+
| QUERY PLAN                                                               |
+--------------------------------------------------------------------------+
| Plan 0:                                                                  |
| Sink                                                                     |
|   ->  PreInsert on tpch.t9                                               |
|         ->  Project                                                      |
|               ->  Project                                                |
|                     ->  Values Scan "*VALUES*"                           |
| Plan 1:                                                                  |
| Insert on tpch.__mo_index_secondary_018e2d14-6f20-7db0-babb-c1fd505fd3c5 |
|   ->  Lock                                                               |
|         ->  PreInsert SecondaryKey                                       |
|               ->  Sink Scan                                              |
|                     DataSource: Plan 0                                   |
| Plan 2:                                                                  |
| Insert on tpch.t9                                                        |
|   ->  Sink Scan                                                          |
|         DataSource: Plan 0                                               |
+--------------------------------------------------------------------------+
16 rows in set (0.00 sec)
```
