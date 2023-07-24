# Implicit Transactions in MatrixOne

In MatrixOne's Implicit transactions also obey the following rules:

## Implicit transaction rules

- When `AUTOCOMMIT` changes, if the implicit transaction is not committed, MatrixOne will report an error and prompt the user to submit the change.

- `AUTOCOMMIT=0`, and when there are no active transactions, DDL (Data Definition Language) and parameter configuration files can be executed.

- In the case of `AUTOCOMMIT=1`, each DML (Data Manipulation Language, Data Manipulation Language) statement is a separate transaction and is committed immediately after execution.

- In the case of `AUTOCOMMIT=0`, each DML statement will not be submitted immediately after execution, and `COMMIT` or `ROLLBACK` needs to be performed manually. If the client exits without committing or rolling back, then Rollback by default.

- In the case of `AUTOCOMMIT=0`, DML and DDL can exist at the same time.

- If a `CREATE/DROP DATABASE` or `CREATE/DROP SEQUENCE` operation occurs in the state of `AUTOCOMMIT=0`, all previously uncommitted content will be forced to be committed. Also, the `CREATE/DROP DATABASE` functions will be committed immediately as a separate transaction.

- When there is uncommitted content in the implicit transaction, opening an explicit transaction will force the submission of the previously uncommitted content.

## The difference between MatrixOne and MySQL implicit transactions

In MatrixOne, if the implicit transaction is enabled (`SET AUTOCOMMIT=0`), all operations must manually execute `COMMIT` or `ROLLBACK` to end the transaction. In contrast, MySQL automatically commits when encountering a DDL or similar `SET` statement.

### MySQL Implicit Transaction Behavior

|Transaction type|Turn on autocommit|Turn off autocommit|
|---|---|---|
|Implicit transactions and autocommit|When `AUTOCOMMIT=1`, MySQL will not change the transaction; each statement is a separate auto-commit transaction. |When `AUTOCOMMIT=0`, MySQL also does not change the transaction, but subsequent statements continue to execute within the current transaction until the transaction is explicitly committed or rolled back. |
|Implicit transactions and non-autocommit|When `AUTOCOMMIT=1`, MySQL will automatically commit uncommitted transactions after each statement execution. | When `AUTOCOMMIT=0`, MySQL continues to execute subsequent statements in the current transaction until the transaction is explicitly committed or rolled back. |

**MySQL Implicit Transaction Behavior Example**

```sql
mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = 1;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
|                  1 |
+--------------------+
1 row in set (0.01 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
|                  1 |
+--------------------+
1 row in set (0.00 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = default;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.00 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.00 sec)
```

**MatrixOne Implicit Transaction Behavior Example**

```sql
mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = 1;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
| 1                  |
+--------------------+
1 row in set (0.00 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
| 1                  |
+--------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
ERROR 20101 (HY000): internal error: Uncommitted transaction exists. Please commit or rollback first.
```

## Implicit Transactions Example

For example, insert data (4,5,6) to *t1*, which becomes an implicit transaction. Whether the implicit transaction is committed immediately depends on the value of the `AUTOCOMMIT` parameter:

```sql
CREATE TABLE t1(a bigint, b varchar(10), c varchar(10));
START TRANSACTION;
INSERT INTO t1 values(1,2,3);
COMMIT;

-- Check the AUTOCOMMIT parameters
mysql> SHOW VARIABLES LIKE 'AUTOCOMMIT';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | 1     |
+---------------+-------+
1 row in set (0.00 sec)
-- Here an implicit transaction begins, with each DML committed immediately after execution with AUTOCOMMIT=.1
insert into t1 values(4,5,6);

-- Implicit transaction is committed automatically, and the table structure is shown below
mysql> select * from t1;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 | 2    | 3    |
|    4 | 5    | 6    |
+------+------+------+
2 rows in set (0.00 sec)
```
