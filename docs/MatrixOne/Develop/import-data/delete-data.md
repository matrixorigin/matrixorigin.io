# Delete Data

This document describes how to delete data in MatrixOne using SQL statements.

## Prerequisites

Complete the [Deploy standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

## SQL Statements for Deleting Data

You can delete data in three ways: `DROP TABLE`, `TRUNCATE TABLE`, and `DELETE FROM`.

Here are the differences between them:

- [`DELETE FROM`](../../Reference/SQL-Reference/Data-Manipulation-Language/delete.md): Use `DELETE FROM` to delete specific records.
- [`TRUNCATE TABLE`](../../Reference/SQL-Reference/Data-Definition-Language/truncate-table.md): Use `TRUNCATE TABLE` when you want to keep the table structure, indexes, and constraints intact, but delete all records.
- [`DROP TABLE`](../../Reference/SQL-Reference/Data-Definition-Language/drop-table.md): Use `DROP TABLE` when you no longer need the table.

### `DELETE`

```
DELETE FROM tbl_name [[AS] tbl_alias]
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

1. `DELETE FROM tbl_name`: Specifies the target table from which data will be deleted. `tbl_name` is the table name.

2. `[AS] tbl_alias` (optional): You can use the AS keyword to assign a table alias (`tbl_alias`) to the target table. The alias is optional and used to simplify the query and reference the table in the statement.

3. `[WHERE where_condition]` (optional): The WHERE clause specifies the conditions for deleting data. Only rows that satisfy the specified conditions will be deleted. `where_condition` is a logical expression that can use various comparisons and logical operators to define the conditions.

4. `[ORDER BY ...]` (optional): The ORDER BY clause is used to sort the rows to be deleted based on specified columns. You can use one or more columns and specify ascending (ASC) or descending (DESC) order. The sorting affects the order of the deleted rows.

5. `[LIMIT row_count]` (optional): The LIMIT clause limits the number of rows deleted from the table. It specifies the maximum number of rows (`row_count`) to be deleted. If the LIMIT clause is not specified, all rows satisfying the WHERE condition will be deleted.

### `TRUNCATE`

```
TRUNCATE [TABLE] table_name;
```

The `TRUNCATE` statement deletes all data in a table while preserving the table structure. It quickly clears the table without deleting rows one by one.

- `[TABLE]` (optional) is a keyword that provides more explicit syntax but can be omitted in most database systems.
- `table_name` is the name of the target table.

### `DROP`

```
DROP TABLE [IF EXISTS] [db.]name
```

The `DROP TABLE` statement completely removes a table, including its structure and data, from the database.

- `[IF EXISTS]` (optional) is a keyword that performs the deletion only if the table exists. An error will occur if omitted, and the table to be dropped does not exist.
- `[db.]` (optional) specifies the database name where the table resides. If no database name is provided, the current database is assumed.
- `name` is the name of the table to be dropped.

## Garbage Collection

By default, MatrixOne does not immediately delete data from the disk after running `DELETE`, `DROP`, or `TRUNCATE` statements. Instead, it marks the data as deletable. Then, the GC (Garbage Collection) mechanism periodically scans and cleans up the no longer-needed old data.

By default, the garbage collection mechanism scans every 30 minutes. During each scan, it identifies data deleted through SQL statements for over 1 hour and starts the cleanup process to release disk space. The most extended cycle to complete all deletions is 90 minutes. Therefore, it is essential to note that executing `DELETE`, `DROP`, or `TRUNCATE` statements do not immediately reduce disk usage. Only data marked as deletable during the garbage collection will be cleaned up, and disk space will be freed.

## Examples

- Example 1

```sql
-- Create table
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department VARCHAR(50)
);

-- Insert data
INSERT INTO employees (id, name, department)
VALUES (1, 'John Doe', 'HR'),
       (2, 'Jane Smith', 'Marketing'),
       (3, 'Mike Johnson', 'IT'),
       (4, 'Emily Brown', 'Finance');

-- View initial data
mysql> SELECT * FROM employees;
+------+--------------+------------+
| id   | name         | department |
+------+--------------+------------+
|    1 | John Doe     | HR         |
|    2 | Jane Smith   | Marketing  |
|    3 | Mike Johnson | IT         |
|    4 | Emily Brown  | Finance    |
+------+--------------+------------+
4 rows in set (0.01 sec)

-- Delete partial data
mysql> DELETE FROM employees WHERE department = 'IT';
Query OK, 1 row affected (0.01 sec)

-- View data after the deletion
mysql> SELECT * FROM employees;
+------+-------------+------------+
| id   | name        | department |
+------+-------------+------------+
|    1 | John Doe    | HR         |
|    2 | Jane Smith  | Marketing  |
|    4 | Emily Brown | Finance    |
+------+-------------+------------+
3 rows in set (0.00 sec)
```

- Example 2

```sql
-- Create table
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_name VARCHAR(50),
  order_date DATE
);

-- Insert data
INSERT INTO orders (order_id, customer_name, order_date)
VALUES (1, 'John Doe', '2022-01-01'),
       (2, 'Jane Smith', '2022-02-01'),
       (3, 'Mike Johnson', '2022-03-01'),
       (4, 'Emily Brown', '2022-04-01'),
       (5, 'David Wilson', '2022-05-01');

-- View initial data
mysql> SELECT * FROM orders;
+----------+---------------+------------+
| order_id | customer_name | order_date |
+----------+---------------+------------+
|        1 | John Doe      | 2022-01-01 |
|        2 | Jane Smith    | 2022-02-01 |
|        3 | Mike Johnson  | 2022-03-01 |
|        4 | Emily Brown   | 2022-04-01 |
|        5 | David Wilson  | 2022-05-01 |
+----------+---------------+------------+
5 rows in set (0.01 sec)

-- Delete the earliest two orders
mysql> DELETE FROM orders
       WHERE order_id IN (
       SELECT order_id
       FROM orders
       ORDER BY order_date
       LIMIT 2);
Query OK, 2 rows affected (0.01 sec)

-- View data after the deletion
mysql> SELECT * FROM orders;
+----------+---------------+------------+
| order_id | customer_name | order_date |
+----------+---------------+------------+
|        3 | Mike Johnson  | 2022-03-01 |
|        4 | Emily Brown   | 2022-04-01 |
|        5 | David Wilson  | 2022-05-01 |
+----------+---------------+------------+
3 rows in set (0.01 sec)
```
