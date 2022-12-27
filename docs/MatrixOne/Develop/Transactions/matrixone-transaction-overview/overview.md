# Transaction overview of MatrixOne

## What is a transaction in MatrixOne?

MatrixOne transactions follow the Standard Definition and Basic Characteristics (ACID) of database transactions. It aims to help users in a distributed database environment to ensure that every database data operation behavior can ensure the consistency and integrity of the results and isolate each other without interference under concurrent requests.

## Transaction type of MatrixOne

In MatrixOne, transactions, like general transactions, are also divided into the following two categories:
- According to whether there is a clear start and end, it is divided into explicit and implicit transactions.
- Divided into optimistic and pessimistic transactions according to the use stage of resource locks.

The classification of these two types of transactions is not limited by each other. An explicit transaction can be an optimistic or pessimistic transaction, and a pessimistic transaction can be either an explicit or an implicit transaction.

__Note__: MatrixOne does not support pessimistic transactions.

## [Explicit Transaction](explicit-transaction.md)

In MatrixOne, a transaction explicitly declared with `START TRANSACTION` becomes explicit.

## [Implicit Transaction](implicit-transaction.md)

In MatrixOne, if a transaction is not explicitly declared by `START TRANSACTION` or `BEGIN`, it is an implicit transaction.

## [Optimistic Transaction](optimistic-transaction.md)

At the beginning of an optimistic transaction, it is assumed that the transaction-related tables are in a state where no write conflicts will occur. The insertion, modification, or deletion of data is cached in memory. At this stage, the data will not be locked, but in the data Lock the corresponding data table or data row when submitting, and unlock it after submitting.

## [Snapshot Isolation in MatrixOne](snapshot-isolation.md)

### Snapshot Isolation

Different from the four isolation levels defined by the SQL standard, in MatrixOne, the supported isolation level is snapshot isolation (Snapshot Isolation), which is isolated in the **REPEATABLE READ** and **SERIALIZABLE** of the SQL-92 standard between. Different from other isolation levels, snapshot isolation has the following characteristics:

- Snapshot isolation does not reflect changes made to data by other synchronized transactions for data read within a specified transaction. Specifies that the transaction uses the data rows read at the beginning of this transaction.

- Data is not locked while being read, so snapshot transactions do not prevent other transactions from writing data.

- Transactions that write data also do not block snapshot transactions from reading data.

Compared with other isolation levels, snapshot isolation is also suitable for scenarios such as dirty reads (read uncommitted data), dirty writes (write uncommitted records after modification), phantom reads (multiple reads before and after, and the total amount of data is inconsistent) and other scenarios. Effective avoidance is achieved:

|Isolation Level|P0 Dirty Write|P1 Dirty Read|P4C Cursor Lost Update|P4 Lost Update|P2 Fuzzy Read|P3 Phantom|A5A Read Skew|A5B Write Skew|
|---|---|---|---|---|---|---|---|---|
|MatrixOne's Snapshot Isolation|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible| Possible|
