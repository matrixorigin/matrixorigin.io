# Window Function Overview

Window Function (Window Function) is a unique function that can perform calculation operations on a specific window (Window) of the query result set. Window functions can be used to group, sort, and aggregate the result set and calculate the relevant value of each row of data within each window without changing the number of rows in the result set. That is, the result set can be flexibly analyzed and processed through the window function without introducing additional subqueries or join operations.

SQL window functions have a wide range of applications in various business scenarios:

1. **Intra-row comparison**: Compare a specific value of each row with other rows in the same group, such as calculating the difference between each employee's salary and the department's average salary. At this time, you can use window functions.

2. **Data ranking**: The window function can quickly generate data ranking information. For example, you can use the `RANK()` or `ROW_NUMBER()` function to check the sales ranking.

3. **Rolling Calculation**: Calculate the moving average. You can define the window range of the window function and then perform rolling calculations.

## List of window functions

- Most aggregate functions can also be used as window functions, for example, `SUM()`, `AVG()`, and `COUNT()`. These aggregate functions can be used with window functions to calculate the value of a column within a window Sum, average, or count. For aggregate functions and reference documents supported by MatrixOne that can be used as window functions, see:

    * [AVG](../Aggregate-Functions/avg.md)
    * [COUNT](../Aggregate-Functions/count.md)
    * [MAX](../Aggregate-Functions/max.md)
    * [SUM](../Aggregate-Functions/sum.md)
    * [MIN](../Aggregate-Functions/min.md)

- See the table below for other window functions:

|Function name|description|
|---|---|
|[DENSE_RANK()](dense_rank.md)| Used to assign ranks to rows in a dataset, always assigning consecutive ranks to the next value, even if previous values ​​have the same rank. |
|[RANK()](rank.md)|Assigns a rank value to each row in the query result set, rows with the same value will have the same rank, and the next rank value will skip the same number of rows. |
|[ROW_NUMBER()](row_number.md)|Assigns a unique integer value to each row in the query result set, ordered according to the specified collation. |

## How to use window functions

Using window functions usually requires the following steps:

1. Define the window (Window): By using the OVER clause to define the scope of the window, you can specify the sorting rules, partition method and row range of the window, etc.

2. Write the window function: In the `SELECT` statement, list the window function together with other columns, and specify the columns and operations that need to be calculated within the window.

Here is an example of how to use window functions to calculate the total sales for each department and the sales rank for each employee within the department:

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

In the above example, the `PARTITION BY` clause is used to partition the result set by the department, and then the `SUM()` function calculates the total sales for each department. Also, the `ORDER BY` clause specifies sorting in descending order by sales, and the `RANK()` function assigns ranks to employees within each department based on sales.
