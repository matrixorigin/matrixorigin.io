# How to use MatrixOne Transaction?

This document will teach you how to simply start, commit, rollback a transaction, and how to automatically commit a transaction.

## Start transaction

To start a transaction, you can start a transaction with `START TRANSACTION`, or you can use the dialect command `BEGIN`.

The code example is as follows:

```
START TRANSACTION;
insert into t1 values(123,'123');
```

Or:

```
BEGIN;
insert into t1 values(123,'123');
```

## Commit transaction

When committing a transaction, MatrixOne accepts the `COMMIT` command as a commit command. The code example is as follows:

```
START TRANSACTION;
insert into t1 values(123,'123');
commit;
```

## Rollback transaction

When rolling back a transaction, MatrixOne accepts the `ROLLBACK` command as a commit command. The code example is as follows:

```
START TRANSACTION;
insert into t1 values(123,'123');
rollback;
```

## Autocommit

In MatrixOne, there is a parameter `AUTOCOMMIT`, which determines whether there is a single SQL statement to be automatically committed as an independent transaction without `START TRANSACTION` or `BEGIN`. The syntax is as follows:

```sql
-- Set the value of this parameter
SET AUTOCOMMIT={on|off|0|1}  
SHOW VARIABLES LIKE 'AUTOCOMMIT';
```

When this parameter is set to ON or 1, it means automatic submission. All single SQL statements not in `START TRANSACTION` or `BEGIN` will be automatically submitted when executed.

```sql
-- Autocommit
insert into t1 values(1,2,3);   
```

When this parameter is set to OFF or 0, it is not automatically committed. All SQL statements not in `START TRANSACTION` or `BEGIN` need to use `COMMIT` or `ROLLBACK` to perform commit or rollback.

```sql
insert into t1 values(1,2,3);
-- Manual submission is required here
COMMIT;  
```

## Switch Transaction Mode

MatrixOne adopts pessimistic transaction and RC isolation level by default. But if you need to switch to optimistic transaction mode, the corresponding isolation level will be changed to snapshot isolation.

Add the following configuration parameters to the configuration file *cn.toml* under the *matrixone/etc/launch-with-proxy/* directory to switch the transaction mode:

```toml
[cn.Txn]
mode = "optimistic"
isolation = "SI"
```

__Note:__ If you only add the transaction mode parameter `mode = "optimistic"`, but do not add `isolation = "SI"`, the system will default to SI isolation in the optimistic transaction mode.

Restart MatrixOne to make the switched transaction mode take effect.

For more information on the configuration parameters, see [Distributed Common Parameters Configuration](../../../Reference/System-Parameters/distributed-configuration-settings.md).
