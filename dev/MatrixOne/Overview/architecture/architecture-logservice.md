# Detailed Logservice Architecture

Logservice plays a vital role in MatrixOne. It is an independent service used by external components through RPC for log management.

Logservice uses the dragonboat library based on the Raft protocol (a multi-raft group's Go language open source implementation) and usually uses local disks to store logs in multiple copies, similar to the management of WAL (Write-Ahead Log). The transaction commits must only be written to the Logservice without writing the data to S3. Additional components write batches of data to S3 asynchronously. Such a design ensures low latency when the transaction commits, and multiple copies provide high data reliability.

## Logservice Architecture

The architecture of Logservice consists of two parts: client and server. The server includes modules such as handler, dragonboat, and RSM (Replicated State Machine), while the client includes several key interfaces. The collaborative relationship between them is shown in the figure below:

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/logserviece-arch.png?raw=true)

### Client

Logservice client is mainly invoked by TN (Transaction node) and provides the following key interfaces:

- `Close()`: Close the client connection.
- `Config()`: Get client-related configuration.
- `GetLogRecord()`: returns a `pb.LogRecord` variable containing an 8-byte LSN (log sequence number), a 4-byte record type, and a data field of type `[]byte`. The data field consists of 4 bytes for `pb.UserEntryUpdate`, 8 for the replica TN ID, and `payload []byte`.
- `Append()`: Append `pb.LogRecord` to Logservice and return LSN. The parameter `pb.LogRecord` can be reused on the calling side.
- `Read()`: Read logs starting from the specified `firstLsn` from the Logservice until maxSize is reached. The returned LSN is used as the starting point for the next read.
- `Truncate()`: Delete the logs before the specified LSN to free up disk space.
- `GetTruncatedLsn()`: Returns the LSN of the most recently deleted log.
- `GetTSOTimestamp()`: Request the specified timestamps from TSO (Timestamp Oracle). The caller occupies the scope of `[returned value, returned value + count]`. This method currently needs to be used.

The Logservice client sends a request to the Logservice server through MO-RPC, and the server interacts with `Raft`/`dragonboat` and returns the result.

### Server

#### Server Handler

The server side of Logservice receives requests from clients and handles them. The entry function is `(*Service).handle()`, and different requests are processed by calling other methods:

- Append: Appends logs to Logservice, ultimately invoking the `(*NodeHost) SyncPropose()` method of Dragonboat for synchronous proposal. It waits for the log to be committed and applied before returning, and the return value is the LSN (Log Sequence Number) after a successful log write.
- Read: Reads log entries from the log database. It first calls the `(*NodeHost) SyncRead()` method to perform a linear read from the state machine up to the current LSN and then calls the `(*NodeHost) QueryRaftLog()` method to read log entries from the log database based on the LSN.
- Truncate: Truncates logs in the log database to free up disk space. It's important to note that here, only the latest truncatable LSN in the state machine is updated, and the actual truncation operation still needs to be performed.
- Connect: Establishes a connection with the Logservice server and attempts to read and write the state machine for state checking.
- Heartbeat: Includes heartbeats to Logservice, CN, and TN. This request updates the status information of each entity in the HAKeeper's state machine and synchronizes the tick of HAKeeper. When the HAKeeper performs checks, it compares the offline time based on the tick, and if it's offline, it triggers removal or shutdown operations.
- Get XXX: Retrieves relevant information from the state machine.

#### Bootstrap

Bootstrap is the process that occurs when the logservice server starts, and it is carried out through HAKeeper's shard ID 0. The entry function is `(*Service) BootstrapHAKeeper`.
Regardless of how many replicas are configured, each logservice process starts a replica of HAKeeper during startup. Each replica sets up members (replicas) upon startup, and the HAKeeper shard starts Raft with these members as the default replica count.
After completing the leader election in Raft, it executes setting the initial cluster information (`set initial cluster info`), sets the shard to count for logs and TNs, and sets the replica count for logs.
Once the replica count is set, any excess HAKeeper replicas will be stopped.

#### Heartbeat

This heartbeat is sent from Logservice, CN, and TN to HAKeeper, rather than being a heartbeat between Raft replicas. It serves two primary purposes:

1. Sending the status information of each replica to HAKeeper through heartbeats, allowing HAKeeper's state machine to update replica information.
2. Retrieving commands that replicas need to execute from HAKeeper upon heartbeat response.

The heartbeat process in Logservice is illustrated in the following diagram, and the process is similar for CN and TN.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/heartbeat.png?raw=true)

By default, the heartbeat is executed once per second, and its mechanism is as follows:

1. Generate heartbeat information for all shard replicas on the storage level, including shard ID, node information, term, leader, etc.
2. Send the request to the server side of Logservice.
3. Upon receiving the request, the server invokes the `(*Service) handleLogHeartbeat()` method to process it and uses propose to send the heartbeat to Raft.
4. Upon receiving the heartbeat, the state machine of HAKeeper calls the `(*stateMachine) handleLogHeartbeat()` method to process it, primarily performing the following tasks:
    - Updating the LogState in the state machine: Invoking the `(*LogState) Update()` method to update storage and shard information.
    - Retrieving commands from the `ScheduleCommands` of the state machine and returning them to the initiating end for execution.

The principles of CN and TN sending heartbeats to HAKeeper are also similar.

#### Replicated State Machine (RSM)

Logservice and HAKeeper have an in-memory replicated state machine model where all data is stored in memory. They both implement the IStateMachine interface, and the key methods are as follows:

- `Update()`: After completing a propose and commit (i.e., when a majority of replicas have finished writing), the `Update()` method is called to update the data in the state machine. The user implements the `Update()` method and must be side-effect free, meaning that the same input must yield the same output. Otherwise, it can lead to an unstable state machine. The results of the `Update()` method are returned through the Result structure, and if an error occurs, the error field is not empty.
- `Lookup()`: Used to retrieve data from the state machine. The data type to be retrieved is specified through the `interface{}` parameter, and the result is also of type `interface{}`. Therefore, users need to define the data in the state machine, pass the corresponding data type, and then perform type assertion. `Lookup()` is a read-only method and should not modify the data in the state machine.
- `SaveSnapshot()`: Creates a snapshot by writing the data from the state machine to an `io.Writer` interface, typically a file handle. Thus, the snapshot is ultimately saved to a local disk file. `ISnapshotFileCollection` represents a list of files outside the state machine's file system (if any), which will also be stored in the snapshot. The third parameter is to notify the snapshot process that the Raft replica has stopped, terminating the snapshot operation.
- `RecoverFromSnapshot()`: Recovers the state machine data by reading the latest snapshot data from an `io.Reader`. `[]SnapshotFile` represents an additional list of files directly copied to the state machine's data directory. The third parameter controls the snapshot operation's recovery, stopping it when Raft replica operations are being performed.
- `Close()`: Closes the state machine and performs any necessary cleanup tasks.

### Read-Write Process

In Logservice, the general process for a read-write request is as follows:

#### Write Process

1. The request is forwarded to the leader node if the connected node is not the leader. Upon receiving the request, the leader node writes the log entry to its local disk.
2. Simultaneously, the request is asynchronously sent to follower nodes. Upon receiving the request, each follower node writes the log entry to its local disk.
3. Once most nodes have completed the write, the commit index is updated, and other follower nodes are notified through heartbeat messages.
4. The leader node executes the state machine operations (apply) after the write is committed.
5. The result is returned to the client after the state machine operations are completed.
6. Each follower node independently executes its state machine operations upon receiving the commit index from the leader.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/write.png?raw=true)

#### Read Process

Reading data can be divided into two scenarios:

- Reading data from the state machine.

    * The client initiates a read request, and when the request reaches the leader node, the current commit index is recorded.
    * The leader node sends heartbeat requests to all nodes to confirm its leader status. Once most nodes respond and confirm it as the leader, it can respond to the read request.
    * Wait for the apply index to be greater than or equal to the commit index.
    * Once the condition is met, the data can be read from the state machine and returned to the client.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/read.png?raw=true)

- Reading log entries from the log database (log db).

    * This process typically occurs during cluster restart.
    * During restart, replicas first need to recover the state machine data from the snapshot, then start reading log entries from the log database based on the index position recorded in the snapshot and apply them to the state machine.
    * After this operation is completed, replicas can participate in leader elections.
    * When a leader is elected in the cluster, the Transaction nodes (TN) connect to the Logservice cluster and start reading log entries from the last checkpoint position of a replica's log database. These log entries are replayed into the Transaction node's in-memory data.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/logdb-read.png?raw=true)

### Truncation

As the log entries in Logservice's log database continue to grow, it can lead to insufficient disk space. Therefore, regular disk space release is needed, achieved through truncation.

Logservice uses an in-memory-based state machine that only stores some metadata and status information, such as tick, state, and LSN (Log Sequence Number), without recording user data. User data is recorded by the Transaction nodes (TN) themselves. You can think of it as a master-slave architecture, where the state machines are separate, and the TN and Logservice maintain their respective state machines.

In this design with separate state machines, a simple snapshot mechanism can cause issues:

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/truncation-1.png?raw=true)

1. When a TN sends a truncation request and sets the truncation index to 100, the applied index of the Logservice's state machine is 200. This means that logs before index 200 will be deleted, and a snapshot will be generated at that position. Note: The truncation index is not equal to the applied index.
2. The cluster restarts.
3. The Logservice's state machine applies the snapshot with index 200, sets the first index to 200 (deleting logs before index 200), and replays logs before providing the service.
4. When the TN reads log entries from Logservice, starting from index 100, it fails to read because the logs before index 200 have been deleted, resulting in an error.

To address the above problem, the current truncation workflow is as follows:

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/logservice/truncation-2.png?raw=true)

1. The TN sends a truncation request and updates the truncation LSN (truncateLsn) in the Logservice's state machine. Only the value is updated, and no snapshot/truncation operation is executed.
2. Each Logservice server internally starts a truncation worker that periodically sends truncation requests (Truncate Request). It's important to note that the Exported parameter in this request is true, indicating that the snapshot is not visible to the system and is only exported to a specified directory.
3. The truncation worker also checks the list of currently exported snapshots to see if there are any snapshots with an index greater than the truncation LSN in the Logservice's state machine. If there are, the snapshot closest to the truncation LSN is imported into the system to make it effective and visible to the system.
4. All replicas perform the same operations to ensure that the snapshot LSN of both state machines is consistent. This allows reading the corresponding log entries when the cluster restarts.
