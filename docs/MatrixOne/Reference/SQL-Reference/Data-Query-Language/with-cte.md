# **WITH (Common Table Expressions)**

## **Description**

Common Table Expression (CTE) is a temporary result set defined within the scope of a single statement, valid only during the execution of the query. It can self-reference and can be referenced multiple times within the same query. Its purpose is simplifying complex queries, enhance code readability, and improve maintainability. A CTE can be seen as a temporary view that exists only for the query's execution and is not visible to external queries.

Once defined, a CTE can be referenced like a `SELECT`, `INSERT`, `UPDATE`, `DELETE`, or `CREATE VIEW` statement.

The `WITH` clause is used to specify Common Table Expressions, and the `WITH` clause can include one or more comma-separated clauses. Each clause provides a subquery that generates a result set and associates a name with the subquery.

**Use Cases**:

- CTEs can reuse the same subquery in multiple places, avoiding redundant logic.
- They can simplify recursive queries, such as querying tree-structured data.
- Complex queries can be broken down into smaller parts using CTEs, making the query logic clearer and more understandable.

**Common Table Expressions are divided into two types: non-recursive and recursive**:

- Non-recursive CTE refers to an expression in which the CTE does not reference itself. It is used to build a one-time temporary result set and does not involve recursion.

- Recursive CTE refers to an expression in which the CTE references itself. It handles data with recursive structures, such as trees or graphs. A recursive CTE includes a base query (initial condition) in its definition, then performs recursive operations on the result of that base query until a stop condition is met.

### Non-recursive CTE

#### **Syntax**

```
WITH <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

#### Explanations

- `<query_name>`: Specifies the temporary name assigned to the CTE result set. It can be any valid identifier, similar to a table or column name.

- `<query_definition>`: The query statement defines the CTE result set. It can be any valid `SELECT` query used to create the result set of the CTE.

- `SELECT ... FROM <query_name>`: This is the query executed on the CTE, where you can use the name of the CTE.

### Recursive CTE

#### **Syntax**

```
WITH RECURSIVE <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

#### Explanations

- `WITH RECURSIVE`: Indicates that this is a recursive CTE.

- `<query_name>`: Specifies the temporary name assigned to the result set of the recursive CTE. It can be any valid identifier, similar to a table or column name.

- `<query_definition>`: This consists of two parts in the context of a recursive CTE:

    + Initial part: Defines the recursion's initial condition and result set.
    + Recursive function: Defines how to recursively generate the next round of the result set from the initial result set.

- `SELECT ... FROM <query_name>`: Use the name of the recursive CTE to query the recursive CTE.

#### Guidelines for Using Recursive CTEs

##### Anchor and Recursive Members

A recursive common table expression (CTE) must consist of at least two query definitions: an anchor member and a recursive member. The anchor member should come before the first recursive member, and you can define multiple anchor and recursive members. All CTE query definitions are considered anchor members unless they reference the CTE itself.

Suppose you have a table named `Employee` that contains employee information, including fields like `EmployeeID`, `Name`, and `ManagerID`, representing the employee's ID, name, and ID of their manager. You can use a recursive CTE to query the hierarchical relationship between employees and subordinates.

Assuming the table data is as follows:

| EmployeeID | Name    | ManagerID |
|------------|---------|-----------|
| 1          | Alice   | NULL      |
| 2          | Bob     | 1         |
| 3          | Charlie | 1         |
| 4          | David   | 2         |
| 5          | Eve     | 2         |
| 6          | Frank   | 3         |

Here's an example of using a recursive CTE to query the hierarchical relationship between employees and their subordinates:

```sql
WITH RECURSIVE EmployeeHierarchy AS (
    -- Anchor member: Find top-level employees
    SELECT EmployeeID, Name, ManagerID, 0 AS Level
    FROM Employee
    WHERE ManagerID IS NULL

    UNION ALL

    -- Recursive member: Recursively query subordinate employees
    SELECT e.EmployeeID, e.Name, e.ManagerID, eh.Level + 1
    FROM Employee AS e
    JOIN EmployeeHierarchy AS eh ON e.ManagerID = eh.EmployeeID
)
SELECT Name, Level
FROM EmployeeHierarchy;
```

In the above example:

- The anchor member selects top-level employees (with `ManagerID` as NULL) and sets their level (`Level`) to 0.
- The recursive member queries subordinate employees based on the previous round's results (`EmployeeHierarchy`), incrementing the level.
- The final query uses `SELECT` to retrieve employee names and levels from the recursive CTE.

Executing this query will provide information about the hierarchical relationship between employees and their subordinates. Both anchor and recursive members together form the structure of a recursive query. On the other hand, a non-recursive CTE is used to create a temporary result set with a single query definition, and you only need to reference this CTE in your query without concerning anchor and recursive members.

##### Operators and Statement Requirements

- **Set Operators**: Anchor members must be combined using set operators (such as `UNION ALL`, `UNION`, `INTERSECT`, or `EXCEPT`). Only `UNION ALL` is allowed between the last anchor member and the first recursive member, as well as when combining multiple recursive members.

- **Column Matching**: The number of columns in anchor and recursive members must be the same.

- **Data Types**: Columns in the recursive member must have the same data types as the corresponding columns in the anchor member.

- **FROM Clause**: The FROM clause of a recursive member can only reference the CTE expression_name once.

- **Unsupported Features**: Certain features are not allowed in the CTE_query_definition of a recursive member, including:

    + Using the `SELECT DISTINCT` keyword for distinct queries.
    + Using `GROUP BY` to group results.
    + Using `HAVING` to filter results after grouping.
    + Scalar aggregation applies an aggregate function (like `SUM`, `AVG`, etc.) to a set of rows and returns a single value.
    + Outer join operations like `LEFT`, `RIGHT`, and `OUTER JOIN` (though `INNER JOIN` is allowed).
    + Subqueries.

## **Examples**

- Non-recursive CTE example:

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    salary INT
);

INSERT INTO employees (id, name, salary) VALUES
(1, 'Alice', 50000),
(2, 'Bob', 60000),
(3, 'Charlie', 75000),
(4, 'David', 55000),
(5, 'Eve', 80000);

-- Query employees whose salary is higher than the average salary
mysql> WITH avg_salary AS (
       SELECT AVG(salary) AS avg_salary FROM employees)
       SELECT name, salary
       FROM employees
       JOIN avg_salary ON salary > avg_salary.avg_salary;
+---------+--------+
| name    | salary |
+---------+--------+
| Charlie |  75000 |
| Eve     |  80000 |
+---------+--------+
2 rows in set (0.00 sec)
```

- Recursive CTE example:

```sql
CREATE TABLE employees_hierarchy (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    manager_id INT
);

INSERT INTO employees_hierarchy (id, name, manager_id) VALUES
(1, 'Alice', NULL),
(2, 'Bob', 1),
(3, 'Charlie', 1),
(4, 'David', 2),
(5, 'Eve', 2),
(6, 'Frank', 3);

-- Query an employee and all his employees
mysql> WITH RECURSIVE employee_hierarchy_cte (id, name, manager_id, level) AS (
    SELECT id, name, manager_id, 0
    FROM employees_hierarchy
    WHERE name = 'Alice'
    UNION ALL
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees_hierarchy AS e
    JOIN employee_hierarchy_cte AS eh ON e.manager_id = eh.id
)
SELECT name, level
FROM employee_hierarchy_cte;
+---------+-------+
| name    | level |
+---------+-------+
| Alice   |     0 |
| Bob     |     1 |
| Charlie |     1 |
| David   |     2 |
| Eve     |     2 |
| Frank   |     2 |
+---------+-------+
6 rows in set (0.00 sec)
```
