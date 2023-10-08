# Common Table Expression

A CTE (Common table expression) is a named temporary result set that exists only within the execution scope of a single SQL statement (such as `SELECT`, `INSERT`, `UPDATE`, or `DELETE`).

Like derived tables, CTEs are not stored as objects and persist only for the duration of query execution; Unlike derived tables, CTEs can be self-referenced or referenced multiple times in the same query. In addition, CTEs provide better readability and performance than derived tables.

**Use Cases**:

- CTEs can reuse the same subquery in multiple places, avoiding redundant logic.
- They can simplify recursive queries, such as querying tree-structured data.
- Complex queries can be broken down into smaller parts using CTEs, making the query logic clearer and more understandable.

**Common Table Expressions are divided into two types: non-recursive and recursive**:

- Non-recursive CTE refers to an expression in which the CTE does not reference itself. It is used to build a one-time temporary result set and does not involve recursion. Non-recursive CTE Statement:

```sql
WITH <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

- Recursive CTE refers to an expression in which the CTE references itself. It handles data with recursive structures, such as trees or graphs. A recursive CTE includes a base query (initial condition) in its definition, then performs recursive operations on the result of that base query until a stop condition is met. Recursive CTE Statement:

```sql
WITH RECURSIVE <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

## Before you start

Make sure you have already [Deployed standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

## Examples of Using CTE Statements

Suppose we want to create a table named `EMPLOYEES` that includes a hierarchical relationship among employees. We will then use non-recursive and recursive Common Table Expressions (CTEs) to query the employee hierarchy.

First, let's create the `EMPLOYEES` table and insert some sample data:

```sql
CREATE TABLE EMPLOYEES (
    EMPLOYEE_ID INT PRIMARY KEY,
    NAME VARCHAR(50),
    MANAGER_ID INT
);

INSERT INTO EMPLOYEES (EMPLOYEE_ID, NAME, MANAGER_ID) VALUES
    (1, 'Alice', NULL),
    (2, 'Bob', 1),
    (3, 'Carol', 1),
    (4, 'David', 2),
    (5, 'Eve', 2),
    (6, 'Frank', 3),
    (7, 'Grace', 3),
    (8, 'Hannah', 4),
    (9, 'Ian', 4);
```

Next, we'll use a recursive CTE to query the employee hierarchy:

```sql
WITH RECURSIVE EmployeeHierarchy AS (
    SELECT EMPLOYEE_ID, NAME, MANAGER_ID, 0 AS LEVEL
    FROM EMPLOYEES
    WHERE MANAGER_ID IS NULL

    UNION ALL

    SELECT e.EMPLOYEE_ID, e.NAME, e.MANAGER_ID, eh.LEVEL + 1
    FROM EMPLOYEES e
    INNER JOIN EmployeeHierarchy eh ON e.MANAGER_ID = eh.EMPLOYEE_ID
)
SELECT * FROM EmployeeHierarchy;
+-------------+--------+------------+-------+
| employee_id | name   | manager_id | level |
+-------------+--------+------------+-------+
|           1 | Alice  |       NULL |     0 |
|           2 | Bob    |          1 |     1 |
|           3 | Carol  |          1 |     1 |
|           4 | David  |          2 |     2 |
|           5 | Eve    |          2 |     2 |
|           6 | Frank  |          3 |     2 |
|           7 | Grace  |          3 |     2 |
|           8 | Hannah |          4 |     3 |
|           9 | Ian    |          4 |     3 |
+-------------+--------+------------+-------+
9 rows in set (0.01 sec)
```

Then, we'll use a non-recursive CTE to query employee information:

```sql
WITH EmployeeInfo AS (
    SELECT EMPLOYEE_ID, NAME, MANAGER_ID
    FROM EMPLOYEES
)
SELECT * FROM EmployeeInfo;
+-------------+--------+------------+
| employee_id | name   | manager_id |
+-------------+--------+------------+
|           1 | Alice  |       NULL |
|           2 | Bob    |          1 |
|           3 | Carol  |          1 |
|           4 | David  |          2 |
|           5 | Eve    |          2 |
|           6 | Frank  |          3 |
|           7 | Grace  |          3 |
|           8 | Hannah |          4 |
|           9 | Ian    |          4 |
+-------------+--------+------------+
9 rows in set (0.00 sec)
```

We used a recursive CTE named `EmployeeHierarchy`, which first selects top-level managers (`MANAGER_ID IS NULL`), and then recursively joins to find each employee's direct subordinates while keeping track of the hierarchy level. This allows us to query the detailed information of the employee hierarchy using the CTE.

The non-recursive CTE example selects basic information of all employees from the `EMPLOYEES` table, including `EMPLOYEE_ID`, `NAME`, and `MANAGER_ID`.

The `RECURSIVE` keyword is needed to declare a recursive CTE.

For more information on using CTEs, see [WITH (Common Table Expressions)](../../Reference/SQL-Reference/Data-Query-Language/with-cte.md).
