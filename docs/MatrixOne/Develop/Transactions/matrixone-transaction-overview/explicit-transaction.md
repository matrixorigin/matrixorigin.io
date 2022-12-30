# Explicit Transactions in MatrixOne

In MatrixOne's explicit transactions also obey the following rules:

## Explicit transaction rules

- An explicit transaction starts and ends with `BEGIN...END` or `START TRANSACTIONS...COMMIT` or `ROLLBACK`.
- In explicit transactions, DML (Data Manipulation Language) and DDL (Data Definition Language) can exist at the same time. DDL is limited to `CREATE`, and all others cannot be supported.
- In an explicit transaction, other explicit transactions cannot be nested. For example, if `START TANSACTIONS` is encountered after `START TANSACTIONS`, all statements between two `START TANSACTIONS` will be forced to commit, regardless of the value of `AUTOCOMMIT` 1 or 0.
- In an explicit transaction, only DML and DDL can be included and cannot contain modification parameter configuration or management commands, such as `set [parameter] = [value]`, `create user,` etc.
- In an explicit transaction, if a write-write conflict occurs when a new transaction is started without an explicit commit or rollback, the previously uncommitted transaction will be rolled back, and an error will be reported.

## Example

```
START TRANSACTION;
insert into t1 values(1,2,3);
COMMIT;
```
