# Transaction and Lock Mechanisms Architecture

This article provides an in-depth look into the implementation details of the transaction and lock mechanisms in MatrixOne.

## Transaction Features in MatrixOne

MatrixOne supports default pessimistic transactions and Read Committed isolation level. It also supports optimistic transactions based on Snapshot Isolation. However, optimistic and pessimistic transactions cannot run simultaneously in a cluster. In a cluster, you either use the pessimistic or optimistic transaction models.

## Transaction Architecture in MatrixOne

MatrixOne's cluster comprises three built-in services: CN (Compute Node), TN (Transaction Node), LogService, and an external object storage service.

### CN (Compute Node)

CN is the compute node responsible for executing most computational tasks. Each transaction client, such as JDBC or MySQL clients, establishes a connection with a CN, and transactions initiated are created on the corresponding CN. Each transaction is allocated a workspace on the CN to store temporary data. When a transaction is committed, the data in the workspace is sent to the TN node for processing.

### TN (Transaction Node)

TN is the transaction node responsible for handling transaction commits from all CN nodes. TN's responsibilities include writing the transaction's commit log to the LogService and writing the committed data to memory. When the memory data reaches certain conditions, TN writes the committed data to external object storage and cleans up related logs.

### LogService

LogService is a logging node similar to the TN node's Write-Ahead Logging (WAL) system. It uses the Raft protocol to store logs as multiple replicas, ensuring high availability and consistency. LogService can be used to recover TN nodes at any time.

It's important to note that logs stored in LogService do not grow indefinitely. When the log size reaches a certain threshold, TN writes the data corresponding to the logs in LogService to external object storage and truncates the logs. This truncated log data is called "LogTail," and together with the data stored in external object storage, constitutes the complete data of the MatrixOne database.

### Clock Scheme

MatrixOne employs the Hybrid Logical Clocks (HLC) clock scheme and integrates it with the built-in MatrixOne Remote Procedure Call (MORPC) for clock synchronization between CN and TN nodes.

### Read Operations in Transactions

Transaction operations occur on CN nodes, where they can view data versions using Multi-Version Concurrency Control (MVCC) depending on the transaction's snapshot timestamp (SnapshotTS).

Once a transaction determines its SnapshotTS, it must access two datasets: one stored in object storage and the other in LogTail. CN can directly access data stored in object storage and provides caching for improved data read performance. Data in LogTail is distributed in the memory of TN nodes.

In previous versions, CN nodes used a "Pull Mode," which means they only actively synchronized LogTail data with TN after a transaction began. This led to performance issues, high latency, and reduced throughput. However, starting from version 0.8, MatrixOne introduced a "Push Mode." In this mode, LogTail synchronization is no longer initiated at the beginning of a transaction but is based on CN-level subscriptions. TN nodes push incremental LogTail to subscribed CN nodes whenever there are changes.

In Push Mode, each CN node continuously receives LogTail updates from TN nodes and maintains the same memory data structures as TN nodes, along with the timestamp of the last consumed LogTail. Once a transaction's SnapshotTS is determined, it only needs to wait for the timestamp of the previously consumed LogTail to be greater than or equal to SnapshotTS, indicating that the CN has the complete SnapshotTS dataset.

### Data Visibility

The data a transaction can read depends on its SnapshotTS.

If every transaction uses the latest timestamp as SnapshotTS, it can read any data committed before it. This ensures that the data read is always the most recent but comes with a performance cost.

In Pull Mode, transactions must wait until all transactions that occurred before the SnapshotTS are committed. The newer the SnapshotTS, the more transactions it needs to wait for, resulting in higher latency.

In Push Mode, CN nodes must wait until all transactions before the SnapshotTS have consumed their Commit LogTail. Like in Pull Mode, the newer the SnapshotTS, the more transactions must be delayed, leading to higher latency.

However, it's not always necessary to read the latest data. MatrixOne provides two data freshness levels:

1. Using the current timestamp as SnapshotTS always to view the latest data.

2. Using the maximum LogTail timestamp, the CN node has consumed as SnapshotTS.

For the second approach, it has the advantage of minimal transaction latency, allowing immediate read and write operations. However, it introduces a problem: if multiple transactions are on the same database connection, the subsequent transaction may not see the writes of the previous transaction. This happens because when the subsequent transaction starts, the TN node hasn't yet pushed the Commit LogTail of the last transaction to the current CN node, causing the subsequent transaction to use an older SnapshotTS and not see the writes of the previous transaction.

To address this issue, MatrixOne maintains two timestamps: the CommitTS of the last transaction on the current CN node (CNCommitTS) and the CommitTS of the previous transaction in the session (database connection) (SessionCommitTS). Additionally, two data visibility levels are provided: session-level data visibility, which uses Max(SessionCommitTS, LastLogTailTS) as the transaction's SnapshotTS to ensure visibility of data within the same session, and CN-level data visibility, which uses Max(CNCommitTS, LastLogTailTS) as the transaction's SnapshotTS to ensure visibility of data within the same CN node.

## Read Committed (RC)

The previous sections primarily introduced how transactions are processed in MatrixOne. MatrixOne previously only supported SI isolation level, implemented on top of MVCC with multiple data versions. However, MatrixOne now supports the Read Committed (RC) isolation level.

To implement the RC isolation level on top of multiple versions, SI transactions need to maintain consistent snapshots. In RC, one consistent snapshot is no longer for the entire transaction lifecycle but for each query. Each query starts with the current timestamp as the transaction's SnapshotTS to ensure it can see previously committed data.

In RC mode, for statements with updates (UPDATE, DELETE, SELECT FOR UPDATE), once a write-write conflict occurs, indicating that other concurrent transactions have modified the data involved in the query, RC must see the latest committed data. If the conflicting transaction has already been committed, RC needs to update the transaction's SnapshotTS and retry the query.

## Pessimistic Transactions

This chapter explains how MatrixOne implements pessimistic transactions and related design considerations.

### Core Issues to Address

Implementing pessimistic transactions in MatrixOne requires addressing several key issues:

#### Providing Lock Services

Lock services are used to lock individual records, ranges, or even entire tables. When a transaction needs to lock resources in read/write operations, it should implement lock waiting if lock conflicts are detected. In a deadlock cycle, a deadlock detection mechanism should be in place to resolve deadlocks.

#### Scalable Lock Service Performance

MatrixOne's transactions can occur on any CN node. When multiple nodes access the lock service simultaneously, the lock service must be scalable.

#### Removing Conflict Detection in TN Node's Commit Phase

In a pessimistic mode, multiple TN nodes exist in the MatrixOne cluster. Thus, it is necessary to remove conflict detection safely.

 The Commit phase of TN nodes.

### Lock Service

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/lockservice.png?raw=true)

MatrixOne has implemented LockService to provide lock services, including locking, unlocking, lock conflict detection, lock waiting, and deadlock detection.

LockService is not a separately deployed component but a part of CN. In a MatrixOne cluster, each CN's LockService instance is aware of other LockService instances, coordinating the work of LockService across the entire cluster. Each CN only accesses its local LockService instance and is unaware of other LockService instances. From the perspective of a CN, the current node's LockService behaves like a local component.

#### LockTable

Lock information is stored in a LockTable component, and one LockService can contain multiple LockTables.

In the MatrixOne cluster, when a lock service for a table is accessed for the first time, the LockService creates a LockTable instance, which is then attached to the current CN's LockService instance. Across the entire cluster, a LockTable will have one local LockTable and multiple remote LockTable instances. Only the local LockTable genuinely holds lock information, while the remote LockTable is a proxy for accessing the local LockTable.

#### LockTableAllocator

LockTableAllocator is a component used to allocate LockTables, and it maintains the distribution of all LockTables in memory within the MatrixOne cluster.

LockTableAllocator is not a separately deployed component but is part of TN. Because the binding between LockTable and LockService is mutable (e.g., if LockTableAllocator detects a CN going offline, the binding relationship changes), each change in critical results in an increase in the compulsory version number.

Within the time window of transaction initiation and transaction submission, the binding relationship between LockTable and LockService may change. Such inconsistency might lead to data conflicts and invalidate the pessimistic transaction model. Therefore, LockTableAllocator is a component of TN and checks whether the binding relationship has changed before processing the transaction's submission. If an outdated binding relationship is detected for a transaction's access to LockTable, the transaction is aborted to ensure correctness.

#### Distributed Deadlock Detection

Locks held by all active transactions are distributed across the local LockTables of multiple LockServices, requiring a distributed deadlock detection mechanism.

Each LockService has a deadlock detection module with a detection mechanism as follows:

- Maintain a waiting queue in memory for each lock.
- When a new conflict occurs, add the transaction to the waiting queue of the lock holder.
- Start an asynchronous task to check for waiting cycles among all transactions holding locks recursively. If remote transactions' locks are encountered, fetch all lock information held by remote transactions using RPC.

#### Reliability

Critical data of the entire lock service is stored in memory, including lock information, LockTable, and the binding relationship of LockTable and LockService. For lock information recorded internally in the local LockTable, if a CN node crashes, transactions connected to that CN fail as database connections are disconnected. Then, the LockTableAllocator reallocates LockTable and LockService binding relationships to ensure the entire lock service continues to provide service.

LockTableAllocator runs in TN, and if TN crashes, HAKeeper will repair a new TN, causing all binding relationships to become invalid. This means that mismatched critical relationships will fail all currently active transactions.

### How to Use Lock Service

MatrixOne has implemented a Lock operator responsible for invoking and handling the lock service to utilize the lock service effectively.

In the SQL planning phase, relevant conditions are handled if it is a pessimistic transaction. During the execution phase, the Lock operator is inserted at the appropriate location.

- For `INSERT` operations, in the planning phase, the Lock operator is inserted before any other Insert operators, and during execution, subsequent operators are executed only after successfully acquiring the lock.

- For `DELETE` operations, similar to inserts, the planning phase inserts the Lock operator before other Delete operators, and execution proceeds only after acquiring the lock.

- The planning phase is split into Delete+Insert for' UPDATE' operations. Thus, there are two lock stages (unless the primary key is unaltered, in which case optimization avoids one of the lock stages).
