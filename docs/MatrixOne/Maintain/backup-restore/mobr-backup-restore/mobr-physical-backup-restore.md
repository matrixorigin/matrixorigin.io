## Overview of principles

A regular physical backup of a database is a direct copy of the database's physical storage files, including data files, log files, and control files, to create a separate copy of the database. This process is usually performed at the file system level and can be achieved by operating system commands. The resulting backup is a full backup of the database, containing all the data and objects. Backup files can be stored on multiple media and can be compressed and encrypted to save space and improve security. On recovery, these files can be copied directly to the desired location to quickly restore the entire database. In addition, physical backups support cross-platform migration for disaster recovery and database migration scenarios, but may require more storage space and time.

A full backup is a backup process that backs up all data in a database. It creates a full copy of the database, which usually requires more storage space and longer to complete. Because it contains all the data, full backups are simpler to restore and can be restored directly to the state they were in.

Incremental backups are backups of data that has changed since the last backup. It replicates only blocks or data files that have been modified between backups, so backup sets are typically smaller and faster. Incremental backups can save storage space and backup time, but can be more complex when data is restored because a series of incremental backups need to be applied sequentially to restore to the latest state.

MatrixOne supports incremental and full physical backup restores using `mo_br`:

!!! note
    mo_br Backup and recovery tool for enterprise services, you need to contact your MatrixOne account manager for the tool download path.

## Examples

### Example 1 Full Backup Recovery

- Connect mo to create databases db1, db2.

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- Create a full backup

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback1"

Backup ID
    25536ff0-126f-11ef-9902-26dd28356ef3

./mo_br list
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
|                  ID                  | SIZE  |                  PATH                  |          AT TIME          |   DURATION   |       COMPLETE TIME       |       BACKUPTS        | BACKUPTYPE |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
| 25536ff0-126f-11ef-9902-26dd28356ef3 | 65 MB |      BackupDir: filesystem  Path:      | 2024-05-15 11:56:44 +0800 | 8.648091083s | 2024-05-15 11:56:53 +0800 | 1715745404915410000-1 |    full    |
|                                      |       | /Users/admin/soft/backuppath/syncback1 |                           |              |                           |                       |            |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
```

- Connect mo Delete database db1 and build database db3.

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db2                |
| db3                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- Stop mo service, delete mo-data, restore backup

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 25536ff0-126f-11ef-9902-26dd28356ef3  --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
From:
    BackupDir: filesystem
    Path: /Users/admin/soft/backuppath/syncback1

To
    BackupDir: filesystem
    Path: /Users/admin/soft/matrixone

TaePath
    ./mo-data/shared
restore tae file path ./mo-data/shared, parallelism 1,  parallel count num: 1
restore file num: 1, total file num: 733, cost : 549µs
Copy tae file 1
    018f7a41-1881-7999-bbd6-858c3d4acc18_00000 => mo-data/shared/018f7a41-1881-7999-bbd6-858c3d4acc18_00000
    ... 
```

- Start mo, check recovery

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

As you can see, the recovery was successful.

### Example 2 Incremental Backup Recovery

- Connect mo Create databases db1, db2

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- Creating Full Backups

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback2"

Backup ID
    2289638c-1284-11ef-85e4-26dd28356ef3
```

- Create incremental backups based on the above full backup

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback2" --backup_type "incremental" --base_id "2289638c-1284-11ef-85e4-26dd28356ef3"

Backup ID
    81531c5a-1284-11ef-9ba3-26dd28356ef3

./mo_br list
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
|                  ID                  | SIZE  |                  PATH                  |          AT TIME          |   DURATION   |       COMPLETE TIME       |       BACKUPTS        | BACKUPTYPE  |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
| 2289638c-1284-11ef-85e4-26dd28356ef3 | 70 MB |      BackupDir: filesystem  Path:      | 2024-05-15 14:26:59 +0800 | 9.927034917s | 2024-05-15 14:27:09 +0800 | 1715754419668571000-1 |    full     |
|                                      |       | /Users/admin/soft/backuppath/syncback2 |                           |              |                           |                       |             |
| 81531c5a-1284-11ef-9ba3-26dd28356ef3 | 72 MB |      BackupDir: filesystem  Path:      | 2024-05-15 14:29:38 +0800 | 2.536263666s | 2024-05-15 14:29:41 +0800 | 1715754578690660000-1 | incremental |
|                                      |       | /Users/admin/soft/backuppath/syncback2 |                           |              |                           |                       |             |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
```

Comparing the time consumption of incremental and full backups, you can see that incremental backups take less time.

- Connect mo Delete database db1 and build database db3.

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db2                |
| db3                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- Stop mo service, delete mo-data, restore backup

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 81531c5a-1284-11ef-9ba3-26dd28356ef3  --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
2024/05/15 14:35:27.910925 +0800 INFO malloc/malloc.go:43 malloc {"max buffer size": 2147483648, "num shards": 8, "classes": 23, "min class size": 128, "max class size": 1048576, "buffer objects per class": 22}
From:
    BackupDir: filesystem
    Path: /Users/admin/soft/backuppath/syncback2

To
    BackupDir: filesystem
    Path: /Users/admin/soft/matrixone

TaePath
    ./mo-data/shared
...
```

- Start mo, check recovery

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

As you can see, the recovery was successful.
