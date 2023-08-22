# AUTO INCREMENT Constraint

The Auto-Increment Constraint is a feature in MatrixOne that automatically generates a unique identifier value for a column in a table. When inserting new rows, it allows you to automatically generate an incrementing unique value for the specified auto-increment column. This feature is handy in many cases, such as for primary keys or identifiers.

**Auto-Increment Constraint Features**

The Auto-Increment Constraint simplifies the generation and management of identifiers. When using an auto-increment column, there are a few things to keep in mind:

- Auto-increment columns are usually used as primary keys, so their uniqueness should be ensured.
- The data type of the auto-increment column should be chosen appropriately based on the requirements, typically an integer type.
- The values of the auto-increment column are automatically generated when inserting new rows and cannot be manually specified.
- The auto-increment values are unique within the table and automatically increment with subsequent insert operations.
- The auto-increment value's starting value and increment step can be customized by modifying the table definition.

Please use the auto-increment constraint to simplify the generation and management of identifiers based on the specific table structure and requirements, ensuring data integrity and uniqueness.

### Syntax

When creating a table, you can define an auto-increment constraint for a column. Typically, the data type of the auto-increment column is an integer type such as `INT` or `BIGINT`. To add an auto-increment constraint to a column, use the `AUTO_INCREMENT` keyword when creating the table.

```sql
CREATE TABLE table_name (
  column_name data_type AUTO_INCREMENT,
  ...
  PRIMARY KEY (primary_key_column)
);
```

- `table_name`: The name of the table.
- `column_name`: The column's name to be defined as auto-increment.
- `data_type`: The data type of the column, usually an integer type such as `INT` or `BIGINT.`
- `primary_key_column`: The primary key column of the table.

### Example

Here is an example of creating a table with an auto-increment column:

```sql
-- Create an employees' table with an 'id' column defined as an auto-increment column. The 'id' column has a data type of 'INT' and the auto-increment constraint is specified using the 'AUTO_INCREMENT' keyword. The 'id' column is set as the table's primary key.
CREATE TABLE employees (
  id INT AUTO_INCREMENT,
  name VARCHAR(50),
  department VARCHAR(50),
  PRIMARY KEY (id)
);

-- Insert data into the table and let the auto-increment column generate unique identifier values. No values are specified for the 'id' column, and an incrementing unique value is automatically generated for the 'id' column when inserting new rows. The value of the 'id' column will automatically increment with each new row inserted.
INSERT INTO employees (name, department)
VALUES ('John Doe', 'HR'),
       ('Jane Smith', 'Marketing'),
       ('Mike Johnson', 'IT');

-- The 'id' column values will be auto-incremented, generating a unique identifier value for each new row inserted.
mysql> SELECT * FROM employees;
+------+--------------+------------+
| id   | name         | department |
+------+--------------+------------+
|    1 | John Doe     | HR         |
|    2 | Jane Smith   | Marketing  |
|    3 | Mike Johnson | IT         |
+------+--------------+------------+
3 rows in set (0.01 sec)
```

## Constraints

1. MatrixOne currently does not support modifying auto-increment values' starting and increment steps using the `ALTER TABLE` statement.
2. In MatrixOne, only syntax supports using the system variable `set @@auto_increment_increment=n` to set the incremental step size, and only syntax supports using the system variable `set @@auto_increment_offset=n` to set the default auto-increment column initial value, but it does not take effect; currently supports setting the initial value `AUTO_INCREMENT=n` of the auto-increment column, but the step size is still 1 by default.
