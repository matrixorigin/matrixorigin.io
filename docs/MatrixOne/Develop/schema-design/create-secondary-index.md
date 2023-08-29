# Create a secondary index

## What is a secondary index

Indexes identified on non-primary keys and secondary indexes are also called non-clustered indexes, which are used to improve query performance and speed up data retrieval. The secondary index does not directly store table data. Still, it indexes a part of the data (such as a column), allowing the database system to locate the table rows containing specific values quickly.

Secondary indexes can help speed up query operations, especially when querying large tables. Secondary indexes can also support sorting, grouping, and join operations, which usually require sorting or matching a portion of the data in the table.

## Before you start

Before reading this document, make sure that the following tasks are completed:

- Build a MatrixOne Cluster in MatrixOne.
- Read the [Database Schema Design Overview](overview.md).
- The database has been created.

## Use secondary index

Create a secondary index. You can create a secondary index through the`CREATE INDEX` statement, specify the column for which the index is aimed, and other indexing options.

The syntax structure is`'CREATE INDEX index_name on table_name (column_name);`

`index_name` is the name of the index, `table_name` is the name of the table on which the index is to be created, and `column_name` is the name of the column used to create the index.

For example, if you want to create a secondary index on the `last_name` column of a table named `employees`, you can use the following SQL statement:

```sql
CREATE INDEX idx_lastname ON employees (last_name);
```

Use a secondary index: You can use a secondary index in a query statement to locate data rows. The SQL query optimizer will automatically select the appropriate index to perform the query operation for the best performance. Such as:

```sql
SELECT * FROM employees WHERE last_name = 'Smith';
```

In this example, the query optimizer will use the `idx_lastname` index to locate the data row whose `last_name` is `smith`.

It should be noted that creating an index will increase the storage and maintenance costs of the database, and it may also affect performance when inserting, updating, and deleting data. Therefore, when creating a secondary index, it is necessary to carefully consider its impact on database performance and make the necessary optimizations and adjustments.

## Examples

```sql
CREATE TABLE users (id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  email VARCHAR(50)
);
-- create a secondary index on the table to speed up the speed of querying users by name
CREATE INDEX idx_users_name ON users(name);
-- Insert data
INSERT INTO users VALUES ('1', 'John', '30', 'john@gmail.com');
INSERT INTO users VALUES ('2', 'Tommy', '50', 'tom@gmail.com');
INSERT INTO users VALUES ('3', 'Ann', '33', 'ann@gmail.com');
-- Perform the following query, the database can use the secondary index to quickly find all users with the name 'John' without having to scan the entire table
mysql> SELECT * FROM users WHERE name = 'John';
+------+------+------+----------------+
| id   | name | age  | email          |
+------+------+------+----------------+
|    1 | John |   30 | john@gmail.com |
+------+------+------+----------------+
1 row in set (0.00 sec)
```

## Constraints

Currently MatrixOne only implements secondary indexes syntactically, and does not achieve performance improvements.
