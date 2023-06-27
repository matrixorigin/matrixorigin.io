# Create View

## What is View

View is a visual, read-only virtual table based on the result set of an SQL statement, whose content is defined by the query. Unlike ordinary tables (tables that store data), views do not contain data but are only formatted displays of query results based on the base table (the table being queried). You can think of a view as a window on a table; the data in this window is reflected on other tables. When a view is queried, the database applies its SQL query to its underlying tables.

## Advantages of Views

- Simplify queries: For complex queries, you can create views to hide the complexity of the query, and you only need to select data from the view without remembering complex query statements.

- Add an extra layer of security: Views can restrict user's access to specific database fields and only display the fields they need to see, which can protect the security of the data.

- Maintain data consistency: Creating a view can maintain data consistency if multiple queries need to use the same query clause.

- Logical abstraction: Views can represent functional parts of base table data, summaries, and information from several tables.

But Views also have disadvantages:

- Performance: Querying data from a database view can be slow, especially if the view is created based on other views.

- Depends on other tables: A view will be created based on the underlying tables of the database. Not all views support updating data, depending on the definition of the view and its underlying tables.

## Before you start

Before reading this document, make sure that the following tasks are completed:

- Build a MatrixOne Cluster in MatrixOne.
- Read the [Database Schema Design Overview](overview.md).
- The database has been created.

## How to use views

The syntax for creating a view is as follows:

```sql
CREATE VIEW view_name AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

After creating a view, you can query it like any other table:

```sql
SELECT column1, column2, ...
FROM view_name;
```

## Example

```sql
-- Create a table called 'orders'
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    order_amount DOUBLE,
    PRIMARY KEY (order_id)
);

-- Insert some data into the 'orders' table
INSERT INTO orders (customer_id, order_date, order_amount)
VALUES (1, '2023-01-01', 99.99),
       (1, '2023-01-03', 29.99),
       (2, '2023-01-03', 49.99),
       (3, '2023-01-05', 89.99),
       (1, '2023-01-07', 59.99),
       (2, '2023-01-07', 19.99);

-- Create a view called 'order_summary' that shows the total order quantity and total order amount for each customer
CREATE VIEW order_summary AS
SELECT customer_id, COUNT(*) as order_count, SUM(order_amount) as total_amount
FROM orders
GROUP BY customer_id;

--  Query view
mysql> SELECT *
FROM order_summary;
+-------------+-------------+--------------+
| customer_id | order_count | total_amount |
+-------------+-------------+--------------+
|           1 |           3 |       189.97 |
|           2 |           2 |        69.98 |
|           3 |           1 |        89.99 |
+-------------+-------------+--------------+
3 rows in set (0.01 sec)
```
