# MatrixOne Query Execution Plan Overview

## What is Query Execution Plan?

Execution plan is the specific steps for the database to execute SQL statements, such as accessing data in the table through index or full table scan, connection query implementation method and connection sequence, etc.; the execution plan is based on The details of your tables, columns, indexes, and conditions in the `WHERE` clause can tell you how the query will be executed or how it has been executed, which can be performed without reading all rows. Huge Queries of tables; joins involving multiple tables can be performed without comparing every combination of rows. If the performance of a SQL statement is not satisfactory, the first thing you should look at is its execution plan. Like most mature database products, MatrixOne database also provides the function of analyzing query statement performance.

The MatrixOne query optimizer selects the most efficient execution plan by "calculating" the input SQL statement, and this execution plan is the execution plan.

## Use `EXPLAIN` to query the execution plan

The `EXPLAIN` statement shows the MatrixOne query execution plan for the SQL statement.

`EXPLAIN` works with `SELECT`, `DELETE`, `INSERT`, `REPLACE`, and `UPDATE` statements.

When `EXPLAIN` is used with an explainable statement, MatrixOne displays information from the optimizer about the statement execution plan. That is, MatrixOne explains how it would process the statement, including information about how tables are joined and in which order.

!!! note
    When you use the MatrixOne client to connect to MatrixOne, to read the output result in a clearer way without line wrapping, you can use the `pager less -S` command. Then, after the `EXPLAIN` result is output, you can press the right arrow **→** button on your keyboard to horizontally scroll through the output.

## EXPLAIN Example

You can see the `EXPLAIN` example to understand the query execution plan:

**Data preparation**:

```sql
CREATE TABLE t (id INT NOT NULL PRIMARY KEY auto_increment, a INT NOT NULL, pad1 VARCHAR(255), INDEX(a));
INSERT INTO t VALUES (1, 1, 'aaa'),(2,2, 'bbb');
EXPLAIN SELECT * FROM t WHERE a = 1;
```

**Return result**:

```sql
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on aab.t                      |
|         Filter Cond: (CAST(t.a AS BIGINT) = 1) |
+------------------------------------------------+
```

`EXPLAIN` does not execute the actual query. `EXPLAIN ANALYZE` can be used to execute the query and show `EXPLAIN` information. This can be useful in diagnosing cases where the execution plan selected is suboptimal.

**EXPLAIN output analysis**

- QUERY PLAN: the name of an operator.

    + Filter Cond:Filter conditions
    + Table Scan:scans the table

- **Project** is the parent node of the executive order in the query process. The structure of the Project is tree-like, and the child node "flows into" the parent node after the calculation is completed. The parent, child, and sibling nodes may execute parts of the query in parallel.

**Range query**

In the `WHERE/HAVING/ON` conditions, the MatrixOne optimizer analyzes the result returned by the primary key query. For example, these conditions might include comparison operators of the numeric and date type, such as `>`, `<`, `=`, `>=`, `<=`, and the character type such as `LIKE`.
