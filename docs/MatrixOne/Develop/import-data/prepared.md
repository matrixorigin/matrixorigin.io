# Prepared

MatrixOne provides support for server-side prepared statements. This support takes advantage of the efficient client/server binary protocol. Using prepared statements with placeholders for parameter values has the following benefits:

Less overhead for parsing the statement each time it is executed. Typically, database applications process large volumes of almost-identical statements, with only changes to literal or variable values in clauses such as WHERE for queries and deletes, SET for updates, and VALUES for inserts.

Protection against SQL injection attacks. The parameter values can contain unescaped SQL quote and delimiter characters.

## PREPARE, EXECUTE, and DEALLOCATE PREPARE Statements

SQL syntax for prepared statements is based on three SQL statements:

- [PREPARE](../../Reference/SQL-Reference/Other/Prepared-Statements/prepare.md) prepares a statement for execution.

- [EXECUTE](../../Reference/SQL-Reference/Other/Prepared-Statements/execute.md) executes a prepared statement.

- [DEALLOCATE PREPARE](../../Reference/SQL-Reference/Other/Prepared-Statements/deallocate.md) releases a prepared statement.

### Create a prepared statement

```
PREPARE stmt_name FROM preparable_stmt
```

|  Arguments   | Description  |
|  ----  | ----  |
|stmt_name | The name of the prepared statement. |
|preparable_stmt| a string literal or a user variable that contains the text of the SQL statement. The text must represent a single statement, not multiple statements.|

### Executes a prepared statement

```
EXECUTE stmt_name [USING @var_name [, @var_name] ...]
```

|  Arguments   | Description  |
|  ----  | ----  |
|stmt_name | The name of the prepared statement. |

### Delete a prepared statement

```
{DEALLOCATE | DROP} PREPARE stmt_name
```

|  Arguments   | Description  |
|  ----  | ----  |
|stmt_name | The name of the prepared statement. |

## Example

```sql
-- Create table
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(50)
);

-- Insert data
INSERT INTO customers (id, name, email)
VALUES (1, 'John Doe', 'john@example.com'),
       (2, 'Jane Smith', 'jane@example.com'),
       (3, 'Mike Johnson', 'mike@example.com');

-- Prepare statement
mysql> PREPARE stmt FROM 'SELECT * FROM customers WHERE id = ?';
Query OK, 0 rows affected (0.02 sec)

-- Execute prepared statement
mysql> SET @id = 2;
Query OK, 0 rows affected (0.00 sec)

mysql> EXECUTE stmt USING @id;
+------+------------+------------------+
| id   | name       | email            |
+------+------------+------------------+
|    2 | Jane Smith | jane@example.com |
+------+------------+------------------+
1 row in set (0.01 sec)

-- Deallocate statement
mysql> DEALLOCATE PREPARE stmt;
Query OK, 0 rows affected (0.00 sec)
```

The above example begins by creating a table named `customers` with three columns: `id`, `name`, and `email`. Next, three rows of data are inserted into the table.

Then, the `PREPARE` statement is used to prepare a statement, and the `SELECT * FROM customers WHERE id = ?` query is stored in the `stmt` variable.

When executing the prepared statement, the `@id` variable is set to 2, and the `EXECUTE` statement is used to execute the prepared statement with the `@id` parameter.

Finally, the `DEALLOCATE PREPARE` statement is used to deallocate the prepared statement and free up the associated resources.
