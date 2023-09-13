# Explicit Transactions in MatrixOne

In MatrixOne's explicit transactions also obey the following rules:

## Explicit transaction rules

- An explicit transaction starts and ends with `BEGIN...END` or `START TRANSACTION...COMMIT` or `ROLLBACK`.
- In explicit transactions, DML (Data Manipulation Language) and DDL (Data Definition Language) can exist at the same time. All DDLs are supported.
- In an explicit transaction, other explicit transactions cannot be nested. For example, if `START TANSACTIONS` is encountered after `START TANSACTIONS`, all statements between two `START TANSACTIONS` will be forced to commit, regardless of the value of `AUTOCOMMIT` 1 or 0.
- In an explicit transaction, only DML and DDL can be included and cannot contain modification parameter configuration or management commands, such as `set [parameter] = [value]`, `create user,` and so on.
- In an explicit transaction, if a write-write conflict occurs when a new transaction is started without an explicit commit or rollback, the previously uncommitted transaction will be rolled back, and an error will be reported.

## Differences from MySQL explicit transactions

|Transaction type|Turn on autocommit|Turn off autocommit|
|---|---|---|
|Explicit Transactions vs. Autocommit| When `AUTOCOMMIT=1`, MySQL will not change the transaction, and each statement will be executed in a new auto-commit transaction. |When `AUTOCOMMIT=0`, each statement will be executed in an explicitly opened transaction until the transaction is explicitly committed or rolled back. |
|Explicit transactions and non-autocommit|When `AUTOCOMMIT=1`, MySQL will automatically commit uncommitted transactions after each statement execution. |When `AUTOCOMMIT=0`, each statement will be executed in an explicitly opened transaction until the transaction is explicitly committed or rolled back. |

**MySQL and MatrixOne Explicit Transaction Behavior Example**

```sql
mysql> CREATE TABLE Accounts (account_number INT PRIMARY KEY, balance DECIMAL(10, 2));
Query OK, 0 rows affected (0.07 sec)

mysql> INSERT INTO Accounts (account_number, balance) VALUES (1, 1000.00), (2, 500.00);
Query OK, 2 rows affected (0.00 sec)

mysql> BEGIN;
Query OK, 0 rows affected (0.01 sec)

mysql> UPDATE Accounts SET balance = balance - 100.00 WHERE account_number = 1;
Query OK, 1 row affected (0.00 sec)

mysql> UPDATE Accounts SET balance = balance + 100.00 WHERE account_number = 2;
Query OK, 1 row affected (0.00 sec)

mysql> COMMIT;
Query OK, 0 rows affected (0.01 sec)

mysql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

mysql> UPDATE Accounts SET balance = balance - 100.00 WHERE account_number = 1;
Query OK, 1 row affected (0.00 sec)

mysql> UPDATE Accounts SET invalid_column = 0 WHERE account_number = 2;
ERROR 20101 (HY000): internal error: column 'invalid_column' not found in table
Previous DML conflicts with existing constraints or data format. This transaction has to be aborted
mysql> ROLLBACK;
Query OK, 0 rows affected (0.00 sec)
mysql> SELECT * FROM Accounts;
+----------------+---------+
| account_number | balance |
+----------------+---------+
|              1 |  900.00 |
|              2 |  600.00 |
+----------------+---------+
2 rows in set (0.01 sec)
```

## Cross-Database Transaction Behavior Example

MatrixOne supports cross-database transaction behavior; here, we'll illustrate it with a simple example.

First, let's create two databases (db1 and db2) along with their respective tables (table1 and table2):

```sql
-- Create the db1 database
CREATE DATABASE db1;
USE db1;

-- Create table1 within db1
CREATE TABLE table1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field1 INT
);

-- Create the db2 database
CREATE DATABASE db2;
USE db2;

-- Create table2 within db2
CREATE TABLE table2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field2 INT
);
```

Now, we have created two databases and their tables. Next, let's insert some data:

```sql
-- Insert data into table1 in db1
INSERT INTO db1.table1 (field1) VALUES (100), (200), (300);

-- Insert data into table2 in db2
INSERT INTO db2.table2 (field2) VALUES (500), (600), (700);
```

We now have data in both databases. Moving on, let's execute a cross-database transaction to modify data in these two databases simultaneously:

```sql
-- Start the cross-database transaction
START TRANSACTION;

-- Update data in table1 within db1
UPDATE db1.table1 SET field1 = field1 + 10;

-- Update data in table2 within db2
UPDATE db2.table2 SET field2 = field2 - 50;

-- Commit the cross-database transaction
COMMIT;
```

In the above cross-database transaction, we begin with `START TRANSACTION;`, then proceed to update data in table1 within db1 and table2 within db2. Finally, we use `COMMIT;` to commit the transaction. If any step fails during the transaction, the entire transaction is rolled back to ensure data consistency.

This example demonstrates a complete cross-database transaction. Cross-database transactions can be more complex in real-world applications, but this simple example helps us understand the fundamental concepts and operations involved.
