# Transactional Analytical Engine Architecture

MatrixOne's storage engine is called the Transactional Analytical Engine (TAE).

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/tae-arch.png?raw=true)

## Storage Engine Architecture

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/tae-storage.png?raw=true)

The Transactional Analytical Engine (TAE) organizes data into column blocks, the minor IO units. Currently, these blocks are organized with a fixed number of rows. For columns of the Blob type, special handling is performed.

TAE organizes data in the form of tables, and the data of each table is structured as a Log-structured Merge-tree (LSM) tree. The current implementation of TAE is a three-level LSM tree, including L0, L1, and L2. L0 is relatively tiny and stored entirely in memory, while L1 and L2 are persisted on disk.

In TAE, L0 consists of transient blocks, where data is unsorted. On the other hand, L1 consists of sorted blocks that contain sorted data. New data is permanently inserted into the latest transient block. When the number of rows in a transient block exceeds a limit due to inserted data, the block is sorted by the primary key and then flushed into L1 as a sorted block. If the number of sorted blocks exceeds the maximum limit for a segment, a merge sort method is used to sort and write them into L2.

Both L1 and L2 store data sorted by the primary key. The main difference between the two is that L1 ensures data is sorted within a block, while L2 ensures data is sorted within each segment. A segment is a logical concept equivalent to row groups or sets in other implementations. A segment can be compressed based on the number of updates (delete) operations, resulting in a new segment. Additionally, multiple segments can be merged into a new segment. These operations are performed by background asynchronous tasks, with scheduling strategies that balance write amplification and read amplification.

## Key Features

- Suitable for AP scenarios: TAE offers efficient data compression, high query efficiency, fast aggregate operations, and concurrent solid processing capabilities. Therefore, TAE performs better and is more suitable for analytics processing and data warehousing scenarios, especially with large-scale data.
- Flexible workload adaptation: By introducing the concept of Column Families, TAE allows flexible workload adaptation. For example, if all columns belong to the same Column Family (i.e., all column data is stored together), it behaves similarly to row storage. If each column is an independent Column Family (i.e., each column is stored independently), it behaves like a column storage. Users can easily switch between row and column storage by specifying it in the DDL table definition.

## Indexing and Metadata Management

Like traditional column storage engines, TAE introduces Zonemap (min/max data) information at the block and segment levels. As a transactional storage engine, TAE implements complete primary key constraint functionality, including support for multi-column primary keys and global auto-increment IDs. A primary key index is automatically created for each table to ensure data deduplication during data insertion to satisfy the primary key constraint and enable filtering based on the primary key.

Primary key deduplication is a critical step in data insertion. TAE achieves a balance in the following aspects:

- Query performance
- Memory usage
- Data layout matching

From an indexing granularity perspective, TAE can be divided into table-level indexing and segment-level indexing. For example, there can be one table-level index or one index per segment. Since TAE's table data consists of multiple segments, each undergoing compression/merging processes from L1 to L3, transitioning from unordered to ordered, table-level indexing is unfavorable. Therefore, TAE's indexing is built at the segment level.

In segment-level indexing, there are two segments: append-only and non-dependable. For non-appendable segments, the segment-level index is a two-tier structure consisting of a Bloom filter and a Zone map. Dependable segments are composed of at least one dependable block and multiple non-appendable blocks. The index of the dependable block is an ART-tree (Adaptive Radix Tree) structure and a Zonemap, which reside in memory. The non-appendable blocks contain a Bloom filter and a Zone map.

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/index-metadata.png?raw=true)

## Buffer Management

In a stable storage engine, efficient memory management is crucial for buffer management. Although buffer management is theoretically just the concept of a least-recently-used (LRU) cache, databases do not directly use the operating system's page cache to replace the cache manager, especially for transactional (TP) databases.

In MatrixOne, a cache manager is used to manage memory buffer areas. Each buffer node has a fixed size and is allocated to four areas:

1. Mutable: A fixed-size buffer area used to store transient column blocks from L0.
2. SST: A buffer area used to store blocks from L1 and L2.
3. Index

: An area for storing index information.
4. Redo log: Stores uncommitted transaction data, with at least one buffer needed per transaction.

Each buffer node can be in either the Loaded or Unloaded state. When a user requests a pin operation on a buffer node from the cache manager, the reference count of the node is increased if it is in the Loaded state. If the node is in the Unloaded state, it is read from disk or remote storage, increasing the reference count. When there is insufficient memory, the system removes some nodes from memory based on the LRU strategy to free up space. When a user unpins a node, they close the node handle. If the reference count is 0, the node becomes a candidate for removal, while it remains in memory if the reference count is greater than 0.

## Write-Ahead Log and Log Replay

In TAE, the handling of redo logs is optimized to make the column storage engine's Write-Ahead Log (WAL) design more efficient. Unlike a row storage engine, TAE only records redo logs during transaction commits instead of recording them for each write operation. Utilizing the cache manager reduces the usage of input/output (IO), especially for short-lived transactions that may require rollbacks, thereby avoiding IO events. Additionally, TAE can support large or long-running transactions.

The format of the log entry header in TAE's redo log follows the structure below:

| Item     | Byte Size |
| -------- | --------- |
| GroupID  | 4         |
| LSN      | 8         |
| Length   | 8         |
| Type     | 1         |

The transaction log entries include the following types:

| Type | Data Type | Value | Description                                        |
| ---- | --------- | ----- | -------------------------------------------------- |
| AC   | int8      | 0x10  | Full write operations of a committed transaction   |
| PC   | int8      | 0x11  | Partial write operations of a committed transaction |
| UC   | int8      | 0x12  | Partial write operations of an uncommitted transaction |
| RB   | int8      | 0x13  | Transaction rollback                               |
| CKP  | int8      | 0x40  | Checkpoint                                         |

Most transactions have only one log entry, but larger or longer transactions may require multiple entries. Therefore, a transaction's log may contain one or more UC-type log entries, one PC-type log entry, or just one AC-type log entry. UC-type log entries are allocated to a dedicated group.

In TAE, the payload of a transaction log entry contains multiple transaction nodes. Transaction nodes include data manipulation language (DML) operations such as delete, add, update, and data definition language (DDL) operations such as create/delete table, create/delete database, etc. Each transaction node is a sub-item of a committed log entry and can be understood as part of the transaction log. Active transaction nodes share a fixed-size memory space and are managed by the cache manager. When there is insufficient space, some transaction nodes are unloaded, and their corresponding log entries are saved in the redo log. These log entries are replayed and applied to their respective transaction nodes during loading.

A checkpoint is a safe point where the state machine can apply log entries during a system restart. Log entries before the checkpoint are no longer needed and will be physically destroyed at the appropriate time. TAE records information about the last checkpoint through groups, allowing log replay to start from the last checkpoint during system restart.

TAE's WAL and log replay components have been independently abstracted into a code module called log store. It provides an abstraction for low-level log storage and access operations, which can be adapted to different implementations ranging from single-node to distributed systems. At the physical level, the behavior of a store is similar to that of a message queue. Starting from version 0.6 of MatrixOne, we have evolved towards a cloud-native version, using a separate shared log service as the log service. Therefore, in future versions, TAE's log store will be appropriately modified to access the external shared log service directly, eliminating the dependency on local storage.

## Transaction Processing

TAE ensures transaction isolation by employing the Multi-Version Concurrency Control (MVCC) mechanism. Each transaction is equipped with a consistent read view determined by the transaction's start time, ensuring that the data read within the transaction never reflects modifications made by other concurrent transactions. TAE provides fine-grained optimistic concurrency control, and conflicts occur only when updates are made to the same row and column. Transactions use value versions that existed at the start of the transaction and do not lock them during read operations. When two transactions attempt to update the same value, the second fails due to a write-write conflict.

In TAE's architecture, a table consists of multiple segments, each resulting from multiple transactions. Therefore, a segment can be represented as `$[T{start}, T{end}]$` (· is the commit time of the earliest transaction, · is the commit time of the latest transaction). To compress and merge segments, an additional dimension is added to the representation of a segment: `$([T{start} T{end}]$`, `[T{create}, T{drop}])$` where `$T{create}$` is the creation time of the segment and `$T{drop}$` is the deletion time of the segment. When `$T{drop} = 0$`, it indicates that the segment has not been dropped. The representation of blocks is the same as that of segments: `$([T{start}, T{end}]$`, `[T{create}, T{drop}])$`. When a transaction is committed, its read view is determined by the commit time: `$(Txn{commit} \geqslant T{create}) \bigcap ((T{drop} = 0) \bigcup (T{drop} > Txn{commit}))$`.

Background asynchronous tasks handle the generation and transformation of segments. To ensure data consistency during data reading, TAE incorporates these asynchronous tasks into the transaction processing framework, as shown in the example below:

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/segment.png?raw=true)

Block `$Block1 {L0}$` in layer L0 is created at time `$t1$` and contains data from `$Txn1$`, `$Txn2$`, `$Txn3$`, and `$Txn4$`. Block `$Block1 {L0}$` starts sorting at `$t11$`; its read view is the baseline plus one uncommitted update node. Sorting and persisting blocks may take a long time. Before the committed sorted block `$Block2 {L1}$` is flushed, there are two committed transactions `$Txn5$`, `$Txn6$`, and one uncommitted transaction `$Txn7$`. When `$Txn7$` is committed at `$t16$`, it fails because `$Block1 {L0}$` has already been terminated. The update nodes `$Txn5$` and `$Txn6$` committed during the period `$(t11, t16)$` will be merged into a new update node, which will be committed together with `$Block2 {L1}$` at `$t16

$`.

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/compaction.png?raw=true)

The compaction process terminates a series of blocks or segments and atomically creates a new block or segment (or builds an index). Unlike regular transactions, this process often takes longer, and we do not want to block, update, or delete transactions involving the blocks or segments in question. Therefore, we extend the read view to include the metadata of blocks and segments. During the execution of a transaction, each write operation checks for write-write conflicts. If a conflict occurs, the transaction is terminated prematurely.

## MVCC (Multi-Version Concurrency Control)

The version storage mechanism of a database determines how the system stores different versions of tuples and the information contained in each version. TAE creates a lock-free linked list called the version chain based on the pointer fields of data tuples. The version chain allows the database to locate the desired version of a tuple accurately. Therefore, the storage mechanism for version data is an essential consideration in the design of a database storage engine.

One solution is to use an append-only mechanism to store all tuple versions of a table in the same storage space. Due to the inability to maintain a lock-free bidirectional linked list, the version chain can only point in one direction: from old to new (O2N) or from new to old (N2O).

Another similar solution is time travel, which keeps the information of the version chain separate while maintaining the primary version of tuples in the main table.

The third solution is to maintain the primary version of tuples in the main table and a series of incremental versions in separate storage. When updating existing tuples, the database acquires a continuous space from the incremental storage to create a new incremental version that only contains the original values of the modified attributes rather than the entire tuple. The database then directly updates the primary version in the main table.

Each of the above solutions has characteristics that impact its performance in OLTP workloads. For LSM trees, due to their inherent append-only structure, they are closer to the first solution. However, the linked list of the version chain may need to be made apparent.

TAE currently chooses a variant of the third solution:

![](https://github.com/matrixorigin/artwork/blob/main/docs/tae/mvcc.png?raw=true)

In heavy updates, the old version data of LSM tree structures can lead to significant read amplification. The cache manager maintains the version chain in TAE, and when it needs to be replaced, it is merged with the primary table data to generate new blocks. Thus, it is semantically in-place updates but implemented as copy-on-write, which is necessary for cloud storage. The newly generated blocks have less read amplification, which is advantageous for frequent AP queries after updates.
