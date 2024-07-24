# Get information with `EXPLAIN ANALYZE`

`EXPLAIN ANALYZE` is an analysis tool for queries that shows you how long SQL spends on queries and why. It will schedule the query, detect it, and execute it, while counting the rows and measuring the time spent at various points in the execution plan. When execution is complete, `EXPLAIN ANALYZE` prints the plan and measurements instead of querying the results.

`EXPLAIN ANALYZE`, which runs SQL statements to produce `EXPLAIN` output, in addition to other information, such as time and iterator-based additional information, and about the expected versus actual execution of the optimizer.

For each iterator, provide the following information:

- Estimated implementation costs

   Some iterators are not considered in the cost model and are therefore not included in the estimate.

- Estimated number of rows returned

- Returns the time of the first row

- Time, in milliseconds, spent executing this iterator (including only child iterators but not parent iterators).

- Number of rows returned by the iterator

- Number of cycles

Query execution information is displayed using the `TREE` output format, where nodes represent iterators. `EXPLAIN ANALYZE` always uses the `TREE` output format.

`EXPLAIN ANALYZE` can be used with `SELECT` statements or with multi-table `UPDATE` and `DELETE` statements.

You can use `KILL QUERY` or `CTRL-C` to terminate this statement.

`EXPLAIN ANALYZE` cannot be used with `FOR CONNECTION`.

## Examples

**Building table**

```sql
CREATE TABLE t1 (
    c1 INTEGER DEFAULT NULL,
    c2 INTEGER DEFAULT NULL
);

CREATE TABLE t2 (
    c1 INTEGER DEFAULT NULL,
    c2 INTEGER DEFAULT NULL
);

CREATE TABLE t3 (
    pk INTEGER NOT NULL PRIMARY KEY,
    i INTEGER DEFAULT NULL
);
```

**Table output results**:

```sql
> mysql> EXPLAIN ANALYZE SELECT * FROM t1 JOIN t2 ON (t1.c1 = t2.c2)\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Join
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=16441bytes
*************************** 5. row ***************************
QUERY PLAN:         Join Type: INNER
*************************** 6. row ***************************
QUERY PLAN:         Join Cond: (t1.c1 = t2.c2)
*************************** 7. row ***************************
QUERY PLAN:         ->  Table Scan on tpch.t1
*************************** 8. row ***************************
QUERY PLAN:               Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 9. row ***************************
QUERY PLAN:         ->  Table Scan on tpch.t2
*************************** 10. row ***************************
QUERY PLAN:               Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
10 rows in set (0.00 sec)

> EXPLAIN ANALYZE SELECT * FROM t3 WHERE i > 8\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Table Scan on tpch.t3
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 5. row ***************************
QUERY PLAN:         Filter Cond: (t3.i > 8)
5 rows in set (0.00 sec)

> EXPLAIN ANALYZE SELECT * FROM t3 WHERE pk > 17\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Table Scan on tpch.t3
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 5. row ***************************
QUERY PLAN:         Filter Cond: (t3.pk > 17)
5 rows in set (0.01 sec)
```
