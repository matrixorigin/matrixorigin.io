# **DENSE_RANK()**

## **Description**

`DENSE_RANK()` gives each row in the dataset a unique rank, very similar to the RANK() function. The `DENSE_RANK()` function first sorts the dataset according to the columns specified in the ORDER BY clause, then assigns each row a unique rank.

The `DENSE_RANK()` function handles ties (i.e., two or more rows with the same value) slightly differently than the `RANK()` function. In the case of a link, `DENSE_RANK()` will assign the same rank to all rows with the same value but will not skip any ranks immediately following it. For example, if two rows rank 1, the next row gets rank 2, not 3.

## **Syntax**

```
> DENSE_RANK() OVER (
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

-- Query the 'SalesTable' table and return the employee's name, their sales, and their sales rank (using the 'DENSE_RANK()' function)
-- In this query, the 'DENSE_RANK()' function ranks all employees in descending order of sales (specified by 'ORDER BY Sales DESC')
-- If multiple employees have the same sales, they will get the same rank, and the rank of the next sales will not be skipped. So, if two employees are number one in sales, the next employee is number two, not number three.
mysql> SELECT
  Employee,
  Sales,
  DENSE_RANK() OVER(ORDER BY Sales DESC) FROM
  SalesTable;
+----------+-------+-----------------------------------------+
| employee | sales | dense_rank() over (order by sales desc) |
+----------+-------+-----------------------------------------+
| Jane     |  1200 |                                       1 |
| Bob      |  1100 |                                       2 |
| John     |  1000 |                                       3 |
| Alex     |   900 |                                       4 |
| Charlie  |   850 |                                       5 |
| Alice    |   800 |                                       6 |
+----------+-------+-----------------------------------------+
6 rows in set (0.01 sec)
```
