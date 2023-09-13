# Transaction overview of MatrixOne

## What is a transaction in MatrixOne?

MatrixOne transactions follow the Standard Definition and Basic Characteristics (ACID) of database transactions. It aims to help users in a distributed database environment to ensure that every database data operation behavior can ensure the consistency and integrity of the results and isolate each other without interference under concurrent requests.

## Transaction type of MatrixOne

In MatrixOne, transactions, like general transactions, are also divided into the following two categories:

- According to whether there is a clear start and end, it is divided into explicit and implicit transactions.
- Divided into optimistic and pessimistic transactions according to the use stage of resource locks.

The classification of these two types of transactions is not limited by each other. An explicit transaction can be an optimistic or pessimistic transaction, and a pessimistic transaction can be either an explicit or an implicit transaction.

## [Explicit Transaction](explicit-transaction.md)

In MatrixOne, a transaction explicitly declared with `START TRANSACTION` becomes explicit.

## [Implicit Transaction](implicit-transaction.md)

In MatrixOne, if a transaction is not explicitly declared by `START TRANSACTION` or `BEGIN`, it is an implicit transaction.

## [Optimistic Transaction](optimistic-transaction.md)

At the beginning of an optimistic transaction, it is assumed that the transaction-related tables are in a state where no write conflicts will occur. The insertion, modification, or deletion of data is cached in memory. At this stage, the data will not be locked, but in the data Lock the corresponding data table or data row when submitting, and unlock it after submitting.

## [Pessimistic Transaction](pessimistic-transaction.md)

MatrixOne defaults to pessimistic transactions. At the beginning of a pessimistic transaction, it is assumed that the transaction-related table is in a state where write conflicts may occur, and the corresponding data table or data row is locked in advance. After the locking action is completed, the data's insertion, modification, or deletion is cached in In memory; after committing or rolling back, the data is completed, and the lock is released.

## MatrixOne Supports Cross-Database Transactions

MatrixOne supports cross-database transactions, allowing a single transaction to access and modify multiple databases simultaneously.

In real-world applications, specific business requirements may necessitate operations involving multiple databases. The introduction of cross-database transactions serves to address these needs. This functionality ensures that operations across different databases maintain consistency and isolation as executed within a single database. This means that when you need to perform a series of operations across multiple databases, you can wrap them within a single transaction, facilitating the completion of these operations while preserving data integrity and consistency.

Cross-database transactions typically play a pivotal role in complex enterprise application scenarios. Different business functions or departments may use separate databases in these scenarios, yet they need to collaborate to fulfill intricate business requirements. MatrixOne's support for cross-database transactions enhances system flexibility and scalability. However, preserving data integrity and consistency also requires careful design and management.

## Transaction isolation level of MatrixOne

MatrixOne supports two isolation levels: **Read Committed** and **Snapshot Isolation**. The default isolation level is **Read Committed**.

### Read Committed

Read Committed is the default isolation level of MatrixOne after version 0.8, and it is also one of the four isolation levels in the SQL standard. Its most notable features are:

- Between different transactions, only the data submitted by other transactions can be read, and the uncommitted data cannot be viewed.
- The read-committed isolation level can effectively prevent dirty writes and dirty reads but cannot avoid non-repeatable reads and phantom reads.

|Isolation Level|P0 Dirty Write|P1 Dirty Read|P4C Cursor Lost Update|P4 Lost Update|
|---|---|---|---|---|
|READ COMMITTED|Not Possible|Not Possible|Possible|Possible|

### Snapshot Isolation

Different from the four isolation levels defined by the SQL standard, in MatrixOne, the supported isolation level is snapshot isolation (Snapshot Isolation), which is isolated in the **REPEATABLE READ** and **SERIALIZABLE** of the SQL-92 standard between. Different from other isolation levels, snapshot isolation has the following characteristics:

- Snapshot isolation does not reflect changes made to data by other synchronized transactions for data read within a specified transaction. Specifies that the transaction uses the data rows read at the beginning of this transaction.

- Data is not locked while being read, so snapshot transactions do not prevent other transactions from writing data.

- Transactions that write data also do not block snapshot transactions from reading data.

Compared with other isolation levels, snapshot isolation is also suitable for scenarios such as dirty reads (read uncommitted data), dirty writes (write uncommitted records after modification), phantom reads (multiple reads before and after, and the total amount of data is inconsistent) and other scenarios. Effective avoidance is achieved:

|Isolation Level|P0 Dirty Write|P1 Dirty Read|P4C Cursor Lost Update|P4 Lost Update|P2 Fuzzy Read|P3 Phantom|A5A Read Skew|A5B Write Skew|
|---|---|---|---|---|---|---|---|---|
|MatrixOne's Snapshot Isolation|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible| Possible|
