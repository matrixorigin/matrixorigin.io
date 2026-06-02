# Optimistic Transactions in MatrixOne

## Optimistic Transaction principle

When the transaction starts, no conflict detection or lock will be performed, and the relevant data will be cached in the corresponding memory area. The data will be added, deleted, or modified.

After completing the modification, when entering the submission stage, it will be submitted in two steps:

**Step 1**: Use a column in the data to be written as the primary key column, lock the column and create a timestamp. Writes to related rows after this timestamp are judged as write conflicts.

**Step 2**: Write data, record the timestamp at this time, and unlock it.

## Optimistic Transaction model

MatrixOne supports an optimistic transaction model. You don't lock a row while reading it using optimistic concurrency. When you want to update a row, the application must determine whether another user has updated the row since it was read. Optimistic concurrent transactions are typically used in environments with low data contention.

In an optimistic concurrency model, an error occurs if you receive a value from the database and another user modifies it before you attempt to modify it.

### Example

The following is an example of optimistic concurrency, showing how MatrixOne resolves concurrency conflicts.

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

3. At 1:03 PM, User 2 changes the FirstName row from "Bob" to "Robert" and updates the database.

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|Robert|Bob|

4. As shown in the above table, the value in the database at the time of the update matches the original value of User 2, indicating that the update was successful.

5. At 1:05 PM, User 1 changes the FirstName row from "Bob" to "James" and attempts to update it.

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|James|Robert|

6. At this point, user 1 encounters an optimistic concurrency violation because the value "Robert" in the database no longer matches the original value "Bob" that user 1 expected. The concurrency violation indicates that the update failed. The next step is to overwrite User 2's changes with User 1's changes or cancel User 1's changes.
