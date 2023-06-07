# Optimizer Hints

When you determine the problems in the execution plan, such as when the optimizer chooses a query plan that is not optimal, you can use Optimizer Hints to control the generation of the execution plan.

The `Hint` hint command tells the query optimizer how to execute the query statement. By using hints, you can provide queries with information about how to access data to improve query performance. The `Hint` hint directive often tunes large or complex queries.

Hints can be used to modify the execution plan of a query, including choosing a different index, using a different `JOIN` algorithm, changing the join order, etc. <!--Hints can be used to control the cache behavior of the query, such as forcing the cache to be refreshed or not caching the query results. -->

Hints in SQL use comment syntax, and specific comments can be added to query statements to specify hints.

## Syntax

```
{DELETE|INSERT|SELECT|UPDATE} /*+ hint [text] [hint[text]]... */
```

### Explanations

- `DELETE`, `INSERT`, `SELECT`, `UPDATE` are keywords of SQL statements.

- `/*+ */` is a comment symbol in the SQL statement.

- `hint` is the specific instruction for hinting.

- `text` is the argument to the prompt command.

Here are some commonly used SQL hints:

`/*+ INDEX (table index) */`: Specifies to use a specific index to execute the query.

`/*+ FULL (table) */`: Specifies to perform a full table scan instead of using an index.

<!--/*+ NOCACHE */: Specifies not to cache query results. -->

<!--/*+ USE_HASH (table) */: Specifies to use the hash join algorithm. -->

## Scenarios

- When the query optimizer chooses an inappropriate execution plan, you can use the `hint` hint to specify a better execution plan. For example, when a query involves multiple tables, the optimizer may choose the wrong join algorithm or join order, resulting in degraded query performance. In this case, hints can be used to specify a better join algorithm or join order.

- When a query contains complex subqueries or aggregate functions, the `hint` hint can be used to optimize the execution plan of the query. Because the optimizer cannot analyze complex subqueries or aggregate functions, it may choose the wrong execution plan, resulting in degraded query performance.

- When the amount of data accessed by the query is vast, the `hint` hint can be used to optimize the query execution plan. In this case, hints can be used to specify the use of a specific index or join algorithm to improve query performance.

MatrixOne supports the use of `hint` hints to choose between full table scans or index scans and to optimize the order of multi-table joins.

- Select full table scan or use index scan:

An index scan can speed up queries, but in some cases, a full table scan might be faster than an index scan. For example, using indexes can become slow when query conditions are too broad. In this case, the following hint syntax can be used to choose to use a full table scan or an index scan:

```sql
SELECT /*+ INDEX(table_name index_name) */ column_name FROM table_name WHERE ...
```

Among them, table_name is the table name, index_name is the index name, and column_name is the column name. If an index name is specified, the query will scan that index. The query will use a full table scan if no index name is specified.

- Optimize the order of multi-table joins:

When a query involves multiple tables, the query optimizer will try to choose the optimal join order. However, in some cases, the optimizer may be unable to select the optimal join order, resulting in degraded query performance. In this case, the following hint syntax can be used to optimize the order of multi-table joins:

```sql
SELECT /*+ ORDERED */ column_name FROM table1, table2 WHERE table1.column1 = table2.column2;
```

Among them, ORDERED specifies that the query should be connected in the order of the tables, that is, connect table1 first and then join table2. This prevents the optimizer from choosing the wrong join order, improving query performance.

## Example

```sql
-- Create a new table called orders
CREATE TABLE order (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  order_total DECIMAL(10, 2)
);
-- insert datas
INSERT INTO order (order_id, customer_id, order_date, order_total)
VALUES
  (1, 101, '2022-05-10', 100.00),
  (2, 102, '2022-05-09', 150.00),
  (3, 103, '2022-05-08', 200.00),
  (4, 104, '2022-05-07', 50.00);
-- Query all orders of a customer and sort them in descending order by order date
SELECT order_id, order_date, order_total
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC;
```

To optimize this query, we can use the following `hint` hints:

```sql
-- Execute the query using an index called idx_customer_id created on the customer_id field
SELECT /*+ INDEX(orders idx_customer_id) */ order_id, order_date, order_total
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC;
```

## Constraints

Currently `/*+ HINT_NAME(t1, t2) */` only implements the syntax, and cannot control the execution plan for now.
