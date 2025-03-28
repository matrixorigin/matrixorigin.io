# Deploy a stand-alone MatrixOne based on S3

This article provides an example of how to deploy a stand-alone MatrixOne based on S3. Different from the general stand-alone deployment method, this method uses S3 as the storage medium of MatrixOne, instead of directly using the local disk of the host machine.

## Applicable scenarios

This deployment pattern is ideal for testing timing scenarios. Because the time series data has the characteristics of high speed and large amount of data, the use of S3 with nearly unlimited capacity as a storage medium can well meet these requirements, thus avoiding the limitation of insufficient local disk space in a single computer.

!!! note
    This deployment model is recommended only for development and testing scenarios, but not for production environments. For production environments, it is recommended to use a distributed deployment model based on k8s+s3.

## Precondition

Prepare a host machine and configure S3 storage media, including but not limited to: authentication key pair, access endpoint, area (privatization can be ignored), bucket name path, etc. In addition, it is recommended to place the host of MatrixOne stand-alone deployment and S3 object storage in the same intranet to ensure that the network will not become a performance bottleneck.

## Operation steps

### Scenario 1: MatrixOne with Minio

#### Deploy a stand-alone MatrixOne

For reference [Deploy MatrixOne on a stand-alone basis](../Get-Started/install-standalone-matrixone.md), complete the deployment of the stand-alone version of MatrixOne, and do not start it after deployment.

#### Modifying the MatrixOne Configuration File

The host deployment mode (i.e. source code or binary deployment) is taken as an example below. If the container deployment mode is used, the configuration file needs to be mounted in the container. See the specific operation steps **Containerized deployment mode** section. In the host deployment mode, the default configuration file is generally located in etc/launch/. Generally, the deployment path of Mo and the information of S3 need to be modified.

- Back up the default configuration folder

```bash
cd /your/mo-path/
cp -rp etc/launch etc/launch-default
```

- CN Configuration (CN. Toml)

```
###############################
#    一,default configuration  #
###############################

service-type = "CN"
data-dir = "./mo-data"

[log]
level = "info"

[cn]
uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 18000

[malloc]
check-fraction = 65536
enable-metrics = true

######################################
#    二,Customized Configuration     #
######################################

# The configuration of fileservic array, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with the S3 write): mo's data storage
# 3, ETL: observability system-related data storage (generally aligned with mo's data storage)

# 1. Part I: LOCAL
# 1.1, (optional) configure the local path of the LOCAL section, note that CN, TN, LOG need to configure different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/cn"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1. (Optional) Configure the local cache of the S3 part, including disk cache and memory cache
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo-path/matrixone/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/data" # Path to the bucket name
key-id = "xxxx" # key id
key-secret = "xxxx" #secret key

# 3. Part III: ETL
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,((Required) Configure the object store information for storing mo etl data in the ETL section, keeping most of the information the same as in section 2.2, but using a different subdirectory for key-prefix is sufficient
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/etl" # Path to the bucket name
key-id = "xxxx" # key id
key-secret = "xxxx" #secret key
```

- TN Configuration (TN. Toml)

```
######################################
#    一,default configuration        #
######################################

service-type = "TN"
data-dir = "./mo-data"

[log]
level = "info"

[tn]
uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 19000

[malloc]
check-fraction = 65536
enable-metrics = true

######################################
#    二,Customized Configuration     #
######################################

# fileservic array configuration, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with S3 writing): mo's data storage
# 3, ETL: observability system-related data storage (generally aligned with mo's data storage)

# 1. Part I: LOCAL
# 1.1, (optional) configure the local path of the LOCAL section, note that CN, TN, LOG need to configure different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/tn"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1,(Optional) Configure local caching for the S3 section, including disk caching and memory caching
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo-path/matrixone/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/data" # Path to the bucket name
key-id = "xxxx" # key id
key-secret = "xxxx" #secret key

# 3, Part III: ETL
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,(Required) Configure the object store information for storing mo etl data in the ETL section, most of the information remains the same as in section 2.2, except that a separate subdirectory is sufficient for the key-prefix
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/etl" # Path to the bucket name
key-id = "xxxx" # key id
key-secret = "xxxx" #secret key
```

- Log Service Configuration (log. Toml)

```
######################################
#    一,default configuration        #
######################################

# service node type, [DN|CN|LOG]
service-type = "LOG"
data-dir = "./mo-data"

[log]
level = "info"

[malloc]
check-fraction = 65536
enable-metrics = true

######################################
#    二,Customized Configuration     #
######################################

# fileservic array configuration, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with S3 writing): mo's data storage
# 3, ETL: observability system-related data storage (generally aligned with mo's data storage)

# 1. Part 1: LOCAL
# 1.1, (Optional) Configure the local path for the LOCAL section, note that CN, TN, LOG need to be configured with different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/log"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1,(Optional) Configure local caching for the S3 section, including disk caching and memory caching
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo-path/matrixone/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/data" # Path 
key-id = "xxxx" # key id
key-secret = "xxxx" #secret key

# 3. Part III: ETL
# (mandatory)
[[fileservice]]
backend = "MINIO" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,(Required) Configure the object store information for storing mo etl data in the ETL section, most of the information remains the same as in section 2.2, except that a separate subdirectory is sufficient for the key-prefix
[fileservice.s3]
bucket = "mo-on-minio-demo" # bucket name
endpoint = "http://10.0.0.1" # endpoint
key-prefix = "mo/etl" # Path 
key-id = "xxxx" #key id
key-secret = "xxxx" #secret key

```

#### Start mo-service

```
# run mo-service
mo_ctl start
# After a few moments, confirm that the mo-service is running
mo_ctl status
```

#### Connect MatrixOne

```
# If mo_ctl is left at its default configuration, there is no need to set connection information, and the default will be to connect to the local mo
mo_ctl set_conf MO_HOST=127.0.0.1
mo_ctl set_conf MO_PORT=6001
mo_ctl set_conf MO_USER=dump
mo_ctl set_conf MO_PW=111

# connect 
mo_ctl connect
```

#### Verify that MatrixOne is working properly

```
# Take the example of creating a library table and write some sample data to confirm that mo works properly
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mo_ctl connect
2024-08-26 17:44:10.196 UTC+0800    [INFO]    Checking connectivity
2024-08-26 17:44:10.207 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 8.0.30-MatrixOne-v287278 MatrixOne

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.01 sec)

mysql> create database test;
Query OK, 1 row affected (0.02 sec)

mysql> use test;
Database changed
mysql> create table t1(create_time timestamp(3), device_id varchar(25), metric_value float);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t1 values ('2024-08-26 17:45:01', 'jkasdjlasd', 123.22);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t1 values ('2024-08-26 17:45:10', 'jkasdjlasd', 123.99);
Query OK, 1 row affected (0.00 sec)

mysql> insert into t1 values ('2024-08-26 17:45:10', 'dassad', 88.99);
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1;
+-------------------------+------------+--------------+
| create_time             | device_id  | metric_value |
+-------------------------+------------+--------------+
| 2024-08-26 17:45:01.000 | jkasdjlasd |       123.22 |
| 2024-08-26 17:45:10.000 | jkasdjlasd |       123.99 |
| 2024-08-26 17:45:10.000 | dassad     |        88.99 |
+-------------------------+------------+--------------+
3 rows in set (0.00 sec)

mysql> quit
Bye
2024-08-26 17:45:52.827 UTC+0800    [INFO]    Connect succeeded and finished. Bye
```

#### Confirm data write to S3 (MinIO)

We can use MC, minio's official command-line client tool, to confirm that Mo's data was written to the corresponding bucket. For the specific usage of MC, please refer to the following documentation:
<https://min.io/docs/minio/linux/reference/minio-mc.html>

```
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mc ls minio-sh/mo-on-minio-demo/mo
[2024-08-26 18:00:10 CST]     0B data/
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mc ls minio-sh/mo-on-minio-demo/mo/data/
[2024-08-26 17:47:32 CST] 1.7KiB STANDARD 01918e10-ec44-7245-a131-690549db5f05_00000
[2024-08-26 17:48:17 CST] 2.7KiB STANDARD 01918e10-ec44-72d2-9973-5d4ced588a4a_00000
[2024-08-26 17:48:12 CST]   972B STANDARD 01918e10-ec44-7321-93f8-5820d3abd218_00000
# ....
# 中间的文件省去
01918e1f-8a38-725e-b95f-1ba3213883ac_00000
[2024-08-26 17:58:42 CST]   739B STANDARD 01918e1f-9db7-7950-aa1a-1429b586e98d_00000
[2024-08-26 17:58:42 CST]  24KiB STANDARD 01918e1f-9db7-7bcd-bbf0-2aa3e16b6f73_00000
[2024-08-26 17:58:42 CST] 3.7KiB STANDARD 01918e1f-9dd0-7386-98e9-f2530420d460_00000
[2024-08-26 18:00:12 CST]     0B ckp/
```

### Scenario 2: MatrixOne with S3

This section describes how to deploy a standalone version of MatrixOne based on object storage that follows the standard S3 protocol, using Tencent Cloud COS as an example. For other similar S3 service providers, such as AWS and Alibaba Cloud OSS, their configuration methods are similar, and you can refer to this step. Compared with MinIO, the deployment steps based on Tencent Cloud COS are basically the same except that the configuration files are slightly different. The differences in the configuration files will be highlighted below, and other steps will not be repeated.

#### Modifying the MatrixOne Configuration File

- CN Configuration (CN. Toml)

```
#####################################
#    一,default configuration       #
#####################################

service-type = "CN"
data-dir = "./mo-data"

[log]
level = "info"

[cn]
uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 18000

[malloc]
check-fraction = 65536
enable-metrics = true

######################################
#    二,Customized Configuration     #
######################################

# fileservic array configuration, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with S3 writing): mo's data storage
# 3, ETL: observability system-related datastore (generally consistent with mo's datastore)

# 1, Part I: LOCAL
# 1.1, (optional) configure the local path of the LOCAL part, note that CN, TN, LOG need to configure different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/cn"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1,(Optional) Configure local caching for the S3 section, including disk caching and memory caching
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo/path/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/data" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region

# 3,Part III: ETL
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,(Required) Configure the object store information for storing mo etl data in the ETL section, most of the information remains the same as in section 2.2, except that a separate subdirectory is sufficient for the key-prefix
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/etl" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region
```

- TN Configuration (TN. Toml)

```
######################################
#    一,default configuration        #
######################################

service-type = "TN"
data-dir = "./mo-data"

[log]
level = "info"

[tn]
uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 19000

[malloc]
check-fraction = 65536
enable-metrics = true

#########################################
#    二,Customized Configuration        #
#########################################

# fileservic array configuration, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with S3 writing): mo's data storage
# 3, ETL: observability system-related datastore (generally consistent with mo's datastore)

# 1, Part I: LOCAL
# 1.1, (optional) configure the local path of the LOCAL part, note that CN, TN, LOG need to configure different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/tn"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1,(Optional) Configure local caching for the S3 section, including disk caching and memory caching
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo/path/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/data" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region

# 3, Part III: ETL
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,(Required) Configure the object store information for storing mo etl data in the ETL section, most of the information remains the same as in section 2.2, except that a separate subdirectory is sufficient for the key-prefix
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/etl" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region
```

- Log Service Configuration (log. Toml)

```
#########################################
#    一,default configuration           #
#########################################

# service node type, [DN|CN|LOG]
service-type = "LOG"
data-dir = "./mo-data"

[log]
level = "info"

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二,自定义配置     #
#######################

# fileservic array configuration, name is divided into three parts: LOCAL, S3, ETL, where:
# 1, LOCAL: temporary file storage (generally with DISK's backend)
# 2, SHARED (the old configuration item is S3, later changed to SHARED, but still compatible with S3 writing): mo's data storage
# 3, ETL: observability system-related datastore (generally consistent with mo's datastore)

# 1, Part I: LOCAL
# 1.1, (optional) configure the local path of the LOCAL part, note that CN, TN, LOG need to configure different directories
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/log"
name = "LOCAL"

# 2. Part II: S3
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "S3"

# 2.1,(Optional) Configure local caching for the S3 section, including disk caching and memory caching
[fileservice.cache]
disk-capacity = "20GiB" # Local Disk Cache Size
disk-path = "/your/mo/path/data/disk-cache" # Local Disk Cache Path
memory-capacity = "2GiB" #Local memory cache size

# 2.2,(Required) configuring object storage information for storing mo data data in the S3 section, including
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/data" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region

# 3,Part III: ETL
# (mandatory)
[[fileservice]]
backend = "S3" # Note that when MinIO is configured as MINIO, the rest of S3 is configured as S3
name = "ETL"

# 3.1,(Required) Configure the cache in the ETL section, typically configured to 1B, i.e. almost no
[fileservice.cache]
memory-capacity = "1B"

# 3.2,(Required) Configure the object store information for storing mo etl data in the ETL section, most of the information remains the same as in section 2.2, except that a separate subdirectory is sufficient for the key-prefix
[fileservice.s3]
bucket = "my-bucket-12345678" # bucket name
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint
key-prefix = "mo/etl" # path
key-id = "xxxxxx" # key id
key-secret = "xxxxxx" #secret key
region = "ap-nanjing" # region
```

#### Acknowledge data write to COS

We can use the above MC tool or the coscli tool provided by Tencent Cloud COS for confirmation. Please refer to the official document description: <https://cloud.tencent.com/document/product/436/63143>

```mysql
github@VM-32-6-debian:/data/mo/main$ mo_ctl connect
2024-08-26 18:38:31.105 UTC+0800    [INFO]    Checking connectivity
2024-08-26 18:38:31.124 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 3
Server version: 8.0.30-MatrixOne-v287278 MatrixOne

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.003 sec)

MySQL [(none)]> create database test;
Query OK, 1 row affected (0.008 sec)

MySQL [(none)]> use test
Database changed
MySQL [test]> create table t1(create_time timestamp(3), device_id varchar(25), metric_value float);
Query OK, 0 rows affected (0.012 sec)

MySQL [test]> insert into t1 values ('2024-08-26 17:45:01', 'jkasdjlasd', 123.22);
Query OK, 1 row affected (0.005 sec)

MySQL [test]>  insert into t1 values ('2024-08-26 17:45:10', 'jkasdjlasd', 123.99);
Query OK, 1 row affected (0.003 sec)

MySQL [test]> insert into t1 values ('2024-08-26 17:45:10', 'dassad', 88.99);
Query OK, 1 row affected (0.002 sec)

MySQL [test]> select * from t1;
+-------------------------+------------+--------------+
| create_time             | device_id  | metric_value |
+-------------------------+------------+--------------+
| 2024-08-26 17:45:01.000 | jkasdjlasd |       123.22 |
| 2024-08-26 17:45:10.000 | jkasdjlasd |       123.99 |
| 2024-08-26 17:45:10.000 | dassad     |        88.99 |
+-------------------------+------------+--------------+
3 rows in set (0.003 sec)

MySQL [test]> quit
Bye
2024-08-26 18:50:17.007 UTC+0800    [INFO]    Connect succeeded and finished. Bye


github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo
       KEY       | TYPE | LAST MODIFIED | SIZE  
-----------------+------+---------------+-------
  main_30eca66c/ |  DIR |               |       
             mo/ |  DIR |               |       
       KEY       | TYPE |  LAST MODIFIED  | SIZE  
-----------------+------+-----------------+-------
-----------------+------+-----------------+-------
                          TOTAL OBJECTS:  |  2    
                        ------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/
    KEY    |   TYPE   |      LAST MODIFIED       | SIZE  
-----------+----------+--------------------------+-------
  mo/data/ |      DIR |                          |       
       mo/ | STANDARD | 2024-08-26T10:28:28.000Z | 0  B  
    KEY    |   TYPE   |      LAST MODIFIED       | SIZE  
-----------+----------+--------------------------+-------
-----------+----------+--------------------------+-------
                             TOTAL OBJECTS:      |  2    
                      ---------------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/data
    KEY    | TYPE | LAST MODIFIED | SIZE  
-----------+------+---------------+-------
  mo/data/ |  DIR |               |       
    KEY    | TYPE |  LAST MODIFIED  | SIZE  
-----------+------+-----------------+-------
-----------+------+-----------------+-------
                    TOTAL OBJECTS:  |  1    
                  ------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/data/
                         KEY                         |   TYPE   |      LAST MODIFIED       |   SIZE     
-----------------------------------------------------+----------+--------------------------+------------
                                        mo/data/ckp/ |      DIR |                          |            
  mo/data/01918e44-0205-7239-9fdc-a3370df0cc73_00000 | STANDARD | 2024-08-26T10:43:39.000Z |  15.42 KB  
  mo/data/01918e44-0205-7463-b9b1-95a4b88f11fa_00000 | STANDARD | 2024-08-26T10:43:49.000Z |    972  B  
# ....
# 中间省去
  mo/data/01918e4e-ba33-772f-a606-07a0e7c20e03_00000 | STANDARD | 2024-08-26T10:50:09.000Z |   2.26 KB  
  mo/data/01918e4e-ba34-7605-b070-c53224bc16e2_00000 | STANDARD | 2024-08-26T10:50:09.000Z |  45.77 KB  
  mo/data/01918e4e-ba36-7080-96b6-7000c1f978aa_00000 | STANDARD | 2024-08-26T10:50:09.000Z |  62.67 KB  
                         KEY                         |   TYPE   |      LAST MODIFIED       |   SIZE     
-----------------------------------------------------+----------+--------------------------+------------
-----------------------------------------------------+----------+--------------------------+------------
                                                                       TOTAL OBJECTS:      |    119     
                                                                ---------------------------+------------
```

### Containerized deployment mode

According to the scenario, configure the CN. Toml, TN. Toml, and log. Toml file according to the above steps. After that, put these files in the same directory, for example,/data/Mo _ confs. In addition, you need to configure a launch. Toml file with the following contents:

- Modifying the MatrixOne Configuration File

```
logservices = [
    "./etc/log.toml",
]

tnservices = [
    "./etc/tn.toml"
]

cnservices = [
    "./etc/cn.toml"
]
```

- Set Mo _ CTL Tools Configuration

```bash
#Configure cn.toml, tn.toml and log.toml first.
mo_ctl set_conf MO_CONTAINER_IMAGE=matrixorigin/matrixone/2.1.0 #Setting up mirroring
mo_ctl set_conf MO_CONTAINER_NAME=mo # Setting the container name
mo_ctl set_conf MO_CONTAINER_CONF_HOST_PATH=/data/mo_confs/ # Set the directory on the host machine where the mo configuration file is stored
mo_ctl set_conf MO_CONTAINER_CONF_CON_FILE="/etc/launch.toml" # Set the path to the configuration file inside the container when the container starts up
mo_ctl set_conf MO_CONTAINER_DATA_HOST_PATH="/data/mo-data/" # Setting the host data directory for mounting to containers
mo_ctl set_conf MO_CONTAINER_AUTO_RESTART="yes"   # Configure the container to restart automatically after an abnormal exit
```

- Start the MatrixOne container
  
Set the MatrixOne deployment mode to container and start the MatrixOne container

```
mo_ctl set_conf MO_DEPLOY_MODE=docker
mo_ctl start
```
