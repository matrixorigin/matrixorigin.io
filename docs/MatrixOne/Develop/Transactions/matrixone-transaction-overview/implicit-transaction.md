# Implicit Transactions in MatrixOne

In MatrixOne's Implicit transactions also obey the following rules:

## Implicit transaction rules

- When `AUTOCOMMIT` changes, if the implicit transaction is not committed, MatrixOne will report an error and prompt the user to submit the change.
- `AUTOCOMMIT=0`, and when there are no active transactions, DDL (Data Definition Language) and parameter configuration files can be executed.
- In the case of `AUTOCOMMIT=1`, each DML (Data Manipulation Language, Data Manipulation Language) statement is a separate transaction and is committed immediately after execution.
- In the case of `AUTOCOMMIT=0`, each DML statement will not be submitted immediately after execution, and `COMMIT` or `ROLLBACK` needs to be performed manually. If the client exits without committing or rolling back, then Rollback by default.
- In the case of `AUTOCOMMIT=0`, DML and DDL can exist at the same time.
- When there is uncommitted content in the implicit transaction, opening an explicit transaction will force the submission of the previously uncommitted content.

## Example

For example, after the [Explicit Transactions](explicit-transaction.md) ends, continue to insert data (4,5,6) to *t1*, which becomes an implicit transaction. Whether the implicit transaction is committed immediately depends on the value of the `AUTOCOMMIT` parameter:

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
