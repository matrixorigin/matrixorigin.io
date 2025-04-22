# **RANK()**

## **Description**

`RANK()` provides a unique rank for each row in the dataset. `RANK()` first sorts the dataset according to the columns specified in the `ORDER BY` clause, then assigns each row a unique rank.

The `RANK()` function has a unique behavior when it handles the case of equal values ​​(i.e., tie). When two or more rows have the same value, they get the same rank. It will then skip the rank or ranks that follow it. For example, if two rows rank 1, the next row gets rank 3, not 2.

## **Syntax**

```
> RANK() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- The `PARTITION BY` clause is optional and divides the dataset into partitions; the rank is computed individually inside each partition.
- The `ORDER BY` clause defines how the dataset is sorted, i.e., according to which column or columns to sort. You can specify ascending (ASC) or descending (DESC) sorting.

## **Examples**

```SQL
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

-- Query the 'SalesTable' table and return each employee in each department, their sales, and the total sales of their department (DepartmentSales)
-- will also return each employee's sales rank in their department (SalesRank)
-- For the total sales, use the window function SUM(), and use 'OVER(PARTITION BY Department)' to calculate each department separately
-- For sales ranking, use the window function RANK(), and use 'OVER(PARTITION BY Department ORDER BY Sales DESC)' to rank employees in each department in descending order by sales
-- In the RANK() function, if two employees have the same sales, they get the same rank, and the next sales rank is skipped. For example, if two employees are number one in sales, the next sales rank is number three, not number two.
mysql> SELECT
  Department,
  Employee,
  Sales,
  SUM(Sales) OVER(PARTITION BY Department) AS DepartmentSales,
  RANK() OVER(PARTITION BY Department ORDER BY Sales DESC) AS SalesRank
FROM
  SalesTable;
+------------+----------+-------+-----------------+-----------+
| department | employee | sales | DepartmentSales | SalesRank |
+------------+----------+-------+-----------------+-----------+
| HR         | Charlie  |   850 |            1650 |         1 |
| HR         | Alice    |   800 |            1650 |         2 |
| Marketing  | Jane     |  1200 |            2200 |         1 |
| Marketing  | John     |  1000 |            2200 |         2 |
| Sales      | Bob      |  1100 |            2000 |         1 |
| Sales      | Alex     |   900 |            2000 |         2 |
+------------+----------+-------+-----------------+-----------+
6 rows in set (0.01 sec)
```
