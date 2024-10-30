# MatrixOne System Databases and Tables

MatrixOne system databases and tables are where MatrixOne stores the system information that you can access through them.MatrixOne creates six system databases at initialization: `mo_catalog`, `information_schema`, `system_metrcis`, `system`, `mysql`, and `mo_task`. system`,`mysql`and`mo_task`.`mo_task` is currently under development and will not have a direct impact on the operations you perform for the time being. Other system database and table functions are described in this document.

The system can only modify system databases and tables; you can only read from them.

## `mo_catalog` database

The `mo_catalog` is used to store metadata about MatrixOne objects such as: databases, tables, columns, system variables, tenants, users, and roles.

The concept of multi-tenancy was introduced with MatrixOne version 0.6, and the default `sys` tenant behaves slightly differently from other tenants. The system table `mo_account`, which serves multi-tenant management, is only visible to `sys` tenants; it is not visible to other tenants.

### mo_indexes table

| column            | type            | comments                            |
| -----------------| --------------- | ----------------- |
| id | BIGINT UNSIGNED(64) | index ID |
| table_id | BIGINT UNSIGNED(64) | ID of the table where the index resides |
| database_id | BIGINT UNSIGNED(64) | ID of the database where the index resides |
| name | VARCHAR(64) | name of the index |
| type | VARCHAR(11) | The type of index, including primary key index (PRIMARY), unique index (UNIQUE), secondary index (MULTIPLE) |
| algo_table_type | VARCHAR(11) | Algorithm for creating indexes |
| algo_table_type | VARCHAR(11) | Hidden table types for multi-table indexes |
| | algo_params | VARCHAR(2048) | Parameters for indexing algorithms |
| is_visible | TINYINT(8) | Whether the index is visible, 1 means visible, 0 means invisible (currently all MatrixOne indexes are visible indexes) |
| hidden | TINYINT(8) | Whether the index is hidden, 1 is a hidden index, 0 is a non-hidden index|
| comment | VARCHAR(2048) | Comment information for the index |
| column_name | VARCHAR(256) | The column name of the constituent columns of the index |
| ordinal_position | INT UNSIGNED(32) | Column ordinal in index, starting from 1 |
| options | TEXT(0) | options option information for index |
| index_table_name | VARCHAR(5000) | The table name of the index table corresponding to the index, currently only the unique index contains the index table |

### mo_table_partitions table

| column       | type         | comments     |
| ------------ | ------------ | ------------ |
| table_id | BIGINT UNSIGNED(64) | The ID of the current partitioned table. |
| database_id | BIGINT UNSIGNED(64) | The ID of the database to which the current partitioned table belongs. |
| number | SMALLINT UNSIGNED(16) | The current partition number. All partitions are indexed in the order they are defined, with 1 assigned to the first partition. |
| name | VARCHAR(64) | The name of the partition. |
| partition_type | VARCHAR(50) | Stores the partition type information for the table. For partitioned tables, the values can be "KEY", "LINEAR_KEY", "HASH", "LINEAR_KEY_51", "RANGE", "RANGE_COLUMNS", "LIST", "LIST_COLUMNS". For non-partitioned tables, the value is an empty string. Note: MatrixOne does not currently support RANGE and LIST partitioning. |
| partition_expression | VARCHAR(2048) | The expression for the partitioning function used in the CREATE TABLE or ALTER TABLE statement that created the partitioned table's partitioning scheme. |
| description_utf8 | TEXT(0) | This column is used for RANGE and LIST partitions. For a RANGE partition, it contains the value set in the partition's VALUES LESS THAN clause, which can be an integer or MAXVALUE. For a LIST partition, this column contains the values defined in the partition's VALUES IN clause, which is a comma-separated list of integer values. For partitions with partition_type other than RANGE or LIST, this column is always NULL. Note: MatrixOne does not currently support RANGE and LIST partitioning, so this column is NULL. |
| comment | VARCHAR(2048) | The text of the comment, if the partition has one. Otherwise, this value is empty. |
| options | TEXT(0) | Partition options information, currently set to NULL. |
| partition_table_name | VARCHAR(1024) | The name of the subtable corresponding to the current partition. |

### mo_user table

| column                | type         | comments            |
| --------------------- | ------------ | ------------------- |
| user_id               | int | user id, primary key                 |
| user_host             | varchar(100) |  user host address                   |
| user_name             | varchar(100) |  user name                   |
| authentication_string | varchar(100) |  authentication string encrypted with password                   |
| status                | varchar(8)   | open,locked,expired |
| created_time          | timestamp    | user created time                   |
| expired_time          | timestamp    | user expired time                    |
| login_type            | varchar(16)  | ssl/password/other  |
| creator               | int | the creator id who created this user             |
| owner                 | int | the admin id for this user      |
| default_role          | int | the default role id for this user          |

### mo_account table (Only visible for `sys` account)

| column       | type         | comments     |
| ------------ | ------------ | ------------ |
| account_id   | int unsigned | account id, primary key  |
| account_name | varchar(100) | account name  |
| status       | varchar(100) | open/suspend |
| created_time | timestamp    | create time  |
| comments     | varchar(256) | comment      |
| suspended_time | TIMESTAMP   | Time of the account's status is changed |
| version | bigint unsigned    | the version status of the current account|

### mo_database table

| column           | type            | comments                                |
| ---------------- | --------------- | --------------------------------------- |
| dat_id           | bigint unsigned | Primary key ID                          |
| datname          | varchar(100)    | Database name                           |
| dat_catalog_name | varchar(100)    | Database catalog name, default as `def` |
| dat_createsql    | varchar(100)    | Database creation SQL statement         |
| owner            | int unsigned    | Role id                                 |
| creator          | int unsigned    | User id                                 |
| created_time     | timestamp       | Create time                             |
| account_id       | int unsigned    | Account id                              |
| dat_type         | varchar(23)     | Database type, common library or subscription library |

### mo_role table

| column       | type         | comments                      |
| ------------ | ------------ | ----------------------------- |
| role_id      | int unsigned | role id, primary key          |
| role_name    | varchar(100) | role name                     |
| creator      | int unsigned | user_id                       |
| owner        | int unsigned | MOADMIN/ACCOUNTADMIN  ownerid |
| created_time | timestamp    | create time                   |
| comments     | text         | comment                       |

### mo_user_grant table

| column            | type         | comments                            |
| ----------------- | ------------ | ----------------------------------- |
| role_id           | int unsigned | ID of the authorized role, associated primary key       |
| user_id           | int unsigned | Obtain the user ID of the authorized role and associate the primary key   |
| granted_time      | timestamp    | granted time                        |
| with_grant_option | bool         | Whether to allow an authorized user to license to another user or role |

### mo_role_grant table

| column            | type         | comments                            |
| ----------------- | ------------ | ----------------------------------- |
| granted_id        | int  | the role id being granted, associated primary key              |
| grantee_id        | int  | the role id to grant others, associated primary key            |
| operation_role_id | int  | operation role id                   |
| operation_user_id | int  | operation user id                   |
| granted_time      | timestamp    | granted time                        |
| with_grant_option | bool         | Whether to allow an authorized role to be authorized to another user or role|

### mo_role_privs table

| column            | type            | comments                            |
| ----------------- | --------------- | ----------------------------------- |
| role_id           | int     | role id, associated primary key                        |
| role_name         | varchar(100)    | role name: accountadmin/public                           |
| obj_type          | varchar(16)     | object type: account/database/table, associated primary key                         |
| obj_id            | bigint unsigned | object id, associated primary key                         |
| privilege_id      | int             | privilege id, associated primary key                      |
| privilege_name    | varchar(100)    | privilege name: the list of privileges                                   |
| privilege_level   | varchar(100)    | level of privileges, associated primary key                                    |
| operation_user_id | int unsigned    | operation user id                             |
| granted_time      | timestamp       | granted time                                    |
| with_grant_option | bool            | If permission granting is permitted |

### mo_user_defined_function table

| column            | type            | comments                            |
| -----------------| --------------- | ----------------- |
| function_id | INT(32) | ID of the function, primary key |
| name | VARCHAR(100) | the name of the function |
| owner | INT UNSIGNED(32) | ID of the role who created the function |
| args | TEXT(0) | Argument list for the function |
| rettype | VARCHAR(20) | return type of the function |
| body | TEXT(0) | function body |
| language | VARCHAR(20) | language used by the function |
| db | VARCHAR(100) | database where the function is located |
| definer | VARCHAR(50) | name of the user who defined the function |
| modified_time | TIMESTAMP(0) | time when the function was last modified |
| created_time | TIMESTAMP(0) | creation time of the function |
| type | VARCHAR(10) | type of function, default FUNCTION |
| security_type | VARCHAR(10) | security processing method, uniform value DEFINER |
| comment | VARCHAR(5000) | Create a comment for the function |
| character_set_client | VARCHAR(64) | Client character set: utf8mb4 |
| collation_connection | VARCHAR(64) | Connection sort: utf8mb4_0900_ai_ci |
| database_collation | VARCHAR(64) | Database connection collation: utf8mb4_0900_ai_ci |

### mo_mysql_compatbility_mode table

| column            | type            | comments                            |
| -----------------| --------------- | ----------------- |
| configuration_id | INT(32) | Configuration item id, self-incrementing column, used as primary key to distinguish between different configurations |
| account_id | INT(32) | Tenant id of the configuration |
| account_name | VARCHAR(300) | The name of the tenant where the configuration is located |
| dat_name | VARCHAR(5000) | The name of the database where the configuration resides |
| variable_name | VARCHAR(300) | The name of the variable |
| variable_value | VARCHAR(5000) | The name of the database where the configuration resides. |
| variable_value | VARCHAR(5000) | The value of the variable |
| system_variables | BOOL(0) | if it is a system variable (compatibility variables are added in addition to system variables) |

### `mo_pubs` table

| Column Properties | Type | Description |
| ------------------| ---------------| -----------------|
| pub_name | VARCHAR(64) | Publish name |
| database_name | VARCHAR(5000) | Name of published data |
| database_id | BIGINT UNSIGNED(64) | The ID of the publishing database, corresponding to the dat_id in the mo_database table |
| all_table | BOOL(0) | Whether the publishing library contains all tables in the database corresponding to database_id |
| table_list | TEXT(0) | When it is not all table, publish the list of tables contained in the library. The table name corresponds one-to-one with the table under the database corresponding to database_id |
| account_list | TEXT(0) |When non-all accounts are used, the list of accounts allowed to subscribe to the publication library|
| created_time | TIMESTAMP(0) |The time when the release library was created |
| updated_time | TIMESTAMP(0) |Time to update the release library |
| owner | INT UNSIGNED(32) | Create the role ID corresponding to the release library |
| creator | INT UNSIGNED(32) | Create the user ID corresponding to the release library |
| comment | TEXT(0) | Remarks for creating a release library |

### `mo_subs` table

| Column Properties | Type | Description |
| ---------------------| ---------------| -----------------|
| sub_account_id | INT(32) | Subscription tenant id|
| sub_name | VARCHAR(5000) | subscription name |
| sub_time | TIMESTAMP(0) | Subscription time |
| pub_account_name |VARCHAR(300) | The name of the publishing tenant |
| pub_name | VARCHAR(64) | Publish name |
| pub_database | VARCHAR(5000) |Published database|
| pub_tables | TEXT(0) |Published tables |
| pub_time | TIMESTAMP(0) | Published time |
| pub_comment | TEXT(0) | Comments from the publishing library |
| status | TINYINT(8) | Subscription status, 0 means normal subscription, 1 means the publication exists but does not have subscription permission, 2 means the publication was originally subscribed but was deleted |

### mo_stages table

| column            | type            | comments         |
| -----------------| ---------------- | ----------------- |
| stage_id         | INT UNSIGNED(32) | data stage ID |
| stage_name       | VARCHAR(64)      | data stage name |
| url              | TEXT(0)          | Path to object storage (without authentication), path to file system |
| stage_credentials| TEXT(0)          | Authentication information, encrypted and saved |
| stage_status     | VARCHAR(64)      | ENABLED/DISABLED Default: DISABLED |
| created_time     | TIMESTAMP(0)     | creation time |
| comment          | TEXT(0)          | comment |

## `mo_sessions` view

| column            | type            | comments         |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| node_id           | VARCHAR(65535)   | Unique identifier of the atrixOne node. Once activated, it cannot be changed. |
| conn_id           | INT UNSIGNED     | A unique number associated with the client TCP connection in MatrixOne, automatically generated by Hakeeper. |
| session_id        | VARCHAR(65535)   | A unique UUID used to identify a session. a new UUID is generated for each new session. |
| account           | VARCHAR(65535)   | Name of the tenant.                                |
| user              | VARCHAR(65535)   | The name of the user.                                                |
| host              | VARCHAR(65535)   | The IP address and port on which the CN node receives client requests.  |
| db                | VARCHAR(65535)   | The name of the database used when executing the SQL.   |
| session_start     | VARCHAR(65535)   | The timestamp of the session creation.    |
| command           | VARCHAR(65535)   | Types of MySQL commands, such as COM_QUERY, COM_STMT_PREPARE, COM_STMT_EXECUTE, and so on. |
| info              | VARCHAR(65535)   | The SQL statement to execute. A single SQL may contain multiple statements. |
| txn_id            | VARCHAR(65535)   | The unique identifier of the associated transaction.    |
| statement_id      | VARCHAR(65535)   | The unique identifier (UUID) of the SQL statement.     |
| statement_type    | VARCHAR(65535)   | Types of SQL statements, such as SELECT, INSERT, UPDATE, and so on.   |
| query_type        | VARCHAR(65535)   | Types of SQL statements such as DQL (Data Query Language), TCL (Transaction Control Language), etc. |
| sql_source_type   | VARCHAR(65535)   | The source of the SQL statement, such as external or internal.      |
| query_start       | VARCHAR(65535)   | The timestamp at which the SQL statement began execution. |
| client_host       | VARCHAR(65535)   | The IP address and port number of the client.         |
| role              | VARCHAR(65535)   | The name of the user's role.       |

### `mo_configurations` view

| column            | type            | comments                            |
| ------------- | --------------- | ------------------------------------ |
| node_type     | VARCHAR(65535) |  Types of nodes: cn (compute node), tn (transaction node), log (log node), proxy (proxy).   |
| node_id       | VARCHAR(65535) |  The unique identifier of the node.  |
| name          | VARCHAR(65535) |The name of the configuration item, possibly accompanied by a nested structure prefix.|
| current_value | VARCHAR(65535) |  The current value of the configuration item.   |
| default_value | VARCHAR(65535) |  The default value of the configuration item.   |
| internal      | VARCHAR(65535) |  Indicates whether the configuration parameter is internal. |

### `mo_locks` view

| column            | type            | comments                            |
| ------------- | --------------- | ------------------------------------------------ |
| cn_id         | VARCHAR(65535) | cn's uuid                              |
| txn_id        | VARCHAR(65535) | The transaction holding the lock.                                  |
| table_id      | VARCHAR(65535) | Locked tables.                                      |
| lock_key      | VARCHAR(65535) | Lock type. Can be `point` or `range`.              |
| lock_content  | VARCHAR(65535) | The contents of the lock, in hexadecimal. For `range` locks, an interval; for `point` locks, a single value. |
| lock_mode     | VARCHAR(65535) | Lock mode. Can be `shared` or `exclusive`.         |
| lock_status   | VARCHAR(65535) | Lock status, which may be `wait`, `acquired` or `none`. <br>wait. No transaction holds the lock, but there are transactions waiting on the lock. <br>acquired. A transaction holds the lock. <br>none. No transaction holds the lock, and no transaction is waiting on the lock.    |
| lock_wait   | VARCHAR(65535) | Transactions waiting on this lock.                             |

### `mo_transactions` view

| column            | type            | comments                            |
| ------------- | --------------- | ------------------------------------ |
| cn_id        | VARCHAR(65535) | ID that uniquely identifies the CN (Compute Node).    |
| txn_id       | VARCHAR(65535) | The ID that uniquely identifies the transaction.                  |
| create_ts    | VARCHAR(65535) | Record the transaction creation timestamp, following the RFC3339Nano format ("2006-01-02T15:04:05.99999999999Z07:00").   |
| snapshot_ts  | VARCHAR(65535) | Represents the snapshot timestamp of the transaction, expressed in both physical and logical time.   |
| prepared_ts  | VARCHAR(65535) | Indicates the prepared timestamp of the transaction, in the form of physical and logical time.  |
| commit_ts    | VARCHAR(65535) | Indicates the commit timestamp of the transaction, in both physical and logical time.|
| txn_mode     | VARCHAR(65535) | Identifies the transaction mode, which can be either pessimistic or optimistic.   |
| isolation    | VARCHAR(65535) | Indicates the isolation level of the transaction, either SI (Snapshot Isolation) or RC (Read Committed).  |
| user_txn     | VARCHAR(65535) | Indicates a user transaction, i.e., a transaction created by a SQL operation performed by a user connecting to MatrixOne via a client.   |
| txn_status   | VARCHAR(65535) | Indicates the current state of the transaction, with possible values including active, committed, aborting, aborted. In the distributed transaction 2PC model, this would also include prepared and committing.  |
| table_id     | VARCHAR(65535) | Indicates the ID of the table involved in the transaction.  |
| lock_key     | VARCHAR(65535) | Indicates the type of lock, either range or point.   |
| lock_content | VARCHAR(65535) | Point locks represent individual values, range locks represent ranges, usually in the form of "low - high". Note that transactions may involve multiple locks, but only the first lock is shown here.|
| lock_mode    | VARCHAR(65535) | Indicates the mode of the lock, either exclusive or shared.   |

### `mo_transactions` 视图

| column           | type     | comments                                                |
| ------------- | --------------- | ------------------------------------ |
| cn_id        | VARCHAR(65535) | ID that uniquely identifies the CN (Compute Node).    |
| txn_id       | VARCHAR(65535) | The ID that uniquely identifies the transaction.                  |
| create_ts    | VARCHAR(65535) | Record the transaction creation timestamp, following the RFC3339Nano format ("2006-01-02T15:04:05.99999999999Z07:00").   |
| snapshot_ts  | VARCHAR(65535) | Represents the snapshot timestamp of the transaction, expressed in both physical and logical time.   |
| prepared_ts  | VARCHAR(65535) | Indicates the prepared timestamp of the transaction, in the form of physical and logical time.  |
| commit_ts    | VARCHAR(65535) | Indicates the commit timestamp of the transaction, in both physical and logical time.|
| txn_mode     | VARCHAR(65535) | Identifies the transaction mode, which can be either pessimistic or optimistic.   |
| isolation    | VARCHAR(65535) | Indicates the isolation level of the transaction, either SI (Snapshot Isolation) or RC (Read Committed).  |
| user_txn     | VARCHAR(65535) | Indicates a user transaction, i.e., a transaction created by a SQL operation performed by a user connecting to MatrixOne via a client.   |
| txn_status   | VARCHAR(65535) | Indicates the current state of the transaction, with possible values including active, committed, aborting, aborted. In the distributed transaction 2PC model, this would also include prepared and committing.  |
| table_id     | VARCHAR(65535) | Indicates the ID of the table involved in the transaction.  |
| lock_key     | VARCHAR(65535) | Indicates the type of lock, either range or point.   |
| lock_content | VARCHAR(65535) | Point locks represent individual values, range locks represent ranges, usually in the form of "low - high". Note that transactions may involve multiple locks, but only the first lock is shown here.|
| lock_mode    | VARCHAR(65535) | Indicates the mode of the lock, either exclusive or shared.   |

### mo_columns table

| column           | type     | comments                                                |
| --------------------- | --------------- | ------------------------------------------------------------ |
| att_uniq_name         | varchar(256)    | Primary Key. Hidden, composite primary key, format is like "${att_relname_id}-${attname}" |
| account_id            | int unsigned    | accountID                                                     |
| att_database_id       | bigint unsigned | databaseID                                                   |
| att_database          | varchar(256)    | database Name                                                |
| att_relname_id        | bigint unsigned | table id                                                     |
| att_relname           | varchar(256)    | The table this column belongs to.(references mo_tables.relname) |
| attname               | varchar(256)    | The column name                                              |
| atttyp                | varchar(256)    | The data type of this column (zero for a dropped column).    |
| attnum                | int             | The number of the column. Ordinary columns are numbered from 1 up. |
| att_length            | int             | bytes count for the type.                                    |
| attnotnull            | tinyint(1)      | This represents a not-null constraint.                       |
| atthasdef             | tinyint(1)      | This column has a default expression or generation expression. |
| att_default           | varchar(1024)   | default expression                                           |
| attisdropped          | tinyint(1)      | This column has been dropped and is no longer valid. A dropped column is still physically present in the table, but is ignored by the parser and so cannot be accessed via SQL. |
| att_constraint_type   | char(1)         | p = primary key constraint, n=no constraint                  |
| att_is_unsigned       | tinyint(1)      | unsigned or not                                              |
| att_is_auto_increment | tinyint(1)      | auto increment or not                                        |
| att_comment           | varchar(1024)   | comment                                                      |
| att_is_hidden         | tinyint(1)      | hidden or not                                                |
| attr_has_update       | tinyint(1)      | This columns has update expression                           |
| attr_update           | varchar(1024)   | update expression                                            |
| attr_is_clusterby     | tinyint(1)      | Whether this column is used as the cluster by keyword to create the table   |

### mo_tables table

| column         | type            | comments                                                     |
| -------------- | --------------- | ------------------------------------------------------------ |
| rel_id         | bigint unsigned | Primary key, table ID                  |
| relname        | varchar(100)    | Name of the table, index, view, and so on.                         |
| reldatabase    | varchar(100)    | The database that contains this relation. reference mo_database.datname |
| reldatabase_id | bigint unsigned | The database id that contains this relation. reference mo_database.datid |
| relpersistence | varchar(100)    | p = permanent table, t = temporary table                     |
| relkind        | varchar(100)    | r = ordinary table, e = external table, i = index, S = sequence, v = view, m = materialized view |
| rel_comment    | varchar(100)    |                                                              |
| rel_createsql  | varchar(100)    | Table creation SQL statement                                 |
| created_time   | timestamp       | Create time                                                  |
| creator        | int unsigned    | Creator ID                                                   |
| owner          | int unsigned    | Creator's default role id                                    |
| account_id     | int unsigned    | Account id                                                    |
| partitioned    | blob            | Partition by statement                                       |
| partition_info    | blob            | the information of partition         |
| viewdef            | blob                    | View definition statement                       |
| constraint        | varchar(5000)            | Table related constraints                      |
| catalog_version | INT UNSIGNED(0)    | Version number of the system table |

## `system_metrics` database

`system_metrics` collect the status and statistics of SQL statements, CPU & memory resource usage.

`system_metrics` tables have more or less same column types, fields in these tables are described as follows:

* collecttime:Collection time
* value:  the value of the collecting metric

- node: the MatrixOne node uuid
- role: the MatrixOne node role, can be CN, TN or LOG.  
- account: default as "sys", the account who fires the SQL request.
- type:SQL type, can be `select`, `insert`, `update`, `delete`, `other` types.

### `metric` table

| Column      | Type         | Comment                                                      |
| ----------- | ------------ | ------------------------------------------------------------ |
| metric_name | VARCHAR(128) | metric name, like: sql_statement_total, server_connections, process_cpu_percent, sys_memory_used, .. |
| collecttime | DATETIME     | metric data collect time                                     |
| value       | DOUBLE       | metric value                                                 |
| node        | VARCHAR(36)  | MatrixOne node uuid                                                    |
| role        | VARCHAR(32)  | MatrixOne node role                                                    |
| account     | VARCHAR(128) | account name, default "sys"                                                 |
| type        | VARCHAR(32)  | SQL type: like insert, select, update ...                                                  |

The other tables are all views of the `metric` table:

* `process_cpu_percent` table: Process CPU busy percentage.
* `process_open_fs` table: Number of open file descriptors.
* `process_resident_memory_bytes` table: Resident memory size in bytes.
* `server_connection` table: Server connection numbers.
* `sql_statement_errors` table: Counter of sql statements executed with errors.
* `sql_statement_total` table: Counter of executed sql statement.
* `sql_transaction_errors` table: Counter of transactional statements executed with errors.
* `sql_statement_hotspot` table: records the most extended SQL query executed by each tenant within each minute. Only those SQL queries whose execution time does not exceed a certain aggregation threshold will be included in the statistics.
* `sql_transaction_total` table: Counter of transactional sql statement.
* `sys_cpu_combined_percent` table: System CPU busy percentage, average among all logical cores.
* `sys_cpu_seconds_total` table: System CPU time spent in seconds, normalized by number of cores
* `sys_disk_read_bytes` table: System disk read in bytes.
* `sys_disk_write_bytes` table: System disk write in bytes.
* `sys_memory_available` table: System memory available in bytes.
* `sys_memory_used` table: System memory used in bytes.
* `sys_net_recv_bytes` table: System net received in bytes.
* `sys_net_sent_bytes` table: System net sent in bytes.

## `system` database

`System` database stores MatrixOne historical SQL statements, system logs, error information.

### `statement_info` table

It records user and system SQL statement with detailed information.

| Column                | Type          | Comments                                                     |
| --------------------- | ------------- | ------------------------------------------------------------ |
| statement_id          | VARCHAR(36)   | statement unique id                                          |
| transaction_id        | VARCHAR(36)   | Transaction unique id                                        |
| session_id            | VARCHAR(36)   | session unique id                                            |
| account               | VARCHAR(1024) | account name                                                 |
| user                  | VARCHAR(1024) | user name                                                    |
| host                  | VARCHAR(1024) | user client ip                                               |
| database              | VARCHAR(1024) | what database current session stay in                        |
| statement             | TEXT          | sql statement                                                |
| statement_tag         | TEXT          | note tag in statement(Reserved)                              |
| statement_fingerprint | TEXT          | note tag in statement(Reserved)                              |
| node_uuid             | VARCHAR(36)   | node uuid, which node gen this data                          |
| node_type             | VARCHAR(64)   | node type in MO, val in [TN, CN, LOG]                        |
| request_at            | DATETIME      | request accept datetime                                      |
| response_at           | DATETIME      | response send datetime                                       |
| duration              | BIGINT        | exec time, unit: ns                                          |
| status                | VARCHAR(32)   | sql statement running status, enum: Running, Success, Failed |
| err_code              | VARCHAR(1024) | error code                                                   |
| error                 | TEXT          | error message                                                |
| exec_plan             | JSON          | statement execution plan                                     |
| rows_read             | BIGINT        | rows read total                                              |
| bytes_scan            | BIGINT        | bytes scan total                                             |
| stats                 | JSON          | global stats info in |
|exec_plan             | JSON           | statement execution plan                            |
| rows_read             | BIGINT        | Read the total number of rows               |
| bytes_scan            | BIGINT        | Total bytes scanned                                           |
| stats                 | JSON          | Global statistics in exec_plan         |
| statement_type        | VARCHAR(1024) | statement type, val in [Insert, Delete, Update, Drop Table, Drop User, ...] |
| query_type            | VARCHAR(1024) | query type, val in [DQL, DDL, DML, DCL, TCL]           |
| role_id               | BIGINT        | role id         |
| sql_source_type       | TEXT          | Type of SQL source internally generated by MatrixOne             |
| aggr_count            | BIGINT(64)    | the number of statements aggregated   |
| result_count          | BIGINT(64)    | the number of rows of sql execution results    |  

### `rawlog` table

It records very detailed system logs.

| Column                | Type          | Comments                                                     |
| -------------- | ------------- | ------------------------------------------------------------ |
| raw_item       | VARCHAR(1024) | Original log entry      |
| node_uuid      | VARCHAR(36)   | Node uuid, i.e. a node that generates data  |
| node_type      | VARCHAR(64)   | Node type of TN/CN/Log to which var belongs within MatrixOne      |
| span_id        | VARCHAR(16)   | The unique ID of the span     |
| trace_id       | VARCHAR(36)   | trace unique uuid     |
| logger_name    | VARCHAR(1024) | Name of the logger                                                  |
| timestamp      | DATETIME      | Time-stamped actions                                      |
| level          | VARCHAR(1024) |  Log level, e.g. debug, info, warn, error, panic, fatal      |
| caller         | VARCHAR(1024) | Where the Log is generated: package/file.go:123  |
| message        | TEXT          | log message   |
| extra          | JSON          | Log dynamic fields       |
| err_code       | VARCHAR(1024) | error log   |
| error          | TEXT          | error message        |
| stack          | VARCHAR(4096) | Stack information for log_info and error_info  |
| span_name      | VARCHAR(1024) | span name, e.g. step name of execution plan, function name in code, ... |
| parent_span_id | VARCHAR(16)   | Parent span unique ID                                        |
| start_time     | DATETIME      |   span Start time                                                           |
| end_time       | DATETIME      |   span End time                                                           |
| duration       | BIGINT        | Execution time in ns                                          |
| resource       | JSON          | Static resource information                                  |
| span_kind      | VARCHAR(1024)       | span type. internal: MO internal generated trace (default); statement: trace_id==statement_id; remote: communicate via morpc|
| statement_id   | VARCHAR(36)         |  ID of the declaration statement            |
| session_id     | VARCHAR(36)         |  ID of the session           |

The other 3 tables(`log_info`, `span_info` and `error_info`) are views of `statement_info` and `rawlog` table.

## `information_schema` database

Information Schema provides an ANSI-standard way of viewing system metadata. MatrixOne also provides a number of custom `information_schema` tables, in addition to the tables included for MySQL compatibility.

Many `INFORMATION_SCHEMA` tables have a corresponding `SHOW` command. The benefit of querying `INFORMATION_SCHEMA` is that it is possible to join between tables.

### Tables for MySQL compatibility

| Table Name       | Description                                                  |
| :--------------- | :----------------------------------------------------------- |
| KEY_COLUMN_USAGE | Describes the key constraints of the columns, such as the primary key constraint. |
| COLUMNS          | Provides a list of columns for all tables.                   |
| PROFILING | Provides some profiling information during SQL statement execution. |
| PROCESSLIST      | Provides similar information to the command `SHOW PROCESSLIST`. |
| USER_PRIVILEGES  | Summarizes the privileges associated with the current user.  |
| SCHEMATA         | Provides similar information to `SHOW DATABASES`.            |
| CHARACTER_SETS   | Provides a list of character sets the server supports.       |
| TRIGGERS         | Provides similar information to `SHOW TRIGGERS`.             |
| TABLES           | Provides a list of tables that the current user has visibility of. Similar to `SHOW TABLES`. |
| PARTITIONS       | Provides information about table partitions.  |
| VIEWS | Provides information about views in the database. |
| ENGINES          | Provides a list of supported storage engines.                |
| ROUTINES | Provides some information about stored procedures. |
| PARAMETERS| Provides information about stored procedures' parameters and return values ​​. |
| KEYWORDS | Provide information about keywords in the database; see [Keywords](Language-Structure/keywords.md) for details. |

### `CHARACTER_SETS` table

The description of columns in the `CHARACTER_SETS` table is as follows:

- `CHARACTER_SET_NAME`: The name of the character set.
- `DEFAULT_COLLATE_NAME` The default collation name of the character set.
- `DESCRIPTION` The description of the character set.
- `MAXLEN` The maximum length required to store a character in this character set.

### `COLUMNS` table

The description of columns in the `COLUMNS` table is as follows:

- `TABLE_CATALOG`: The name of the catalog to which the table with the column belongs. The value is always `def`.
- `TABLE_SCHEMA`: The name of the schema in which the table with the column is located.
- `TABLE_NAME`: The name of the table with the column.
- `COLUMN_NAME`: The name of the column.
- `ORDINAL_POSITION`: The position of the column in the table.
- `COLUMN_DEFAULT`: The default value of the column. If the explicit default value is `NULL`, or if the column definition does not include the `default` clause, this value is `NULL`.
- `IS_NULLABLE`: Whether the column is nullable. If the column can store null values, this value is `YES`; otherwise, it is `NO`.
- `DATA_TYPE`: The type of data in the column.
- `CHARACTER_MAXIMUM_LENGTH`: For string columns, the maximum length in characters.
- `CHARACTER_OCTET_LENGTH`: For string columns, the maximum length in bytes.
- `NUMERIC_PRECISION`: The numeric precision of a number-type column.
- `NUMERIC_SCALE`: The numeric scale of a number-type column.
- `DATETIME_PRECISION`: For time-type columns, the fractional seconds precision.
- `CHARACTER_SET_NAME`: The name of the character set of a string column.
- `COLLATION_NAME`: The name of the collation of a string column.
- `COLUMN_TYPE`: The column type.
- `COLUMN_KEY`: Whether this column is indexed. This field might have the following values:
    - `Empty`: This column is not indexed, or this column is indexed and is the second column in a multi-column non-unique index.
    - `PRI`: This column is the primary key or one of multiple primary keys.
    - `UNI`: This column is the first column of the unique index.
    - `MUL`: The column is the first column of a non-unique index, in which a given value is allowed to occur for multiple times.
- `EXTRA`: Any additional information of the given column.
- `PRIVILEGES`: The privilege that the current user has on this column.
- `COLUMN_COMMENT`: Comments contained in the column definition.
- `GENERATION_EXPRESSION`: For generated columns, this value displays the expression used to calculate the column value. For non-generated columns, the value is empty.
- `SRS_ID`: This value applies to spatial columns. It contains the column `SRID` value that indicates the spatial reference system for values stored in the column.

### `ENGINES` table

The description of columns in the `ENGINES` table is as follows:

- `ENGINES`: The name of the storage engine.
- `SUPPORT`: The level of support that the server has on the storage engine.
- `COMMENT`: The brief comment on the storage engine.
- `TRANSACTIONS`: Whether the storage engine supports transactions.
- `XA`: Whether the storage engine supports XA transactions.
- `SAVEPOINTS`: Whether the storage engine supports `savepoints`.

### `PARTITIONS` view

The description of columns in the `PARTITIONS` View is as follows:

- `TABLE_CATALOG`: The name of the catalog to which the table belongs. This value is always def.
- `TABLE_SCHEMA`: The name of the schema (database) to which the table belongs.
- `TABLE_NAME`: The name of the table containing the partition.
- `PARTITION_NAME`: The name of the partition.
- `SUBPARTITION_NAME`: If the `PARTITIONS` table row represents a subpartition, the name of subpartition; otherwise NULL.
- `PARTITION_ORDINAL_POSITION`: All partitions are indexed in the same order as they are defined, with 1 being the number assigned to the first partition. The indexing can change as partitions are added, dropped, and reorganized; the number shown is this column reflects the current order, taking into account any indexing changes.
- `SUBPARTITION_ORDINAL_POSITION`: Subpartitions within a given partition are also indexed and reindexed in the same manner as partitions are indexed within a table.
- `PARTITION_METHOD`: One of the values `RANGE`, `LIST`, `HASH`, `LINEAR HASH`, `KEY`, or `LINEAR KEY`. __Note:__ MatrixOne does not currently support RANGE and LIST partitioning.
- `SUBPARTITION_METHOD`: One of the values `HASH`, `LINEAR HASH`, `KEY`, or `LINEAR KEY`.
- `PARTITION_EXPRESSION`: The expression for the partitioning function used in the `CREATE TABLE` or `ALTER TABLE` statement that created the table's current partitioning scheme.
- `SUBPARTITION_EXPRESSION`: This works in the same fashion for the subpartitioning expression that defines the subpartitioning for a table as `PARTITION_EXPRESSION` does for the partitioning expression used to define a table's partitioning. If the table has no subpartitions, this column is `NULL`.
- `PARTITION_DESCRIPTION`: This column is used for `RANGE` and `LIST` partitions. For a `RANGE` partition, it contains the value set in the partition's `VALUES LESS THAN` clause, which can be either an integer or `MAXVALUE`. For a `LIST` partition, this column contains the values defined in the partition's `VALUES IN` clause, which is a list of comma-separated integer values. For partitions whose `PARTITION_METHOD` is other than `RANGE` or `LIST`, this column is always `NULL`. __Note:__ MatrixOne does not currently support RANGE and LIST partitioning.
- `TABLE_ROWS`: The number of table rows in the partition.
- `AVG_ROW_LENGTH`: The average length of the rows stored in this partition or subpartition, in bytes. This is the same as `DATA_LENGTH` divided by `TABLE_ROWS`.
- `DATA_LENGTH`: The total length of all rows stored in this partition or subpartition, in bytes; that is, the total number of bytes stored in the partition or subpartition.
- `INDEX_LENGTH`: The length of the index file for this partition or subpartition, in bytes.
- `DATA_FREE`: The number of bytes allocated to the partition or subpartition but not used.
- `CREATE_TIME`: The time that the partition or subpartition was created.
- `UPDATE_TIME`: The time that the partition or subpartition was last modified.
- `CHECK_TIME`: The last time that the table to which this partition or subpartition belongs was checked.
- `CHECKSUM`: The checksum value, if any; otherwise `NULL`.
- `PARTITION_COMMENT`: The text of the comment, if the partition has one. If not, this value is empty. The maximum length for a partition comment is defined as 1024 characters, and the display width of the `PARTITION_COMMENT` column is also 1024, characters to match this limit.
- `NODEGROUP`: This is the nodegroup to which the partition belongs.
- `TABLESPACE_NAME`: The name of the tablespace to which the partition belongs. The value is always `DEFAULT`.

### `PROCESSLIST` view

Fields in the `PROCESSLIST` view are described as follows:

- `NODE_ID`: CN node UUID
- `CONN_ID`: ID of the user connection
- `SESSION_ID`: ID of the session
- `ACCOUNT`: tenant name
- `USER`: user name
- `HOST`: the listening address of the CN node
- `DB`: the currently connected database
- `SESSION_START`: session creation time
- `COMMAND`: the MySQL protocol command for the statement
- `INFO`: SQL statement being processed
- `TXN_ID`: transaction ID
- `STATEMENT_ID`: Statement ID
- `STATEMENT_TYPE`: type of statement, Select/Update/Delete, etc.
- `QUERY_TYPR`: query type, DQL/DDL/DML etc.
- `SQL_SOURCE_TYPE`: SQL statement source type, external or internal SQL: external_sql/internal_sql
- `QUERY_START`: Query start time.
- `CLIENT_HOST`: client address

### `SCHEMATA` view

The `SCHEMATA` table provides information about databases. The table data is equivalent to the result of the `SHOW DATABASES` statement. Fields in the `SCHEMATA` table are described as follows:

- `CATALOG_NAME`: The catalog to which the database belongs.
- `SCHEMA_NAME`: The database name.
- `DEFAULT_CHARACTER_SET_NAME`: The default character set of the database.
- `DEFAULT_COLLATION_NAME`: The default collation of the database.
- `SQL_PATH`: The value of this item is always `NULL`.
- `DEFAULT_TABLE_ENCRYPTION`: defines the *default encryption* setting for databases and general tablespaces.

### `TABLES` table

The description of columns in the `TABLES` table is as follows:

- `TABLE_CATALOG`: The name of the catalog which the table belongs to. The value is always `def`.
- `TABLE_SCHEMA`: The name of the schema which the table belongs to.
- `TABLE_NAME`: The name of the table.
- `TABLE_TYPE`: The type of the table. The base table type is `BASE TABLE`, the view table type is `VIEW`, and the `INFORMATION_SCHEMA` table type is `SYSTEM VIEW`.
- `ENGINE`: The type of the storage engine.
- `VERSION`: Version. The value is `10` by default.
- `ROW_FORMAT`: The row format. The value is `Compact`, `Fixed`, `Dynamic`, `Compressed`, `Redundant`.
- `TABLE_ROWS`: The number of rows in the table in statistics. For `INFORMATION_SCHEMA` tables, `TABLE_ROWS` is `NULL`.
- `AVG_ROW_LENGTH`: The average row length of the table. `AVG_ROW_LENGTH` = `DATA_LENGTH` / `TABLE_ROWS`.
- `DATA_LENGTH`: Data length. `DATA_LENGTH` = `TABLE_ROWS` * the sum of storage lengths of the columns in the tuple.
- `MAX_DATA_LENGTH`: The maximum data length. The value is currently `0`, which means the data length has no upper limit.
- `INDEX_LENGTH`: The index length. `INDEX_LENGTH` = `TABLE_ROWS` * the sum of lengths of the columns in the index tuple.
- `DATA_FREE`: Data fragment. The value is currently `0`.
- `AUTO_INCREMENT`: The current step of the auto- increment primary key.
- `CREATE_TIME`: The time at which the table is created.
- `UPDATE_TIME`: The time at which the table is updated.
- `CHECK_TIME`: The time at which the table is checked.
- `TABLE_COLLATION`: The collation of strings in the table.
- `CHECKSUM`: Checksum.
- `CREATE_OPTIONS`: Creates options.
- `TABLE_COMMENT`: The comments and notes of the table.

### `USER_PRIVILEGES` table

The `USER_PRIVILEGES` table provides information about global privileges.

Fields in the `USER_PRIVILEGES` table are described as follows:

- `GRANTEE`: The name of the granted user, which is in the format of `'user_name'@'host_name'`.
- `TABLE_CATALOG`: The name of the catalog to which the table belongs. This value is always `def`.
- `PRIVILEGE_TYPE`: The privilege type to be granted. Only one privilege type is shown in each row.
- `IS_GRANTABLE`: If you have the `GRANT OPTION` privilege, the value is `YES`; otherwise, the value is `NO`.

### `VIEWS` view

- `TABLE_CATALOG`: The name of the catalog the view belongs to. The value is `def`.
- `TABLE_SCHEMA`: The name of the database to which the view belongs.
- `TABLE_NAME`: The name of the view.
- `VIEW_DEFINITION`: The `SELECT` statement that provides the view definition. It contains most of what you see in the "Create Table" column generated by `SHOW Create VIEW`.
- `CHECK_OPTION`: The value of the `CHECK_OPTION` property. Values are `NONE`, `CASCADE`, or `LOCAL`.
- `IS_UPDATABLE`: Set a flag called the view updatable flag when `CREATE VIEW`; if UPDATE and DELETE (and similar operations) are legal for the view, the flag is set to `YES(true)`. Otherwise, the flag is set to `NO(false)`.
- `DEFINER`: The account of the user who created the view, in the format `username@hostname`.
- `SECURITY_TYPE`: View the `SQL SECURITY` attribute. Values ​​are `DEFINER` or `INVOKER`.
- `CHARACTER_SET_CLIENT`: The session value of the `character_set_client` system variable when the view was created.
- `COLLATION_CONNECTION`: The session value of the `collation_connection` system variable when the view was created.

### `STATISTICS` view

Obtain detailed information about database table indexes and statistics. For example, you can check whether an index is unique, understand the order of columns within an index, and estimate the number of unique values in an index.

- `TABLE_CATALOG`: The catalog name of the table (always 'def').
- `TABLE_SCHEMA`: The name of the database to which the table belongs.
- `TABLE_NAME`: The name of the table.
- `NON_UNIQUE`: Indicates whether the index allows duplicate values. If 0, the index is unique.
- `INDEX_SCHEMA`: The database name to which the index belongs.
- `INDEX_NAME`: The name of the index.
- `SEQ_IN_INDEX`: The position of the column within the index.
- `COLUMN_NAME`: The name of the column.
- `COLLATION`: The collation of the column.
- `CARDINALITY`: An estimated count of unique values in the index.
- `SUB_PART`: The length of the index part. For the entire column, this value is NULL.
- `PACKED`: Indicates whether compressed storage is used.
- `NULLABLE`: Indicates whether the column allows NULL values.
- `INDEX_TYPE`: The index type (e.g., BTREE, HASH, etc.).
- `COMMENT`: Comment information about the index.

## `mysql` database

### Grant system tables

These system tables contain grant information about user accounts and their privileges:

- `user`: user accounts, global privileges, and other non-privilege columns.
- `db`: database-level privileges.
- `tables_priv`: table-level privileges.
- `columns_priv`: column-level privileges.
- `procs_priv`: stored procedure and stored function privileges.
