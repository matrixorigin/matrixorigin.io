# enable_remap_hint Query Rewrite Hint Support

`enable_remap_hint` is a system variable that enables the Remap Hint feature in SQL queries. When enabled, you can add JSON-formatted comments before SQL statements to map table names to custom queries, achieving dynamic query rewriting.

## Overview

The Remap Hint feature allows you to:

- **Virtual Table Mapping**: Map non-existent table names to actual queries without creating views
- **Dynamic View Replacement**: Define query logic directly in SQL for greater flexibility
- **Aggregate Query Rewriting**: Rewrite simple table queries into complex aggregate queries
- **Multi-table Rewriting**: Rewrite multiple tables simultaneously in a single query

## Enable/Disable Settings

`enable_remap_hint` is disabled by default (value is 0).

- Enable for current session only:

```sql
SET enable_remap_hint = 1;
```

- Enable globally:

```sql
SET GLOBAL enable_remap_hint = 1;
```

- Disable:

```sql
SET enable_remap_hint = 0;
```

## Syntax

```sql
/*+ {
    "rewrites": {
        "database.table_name": "SELECT ... FROM real_table ..."
    }
} */
SELECT * FROM table_name;
```

### Syntax Description

- `/*+ ... */`: Hint comment format, must be placed immediately before the SQL statement
- `rewrites`: JSON object containing mappings from table names to query statements
- **Key format**: Must be in `database.table` format (including the database name)
- **Value format**: Must be a valid SELECT statement

## Examples

### Example 1: Single Table Rewrite

Rewrite a query on table `t1` to return only column `a`:

```sql
-- Enable remap hint
SET enable_remap_hint = 1;

-- Create test table
CREATE DATABASE IF NOT EXISTS db1;
USE db1;
CREATE TABLE t1 (a INT, b INT, c INT);
INSERT INTO t1 VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9);

-- Use remap hint to rewrite the query
/*+ {"rewrites": {"db1.t1": "SELECT a FROM db1.t1"}} */
SELECT * FROM t1;
```

Result:

```
+------+
| a    |
+------+
|    1 |
|    4 |
|    7 |
+------+
```

### Example 2: Virtual Summary Table

Create a virtual summary table that maps to an aggregate query:

```sql
-- Create sales table (assuming we are in db1)
CREATE TABLE sales (
    product_id INT,
    quantity INT,
    sale_date DATE
);
INSERT INTO sales VALUES
    (1, 10, '2024-01-01'),
    (1, 15, '2024-01-02'),
    (2, 20, '2024-01-01'),
    (2, 25, '2024-01-02');

-- Virtual summary table - sales_summary does not actually exist
-- The hint rewrites db1.sales_summary to an aggregate query on db1.sales
/*+ {
    "rewrites": {
        "db1.sales_summary": "SELECT product_id, SUM(quantity) AS total_quantity FROM db1.sales GROUP BY product_id"
    }
} */
SELECT * FROM db1.sales_summary WHERE total_quantity > 20;
```

Result:

```
+------------+----------------+
| product_id | total_quantity |
+------------+----------------+
|          1 |             25 |
|          2 |             45 |
+------------+----------------+
```

### Example 3: Multi-table Rewriting

Rewrite multiple tables simultaneously:

```sql
-- Create orders and products tables
CREATE TABLE orders (order_id INT, product_id INT, status VARCHAR(20));
CREATE TABLE products (product_id INT, product_name VARCHAR(50), category VARCHAR(20));

INSERT INTO orders VALUES (1, 101, 'completed'), (2, 102, 'pending'), (3, 101, 'completed');
INSERT INTO products VALUES (101, 'Laptop', 'Electronics'), (102, 'Book', 'Education');

-- Rewrite both tables simultaneously
/*+ {
    "rewrites": {
        "db1.orders": "SELECT * FROM db1.orders WHERE status = 'completed'",
        "db1.products": "SELECT * FROM db1.products WHERE category = 'Electronics'"
    }
} */
SELECT o.order_id, p.product_name
FROM orders o
JOIN products p ON o.product_id = p.product_id;
```

Result:

```
+----------+--------------+
| order_id | product_name |
+----------+--------------+
|        1 | Laptop       |
|        3 | Laptop       |
+----------+--------------+
```

### Example 4: Rewriting with Filter Conditions

Use rewriting to add default filter conditions to a table:

```sql
CREATE TABLE users (id INT, name VARCHAR(50), status VARCHAR(20));
INSERT INTO users VALUES (1, 'Alice', 'active'), (2, 'Bob', 'inactive'), (3, 'Carol', 'active');

-- Map db1.active_users to query only active users from db1.users
/*+ {
    "rewrites": {
        "db1.active_users": "SELECT * FROM db1.users WHERE status = 'active'"
    }
} */
SELECT * FROM db1.active_users;
```

Result:

```
+------+-------+--------+
| id   | name  | status |
+------+-------+--------+
|    1 | Alice | active |
|    3 | Carol | active |
+------+-------+--------+
```

### Example 5: Rewriting with Window Functions

Use rewriting to implement complex window function queries:

```sql
CREATE TABLE employee_sales (emp_id INT, department VARCHAR(20), monthly_sales DECIMAL(10,2));
INSERT INTO employee_sales VALUES
    (1, 'Sales', 5000.00),
    (2, 'Sales', 7000.00),
    (3, 'Marketing', 4500.00),
    (4, 'Marketing', 6000.00);

-- Use window function to calculate department ranking
/*+ {
    "rewrites": {
        "db1.sales_rank": "SELECT emp_id, department, monthly_sales, RANK() OVER (PARTITION BY department ORDER BY monthly_sales DESC) AS dept_rank FROM db1.employee_sales"
    }
} */
SELECT * FROM db1.sales_rank WHERE dept_rank = 1;
```

Result:

```
+--------+------------+---------------+-----------+
| emp_id | department | monthly_sales | dept_rank |
+--------+------------+---------------+-----------+
|      4 | Marketing  |       6000.00 |         1 |
|      2 | Sales      |       7000.00 |         1 |
+--------+------------+---------------+-----------+
```

## Error Handling

You may encounter the following errors when using Remap Hint:

| Error Type | Example Error Message | Solution |
| --- | --- | --- |
| Invalid JSON format | `invalid character 'r' looking for beginning of object key string` | Ensure the JSON format is correct; all keys and values must use double quotes |
| Key missing database name | `the mapping name needs to include database name` | Key must be in `database.table` format |
| Empty database or table name | `empty table or database` | Neither database name nor table name can be empty |
| Value is not SELECT | `only accept SELECT-like statements as rewrites` | Value must be a SELECT statement |
| Referenced table does not exist | `table "xxx" does not exist` | Ensure the tables referenced in Value exist |
| SQL syntax error | `You have an error in your SQL syntax` | Check the SQL syntax in Value |

## Constraints

- **SELECT statements only**: Remap Hint only works with SELECT statements; INSERT, UPDATE, DELETE, and other statements are ignored
- **Key must include database name**: Format must be `database.table`; table name alone is not allowed
- **Value must be a SELECT statement**: DDL or other DML statements are not allowed
- **No recursive rewriting**: Tables in the rewrite target will not be rewritten again
- **Comment format**: Only `/*+ */` format is supported

## Use Cases

1. **Rapid Prototyping**: Define virtual tables directly in SQL without creating views
2. **Dynamic Reporting**: Dynamically adjust query logic as needed
3. **Data Abstraction**: Create simple table aliases for complex queries
4. **Testing and Debugging**: Temporarily replace table data sources for testing
5. **Performance Optimization**: Rewrite wide table queries to select only required columns
