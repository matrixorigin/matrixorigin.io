# **NULLIF**

## **Description**

The `NULLIF()` function returns NULL if expr1 = expr2 is true, otherwise returns expr1.

The return value has the same type as the first argument.

## **Syntax**

```
> NULLIF(expr1,expr2)

```

## **Examples**

```sql
CREATE TABLE employees ( id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, salary DECIMAL(10, 2) );

INSERT INTO employees (name, salary) VALUES ('John Doe', 1000), ('Alice Smith', 2000), ('Bob Johnson', 1500);

-- Use the NULLIF() function to set the salary of employees whose salary is a specific value to NULL. The NULLIF(salary, 1500) function will compare the value of the salary field with 1500. Returns NULL if the salary value equals 1500; otherwise, returns the salary value.
mysql> SELECT name, salary, NULLIF(salary, 1500) AS adjusted_salary FROM employees;
+-------------+---------+-----------------+
| name        | salary  | adjusted_salary |
+-------------+---------+-----------------+
| John Doe    | 1000.00 | 1000.00         |
| Alice Smith | 2000.00 | 2000.00         |
| Bob Johnson | 1500.00 |                 |
+-------------+---------+-----------------+
3 rows in set (0.01 sec)
```
