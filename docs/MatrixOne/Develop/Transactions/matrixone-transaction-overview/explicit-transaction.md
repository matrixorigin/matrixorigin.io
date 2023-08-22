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
