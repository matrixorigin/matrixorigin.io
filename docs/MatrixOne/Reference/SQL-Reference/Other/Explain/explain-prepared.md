# EXPLAIN PREPARED

## Syntax Description

In MatrixOne, EXPLAIN is a command to get an execution plan for a SQL query, and PREPARE is a command to create a prepared statement. Using these two commands together provides the following advantages:

- Performance tuning: By looking at the execution plan, you can understand the efficiency of queries and identify potential performance bottlenecks.

- Security: Because PREPARE separates the structure and data of SQL statements, it helps prevent SQL injection attacks.

- Reuse: Prepared statements can be reused, which is useful when you need to execute the same query multiple times but with different parameters.

## Syntax structure

```
PREPARE stmt_name FROM preparable_stmt
```

```
EXPLAIN

where option can be one of:
    ANALYZE [ boolean ]
    VERBOSE [ boolean ]
    (FORMAT=TEXT)

FORCE EXECUTE stmt_name
```

## Examples

**Example 1**

```sql
create table t1(n1 int);
insert into t1 values(1);
prepare st_t1 from 'select * from t1';

mysql> explain force execute st_t1;
+----------------------------+
| QUERY PLAN                 |
+----------------------------+
| Project                    |
|   ->  Table Scan on db1.t1 |
+----------------------------+
2 rows in set (0.01 sec)
```

**Example 2**

```sql
create table t2 (col1 int, col2 decimal);
insert into t2 values (1,2);
prepare st from 'select * from t2 where col1 = ?';
set @A = 1;

mysql> explain force execute st using @A;
+---------------------------------------------------+
| QUERY PLAN                                        |
+---------------------------------------------------+
| Project                                           |
|   ->  Table Scan on db1.t2                        |
|         Filter Cond: (t2.col1 = cast('1' AS INT)) |
+---------------------------------------------------+
3 rows in set (0.00 sec)

mysql> explain verbose force execute st using @A;
+----------------------------------------------------------------------------------------+
| QUERY PLAN                                                                             |
+----------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                    |
|   Output: t2.col1, t2.col2                                                             |
|   ->  Table Scan on db1.t2 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1) |
|         Output: t2.col1, t2.col2                                                       |
|         Table: 't2' (0:'col1', 1:'col2')                                               |
|         Filter Cond: (t2.col1 = cast('1' AS INT))                                      |
+----------------------------------------------------------------------------------------+
6 rows in set (0.00 sec)

mysql> explain analyze force execute st using @A;
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                                    |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| Project                                                                                                                                       |
|   Analyze: timeConsumed=0ms waitTime=0ms inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=0bytes                      |
|   ->  Table Scan on db1.t2                                                                                                                    |
|         Analyze: timeConsumed=0ms waitTime=0ms inputBlocks=1 inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=21bytes |
|         Filter Cond: (t2.col1 = 1)                                                                                                            |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
5 rows in set (0.00 sec)

mysql> explain analyze verbose force execute st using @A;
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                                    |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                                                                           |
|   Output: t2.col1, t2.col2                                                                                                                    |
|   Analyze: timeConsumed=0ms waitTime=0ms inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=0bytes                      |
|   ->  Table Scan on db1.t2 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                                                        |
|         Output: t2.col1, t2.col2                                                                                                              |
|         Table: 't2' (0:'col1', 1:'col2')                                                                                                      |
|         Analyze: timeConsumed=0ms waitTime=0ms inputBlocks=1 inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=21bytes |
|         Filter Cond: (t2.col1 = 1)                                                                                                            |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
8 rows in set (0.00 sec)
```
