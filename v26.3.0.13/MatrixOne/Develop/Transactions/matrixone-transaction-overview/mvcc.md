# MVCC

MVCC (Multiversion Concurrency Control) is applied to MatrixOne to ensure transaction snapshot and achieve transaction isolation.

Create a Latch Free linked list based on the pointer field of the data tuple (Tuple, that is, each row in the table), called the version chain. This version chain allows the database to locate the desired version of a Tuple. Therefore, the storage mechanism of these versions of data is an essential consideration in the design of the database storage engine.

One solution is the Append Only mechanism, where all tuple versions of a table are stored in the same storage space. This method is used in Postgre SQL. To update an existing Tuple, the database first fetches an empty slot from the table for the new version; then, it copies the current version's contents to the latest version. Finally, it applies the modifications to the Tuple in the newly allocated Slot. The critical decision of the Append Only mechanism is how to order the version chain of Tuple. Since it is impossible to maintain a lock-free doubly linked list, the version chain only points in one direction, either from Old to New (O2N) or New to Old (N2O).

Another similar scheme is called Time Travel, which stores the information of the version chain separately, while the main table maintains the main version data.

The third option is to maintain the main version of the tuple in the main table, and maintain a series of delta versions in a separate database comparison tool (delta) store. This storage is called a rollback segment in MySQL and Oracle. To update an existing tuple, the database fetches a contiguous space from the delta store to create a new delta version. This delta version contains the original value of the modified property, not the entire tuple. Then the database directly updates the main version in the main table (In Place Update).

![image-20221026152318567](https://github.com/matrixorigin/artwork/blob/main/docs/distributed-transaction/mvcc.png?raw=true)
