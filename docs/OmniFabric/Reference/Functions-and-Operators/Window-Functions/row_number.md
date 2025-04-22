# **ROW_NUMBER()**

## **Description**

`ROW_NUMBER()` provides a unique ordinal number for each row in the dataset, starting at one and ending with the last row in the result set. It first sorts the dataset according to the columns specified in the `ORDER BY` clause and then assigns each row a unique number.

Unlike the `RANK()` and `DENSE_RANK()` functions, `ROW_NUMBER()` gives each row a different row number when dealing with ties (i.e., two or more rows with the same value).

## **Syntax**

```
> ROW_NUMBER() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- The `PARTITION BY` clause is optional and divides the dataset into partitions; the rank is computed individually inside each partition.
- The `ORDER BY` clause defines how the dataset is sorted, i.e., according to which column or columns to sort. You can specify ascending (ASC) or descending (DESC) sorting.

## **Examples**

```sql
-- Create a new table, 'SalesTable' with three fields: 'Department', 'Employee', and 'Sales'
CREATE TABLE SalesTable (
  Department VARCHAR(50),
  Employee VARCHAR(50),
  Sales INT
);

-- Insert data into the 'SalesTable' table; each row contains a department (Department), an employee (Employee), and their sales (Sales)
INSERT INTO SalesTable (Department, Employee, Sales) VALUES
('Marketing', 'John', 1000),
('Marketing', 'Jane', 1200),
('Sales', 'Alex', 900),
('Sales', 'Bob', 1100),
('HR', 'Alice', 800),
('HR', 'Charlie', 850);

-- Query the sales ranking of employees in each department
-- Use the ROW_NUMBER() function to rank employees by Department (Sales)
-- The ROW_NUMBER() function divides the data set into multiple partitions according to the department (Department), then sorts the sales in descending order within each partition, and assigns each row a unique row number (SalesRank )
-- So, the employee with the highest sales in each department will get row number 1, the employee with the second highest sales will get row number 2, and so on
mysql> SELECT
    Department,
    Employee,
    Sales,
    ROW_NUMBER() OVER (PARTITION BY Department ORDER BY Sales DESC) as SalesRank
FROM
    SalesTable;
+------------+----------+-------+-----------+
| department | employee | sales | SalesRank |
+------------+----------+-------+-----------+
| HR         | Charlie  |   850 |         1 |
| HR         | Alice    |   800 |         2 |
| Marketing  | Jane     |  1200 |         1 |
| Marketing  | John     |  1000 |         2 |
| Sales      | Bob      |  1100 |         1 |
| Sales      | Alex     |   900 |         2 |
+------------+----------+-------+-----------+
6 rows in set (0.01 sec)
```
