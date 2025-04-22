# Using EXPLAIN to learn the execution plan

Because SQL is a declarative language, you cannot automatically tell whether a query is executed efficiently. You must first use the `EXPLAIN` statement to learn the current execution plan.

## Example

We have prepared a simple example to help you understand how to interpret an execution plan using `EXPLAIN`.

```sql
> drop table if exists a;
> create table a(a int);
> insert into a values(1),(2),(3),(4),(5),(6),(7),(8);
> select count(*) from a where a>=2 and a<=8;
+----------+
| count(*) |
+----------+
|        7 |
+----------+
1 row in set (0.00 sec)

> explain select count(*) from a where a>=2 and a<=8;
+-----------------------------------------------------------------------------------+
| QUERY PLAN                                                                        |
+-----------------------------------------------------------------------------------+
| Project                                                                           |
|   ->  Aggregate                                                                   |
|         Aggregate Functions: starcount(1)                                         |
|         ->  Table Scan on aab.a                                                   |
|               Filter Cond: (CAST(a.a AS BIGINT) >= 2), (CAST(a.a AS BIGINT) <= 8) |
+-----------------------------------------------------------------------------------+
5 rows in set (0.00 sec)
```

Above are the execution plan results for this query. Starting from the `Filter Cond` operator, the execution process of the query is as follows:

1. Execute the Filter condition `Filter Cond` first: the integer whose data type is `BIGINT` and is greater than or equal to 2 and less than or equal to 8 is filtered out. According to the calculation reasoning, it should be `(2)`,`(3)`,`(4)`,`(5)`,`(6)`,`(7)`,`(8)`.

2. Scan Table in database *aab*.

3. The number of integers is 7.

In the end, the query result is 7, which means `count(*)` = 7.

### Assess the current performance

`EXPLAIN` only returns the query execution plan but does not execute the query.

#### What is EXPLAIN ANALYZE

EXPLAIN ANALYZE is a profiling tool for your queries that will show you where SQL spends time on your query and why. It will plan the query, instrument it and execute it while counting rows and measuring time spent at various points in the execution plan. When execution finishes, EXPLAIN ANALYZE will print the plan and the measurements instead of the query result.

n addition to the query plan and estimated costs, which a normal EXPLAIN will print, EXPLAIN ANALYZE also prints the actual costs of individual iterators in the execution plan.

#### How to use EXPLAIN ANALYZE?

With the above example, to get the actual execution time, you can either execute the query or use `EXPLAIN ANALYZE`:

```sql
> explain analyze select count(*) from a where a>=2 and a<=8;
+-------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                    |
+-------------------------------------------------------------------------------------------------------------------------------+
| Project                                                                                                                       |
|   Analyze: timeConsumed=0us inputRows=1 outputRows=1 inputSize=8bytes outputSize=8bytes memorySize=8bytes                     |
|   ->  Aggregate                                                                                                               |
|         Analyze: timeConsumed=3317us inputRows=2 outputRows=2 inputSize=8bytes outputSize=16bytes memorySize=16bytes          |
|         Aggregate Functions: starcount(1)                                                                                     |
|         ->  Table Scan on aab.a                                                                                               |
|               Analyze: timeConsumed=6643us inputRows=31 outputRows=24 inputSize=96bytes outputSize=64bytes memorySize=64bytes |
|               Filter Cond: (CAST(a.a AS BIGINT) >= 2), (CAST(a.a AS BIGINT) <= 8)                                             |
+-------------------------------------------------------------------------------------------------------------------------------+
8 rows in set (0.00 sec)
```

Judging from the printed execution results, when performing aggregate calculations and scanning tables respectively, the following measurements are obtained, which can be used as reference items:

- total time consumed: timeConsumed
- inputRows/outputRows
- inputSize/outputSize
- memorySize

With this information, you can analyze queries and understand why they behave the way they do, which can be explored in the following ways:

- How long do these queries take to execute? You'll be able to view the `timeConsumed`.

- Why execute the current query plan instead of other execution plans? You can look at the row counter. When there is a significant difference (i.e., several orders of magnitude or more) between the estimated and actual number of rows, it means that the optimizer chooses a plan based on the estimate, but looking at the actual execution can give you a good idea of ​​which execution plan is better.

So using EXPLAIN ANALYZE is analyzing query execution.

The example query above takes 0.00 seconds to execute, which is an ideal performance. Also, because the query we executed in this example is simple, it meets the high execution performance.

For more information, see [EXPLAIN ANALYZE](../../Reference/SQL-Reference/Other/Explain/explain-analyze.md).
