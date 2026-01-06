# Create Temporary Table

## What is a temporary table

A temporary table is a unique one that is only visible in the current session after creation. At the end of the current session, the database automatically drops the temporary table and frees all space; you can also use the `DROP TABLE` to drop the temporary table.

You can use temporary tables to hold some intermediate results in a session; for example, you may need to query these results multiple times, or these results are a subset of other queries.

## Advantages of temporary tables

Temporary tables have several uses and advantages in database design:

- **Data Isolation**: Temporary tables are independent in each session or transaction. This means that two temporary tables with the same name can exist in two different sessions without affecting each other.

- **Simplify complex queries**: If a query is very complex and involves multiple joins and subqueries, you can save the query results to a temporary table and then perform operations on this temporary table, thereby simplifying the query and improving performance.

- **Improve performance**: Saving data in temporary tables can significantly improve query performance for complex queries with large data sets. The access speed is fast because the temporary table is stored in memory.

- **Protect data**: Use temporary tables to avoid modification of original data. When you need to perform operations that may change the original data, you can store the data in a temporary table and then perform functions on the temporary table to avoid changing the original data by mistake.

- **Save storage space**: Temporary tables are automatically deleted when no longer needed, saving storage space.

- **Helpful for debugging**: In complex nested queries, temporary tables can store intermediate results to help debug and verify the output of each step.

Note that temporary tables are not omnipotent, they also have some limitations, such as being only accessible within the current session, and once the session ends, the temporary table disappears.

## Before you start

Before reading this document, make sure that the following tasks are completed:

- Build a MatrixOne Cluster in MatrixOne.
- Read the [Database Schema Design Overview](overview.md).
- The database has been created.

## How to use temporary tables

The syntax for using a temporary table is the same as for a regular table, except that the TEMPORARY keyword is added before the statement that creates the table:

```
CREATE TEMPORARY TABLE temp_table_name (column_list);
```

You can use the same table name for temporary and regular tables. If you do so, the temporary table will shadow (override) the regular table for almost all operations within the current session until the temporary table is dropped. However, two temporary tables cannot share the same name in the same session.

!!! note
    1. When a temporary table and a regular table have the same name, the temporary table takes precedence. Operations such as `SELECT`, `INSERT`, `UPDATE`, `DESC`, and `SHOW CREATE TABLE` will interact with the temporary table.
    2. When using the `SHOW TABLES` command, temporary tables are not displayed in the result list.
    3. Temporary tables currently only support index-related `ALTER TABLE` operations, such as adding or dropping an index. Other structural modifications via `ALTER TABLE` are not yet supported.

## Example

```sql
-- Create a temporary table 'temp_employees'
CREATE TEMPORARY TABLE temp_employees (
    employee_id INT AUTO_INCREMENT, -- auto-increment employee ID
    first_name VARCHAR(50), -- employee name
    last_name VARCHAR(50), -- employee last name
    email VARCHAR(100), -- employee email address
    PRIMARY KEY (employee_id) -- set 'employee_id' as the primary key
);

-- Insert some data into the 'temp_employees' table
INSERT INTO temp_employees (first_name, last_name, email)
VALUES ('John', 'Doe', 'john.doe@example.com'),
       ('Jane', 'Doe', 'jane.doe@example.com'),
       ('Jim', 'Smith', 'jim.smith@example.com'),
       ('Jack', 'Johnson', 'jack.johnson@example.com'),
       ('Jill', 'Jackson', 'jill.jackson@example.com');

-- Query the temporary table to view all employee information
SELECT * FROM temp_employees;
+-------------+------------+-----------+--------------------------+
| employee_id | first_name | last_name | email                    |
+-------------+------------+-----------+--------------------------+
|           1 | John       | Doe       | john.doe@example.com     |
|           2 | Jane       | Doe       | jane.doe@example.com     |
|           3 | Jim        | Smith     | jim.smith@example.com    |
|           4 | Jack       | Johnson   | jack.johnson@example.com |
|           5 | Jill       | Jackson   | jill.jackson@example.com |
+-------------+------------+-----------+--------------------------+
5 rows in set (0.01 sec)

-- At the end of this session, the temporary table 'temp_employees' will be dropped automatically
```
