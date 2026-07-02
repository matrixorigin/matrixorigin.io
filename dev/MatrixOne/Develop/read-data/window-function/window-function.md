# Window function

A Window Function is a special function that can perform computation operations on a window (Window) in a query result set. Window functions can be used to group, sort, and aggregate result sets, while also being able to calculate correlation values for each row of data within each window without changing the number of rows in the result set. That is, through window functions, the result set can be analyzed and processed flexibly without introducing additional subqueries or join operations.

SQL window functions have a wide range of applications in a variety of business scenarios:

1. **Intra-row comparison**: Compares a value in each row to other rows in the same group, such as calculating the difference between each employee's salary and the average departmental salary. At this point, you can use the window function.

2. **Data ranking**: Window functions can easily generate ranking information for data. For example, if you want to see the ranking of sales, you can use the `RANK()` or `ROW_NUMBER()` functions.

3. **Rolling Calculation**: Calculates the moving average. You can define the window range of the window function and then perform a rolling calculation.

## List of window functions

- Most aggregate functions can also be used as window functions, for example, `SUM()`, `AVG()`, `COUNT()` These aggregate functions can be used with window functions to calculate the sum, average, or count of a column within a window. Aggregate functions and reference documentation for windowable functions supported by MatrixOne can be found at:

    * [AVG](../../../Reference/Functions-and-Operators/Aggregate-Functions/avg.md)
    * [COUNT](../../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)
    * [MAX](../../../Reference/Functions-and-Operators/Aggregate-Functions/max.md)
    * [SUM](../../../Reference/Functions-and-Operators/Aggregate-Functions/sum.md)
    * [MIN](../../../Reference/Functions-and-Operators/Aggregate-Functions/min.md)

- See the following table for other window functions:

|Function name | Description|
|---------------|------------|
|[DENSE_RANK()](../../../Reference/Functions-and-Operators/Window-Functions/dense_rank.md)|Use to assign a rank to rows in the dataset, always assigning a consecutive rank to the next value, even if the previous value has the same rank.|
|[RANK()](../../../Reference/Functions-and-Operators/Window-Functions/rank.md)|Assign a rank value to each row in the query result set, rows of the same value will have the same rank, and the next rank value will skip the same number of rows.|
|[ROW_NUMBER()](../../../Reference/Functions-and-Operators/Window-Functions/row_number.md)|Assign a unique integer value to each row in the query result set, determining the order based on the specified sort rules.|

## How to use window functions

Using a window function usually requires the following steps:

1. Define Window: By using the OVER clause to define the scope of a window, you can specify the window's sort rule, partitioning method, row range, etc.

2. Write a window function: In a `SELECT` statement, list the window function with other columns, specifying the columns and actions that need to be computed within the window.

Here is an example that demonstrates how to use the window function to calculate the total sales for each department and the sales ranking for each employee within the department:

```sql
CREATE TABLE SalesTable (
  Department VARCHAR(50),
  Employee VARCHAR(50),
  Sales INT
);

INSERT INTO SalesTable (Department, Employee, Sales) VALUES
('Marketing', 'John', 1000),
('Marketing', 'Jane', 1200),
('Sales', 'Alex', 900),
('Sales', 'Bob', 1100),
('HR', 'Alice', 800),
('HR', 'Charlie', 850);

SELECT
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

In the above example, the `PARTITION BY` clause is used to partition the result set by department, and then the `SUM()` function calculates the total sales for each department. Meanwhile, the `ORDER BY` clause specifies a descending order of sales, and the `RANK()` function assigns a ranking to employees within each department based on sales.
