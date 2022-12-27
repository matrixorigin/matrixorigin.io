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

In MatrixOne, there is a parameter `AUTOCOMMIT`, which determines whether there is no single SQL statement to be automatically committed as an independent transaction without `START TRANSACTION` or `BEGIN`. The syntax is as follows:

```
SET AUTOCOMMIT={on|off|0|1}  //Set the value of this parameter
SHOW VARIABLES LIKE 'AUTOCOMMIT';
```

When this parameter is set to ON or 1, it means automatic submission. All single SQL statements not in `START TRANSACTION` or `BEGIN` will be automatically submitted when executed.

```
insert into t1 values(1,2,3);   //Autocommit
```

When this parameter is set to OFF or 0, it is not automatically committed. All SQL statements not in `START TRANSACTION` or `BEGIN` need to use `COMMIT` or `ROLLBACK` to perform commit or rollback.

```
insert into t1 values(1,2,3);
COMMIT；  //Manual submission is required here
```
