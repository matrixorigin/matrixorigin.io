# mo_br backup and recovery

Database physical backup and snapshot backup are two important data protection strategies, and they play an important role in many scenarios. Physical backup can achieve fast and complete database recovery by copying the physical files of the database, such as data files and log files, and is especially suitable for overall database migration or disaster recovery. On the other hand, snapshot backup provides a fast and storage-efficient backup method by recording the status of data at a specific point in time. It is suitable for scenarios that require point-in-time recovery or read-only query operations, such as generating reports or performing data processing. analyze. The recovery of physical backups may take a long time, while snapshot backups can provide fast data access. The combination of the two can provide comprehensive protection for the database and ensure data security and business continuity.

MatrixOne supports regular physical backups and snapshot backups via the `mo_br` utility. This chapter will introduce how to use `mo_br`.

!!! note
    mo_br is a physical backup and recovery tool for enterprise-level services. You need to contact your MatrixOne account manager to obtain the tool download path.

## Reference command guide

help -print reference guide

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

#### Grammar structure

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
    //incremental backup and restore needed
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

#### Example

- Full backup to local file system

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "filesystem"  --path "yourpath"
```

- Full backup to minio

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "s3"  --endpoint "http://127.0.0.1:9000" --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A" --bucket "bucket1" --filepath "/backup1" --is_minio
```

- Incremental backup to local file system

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "filesystem"  --path "yourpath" --backup_type "incremental" --base_id "xxx"
```

### View backup

#### Grammar structure

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

#### Example

- View a list of all backups

```bash
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

- View the backup list of the specified ID. When the ID is determined by list, the backed up file will be detected.

```bash
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

### Delete backup

#### Grammar structure

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

#### Example

- Delete local file system backup

```bash
./mo_br delete e4cade26-3139-11ee-8631-acde48001122
```

- Delete a backup on the minio.

```bash
./mo_br delete e4cade26-3139-11ee-8631-acde48001122 --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A"
```

### Restore backup

#### Grammar structure

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
| ------------       | ----|
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

- Do not specify a restore backup ID

```  
//recover.
mo_br restore
    --backup_dir s3|filesystem The destination path type for the backup. Used when specifying the destination path for backup.
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
    //Recovery target path, restore_directory
    --restore_dir s3|filesystem,The target path type for recovery. Used when specifying the destination path for recovery.
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

#### Example

Restore from file system to file system

**Step 1:**Stop mo and delete mo-data

**Step 2:**Execute the following recovery command

```
./mo_br restore fb26fd88-41bc-11ee-93f8-acde48001122 --restore_dir filesystem --restore_path "your_mopath"
```

After recovery, a new mo-data file will be generated in matrixone

**Step 3:**Start mo

### Verify backup verification code

Read each file in the backup folder and its sha256 file. Calculate the sha256 value of the file and compare it to the sha256 file value. sha256 files are created when files are created or updated.

#### Grammar structure

- Verify backup of an ID

```bash
mo_br check ID
    //Verify the backup data of the specified ID. If the backup is on s3 (oss minio), you need to specify
      --backup_access_key_id string
      --backup_secret_access_key string
    --meta_path string 指定meta文件位置.如果不指定,默认是同一目录下的mo_br.meta文件.
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

#### Example

- Verify backup of an ID

```bash
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

```bash
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

## Snapshot backup

### Create snapshot

#### Grammar structure

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
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|level | snapshot backup scope, account|cluster|
|account| The tenant object name of the snapshot backup. This parameter does not need to be filled in at the cluster level|
|sname | snapshot name|

#### Example

- The cluster administrator creates a cluster-level snapshot:

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "cluster" --sname "cluster_sp1"
```

- The system tenant administrator creates a tenant-level snapshot for the system tenant sys:

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "account" --sname "snapshot_01" --account "sys"
```

- The system tenant administrator creates a tenant-level snapshot for the common tenant acc1:

```bash
 ./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "account" --sname "snapshot_02" --account "acc1" 
```

- A normal tenant administrator creates a tenant-level snapshot:

    - Create a common tenant acc1

    ```sql
    create account acc1 admin_name admin IDENTIFIED BY '111';
    ```

    - acc1 creates snapshot

    ```
    ./mo_br snapshot create  --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --level "account" --account "acc1" --sname "snapshot_03"
    ```

### View snapshot

#### Grammar structure

```
mo_br snapshot show
    --host
    --port 
    --user 
    --password 
    --cluster
    --account 
    --db 
    --table 
    --sname 
    --beginTs 
    --endTs
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|cluster|Fixed to fill in sys, other values ​​​​do not take effect, only used by sys administrators|
|account| Tenant name to filter, for sys administrators only|
|db | Database name to filter |
|table | table name to filter|
|sname | Snapshot name to filter |
|beginTs |Start time of snapshot timestamp to filter|
|endTs | The end time of the snapshot timestamp to be filtered |

#### Example

- View snapshots created under the system tenant administrator:

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "root" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401 	account       	acc1        	             	          	
snapshot_01  	2024-05-11 02:26:03.462462	account       	sys  
```

- View snapshots created under acc1 by normal tenant administrators:

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_03  	2024-05-11 02:29:31.572512	account       	acc1     
```

- View the snapshot created for tenant acc1 under the system tenant administrator and filter the start time:

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "acc1" --beginTs "2024-05-11 00:00:00"     
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401	account       	acc1 
```  

### Delete snapshot

#### Grammar structure

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
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|sname | Snapshot name to filter |

#### Example

- Delete snapshots created by the system administrator:

```bash
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "root" --password "111" --sname "snapshot_01"
```

- Delete snapshots created by normal tenant administrators:

```bash
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --sname "snapshot_03" 
```

### Restore snapshot

#### Grammar structure

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
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|sname | The name of the snapshot to be restored |
|account| Tenant name to restore, for sys administrators only |
|db | The name of the database to be restored |
|table |The name of the table to be restored|
|newaccount | Newly created tenant name |
|newaccountadmin | Tenant Administrator|
|newaccountpwd | Tenant administrator password |

__NOTE__: Only the system tenant can perform restore data to a new tenant, and only tenant-level restores are allowed.

#### Example

- Table level recovery

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- Database level recovery

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- Tenant level restore to this tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --sname "sp_03"
```

- Tenant level revert to new tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```

- Cluster level recovery

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111"  --sname "cluster_sp1"
```

## PITR backup

### Create PITR

#### Grammar structure

```
mo_br pitr create 
    --host
    --port 
    --user 
    --password 
    --pname 
    --level 
    --account 
    --database 
    --table 
    --rangevalue 
    --rangeunit 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|pname | pitr name|
|level | Backup scope, cluster | account | database | table, when level is equal to the high level, the low-level object name does not need to be filled in and cannot be filled in. For example, level = account, then database and table cannot be filled in |
|account| Backup tenant name|
|database| Backup database name|
|table| Backup table name|
|rangevalue|Time range value, 1-100|
|rangeunit| Time range unit, optional range h (hour), d (day, default), mo (month), y (year) |

#### Example

- Cluster level

Only system tenants can create cluster-level pitrs.

```
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "root" --password "111" --pname "pitr01" --level "cluster" --rangevalue 10 --rangeunit "h"
```

- Tenant level

System tenants can create tenant-level pitrs for themselves and other tenants.

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr02" --level "account" --account "sys" --rangevalue 1 --rangeunit "d"

mo create account acc01 admin_name = 'test_account' identified by '111';
mo create account acc02 admin_name = 'test_account' identified by '111';

./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr015" --level "account" --account "acc01" --rangevalue 1 --rangeunit "y"

./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr016" --level "account" --account "acc02" --rangevalue 1 --rangeunit "y"
```

Ordinary tenants can only create tenant-level pitrs for themselves.

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr07" --level "account" --account "acc01" --rangevalue 1 --rangeunit "h"
```

- database level

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr011" --level "database" --account "sys" --database "abc" --rangevalue 1 --rangeunit "y"
```

- table level

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr011" --level "database" --account "sys" --database "abc" --rangevalue 1 --rangeunit "y"
```

### View PITR

#### Grammar structure

```
mo_br pitr show
    --hostname 
    --port 
    --user 
    --password 
    --cluster 
    --account 
    --database 
    --table 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|pname | pitr name|
|cluster | Fixed filling in sys, other values ​​​​do not take effect, only used by sys administrators |
|account| Backup tenant name|
|database| Backup database name|
|table| Backup table name|

#### Example

- View all pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111" 
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr016  	2024-08-08 06:55:40	2024-08-08 06:55:40	account   	acc02       	*            	*         	          1	y        	
pitr015  	2024-08-08 06:55:04	2024-08-08 06:55:04	account   	acc01       	*            	*         	          1	y        	
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y        	
pitr05   	2024-08-08 06:45:56	2024-08-08 06:45:56	account   	sys         	*            	*         	          1	y        	
pitr04   	2024-08-08 06:45:52	2024-08-08 06:45:52	account   	sys         	*            	*         	          1	mo       	
pitr03   	2024-08-08 06:45:42	2024-08-08 06:45:42	account   	sys         	*            	*         	          1	d        	
pitr02   	2024-08-08 06:45:25	2024-08-08 06:45:25	account   	sys         	*            	*         	          1	h        	
pitr01   	2024-08-08 06:32:31	2024-08-08 06:32:31	cluster   	*           	*            	*         	         10	h  
```

- View cluster level pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --cluster "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr01   	2024-08-08 06:32:31	2024-08-08 06:32:31	cluster   	*           	*            	*         	         10	h 
```

- View tenant level pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y        	
pitr05   	2024-08-08 06:45:56	2024-08-08 06:45:56	account   	sys         	*            	*         	          1	y        	
pitr04   	2024-08-08 06:45:52	2024-08-08 06:45:52	account   	sys         	*            	*         	          1	mo       	
pitr03   	2024-08-08 06:45:42	2024-08-08 06:45:42	account   	sys         	*            	*         	          1	d        	
pitr02   	2024-08-08 06:45:25	2024-08-08 06:45:25	account   	sys         	*            	*         	          1	h   
```

- View database level pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys" --database "abc"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y     
```

- View table level pitr

```bash
 ./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys" --database "abc" --table "test"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y          
```

### Change PITR

#### Grammar structure

```
mo_br pitr alter
    --host
    --port 
    --user 
    --password 
    --pname 
    --rangevalue
    --rangeunit 
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|pname | pitr name|
|rangevalue|Time range value, 1-100|
|rangeunit| Time range unit, optional range h (hour), d (day, default), mo (month), y (year) |

#### Example

```bash
./mo_br pitr alter --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --rangevalue 10 --rangeunit "d"
 ./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --cluster "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr01   	2024-08-08 06:32:31	2024-08-08 07:31:06	cluster   	*           	*            	*         	         10	d    
```

### Restore PITR

#### Grammar structure

```
mo_br pitr restore
    --host string cluster IP
    --port int cluster port number
    --user string username
    --password user password
    //Object name to be restored
    --cluster restores the entire cluster, only for cluster administrators. Fixed filling in sys. After filling in this field, only need to fill in --timestamp
    --account Tenant name to filter, only for cluster administrators
    --database The name of the database to filter
    --table The name of the table to filter
    //Time to restore
    --timestamp
    //Create and restore to new tenant
    --new_account string Newly created tenant name
    --new_admin_name string tenant administrator
    --new_admin_password string Tenant administrator password
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|cluster | Restore the entire cluster, only for cluster administrators. Fixed filling in sys. After filling in this field, just fill in --timestamp|
|account | Tenant name to filter, only for cluster administrators |
|database | Database name to filter |
|table | table name to filter|
|timestamp | time to restore |
|new_account |Time to restore|
|new_admin_name | Create and restore to new tenant, newly created tenant name|
|new_admin_password | Tenant Administrator |
|timestamp | Tenant administrator password |

#### example

- system tenant

    ```bash
    #cluster
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --level "cluster" --rangevalue 10 --rangeunit "h"

    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --cluster "sys" --timestamp "2024-08-08 15:42:20.249966"

    #tenent
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --level "account" --account "sys" --rangevalue 10 --rangeunit "h"
    ##Use account pitr to restore account
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys"
    ##Use account pitr to restore db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys" --database "abc"
    ##Use account pitr to restore table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys" --database "abc" --table "test"

    #Database level
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --level "database" --account "sys" --database "abc" --rangevalue 10 --rangeunit "h"
    ##Use db pitr to restore db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --timestamp "2024-08-08 15:56:18.610295" --account "sys" --database "abc"
    ##Use db pitr to restore table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --timestamp "2024-08-08 15:56:18.610295" --account "sys" --database "abc" --table "test"

    #Table level
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr102" --level "table" --account "sys" --database "abc" --table "test" --rangevalue 10 --rangeunit "h"
    ##用 table pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr102" --timestamp "2024-08-08 16:00:41.433477" --account "sys" --database "abc" --table "test"
    ```

- Ordinary tenant

    ```bash
    #Tenant level
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr200" --level "account" --account "acc01" --rangevalue 10 --rangeunit "h"
    ##Use account pitr to restore account
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01"
    ##Restore db using account pitr
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01" --database "abc"
    ##Use account pitr to restore the table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01" --database "abc" --table "test"

    #database level
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr201" --level "database" --account "acc01" --database "abc" --rangevalue 10 --rangeunit "h"
    ##Restore db using db pitr
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr201" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc"
    ##Use db pitr to restore table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr201" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc" --table "test"

    #Table level
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr202" --level "table" --account "acc01" --database "abc" --table "test" --rangevalue 10 --rangeunit "h"
    ##Restoring table using table pitr
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr202" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc" --table "test"

    #The system tenant creates a pitr for the ordinary tenant and restores the ordinary tenant

    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --level "account" --account "acc01" --rangevalue 1 --rangeunit "y"

    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --timestamp "2024-08-08 16:09:17.035136" --account "acc01"

    #System tenant restores normal tenant to new tenant
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --timestamp "2024-08-08 16:09:17.035136" --account "acc03" --new_account "acc03"  --new_admin_name "test_account" --new_admin_password "111"
    ```

### Delete PITR

#### Grammar structure

```
mo_br pitr drop
    --host
    --port 
    --user 
    --password 
    --pname
```

**Parameter description**

| Parameters | Description |
| ----| ----|
|host | IP of target MatrixOne|
|port|Port number|
|user | user|
|password | User's password|
|pname | pitr name|

#### 示例

```bash
./mo_br pitr drop  --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01"  
```