# WAL Technical Details

WAL (Write Ahead Log) is a technology related to database atomicity and persistence that converts random writes into sequential reads and writes when a transaction is committed. Transactional changes occur randomly on pages that are scattered, and the overhead of random writes is greater than sequential writes, which degrades commit performance. WAL only records changes to a transaction, such as adding a line to a block. The new WAL entry is written sequentially at the end of the WAL file when the transaction is committed, and then asynchronously updates those dirty pages after the commit, destroying the corresponding WAL entry and freeing up space.

MatrixOne's WAL is a physical log that records where each row of updates occurs, and each time it is played back, the data is not only logically the same, but also the same organization at the bottom.

## Commit Pipeline

Commit Pipeline is a component that handles transaction commits. The memtable is updated before committing, persisting WAL entries, and the time taken to perform these tasks determines the performance of the commit. Persistent WAL entry involves IO and is time consuming. The commit pipeline is used in MatrixOne to asynchronously persist WAL entries without blocking updates in memory.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/wal_Commit_Pipeline.png?raw=true)

**The transaction commit process is:**

- Update the changes to the memtable and update the memtable concurrently before the transaction enters the commit pipeline without blocking each other. The status of these changes is then uncommitted and invisible to any transaction;

- Enter the commit pipeline to check for conflicts;

- Persistent WAL entry, collecting WAL entry writes from memory to the backend. Persistent WAL entries are asynchronous, and queues that simply pass the WAL entry to the backend immediately return without waiting for the write to succeed, so that other subsequent transactions are not blocked. The backend handles a batch of entries simultaneously, further accelerating persistence through Group Commit.

- Updating the state in the memtable makes the transaction visible, and the transaction updates the state in the order in which it was queued, so that the order in which the transaction is visible matches the order in which WAL entries were written in the queue.

## Checkpoint

Checkpoint writes dirty data to Storage, destroys old log entries, and frees up space. In MatrixOne, checkpoint is a background-initiated task that flows:

- Select an appropriate timestamp as checkpoint and scan for changes before the timestamp. t0 on the diagram is the last checkpoint and t1 is the currently selected checkpoint. Changes that occur between \[t0,t1] require staging.

- Dump DML modifications. DML changes are stored in various blocks in the memtable. Logtail Mgr is a memory module that records which blocks are changed for each transaction. Scan transactions between \[t0,t1] on Logtail Mgr, initiate background transactions to dump these blocks onto Storage, and record addresses in metadata. This way, all DML changes committed before t1 can be traced to addresses in the metadata. In order to do checkpoints in time to keep the WAL from growing infinitely, even if the block in the interval changes only one line, it needs to be dumped.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/wal_Checkpoint1.png?raw=true width=80% heigth=80%/>
</div>

- Scans for Catalog dump DDL and metadata changes. The Catalog is a tree that records all DDL and metadata information, and each node on the tree records the timestamp at which the change occurred. Collect all changes that fall between \[t0,t1] when scanning.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/wal_Checkpoint2.png?raw=true width=80% heigth=80%/>
</div>

- Destroy the old WAL entry. The LSN corresponding to each transaction is stored in Logtail Mgr. Based on the timestamp, find the last transaction before t1 and tell Log Backend to clean up all logs before the LSN of this transaction.

## Log Backend

MatrixOne's WAL can be written in various Log Backends. The original Log Backend was based on the local file system. For distributed features, we developed our own highly reliable low latency Log Service as the new Log Backend. We abstract a virtual backend to accommodate different log backends, developed by some very lightweight drivers, docking different backends.

**Driver needs to adapt these interfaces:**

- Append, write log entry asynchronously when committing a transaction:

```
Append(entry) (Lsn, error) 
```

- Read, batch read log entry on reboot:

```
Read(Lsn, maxSize) (entry, Lsn, error) 
```

- The Truncate interface destroys all log entries before the LSN, freeing up space:

```
Truncate(lsn Lsn) error 
```

## Group Commit

Group Commit accelerates persistent log entries. Persistent log entry involves IO, is time consuming, and is often a bottleneck for commits. To reduce latency, bulk write log entries to Log Backend. For example, fsync takes a long time in a file system. If each entry is fsynced, it takes a lot of time. In file system-based Log Backend, where multiple entries are written and fsynced only once, the sum of the time costs of these entry swipes approximates the time of one entry swipe.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/wal_Group_Commit.png?raw=true)

Concurrent writes are supported in the Log Service, and the time of each entry swipe can overlap, which also reduces the total time to write an entry and improves the concurrency of commits.

## Handle out-of-order LSNs for Log Backend

To accelerate, concurrent entries are written to Log Backend in an inconsistent order of success and the order in which the requests are made, resulting in inconsistent LSNs generated in Log Backend and logical LSNs passed to the Driver by the upper layers. Truncate and reboot to handle these out-of-order LSNs. In order to ensure that the LSNs in Log Backend are basically ordered and the out-of-order span is not too large, a window of logical LSNs is maintained that stops writing new entries to Log Backend if there are very early log entries that are not being written successfully. For example, if the window is 7 in length and an entry with an LSN of 13 in the figure has not been returned, it blocks an entry with an LSN greater than or equal to 20.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/wal_Log_Backend.png?raw=true)

Destroy the log in Log Backend with the truncate operation, destroying all entries before the specified LSN. entry before this LSN corresponds to a logical LSN that is smaller than the logical truncate point. For example, the logic truncates through 7 in the figure. This entry corresponds to 11 in Log Backend, but the logical LSNs for 5, 6, 7, and 10 in Log Backend are all greater than 7 and cannot be truncate. Log Backend can only truncate 4.

On restart, those discontinuous entries at the beginning and end are skipped. For example, when Log Backend on the diagram writes to 14, the entire machine loses power, and the first 8,9,11 are filtered out on reboot based on the last truncate information. When all entries are read and the logical LSNs of 6,14 and the other entries are not continuous, the last 6 and 14 are discarded.

## Specific format for WAL in MatrixOne

Each write transaction corresponds to one log entry and consists of an LSN, Transaction Context, and multiple Commands.

```
+---------------------------------------------------------+
|                  Transaction Entry                      |
+-----+---------------------+-----------+-----------+-   -+
| LSN | Transaction Context | Command-1 | Command-2 | ... |
+-----+---------------------+-----------+-----------+-   -+
```

**LSN**: Each log entry corresponds to one LSN. The LSN is incremented continuously and is used to delete entries when doing checkpoints.

**Transaction Context**:Logging transaction information

- StartTS is the timestamp when the transaction started.
- CommitTS is the timestamp of the end.
- Memo records where a transaction changes data. Upon reboot, this information is restored to Logtail Mgr and used for checkpointing.

```
+---------------------------+
|   Transaction Context     |
+---------+----------+------+
| StartTS | CommitTS | Memo |
+---------+----------+------+
```

**Transaction Commands**: Each write operation in a transaction corresponds to one or more commands. log entry logs all commands in the transaction.

| Operator           | Command           |
| :----------------- | :---------------- |
| DDL                | Update Catalog    |
| Insert             | Update Catalog    |
|                    | Append            |
| Delete             | Delete            |
| Compact&Merge      | Update Catalog    |

- Operators: The DN in MatrixOne is responsible for committing transactions, writing log entries into Log Backend, doing checkpoints. DN supports build library, delete library, build table, delete table, update table structure, insert, delete, while background automatically triggers sorting. The update operation is split into insert and delete.

    - DDL  
    DDL includes building libraries, deleting libraries, building tables, deleting tables, and updating table structures. The DN records information about tables and libraries in the Catalog. The Catalog in memory is a tree and each node is a catalog entry. catalog entry has 4 classes, database, table, segment and block, where segment and block are metadata that changes when data is inserted and sorted in the background. Each database entry corresponds to one library and each table entry corresponds to one table. Each DDL operation corresponds to a database/table entry, which is logged in entry as Update Catalog Command.

    - Insert  
    The newly inserted data is recorded in the Append Command. The data in the DN is recorded in blocks, which form a segment. If there are not enough blocks or segments in the DN to record the newly inserted data, a new one is created. These changes are documented in the Update Catalog Command. In large transactions, the CN writes the data directly to S3 and the DN commits only the metadata. This way, the data in the Append Command will not be large.
  
    - Delete  
    The line number where the DN record Delete occurred. When reading, read all the inserted data before subtracting the rows. In a transaction, all deletions on the same block are merged to correspond to a Delete Command.

    - Compact & Merge  
    The DN background initiates a transaction to dump the data in memory onto s3. Sort the data on S3 by primary key for easy filtering when reading. compact occurs on a block and the data within the block is ordered after compact. merge occurs within a segment and involves multiple blocks, after merge the entire segment is ordered. The data before and after compact/merge remains the same, changing only the metadata, deleting the old block/segment, and creating a new block/segment. Each delete/create corresponds to one Update Catalog Command.

- Commands

<div>&amp;nbsp&amp;nbsp&amp;nbsp1. &amp;nbspUpdate Catalog</div>

The Catalog is database, table, segment, and block from top to bottom. An Updata Catalog Command corresponds to a Catalog Entry. One Update Catalog Command per ddl or with the new metadata. The Update Catalog Command contains Dest and EntryNode.

```
+-------------------+
|   Update Catalog  |
+-------+-----------+
| Dest  | EntryNode |
+-------+-----------+
```

Dest is where this command works, recording the id of the corresponding node and his ancestor node. Upon reboot, via Dest, locate the location of the action on the Catalog.

| Type               | Dest                                |
| :------------------|:------------------------------------------|
| Update Database    | database id                               |
| Update Table       | database id,table id                      |
| Update Segment     | database id,table id,segment id           |
| Update Block       | atabase id,table id,segment id,block id   |

EntryNode records when an entry was created and deleted. If entry is not deleted, the deletion time is 0. If the current transaction is being created or deleted, the corresponding time is UncommitTS.

```
+-------------------+
|    Entry Node     |
+---------+---------+
| Create@ | Delete@ |
+---------+---------+
```

For segment and block, Entry Node also records metaLoc, deltaLoc, which are the addresses recorded on S3 for data and deletion, respectively.

```
 +----------------------------------------+
 |               Entry Node               |
 +---------+---------+---------+----------+
 | Create@ | Delete@ | metaLoc | deltaLoc |
 +---------+---------+---------+----------+
```

For tables, Entry Node also documents the table structure schema.

```
 +----------------------------+
 |         Entry Node         |
 +---------+---------+--------+
 | Create@ | Delete@ | schema |
 +---------+---------+--------+
```

<div>&amp;nbsp&amp;nbsp&amp;nbsp2. &amp;nbspAppend</div>

The inserted data and the location of that data are documented in the Append Command.

```
+-------------------------------------------+
|             Append Command                |
+--------------+--------------+-   -+-------+
| AppendInfo-1 | AppendInfo-2 | ... | Batch |
+--------------+--------------+-   -+-------+
```

- Batch is the inserted data.

- AppendInfo  
 Data in one Append Data Command may span multiple blocks. Each block corresponds to an Append Info that records the location of the data in Command's Batch pointer to data, and the location destination of the data in the block.

```
+------------------------------------------------------------------------------+
|                              AppendInfo                                      |
+-----------------+------------------------------------------------------------+
| pointer to data |                     destination                            |
+--------+--------+-------+----------+------------+----------+--------+--------+
| offset | length | db id | table id | segment id | block id | offset | length |
+--------+--------+-------+----------+------------+----------+--------+--------+
```

<div>&amp;nbsp&amp;nbsp&amp;nbsp3. &amp;nbspDelete Command</div>

Each Delete Command contains only one delete from a block.

```
+---------------------------+
|      Delete Command       |
+-------------+-------------+
| Destination | Delete Mask |
+-------------+-------------+
```

- Destination record on which Block Delete occurred.
- Delete Mask records the deleted line number.
