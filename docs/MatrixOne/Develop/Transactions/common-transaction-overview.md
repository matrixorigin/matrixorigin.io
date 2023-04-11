# General Transaction Overview

## Why do you need transactions?

In many large, critical applications, computers perform many tasks every second. More often than not, these tasks are themselves, but these tasks are combined to complete a business requirement called a transaction. What happens if one task is executed successfully and an error occurs in a second or third related task? This error is likely to leave system data in an inconsistent state. At this time, the transaction becomes very important; it can make the system data out of this inconsistent state.

How to understand transaction? For example, in the banking system, if there is no transaction to control and manage the data, *A* likely withdraws a sum of money from the corporate account, and *B* and *C* also withdraw money from the same corporate account. Each transfer involves at least two changes in account information (for example, *A*'s money arrives, and the company's account goes out; *B*'s money arrives, and the company's account goes out; *C*'s money comes, and the company's account goes out), If there are no transactions, then the exact value of the booking amount cannot be determined. After introducing the business requirement of the transaction, the essential characteristics of the transaction (ACID) ensure that the fund operation of the bank book is atomic (indivisible) and the amount seen by others is isolated. Each process is Consistent, and all operations are persistent, ensuring that the data in and out of the banking system remains consistent.

## What is Transaction?

The transaction is a logical unit in the execution process of the database management system, consisting of a limited sequence of database operations.
A transaction is a series of SQL statements submitted or rolled back as a logical unit.

## Characteristics of transactions

Usually, transactions need to have four characteristics of ACID:

- **Atomicity**: The atomicity of a transaction means that a transaction is an indivisible unit, and the operations in a transaction either all or none of them occur.

   For example:

   ```
   start transaction;
   insert into t1 values(1,2,3),(4,5,6);
   update t2 set c1='b' where c1='B';
   commit;
   ```

   Suppose an error occurs in inserting data into *t1* or modifying any data in *t2*. In that case, the entire transaction will be rolled back, and only when two statements succeed at the same time will the submission be successful, and one operation will not succeed while the other fails.

- **Consistency**: Transactional consistency means that data must remain correct and obey all data-related constraints before and after the transaction.

   For example, create a new table in database first:

   ```
   create table t1(a int primary key,b varchar(5) not null);
   ```

   To ensure data consistency here, when inserting data, to ensure the data type and range of columns a and b, the primary key constraint of column a and the non-null constraint of column b must be satisfied at the same time:

   ```
   insert into t1 values(1,'abcde'),(2,'bcdef');
   ```

- **Isolation**: The isolation of a transaction is that when multiple users access concurrently, the specified isolation level must be observed between transactions. Within the determined isolation level range, one transaction cannot be interfered with by another transaction.

   For example, in the following transaction example, the session isolation level is read committed, and the data that can be seen in session 1 is as follows:

   ```
   select * from t1;
   +------+------+
   | a    | b    |
   +------+------+
   |    1 | a    |
   |    2 | b    |
   |    3 | c    |
   +------+------+
   ```

   At this point in session 2, you can do the following:

   ```
   begin;
   delete from t1 where a=3;
   ```

   In session 1, you can still see the data unchanged:

   ```
   select * from t1;
   +------+------+
   | a    | b    |
   +------+------+
   |    1 | a    |
   |    2 | b    |
   |    3 | c    |
   +------+------+
   ```

   Until the current transaction is committed in session 2:

   ```
   commit;
   ```

   The result of the committed transaction will only be seen in session 1:

   ```
   select * from t1;
   +------+------+
   | a    | b    |
   +------+------+
   |    1 | a    |
   |    2 | b    |
   +------+------+
   ```

- **Durability**: Transaction durability means that when a transaction is committed in the database, its changes to the data are permanent, regardless of whether the database software is restarted.

## Transaction Types

In a database, transactions are divided into the following categories:

- According to whether there is a clear start and end, it is divided into **explicit transaction** and **implicit transaction**.
- According to the use stage of the resource lock, it is divided into **optimistic transaction** and **pessimistic transaction**.

These two types of transactions is not limited by each other. An explicit transaction can be an optimistic or pessimistic transaction, and a pessimistic transaction can be either an explicit or an implicit transaction.

### Explicit Transaction and Implicit Transaction

- **Explicit transaction**: In general, you can explicitly start a transaction by executing a `BEGIN` statement. A transaction can be ended explicitly by executing a `COMMIT` or `ROLLBACK`. MatrixOne's displayed transaction startup and execution methods are slightly different; see [Explicit Transaction](matrixone-transaction-overview/explicit-transaction.md).

- **Implicit transaction**: The transaction can start and end implicitly, without using `BEGIN TRANSACTION`, `COMMIT`, or `ROLLBACK` statements to start and end. Implicit transactions behave in the same way as explicit transactions. However, the rules for determining when an implicit transaction begins differ from those for determining when an explicit transaction begins. MatrixOne's implicit transaction startup and execution methods are slightly different; see [Implicit Transaction](matrixone-transaction-overview/implicit-transaction.md).

### Optimistic Transaction and Pessimistic Transaction

Regardless of whether it is an optimistic or pessimistic transaction, the execution results of the transaction are the same; that is, the operations in a transaction have exactly the exact requirements for the ACID level, whether it is atomicity, consistency, isolation, or persistence, there is no situation where optimistic transactions are more relaxed and pessimistic transactions are stricter.

The difference between an optimistic transaction and a pessimistic transaction is that it is just a two-phase commit based on a different execution strategy based on the state of the business to be processed. Its choice is based on the executor's judgment, and its efficiency is based on the actual state of the business being processed (the frequency of write conflicts of concurrent transactions). That is, different assumptions are made about the state of transaction-related resources so that write locks are placed in different stages.

At the beginning of an optimistic transaction, it is assumed that the transaction-related tables are in a state where no write conflicts will occur. The insertion, modification, or deletion of data is cached in memory. At this stage, the data will not be locked, but in the data Lock the corresponding data table or data row when submitting, and unlock it after submitting.

At the beginning of a pessimistic transaction, it is assumed that there will be written conflicts in the tables related to the transaction, and the related tables or rows are locked in advance. Then in memory, insert, modify or delete relevant data and commit. Data is only unlocked after a commit or rollback completes.

Optimistic transactions and pessimistic transactions have the following advantages and disadvantages during use:

- Optimistic transactions are more friendly to systems with fewer write operations and more read operations, avoiding deadlocks.
- Optimistic transactions may fail after repeated retries due to conflicts when larger transactions are committed.
- Pessimistic transactions are more friendly to systems with more write operations and avoid write-write conflicts from the database level.
- Pessimistic transactions In a scenario with large concurrency, if a transaction with a long execution time appears, the system may be blocked, and the throughput will be affected.

For more information on optimistic transactions in MatrixOne, see [Optimistic Transaction](matrixone-transaction-overview/optimistic-transaction.md).

For more information on optimistic transactions in MatrixOne, see [Pessimistic Transaction](matrixone-transaction-overview/pessimistic-transaction.md).

## Transaction Isolation

One of the characteristics of transactions is isolation, which we usually call transaction isolation.

Isolation is the most restrictive of the four ACID properties of database transactions. The database system usually uses a locking mechanism or a multi-version concurrency control mechanism to obtain a higher isolation level. Application software also requires additional logic to make it work properly.

Many database management systems (DBMS) define different "transaction isolation levels" to control the degree of locking. In many database systems, most transactions avoid high-level isolation levels (such as serializability) to reduce locking overhead. Programmers must carefully analyze the database access part of the code to ensure that lowering the isolation level does not cause hard-to-find code bugs. On the contrary, a higher isolation level will increase the chance of deadlock, which must be avoided during programming.

The DBMS is allowed to use a higher isolation level than the one requested because there are no operations in a higher isolation level that are prohibited by a lower isolation level.

ANSI/ISO SQL defines four standard isolation levels:

|Isolation Level|Dirty Write|Dirty Read|Fuzzy Read	|Phantom|
|--|--|--|--|--|
|READ UNCOMMITTED|Not Possible|	Possible|Possible|Possible|
|READ COMMITTED|Not Possible|Not Possible|Possible|Possible|
|REPEATABLE READ|Not Possible|Not Possible|Not Possible| Possible|
|SERIALIZABLE|Not Possible|Not Possible|Not Possible|Not Possible|

- **READ UNCOMMITTED**: READ UNCOMMITTED is the lowest isolation level. "Dirty reads" are allowed, and transactions can see the "not committed" modifications of other transactions.

- **READ COMMITTED**: At the READ COMMITTED level, the DBMS based on lock mechanism concurrency control needs to keep the write lock on the selected object until the end of the transaction, but the read lock is released immediately after the SELECT operation is completed. Like the previous isolation level, "scope locks" are not required.

- **REPEATABLE READS**: At the REPEATABLE READS isolation level, the DBMS based on the lock mechanism concurrency control needs to keep the read locks (read locks) and write locks (write locks) of the selected objects until the transaction end but does not require a "range lock", so a "phantom read" may occur. MatrixOne has implemented **Snapshot Isolation** and it is also known as **REPEATABLE READS** to maintain consistency with the isolation level in MySQL.

- **SERIALIZABLE**: SERIALIZABLE is the highest isolation level. On lock-based concurrency control DBMSs, serializability requires that read and write locks on selected objects be released at the end of the transaction. Using a "WHERE" clause in a SELECT query to describe a range should acquire a "range-locks".

Higher levels provide stronger isolation by requiring more restrictions than lower isolation levels. The standard allows transactions to run at a stronger transaction isolation level.

!!! note
    MatrixOne's transaction isolation is slightly different from the general isolation definition and isolation level division; see [Isolation level in MatrixOne](matrixone-transaction-overview/isolation-level.md).
