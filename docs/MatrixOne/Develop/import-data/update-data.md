# Update Data

This document describes how to update data in MatrixOne using SQL statements.

## Prerequisites

Single-node deployment of MatrixOne has been completed.

## SQL Statements for Updating Data

There are two ways to update data: `UPDATE` and `INSERT ON DUPLICATE KEY UPDATE`.

The differences between the two are as follows:

- **[`UPDATE`](../../Reference/SQL-Reference/Data-Manipulation-Language/update.md)**:
    - The UPDATE statement is used to update existing rows of data directly.
    - You need to specify the target table, columns to be updated, their corresponding new values, and the update conditions.
    - If the update conditions are met, the data of the existing rows will be modified.
    - No changes will be made if the update conditions are not met.

- **[`INSERT ON DUPLICATE KEY UPDATE`](../../Reference/SQL-Reference/Data-Manipulation-Language/insert-on-duplicate.md)**:
    - INSERT ON DUPLICATE KEY UPDATE is an extension of the INSERT statement, used to handle duplicate keys when inserting new rows.
    - When there are duplicate keys in the inserted data, i.e., when the values of specific column(s) or combination of columns are the same as existing rows' key values, an UPDATE operation will be performed instead of inserting a new row.
    - You can specify the data to be inserted and the update operations to be performed when duplicate key conflicts occur in a single statement.
    - The specified update operations will update the corresponding columns for rows with duplicate keys.

Key Differences:

- The UPDATE statement is used to directly update existing rows, while the INSERT ON DUPLICATE KEY UPDATE statement is used to handle duplicate keys when inserting data.
- The UPDATE statement requires you to specify the target table, columns to be updated, their corresponding new values, and the update conditions. The INSERT ON DUPLICATE KEY UPDATE statement allows you to specify the data to be inserted and the update operations in a single statement.

### `UPDATE`

```
UPDATE table_reference
    SET assignment_list
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

1. `UPDATE table_reference`: Specifies the target table for updating data. The table_reference can be a single table or multiple tables joined together.

2. `SET assignment_list`: Specifies the columns and values to be updated. The assignment_list lists column names and their corresponding values, separated by commas. Each column name is followed by an equal sign (=) to associate it with the new value to be updated.

3. `[WHERE where_condition]` (optional): The WHERE clause is used to specify the conditions for updating data. Only rows that satisfy the specified conditions will be updated. where_condition is a logical expression that can define conditions using various comparisons and logical operators.

4. `[ORDER BY ...]` (optional): The ORDER BY clause is used to sort the rows to be updated based on the specified columns. You can use one or more columns and specify ascending (ASC) or descending (DESC) order. The sorting will affect the order of the updated rows.

5. `[LIMIT row_count]` (optional): The LIMIT clause limits the number of rows to be updated. It specifies the maximum number of rows (row_count) to be updated. If the LIMIT clause is not specified, all rows that satisfy the WHERE condition will be updated.

During the data update process, specify the target table, the columns and values to be updated, the update conditions, and optionally, the sorting and limiting parameters to perform flexible data updates according to your requirements.

### `INSERT ON DUPLICATE KEY UPDATE`

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
  [ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...];
```

1. `INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...`
   - The INSERT INTO statement inserts new rows into a table.
   - `[db.]` (optional) specifies the database name where the table is located. If not provided, the default is the current database.
   - `table` is the name of the target table where the data will be inserted.
   - `[(c1, c2, c3)]` (optional) specifies the columns to be inserted, enclosed in parentheses and separated by commas. If column names are not specified, it is assumed that all available columns in the table will be inserted.
   - The VALUES clause specifies the values to be inserted. Each value corresponds to its respective column and is separated by commas and enclosed in parentheses. Multiple rows of data can be inserted, with each row separated by commas.

2. `[ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...]`
   - The ON DUPLICATE KEY UPDATE clause handles duplicate keys when inserting data.
   - When there are duplicate keys in the inserted data, i.e., when the values of specific column(s) or combination of columns are the same as existing rows' key values, an UPDATE operation will be performed instead of inserting a new row.
   - `column1, column2, column3` represent the column names to be updated, and `value1, value2, value3` represent the corresponding values to be updated.

This syntax allows you to insert one or multiple rows of data into the specified table.

. If a duplicate key situation occurs, i.e., a row with the same key value already exists, an UPDATE operation is executed to update that row's data.

When using the INSERT INTO statement, provide the corresponding column names and values based on the table structure and requirements. If duplicate keys are encountered, and the ON DUPLICATE KEY UPDATE clause is used, specify the columns to be updated and their corresponding values.

## Examples

- Example 1: `UPDATE`

```sql
-- Create table
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department VARCHAR(50),
  salary DECIMAL(10, 2)
);

-- Insert data
INSERT INTO employees (id, name, department, salary)
VALUES (1, 'John Doe', 'HR', 5000),
       (2, 'Jane Smith', 'Marketing', 6000),
       (3, 'Mike Johnson', 'IT', 7000),
       (4, 'Emily Brown', 'Finance', 8000),
       (5, 'David Wilson', 'HR', 5500);

-- View initial data
mysql> SELECT * FROM employees;
+------+--------------+------------+---------+
| id   | name         | department | salary  |
+------+--------------+------------+---------+
|    1 | John Doe     | HR         | 5000.00 |
|    2 | Jane Smith   | Marketing  | 6000.00 |
|    3 | Mike Johnson | IT         | 7000.00 |
|    4 | Emily Brown  | Finance    | 8000.00 |
|    5 | David Wilson | HR         | 5500.00 |
+------+--------------+------------+---------+
5 rows in set (0.01 sec)

-- Update data using the UPDATE statement. The salary of the first two employees in the 'HR' department is increased by 10%. The WHERE clause specifies the condition for updating the data; only rows with the department 'HR' will be updated. The ORDER BY clause sorts the rows by the id column in ascending order, and the LIMIT clause limits the update to only two rows.
mysql> UPDATE employees
       SET salary = salary * 1.1
       WHERE department = 'HR'
       ORDER BY id
       LIMIT 2;
Query OK, 2 rows affected (0.02 sec)

-- View updated data
mysql> SELECT * FROM employees;
+------+--------------+------------+---------+
| id   | name         | department | salary  |
+------+--------------+------------+---------+
|    2 | Jane Smith   | Marketing  | 6000.00 |
|    3 | Mike Johnson | IT         | 7000.00 |
|    4 | Emily Brown  | Finance    | 8000.00 |
|    1 | John Doe     | HR         | 5500.00 |
|    5 | David Wilson | HR         | 6050.00 |
+------+--------------+------------+---------+
5 rows in set (0.00 sec)
```

- Example 2: `INSERT ... ON DUPLICATE KEY UPDATE`

```sql
-- Create table
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  grade VARCHAR(10)
);

-- Insert data
INSERT INTO students (id, name, age, grade)
VALUES (1, 'John Doe', 18, 'A'),
       (2, 'Jane Smith', 17, 'B'),
       (3, 'Mike Johnson', 19, 'A'),
       (4, 'Emily Brown', 18, 'A');

-- View initial data
mysql> SELECT * FROM students;
+------+--------------+------+-------+
| id   | name         | age  | grade |
+------+--------------+------+-------+
|    1 | John Doe     |   18 | A     |
|    2 | Jane Smith   |   17 | B     |
|    3 | Mike Johnson |   19 | A     |
|    4 | Emily Brown  |   18 | A     |
+------+--------------+------+-------+
4 rows in set (0.01 sec)

-- Update data
mysql> INSERT INTO students (id, name, age, grade)
       VALUES (2, 'Jane Smith', 18, 'A')
       ON DUPLICATE KEY UPDATE age = VALUES(age), grade = VALUES(grade);
Query OK, 1 row affected (0.01 sec)

-- View updated data
mysql> SELECT * FROM students;
+------+--------------+------+-------+
| id   | name         | age  | grade |
+------+--------------+------+-------+
|    1 | John Doe     |   18 | A     |
|    3 | Mike Johnson |   19 | A     |
|    4 | Emily Brown  |   18 | A     |
|    2 | Jane Smith   |   18 | A     |
+------+--------------+------+-------+
4 rows in set (0.00 sec)
```

In the above examples, a table named `students` is first created with four columns: `id`, `name`, `age`, and `grade`. Then, four rows of student data are inserted using the INSERT INTO statement.

Next, the initial data is viewed using a SELECT statement. Then, an INSERT INTO statement is used to insert a new row of student data where the student with `id` 2 already exists, causing a duplicate key situation. In this case, the ON DUPLICATE KEY UPDATE clause is used to update that row's data. The columns to be updated, and their corresponding values are specified using the VALUES function.

Finally, the updated data is viewed again using a SELECT statement, showing that the age and grade of the student with `id` 2 have been updated.
