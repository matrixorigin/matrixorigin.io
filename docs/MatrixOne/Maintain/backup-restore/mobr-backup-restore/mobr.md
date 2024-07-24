# mo_br Backup and Recovery

Database physical backup and snapshot backup are two important data protection strategies that play an important role in many scenarios. Physical backups enable fast and complete database recovery by replicating the physical files of the database, such as data files and log files, and are especially suitable for overall database migration or disaster recovery situations. Snapshot backup, on the other hand, provides a fast and storage-efficient way of backing up data by recording its status at a specific point in time, for scenarios that require point-in-time recovery or read-only query operations, such as report generation or data analysis. The combination of physical backup recovery, which can take longer, and snapshot backup, which provides fast data access, provides comprehensive protection of the database, ensuring data security and business continuity.

MatrixOne supports regular physical and snapshot backups via the `mo_br` utility. This section describes how `mo_br` is used.

!!! note
    mo_br Physical backup and recovery tool for enterprise level services, you need to contact your MatrixOne account manager for the tool download path.

## Reference Command Guide

help - Print Reference Guide

```
./mo_br help
the backup and restore tool for the matrixone

Usage:
  mo_br [flags]
  mo_br [command]

Available Commands:
  backup      backup the matrixone data
  check       check the backup
  completion  Generate the autocompletion script for the specified shell
  delete      delete the backup
  help        Help about any command
  list        search the backup
  restore     restore the matrixone data
  snapshot    Manage snapshots

Flags:
      --config string      config file (default "./mo_br.toml")
  -h, --help               help for mo_br
      --log_file string    log file (default "console")
      --log_level string   log level (default "error")

Use "mo_br [command] --help" for more information about a command.
```

## Physical backup

### Create a backup

#### Syntax structure

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

|  parameters   | clarification |
|  ----  | ----  |
|host | Target MatrixOne's IP|
|port|port number|
|user| user|
|password | User's password|
|backup_dir | Destination path type for backups. s3 or filesystem|
|endpoint| URL to connect to the service that backs up to s3|
|access_key_id| Access key ID for backup to s3|
|secret_access_key| Secret access key for backup to s3|
|bucket| Backup to the bucket s3 needs access to|
|filepath| Relative file paths for backups to s3
|region| Backup to s3's object storage service area|
|compression| The compressed format of the files backed up to s3.|
|role_arn| The resource name of the role backed up to s3.|
|is_minio| Specify whether the backup to s3 is a minio|
|path| Local file system backup path|
|parallelism|parallelism|
|meta_path|Specifies the location of the meta file. It can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory.|
|backup_type|Specifies that the backup type is incremental, incremental.|
|base_id|The ID of the last backup, mainly used to determine the timestamp of the last backup.|

#### Examples

- Full backup to local file system

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "yourpath"
```

- Full backup to minio

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "s3"  --endpoint "http://127.0.0.1:9000" --access_key_id "S0kwLuB4JofVEIAxxxx" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9xxxx" --bucket "bucket1" --filepath "/backup1" --is_minio
```

- Incremental backup to local file system

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "yourpath" --backup_type "incremental" --base_id "xxx"
```

### View backups

#### Syntax structure

```
mo_br list
    -- ID
     // To query the backup data. If the backup is on s3(oss minio), you need to specify the
      --access_key_id 
      --secret_access_key 
    --not_check_data 
    --meta_path 
```

**Parameter description**

|  parameters   | clarification |
|  ----  | ----  |
| ID | ID of the backup|
|access_key_id| Access key ID of the backup to s3|
|secret_access_key| Secret access key for the backup to s3|
|not_check_data | View only the information in the meta. Does not check the backup data. The default without this parameter is that it will check the backed up files. Currently, it will only check if the backup file exists.|
|meta_path | Specifies the location of the meta file. If not specified, the default is the mo_br.meta file in the same directory.|

#### Examples

- View a list of all backups

```
./mo_br list
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
|                  ID                  |  SIZE  |              PATH              |          AT TIME          |   DURATION   |       COMPLETE TIME       |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB |  BackupDir: filesystem  Path:  | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
| 01108122-10f9-11ef-9359-26dd28356ef2 | 8.3 MB |  BackupDir: filesystem  Path:  | 2024-05-13 15:18:28 +0800 | 3.394437375s | 2024-05-13 15:18:32 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
```

- View the list of backups with the specified ID, the ID determined by list detects the backed up files.

```
./mo_br list 4d21b228-10dd-11ef-9497-26dd28356ef2
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
|                  ID                  |  SIZE  |              PATH              |          AT TIME          |   DURATION   |       COMPLETE TIME       |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB |  BackupDir: filesystem  Path:  | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+

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

### Delete Backup

#### Syntax structure

```
mo_br delete ID  
    //To delete backup data. If the backup is on s3 (oss minio), you need to specify the
      --access_key_id 
      --secret_access_key
    --not_delete_data
    --meta_path
```

**Parameter description**

|  parameters   | clarification |
| ---- | ----  |
| ID | ID of the backup to be deleted|
|access_key_id| Access key ID of the backup to s3|
|secret_access_key| Secret access key for the backup to s3|
|not_delete_data|Only the information in the meta is deleted. Backup data is not deleted.|
|meta_path|Specifies the location of the meta file. If not specified, the default is the mo_br.meta file in the same directory.|

#### Examples

- Delete Local File System Backup
  
```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122
```

- Delete a backup on minio.

```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122 --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A"
```

### Restore Backup

#### Syntax structure

- Restore a backup with the specified ID

```
mo_br restore ID
    //Reads the backup data with the specified ID. If the backup is on s3(oss minio), you need to specify the
    --backup_access_key_id
    --backup_secret_access_key 

    //Destination path to restore restore_directory
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

|  parameters   | clarification |
|  ----  | ----  |
|ID | ID to be recovered|
|backup_access_key_id|Access key ID of the backup in s3|
|backup_secret_access_key |Secret access key backed up in s3|
|restore_dir | Destination path type for recovery. Use when specifying the destination path for recovery. s3|filesystem|
|restore_endpoint| Connect to the URL to restore to the S3 service|
|restore_access_key_id| Access key ID restored to s3|
|restore_secret_access_key| Recover the secret access key to s3|
|restore_bucket| Recover to the bucket that s3 needs to access|
|restore_filepath|Relative file path to restore to s3|
|restore_region| Restore the object storage service area to s3|
|restore_compression|The compressed format of the S3 file restored to s3.|
|restore_role_arn| Resource name of the role restored to s3.|
|restore_is_minio|Specifies whether the recovered s3 is a minio|
|restore_path|Restore to local path|
|dn_config_path| dn Configuration path|
|meta_path|Specifies the location of the meta file. It can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory.|
|checksum |Parallelism of tae file replication during recovery, default is 1|
|parallelism|parallelism|

- Do not specify a restore backup ID

```  
//Recovery
mo_br restore
    --backup_dir s3|filesystem Destination path type for backups. Used when specifying the destination path for backups.
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
    //Destination path to restore restore_directory
    --restore_dir s3|filesystem //Destination path type for recovery. Used when specifying the destination path for recovery.
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

|  parameters   | clarification |
|  ----  | ----  |
|backup_dir | Destination path type for recovery. Use when specifying the destination path for recovery. s3|filesystem|
|backup_endpoint| Connect to the URL of the backup on s3 |
|backup_access_key_id| Access key ID of the backup in s3|
|backup_secret_access_key| 备份在 s3 的 Secret access key|
|backup_bucket| Backup bucket in s3|
|backup_filepath| Relative file paths for backups in s3|
|backup_region| Backup service area in s3|
|backup_compression| The compressed format of the files backed up in s3.|
|backup_role_arn| The resource name of the role backed up in s3.|
|backup_is_minio| Specifies whether the backup s3 is minio|
|backup_path| Path to local backup|
|restore_dir | The type of destination path to recover. To specify the destination path for recovery, use. s3 or filesystem|
|restore_endpoint| Connect to the URL to restore to the S3 service|
|restore_access_key_id| Access key ID restored to s3|
|restore_secret_access_key| Recover the secret access key to s3|
|restore_bucket| Recover to the bucket that s3 needs to access|
|restore_filepath|Relative file path to restore to s3|
|restore_region| Restore the object storage service area to s3|
|restore_compression|The compressed format of the S3 file restored to s3.|
|restore_role_arn| Resource name of the role restored to s3.|
|restore_is_minio|Specifies whether the recovered s3 is a minio|
|restore_path|Restore the path to the local matrixone|
|dn_config_path| dn Configuration path|
|meta_path|Specifies the location of the meta file. It can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory.|
|checksum |Parallelism of tae file replication during recovery, default is 1|
|parallelism|parallelism|

#### Examples

Restore from File System to File System

**Step one:** Stop mo, delete mo-data

**Step Two:** Execute the following recovery command

```
./mo_br restore fb26fd88-41bc-11ee-93f8-acde48001122 --restore_dir filesystem --restore_path "your_mopath"
```

After recovery a new mo-data file is generated at matrixone

**Step three:** Start mo

### Verify the check code for the backup

Read each file in the backup folder and its sha256 file. Calculates the sha256 value of the file and compares it to the sha256 file value. The sha256 file is created when the file is created or updated.

#### Syntax structure

- Verify a backup of an ID

```
mo_br check ID
    //Checks the backup data for the specified ID. If the backup is on s3 (oss minio), you need to specify 
      --backup_access_key_id string
      --backup_secret_access_key string
    --meta_path string //Specifies the meta file location. If not specified, the default is the mo_br.meta file in the same directory.
```

**Parameter description**

|  parameters   | clarification |
|  ----  | ----  |
|backup_access_key_id| Access key ID of the backup in s3|
|backup_secret_access_key| Secret access key backed up in s3|
|meta_path|Specifies the location of the meta file. It can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory.|

- Verify the backup, specifying the path to the backup

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

|  parameters   | clarification |
|  ----  | ----  |
|backup_dir | The type of path where the backup is located, which must be specified if no ID is specified. s3 or filesystem|
|backup_endpoint| Connect to the URL of the backup on s3|
|backup_access_key_id| Access key ID of the backup in s3|
|backup_secret_access_key| Secret access key backed up in s3|
|backup_bucket| Backup bucket in s3|
|backup_filepath| Relative file paths for backups in s3|
|backup_region| Backup service area in s3|
|backup_compression| The compressed format of the files backed up in s3.|
|backup_role_arn| The resource name of the role backed up in s3.|
|backup_is_minio| Specifies whether the backup s3 is minio|
|backup_path| Path to local backup|
|meta_path|Specifies the location of the meta file. It can only be a path in the file system. If not specified, the default is the mo_br.meta file in the same directory.|

#### Examples

- Verify a backup of an ID

```
./mo_br check  1614f462-126c-11ef-9af3-26dd28356ef3
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+
|                  ID                  |  SIZE  |               PATH                |          AT TIME          |   DURATION    |       COMPLETE TIME       |
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+
| 1614f462-126c-11ef-9af3-26dd28356ef3 | 126 MB |   BackupDir: filesystem  Path:    | 2024-05-15 11:34:28 +0800 | 22.455633916s | 2024-05-15 11:34:50 +0800 |
|                                      |        | /Users/admin/soft/incbackup/back2 |                           |               |                           |
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+

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
2024/05/15 11:40:30.011160 +0800 INFO malloc/malloc.go:42 malloc {"max buffer size": 1073741824, "num shards": 16, "classes": 23, "min class size": 128, "max class size": 1048576, "buffer objects per class": 23}
check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/launch.toml_018f7a50-d300-7017-8580-150edf08733e
check: config/log.toml_018f7a50-d30c-7ed0-85bc-191e9f1eb753
...
```

## snapshot backup

### Create a snapshot

#### Syntax structure

```
mo_br snapshot create
    --host
    --port 
    --user
    --password 
    --level 
    --account 
    --sname 
```

**Parameter description**

| Parameters | Description |
|  ----  | ----  |
|host | Target MatrixOne's IP|
|port|port number|
|user | user|
|password | User's password|
|level | Scope of snapshot backup, only account is supported for the time being|
|account| Tenant object name for snapshot backups|
|sname | Snapshot name|

#### Examples

- To create a snapshot for system tenant sys:

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "snapshot_01" --account "sys"
```

- System tenant creates snapshot for normal tenant acc1:

```
 ./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "snapshot_02" --account "acc1" 
```

- Normal tenant creation snapshot:

    - Create Normal Tenant acc1

    ```sql
    create account acc1 admin_name admin IDENTIFIED BY '111';
    ```

    - acc1 Create snapshot

    ```
    ./mo_br snapshot create  --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --level "account" --account "acc1" --sname "snapshot_03"
    ```

### View snapshots

#### Syntax structure

```
mo_br snapshot show
    --host
    --port 
    --user 
    --password 
    --account 
    --db 
    --table 
    --sname 
    --beginTs 
    --endTs
```

**Parameter description**

| Parameters | Description |
|  ----  | ----  |
|host | Target MatrixOne's IP|
|port|port number|
|user | subscribers|
|password | User's password|
|account| Tenant name to filter, for sys administrators only|
|db | The name of the database to be filtered|
|table | Table name to filter|
|sname | Name of the snapshot to filter|
|beginTs |Start time of the snapshot timestamp to be filtered|
|endTs | The end time of the snapshot timestamp to be filtered|

#### Examples

- To view snapshots created under System Tenants:

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401 	account       	acc1        	             	          	
snapshot_01  	2024-05-11 02:26:03.462462	account       	sys  
```

- View the snapshot created under acc1:

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_03  	2024-05-11 02:29:31.572512	account       	acc1     
```

- View the snapshot created for tenant acc1 under System Tenant and filter the start time:

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "acc1" --beginTs "2024-05-11 00:00:00"     
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401	account       	acc1 
```  

### Delete Snapshot

#### Syntax structure

```
mo_br snapshot drop
    --host
    --port 
    --user 
    --password 
    --sname 
```

**Parameter description**

| Parameters | Description |
|  ----  | ----  |
|host | Target MatrixOne's IP|
|port|port number|
|user | subscribers|
|password | User's password|
|sname | Name of the snapshot to filter|

#### Examples

- To delete a snapshot created by a system tenant:

```
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "dump" --password "111" --sname "snapshot_01"
```

- To delete a snapshot created by a normal tenant:

```
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --sname "snapshot_03" 
```

### Restoring a snapshot

#### Syntax structure

```
mo_br snapshot restore
    --host 
    --port 
    --user 
    --password 
    --sname 
    --account 
    --db 
    --table 
    --newaccount 
    --newaccountadmin 
    --newaccountpwd 
```

**Parameter description**

| Parameters | Description |
|  ----  | ----  |
|host | Target MatrixOne's IP|
|port|port number|
|user | subscribers|
|password | User's password|
|sname | Name of the snapshot to be restored|
|account| The name of the tenant to restore, for sys administrators only|
|db | Name of the database to be recovered|
|table | The name of the table to be recovered|
|newaccount  | Newly created tenant name|
|newaccountadmin  | tenant manager|
|newaccountpwd   | Tenant Administrator Password|

__NOTE__: Only system tenants can perform restore data to a new tenant, and only tenant-level restores are allowed.

#### Examples

- Table level restored to this tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- Database level restore to this tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- Tenant level restored to this tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03"
```

- Tenant level restored to new tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```