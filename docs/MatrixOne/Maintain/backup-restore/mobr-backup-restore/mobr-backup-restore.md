# mo_br backup and recovery

For enterprises, a large amount of data is generated every day, so database backup is very important. In the event of a system crash, hardware failure, or user misoperation, you can restore data and restart the system without causing data loss.

In addition, data backup also serves as a safeguard before upgrading the MatrixOne installation, and data backup can also be used to transfer the MatrixOne installation to another system.

MatrixOne supports physical backup via the `mo_br` utility. `mo_br` is a command line utility for generating physical backups of MatrixOne databases. It generates SQL statements that can be used to recreate database objects and data.

We will use a simple example to describe how to use the `mo_br` utility to complete the data backup and restore process.

## Create a backup

### Grammar structure

```
mo_br backup
    --host
    --port
    --user
    --password
    --backup_dir s3|filesystem
        //s3 oss minio
            --endpoint
    --access_key_id
            --secret_access_key
            --bucket
            --filepath
            --region
            --compression
            --role_arn
            --is_minio
            --parallelism
        //filesystem
            --path
            --parallelism
    --meta_path
    //incremental backup required
    --backup_type
    --base_id
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user| user|
|password | User's password|
|backup_dir | Backup destination path type. s3 or filesystem|
|endpoint| The URL to connect to the service that backs up to s3|
|access_key_id| Access key ID backed up to s3|
|secret_access_key| Secret access key backed up to s3|
|bucket| The bucket that s3 needs to access when backed up|
|filepath| Relative file path for backup to s3|
|region| Object storage service region backed up to s3|
|compression| Compression format of files backed up to s3. |
|role_arn| Resource name of the role backed up to s3. |
|is_minio| specifies whether the s3 backed up to is minio|
|path| Local file system backup path|
|parallelism|Parallelism|
|meta_path|Specifies the meta file location. Can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory. |
|backup_type|Specifies the backup type as incremental backup, incremental. |
|base_id|The ID of the last backup, mainly used to determine the timestamp of the last backup. |

### Example

- Full backup to local file system

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem" --path "yourpath"
```

- Full backup to minio

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "s3" --endpoint "http://127.0.0.1:9000" --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A" --bucket "bucket1" --filepath "/backup1" --is_minio
```

- Incremental backup to local file system

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem" --path "yourpath" --backup_type "incremental" --base_id " "xxx"
```

## View backup

### Grammar structure

```
mo_br list
    --ID
    //To query backup data. If the backup is on s3 (oss minio), you need to specify
      --access_key_id
      --secret_access_key
    --not_check_data
    --meta_path
```

**Parameter description**

| Parameters | Description |
| ----| ----|
| ID | Backup ID|
|access_key_id| Access key ID of s3 backed up|
|secret_access_key| Secret access key of s3 backed up|
|not_check_data | Only check the information in meta. Do not view backup data. By default, without this parameter, the backed up files will be checked. Currently only the backed up files are checked for existence. |
|meta_path | Specifies the meta file location. If not specified, the default is the mo_br.meta file in the same directory. |

### Example

- View a list of all backups

```bash
./mo_br list
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+
| ID | SIZE | PATH | AT TIME | DURATION | COMPLETE TIME |
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB | BackupDir: filesystem Path: | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
| | | /Users/admin/soft/backup | | | |
| 01108122-10f9-11ef-9359-26dd28356ef2 | 8.3 MB | BackupDir: filesystem Path: | 2024-05-13 15:18:28 +0800 | 3.394437375s | 2024-05-13 15:18:32 +0800 |
| | | /Users/admin/soft/backup | | | |
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+
```

- View the backup list of the specified ID. When the ID is determined by list, the backed up file will be detected.

```bash
./mo_br list 4d21b228-10dd-11ef-9497-26dd28356ef2
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+
| ID | SIZE | PATH | AT TIME | DURATION | COMPLETE TIME |
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB | BackupDir: filesystem Path: | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
| | | /Users/admin/soft/backup | | | |
+----------------------------------------+--------+-----------------------------------+----------------------------+--------------+---------------------------+

Checking the backup data(currently,no checksum)...

check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/log.toml_018f70d1-3100-7762-b28b-8f85ac4ed3cd
check: config/tn.toml_018f70d1-310e-78fc-ac96-aa5e06981bd7
...
```

## Delete backup

### Grammar structure

```
mo_br delete ID
    //To delete the backup data. If the backup is on s3 (oss minio), you need to specify
      --access_key_id
      --secret_access_key
    --not_delete_data
    --meta_path
```

**Parameter description**

| Parameters | Description |
| ----| ----|
| ID | ID of the backup to be deleted |
|access_key_id| Access key ID of s3 backed up|
|secret_access_key| Secret access key of s3 backed up|
|not_delete_data|Only delete the information in meta. Backup data is not deleted. |
|meta_path|Specifies the meta file location. If not specified, the default is the mo_br.meta file in the same directory. |

### Example

- Delete local file system backup

```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122
```

- Delete a backup on the minio.

```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122 --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A"
```

## Restore backup

### Grammar structure

- Restore backup of specified ID

```
mo_br restore ID
    //Read the backup data of the specified ID. If the backup is on s3 (oss minio), you need to specify
    --backup_access_key_id
    --backup_secret_access_key
//Restore target path restore_directory
    --restore_dir s3|filesystem
        //s3
            --restore_endpoint
            --restore_access_key_id
            --restore_secret_access_key
            --restore_bucket
            --restore_filepath
            --restore_region
            --restore_compression
            --restore_role_arn
            --restore_is_minio
        //filesystem
            --restore_path
            --dn_config_path
    --meta_path
    --checksum
--parallelism
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|ID | ID to restore|
|backup_access_key_id|Access key ID backed up in s3|
|backup_secret_access_key |Backup Secret access key in s3|
|restore_dir | Restore target path type. Used when specifying the destination path for recovery. s3|filesystem|
|restore_endpoint| URL to connect to restore to S3 service|
|restore_access_key_id| Restore Access key ID to s3|
|restore_secret_access_key| Restore Secret access key to s3|
|restore_bucket| The bucket that needs to be accessed to restore to s3|
|restore_filepath|Restore relative file path to s3|
|restore_region| Object storage service region restored to s3|
|restore_compression|Restore the compression format of S3 files to s3. |
|restore_role_arn| The resource name of the role restored to s3. |
|restore_is_minio|Specifies whether the restored s3 is minio|
|restore_path|Restore to local path|
|dn_config_path| dn configuration path|
|meta_path|Specifies the meta file location. Can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory. |
|checksum |The parallelism of tae file copy during recovery, the default is 1|
|parallelism|Parallelism|

- Do not specify restore backup ID

```
//recover.
mo_br restore
    --backup_dir s3|filesystem Target path type for backup. Used when specifying the destination path for backup.
        //s3
            --backup_endpoint
            --backup_access_key_id
            --backup_secret_access_key
            --backup_bucket
            --backup_filepath
            --backup_region
            --backup_compression
            --backup_role_arn
            --backup_is_minio
             //filesystem
            --backup_path
            //Restore target path restore_directory
             --restore_dir s3|filesystem The target path type for recovery. Used when specifying the destination path for recovery.
             //s3
            --restore_endpoint
            --restore_access_key_id
            --restore_secret_access_key
    --restore_bucket
            --restore_filepath
            --restore_region
            --restore_compression
            --restore_role_arn
            --restore_is_minio
        //filesystem
            --restore_path
            --dn_config_path
    --meta_path
    --checksum
    --parallelism
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|backup_dir | The destination path type for recovery. Used when specifying the destination path for recovery. s3|filesystem|
|backup_endpoint| URL to connect to backup in s3|
|backup_access_key_id| Access key ID backed up in s3|
|backup_secret_access_key| Secret access key backed up in s3|
|backup_bucket| Bucket backed up in s3|
|backup_filepath| Relative file path of backup in s3|
|backup_region| Service region backed up in s3|
|backup_compression| Compression format for files backed up in s3. |
|backup_role_arn| Resource name of the role backed up in s3. |
|backup_is_minio| specifies whether the backed up s3 is minio|
|backup_path| The path of local backup|
|restore_dir | Restore target path type. Used when specifying the destination path for recovery. s3 or filesystem|
|restore_endpoint| URL to connect to restore to S3 service|
|restore_access_key_id| Restore Access key ID to s3|
|restore_secret_access_key| Restore Secret access key to s3|
|restore_bucket| The bucket that needs to be accessed to restore to s3|
|restore_filepath|Restore relative file path to s3|
|restore_region| Object storage service region restored to s3|
|restore_compression|Restore the compression format of S3 files to s3. |
|restore_role_arn| The resource name of the role restored to s3. |
|restore_is_minio|Specifies whether the restored s3 is minio|
|restore_path|Restore the path to local matrixone|
|dn_config_path| dn configuration path|
|meta_path|Specifies the meta file location. Can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory. |
|checksum |The parallelism of tae file copy during recovery, the default is 1|
|parallelism|Parallelism|

### Example

Restore from file system to file system

**Step 1:**Stop mo and delete mo-data

**Step 2:**Execute the following recovery command

```
./mo_br restore fb26fd88-41bc-11ee-93f8-acde48001122 --restore_dir filesystem --restore_path "your_mopath"
```

After recovery, a new mo-data file will be generated in matrixone

**Step 3:**Start mo

## Verify the backup verification code

Read each file in the backup folder and its sha256 file. Calculate the sha256 value of the file and compare it to the sha256 file value. sha256 files are created when files are created or updated.

### Grammar structure

- Verify backup of an ID

```
mo_br check ID
    //Verify the backup data of the specified ID. If the backup is on s3 (oss minio), you need to specify
      --backup_access_key_id string
      --backup_secret_access_key string
      --meta_path string specifies the meta file location. If not specified, the default is the mo_br.meta file in the same directory.
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|backup_access_key_id| Access key ID backed up in s3|
|backup_secret_access_key| Secret access key backed up in s3|
|meta_path|Specifies the meta file location. Can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory. |

- Verify backup, specify backup path

```
mo_br check
    --backup_dir s3|filesystem
        //s3
            --backup_endpoint
            --backup_access_key_id
            --backup_secret_access_key
            --backup_bucket
            --backup_filepath
            --backup_region
            --backup_compression
            --backup_role_arn
            --backup_is_minio
        //filesystem
            --backup_path
    --meta_path
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|backup_dir | The path type where the backup is located. It must be specified when the ID is not specified. s3 or filesystem|
|backup_endpoint| URL to connect to backup in s3|
|backup_access_key_id| Access key ID backed up in s3|
|backup_secret_access_key| Secret access key backed up in s3|
|backup_bucket| Bucket backed up in s3|
|backup_filepath| Relative file path of backup in s3|
|backup_region| Service region backed up in s3|
|backup_compression| Compression format for files backed up in s3. |
|backup_role_arn| Resource name of the role backed up in s3. |
|backup_is_minio| specifies whether the backed up s3 is minio|
|backup_path| The path of local backup|
|meta_path|Specifies the meta file location. Can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory. |

### Example

- Verify backup of an ID

```
./mo_br check 1614f462-126c-11ef-9af3-26dd28356ef3
+----------------------------------------+--------+-----------------------------------+------------------------------+---------------+---------------------------+
| ID | SIZE | PATH | AT TIME | DURATION | COMPLETE TIME |
+----------------------------------------+--------+-----------------------------------+------------------------------+---------------+---------------------------+
| 1614f462-126c-11ef-9af3-26dd28356ef3 | 126 MB | BackupDir: filesystem Path: | 2024-05-15 11:34:28 +0800 | 22.455633916s | 2024-05-15 11:34:50 +0800 |
| | | /Users/admin/soft/incbackup/back2 | | | |
+----------------------------------------+--------+-----------------------------------+------------------------------+---------------+---------------------------+
Checking the backup data...

check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/launch.toml_018f7a50-d300-7017-8580-150edf08733e
...
```

- Verify backups in a backup directory

```
(base) admin@admindeMacBook-Pro mo-backup % ./mo_br check --backup_dir filesystem --backup_path /Users/admin/soft/incbackup/back2
2024/05/15 11:40:30.011160 +0800 INFO malloc/malloc.go:42 malloc {"max buffer size": 1073741824, "num shards": 16, "classes": 23, "min class size": 128 , "max class size": 1048576, "buffer objects per class": 23}
check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/launch.toml_018f7a50-d300-7017-8580-150edf08733e
check: config/log.toml_018f7a50-d30c-7ed0-85bc-191e9f1eb753
...
```

## Best Practices

Below we will use a few simple examples to describe how to use mo_br to back up and restore data.

## Example 1 Full backup and restore

- Connect mo to create databases db1, db2.

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db1|
|db2|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

- Create full backup

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem" --path "/Users/admin/soft/backuppath/syncback1"

Backup ID
    25536ff0-126f-11ef-9902-26dd28356ef3

./mo_br list
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+---------------------------+-----------------------+----------------+
| ID | SIZE | PATH | AT TIME | DURATION | COMPLETE TIME | BACKUPTS | BACKUPTYPE |
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+---------------------------+-----------------------+----------------+
| 25536ff0-126f-11ef-9902-26dd28356ef3 | 65 MB | BackupDir: filesystem Path: | 2024-05-15 11:56:44 +0800| 45404915410000 -1 | full |
| | | /Users/admin/soft/backuppath/syncback1 | | | | | |
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+---------------------------+-----------------------+----------------+
```

- Connect mo to drop database db1 and create database db3.

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db2|
|db3|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

- Stop mo service, delete mo-data, restore backup

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 25536ff0-126f-11ef-9902-26dd28356ef3 --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
From:
    BackupDir: filesystem
    Path: /Users/admin/soft/backuppath/syncback1

To
    BackupDir: filesystem
Path: /Users/admin/soft/matrixone

TaePath
    ./mo-data/shared
restore tae file path ./mo-data/shared, parallelism 1, parallel count num: 1
restore file num: 1, total file num: 733, cost: 549µs
Copy tae file 1
    018f7a41-1881-7999-bbd6-858c3d4acc18_00000 => mo-data/shared/018f7a41-1881-7999-bbd6-858c3d4acc18_00000
    ...
```

- Start mo and check the recovery status

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db1|
|db2|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

As you can see, the recovery was successful.

## Example 2 Incremental backup and recovery

- Connect mo to create databases db1, db2

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db1|
|db2|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

- Create full backup

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem" --path "/Users/admin/soft/backuppath/syncback2"

Backup ID
    2289638c-1284-11ef-85e4-26dd28356ef3
```

- Create incremental backup based on the above full backup

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem" --path "/Users/admin/soft/backuppath/syncback2" --backup_type "incremental" --base_id "2289638c-1284-11ef-85e4-26dd28356ef3"

Backup ID
    81531c5a-1284-11ef-9ba3-26dd28356ef3

./mo_br list
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+----------------------------+-----------------------+-------------+
| ID | SIZE | PATH | AT TIME | DURATION | COMPLETE TIME | BACKUPTS | BACKUPTYPE |
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+----------------------------+-----------------------+-------------+
| 2289638c-1284-11ef-85e4-26dd28356ef3 | 70 MB | BackupDir: filesystem Path: |2024-05-15 14:26:59 +0800 | 754419668571000 -1 | full |
| | | /Users/admin/soft/backuppath/syncback2 | | | | | |
81531c5a-1284-11ef-9ba3-26dd28356ef3 | BackupDir: filesystem Path: | 2024-05-15 14:29:38 +0800 54578690660000 -1 | incremental |
| | | /Users/admin/soft/backuppath/syncback2 | | | | | |
+-----------------------------------------+-----+------------------------------------------+--------------------------+-----------------+----------------------------+-----------------------+-------------+
```

Comparing the duration of incremental backup and full backup, you can see that incremental backup takes less time.

- Connect mo to drop database db1 and create database db3.

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db2|
|db3|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

- Stop mo service, delete mo-data, restore backup

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 81531c5a-1284-11ef-9ba3-26dd28356ef3 --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
2024/05/15 14:35:27.910925 +0800 INFO malloc/malloc.go:43 malloc {"max buffer size": 2147483648, "num shards": 8, "classes": 23, "min class size": 128 , "max class size": 1048576, "buffer objects per class": 22}
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

- Start mo and check the recovery status

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database |
+--------------------+
|db1|
|db2|
| information_schema |
| mo_catalog |
| mo_debug |
| mo_task |
| mysql |
| system |
| system_metrics |
+--------------------+
9 rows in set (0.00 sec)
```

As you can see, the recovery was successful.