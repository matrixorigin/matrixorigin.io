# Pessimistic Transactions in MatrixOne

## Pessimistic Transactions principle

When a transaction starts, conflict detection or lock operation must be performed. When no conflict or lock is detected, a column in the data to be written will be regarded as the primary key column, the column will be locked, and a timestamp will be created. Writes to related rows after this timestamp are judged as write conflicts.

Cache the current relevant data to the corresponding memory area, and add, delete, and modify the data. If there is a lock on the current table, it will enter the waiting state. When the waiting timeout occurs, the waiting transaction will be canceled.

After the modification is completed, enter the commit phase, write data, record the timestamp at this time, and unlock the lock.

## Pessimistic transaction model

MatrixOne defaults to a pessimistic transaction.

Pessimistic concurrent transactions are typically used in environments with high data contention. When you read a row using pessimistic concurrency, the row is not locked. When you want to update a row, the application must determine whether another user has locked the row.

In the pessimistic concurrency model, if you receive a value from the database, another user will encounter a lock and enter a waiting state before you try to modify the value. After exceeding the transaction waiting time (5 minutes) set by MatrixOne, Waiting transactions will be forcibly canceled.

### Deadlock

In a pessimistic transaction, there may be a situation where two or more transactions lock the resources needed by each other, making it impossible for each transaction to proceed. This situation is called dead. Only through human intervention in one of the transactions, for example, by manually `Kill` the session, can the deadlock be ended immediately; otherwise, the transaction can only wait for the maximum waiting time.

An example of a deadlock is shown in the following figure:

![image-20221026152318567](https://github.com/matrixorigin/artwork/blob/main/docs/distributed-transaction/deadlocked-en.png?raw=true)

### Example

The following is an example of pessimistic concurrency, showing how MatrixOne resolves concurrency conflicts.

1. At 1:00 PM, User 1 reads a row from the database with the following value:

   ```
   CustID LastName FirstName
   101 Smith Bob
   ```

   |Column name|Original value|Current value|Value in database|
   |---|---|---|---|
   |CustID|101|101|101|
   |LastName|Smith|Smith|Smith|
   |FirstName|Bob|Bob|Bob|

2. At 1:01 PM, User 2 reads the same row from the database.

3. At 1:03 PM, User 2 changes the FirstName row from "Bob" to "Robert" and updates the database and the uncommitted state at this time.

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|Robert|Bob|

4. At 1:05 PM, User 1 changes the FirstName column from "Bob" to "James" and attempts to update it.

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|James|Bob|

5. At this point, user 1 encounters a pessimistic concurrency conflict because the row where the value "Robert" in the database has been locked and needs to wait for user 2's next operation.

6. At 1:06 PM, User 1 commits to the transaction. At this time, user 2 releases the waiting state and starts the transaction, but because the corresponding FirstName cannot be matched, the transaction update of user 2 fails.
