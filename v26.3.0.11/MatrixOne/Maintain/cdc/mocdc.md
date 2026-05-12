# mo_cdc Data Synchronization

**CDC (Change Data Capture)** is a technology that captures real-time changes in a database, recording insert, update, and delete operations. By monitoring database changes, it enables real-time data synchronization and incremental processing, ensuring consistency across different systems. CDC is suitable for scenarios such as real-time data synchronization, data migration, disaster recovery, and audit tracking. It reads transaction logs to reduce the pressure of full data replication and improves system performance and efficiency. Its advantages include low latency, high real-time capability, flexible support for multiple databases and systems, and adaptability to evolving large-scale data environments.

Before performing CDC synchronization, it is necessary to first establish PITR (Point-in-Time Recovery) capabilities covering the synchronization scope, with a recommended coverage of at least 2 hours of changes. This ensures that if the synchronization task is interrupted or encounters an exception, the system can backtrack and re-read the changed data, avoiding data loss or inconsistency.

MatrixOne supports data synchronization at the tenant/database/table level through the `mo_cdc` utility. This section introduces the usage of `mo_cdc`.

!!! note
    `mo_cdc` is an enterprise-level data synchronization tool. You need to contact your MatrixOne account manager to obtain the download path.

## Command Reference Guide

`help` - Print the reference guide.

```bash
(base) admin@admindeMBP mo-backup % ./mo_cdc help
This command allows you to manage CDC Task, including task create, task show, task pause, task resume, task restart, and task drop.

Usage:
  mo_cdc [flags]
  mo_cdc [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  task        Manage Task

Flags:
  -h, --help   help for mo_cdc

Use "mo_cdc [command] --help" for more information about a command.
```

## Create a Task

### Syntax

```
mo_cdc task create
    --task-name 
    --source-uri 
    --sink-type 
    --sink-uri 
    --level 
      account|database|table
    --databases
    --tables 
    --no-full 
    --start-ts
    --end-ts
    --start-ts 
    --end-ts
    --send-sql-timeout 
    --max-sql-length 
    --exclude
    --error-handle-option
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `task-name` | Synchronization task name |
| `source-uri` | Source (MatrixOne) connection string |
| `sink-type` | Downstream type, currently supports `mysql` and `matrixone` |
| `level` | Synchronization scope: `account`, `database`, or `table` |
| `databases` | Optional, required when the scope is database-level |
| `tables` | Optional, required when the scope is table-level |
| `no-full` | Optional, enables full synchronization by default; adding this parameter disables it |
| `start-ts` | Optional, starts pulling data from a specific timestamp in the database (must be earlier than the current time) |
| `end-ts` | Optional, stops pulling data at a specified timestamp (must be later than `start-ts` if specified) |
| `max-sql-length` | Optional, limits the length of a single SQL statement (defaults to the smaller of 4MB or the downstream `max_packet_size` variable) |
| `exclude` | Optional, specifies objects to exclude (supports regex) |
| `error-handle-option` | Optional, `stop` or `ignore`. Controls behavior when encountering errors during synchronization (default: `stop`; `ignore` skips the error and continues) |

#### Examples

```bash
>./mo_cdc task create --task-name "ms_task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --level table --tables "db1.t1:db1.t1"  

>./mo_cdc task create --task-name "ms_task2" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --level "account" 

>./mo_cdc task create --task-name "mo_task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@10.222.xx.xx:6001" --sink-type "matrixone" --level database --databases "db1:db2" 
```

## View Tasks

Only tasks created by the current connected user can be viewed.

### Syntax

```
mo_cdc task show
    --source-uri 
    --all 
    --task-name 
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `source-uri` | Source server address |
| `all` | View all synchronization tasks |
| `task-name` | Synchronization task name |

**Response Fields**

| Field | Description |
|  ----  | ----  |
| `task-id` | Task ID |
| `task-name` | Task name |
| `source-uri` | Source server address |
| `sink-uri` | Downstream resource identifier |
| `state` | Task status (`running` or `stopped`) |
| `checkpoint` | Synchronization progress |
| `timestamp` | Current timestamp |

#### Examples

```bash
# View all synchronization tasks
> ./mo_cdc task show --source-uri "mysql://root:111@127.0.0.1:6001"  --all
[
  {
    "task-id": "0195db8d-1a36-73d0-9fa3-e37839638b4b",
    "task-name": "mo_task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@10.222.xx.xx:6001",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:00:35.790209 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  },
  {
    "task-id": "0195db5c-6406-73d8-bbf6-25fb8b9dd45d",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"source_db.orders\": 2025-03-28 15:00:35.620173 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  },
  {
    "task-id": "0195db82-7d6f-7f2a-a6d0-24cbe6ae8896",
    "task-name": "ms_task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:00:35.632194 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  }
]


# View a specific task
>./mo_cdc task show --source-uri "mysql://acc1:admin:111@127.0.0.1:6001"   --task-name "ms_task2"
[
  {
    "task-id": "0195db8c-c15a-742e-8d0d-598529ab3f1e",
    "task-name": "ms_task2",
    "source-uri": "mysql://acc1:admin:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:01:44.030821 +0800 CST,\n  \"db1.table1\": 2025-03-28 15:01:43.998759 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:01:44.908341 +0800 CST"
  }
]
```

## Pause a Task

### Syntax

```
mo_cdc task pause
    --source-uri 
    --all 
    --task-name 
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `source-uri` | Source server address |
| `all` | Pause all synchronization tasks |
| `task-name` | Synchronization task name |

#### Examples

```bash
# Pause a specific task
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"

# Pause all tasks
./mo_cdc task pause --source-uri "mysql://root:111@127.0.0.1:6001"  --all
```

## Resume a Task

A task can only be resumed if its status is `stopped`. The resumption process supports checkpoint recovery. If the pause duration exceeds the GC retention period, operations during that time will not be synchronized, and only the final data state will be synced.

### Syntax

```
mo_cdc task resume
    --source-uri 
    --task-name 
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `source-uri` | Source server address |
| `task-name` | Synchronization task name |

#### Examples

```bash
./mo_cdc task resume  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"
```

## Restart a Task

Restarting a CDC task ignores previous synchronization progress and starts from the beginning.

### Syntax

```
mo_cdc task restart
    --source-uri 
    --task-name 
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `source-uri` | Source server address |
| `task-name` | Synchronization task name |

#### Examples

```bash
./mo_cdc task restart  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"
```

## Delete a Task

### Syntax

```
mo_cdc task drop
    --source-uri 
    --all
    --task-name 
```

**Parameter Description**

| Parameter | Description |
|  ----  | ----  |
| `source-uri` | Source server address |
| `all` | Delete all synchronization tasks |
| `task-name` | Delete a specific task |

#### Examples

```bash
# Delete a specific task
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"

# Delete all tasks
./mo_cdc task drop  --source-uri  "mysql://root:111@127.0.0.1:6001" --all
```