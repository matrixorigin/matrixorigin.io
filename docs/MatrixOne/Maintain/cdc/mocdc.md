# mo_cdc data synchronization

**CDC (Change Data Capture)**is a technology that captures data changes in the database in real time and can record insert, update and delete operations. It monitors database changes to achieve real-time synchronization and incremental processing of data to ensure data consistency between different systems. CDC is suitable for scenarios such as real-time data synchronization, data migration, disaster recovery and audit tracking. By reading transaction logs, it reduces the pressure of full data replication and improves system performance and efficiency. Its advantages include low latency, high real-time performance, flexible support for multiple databases and systems, and adaptability to changing large-scale data environments.

MatrixOne supports table-level data synchronization through the `mo_cdc` utility. This chapter will introduce how to use `mo_cdc`.

!!! note
    mo_cdc is a data synchronization tool for enterprise-level services. You need to contact your MatrixOne account manager to obtain the tool download path.

## Reference command guide

help -print reference guide

```bash
>./mo_cdc help
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

## Create task

### Grammar structure

```
mo_cdc task create
    --task-name 
    --source-uri 
    --sink-type 
    --sink-uri 
    --tables 
    --level 
    --account 
    --no-full 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|task-name | Synchronization task name|
|source-uri|Source (mo) connection string|
|sink-type| Downstream type, currently supports mysql|
|tables | The name of the table that needs to be synchronized, separate multiple table names with commas |
|level | The range of tables selected for synchronization, currently only supports tenants|
|account| Synchronized tenant, when level is account, you need to specify |
|no-full| Optional, full volume is enabled by default, adding this parameter means full volume is turned off|

#### example

```bash
>./mo_cdc task create --task-name "task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --tables "db1.t1:db1.t1,db1.t2:db1.t2" --level "account" --account "sys"

>./mo_cdc task create --task-name "task2" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --tables "db1.table1:db2.tab1" --level "account" --account "acc1"
```

## View tasks

Viewing cdc tasks can only view tasks created by the currently connected user.

### Grammar structure

```
mo_cdc task show
    --source-uri 
    --all 
    --task-name 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|source-uri|Source server address|
|all| View all synchronization tasks|
|task-name | Synchronization task name|

**return information**

| Field | Description |
| ----| ----|
|task-id|task id|
|task-name| Task name|
|source-uri | Source server address |
|sink-uri | Downstream identification resources|
|state | task status, running or stopped|
|checkpoint | synchronization progress|
|timestamp | current timestamp|

#### Example

```bash
#View all sync tasks
>./mo_cdc task show "task1" --source-uri "mysql://root:111@127.0.0.1:6001"  --all
[
  {
    "task-id": "0192bd8a-781b-776e-812a-3f4440fceff9",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"db1.t1\": 2024-10-24 16:12:56.254918 +0800 CST,\n  \"db1.t2\": 2024-10-24 16:12:56.376204 +0800 CST,\n}",
    "timestamp": "2024-10-24 16:12:56.897015 +0800 CST"
  }
]

#View specific sync tasks
>./mo_cdc task show "task1" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001"   --task-name "task2"
[
  {
    "task-id": "0192bd94-e716-73c4-860e-a392a0d68d6f",
    "task-name": "task2",
    "source-uri": "mysql://acc1:admin:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"db1.table1\": 2024-10-24 16:14:43.552274 +0800 CST,\n}",
    "timestamp": "2024-10-24 16:14:43.664386 +0800 CST"
  }
]
```

## Pause task

### Grammar structure

```
mo_cdc task pause
    --source-uri 
    --all 
    --task-name 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|source-uri|Source server address|
|all| Pause all synchronization tasks|
|task-name | Synchronization task name|

#### Example

```bash
#Pause specific tasks
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"

#Pause all tasks
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --all
```

## Recovery task

The task can only be resumed when its status is stopped, and the resume process will resume the upload from the breakpoint. If the task is suspended for longer than the GC retention period, operations during this period will not be synchronized, and the system will only synchronize the final data status of the task.

### Grammar structure

```
mo_cdc task resume
    --source-uri 
    --task-name 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|source-uri|Source server address|
|task-name | Synchronization task name|

#### Example

```bash
./mo_cdc task resume  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"
```

## Restart task

Restarting the cdc task will ignore the synchronization progress record before the task and restart the synchronization from the beginning.

### Grammar structure

```
mo_cdc task restart
    --source-uri 
    --task-name 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|source-uri|Source server address|
|task-name | Synchronization task name|

#### Example

```bash
./mo_cdc task restart  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"
```

## Delete task

### Grammar structure

```
mo_cdc task drop
    --source-uri 
    --all
    --task-name 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|source-uri|Source server address|
|all|Delete all synchronization tasks|
|task-name | Delete a synchronization task with a specific name |

#### Example

```bash
#Delete specific tasks
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"

#Delete all tasks
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --all
```
