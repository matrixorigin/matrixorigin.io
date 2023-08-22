# **SHOW PROCESSLIST**

## **Description**

`SHOW PROCESSLIST` is used to view a list of currently executing threads (also known as a process list), providing information about all active connections and executing queries on the MatrixOne server.

`SHOW PROCESSLIST` is used to monitor and manage activities in the database, identify potential issues, help diagnose query performance problems, and aid in decision-making to optimize database operations:

- Monitoring Database Activity: By executing `SHOW PROCESSLIST`, you can view the queries and operations currently running in the database in real time. This is useful for monitoring database activity and promptly identifying potential performance issues. You can see which queries are running, their status, and whether there are long-running or blocked queries, as well as information about locks, deadlocks, or resource contention.

- Terminating Queries: By examining the process list, you can identify the query ID of a specific query that needs to be terminated and then use the `KILL` command to stop that particular query. This is beneficial for controlling long-running queries or resolving deadlock situations.

## **Syntax**

```
> SHOW PROCESSLIST;
```

The explanations for the queried table structure are as follows:

| Column Name | Data Type | Constraint | Remarks |
|-------------|-----------|------------|---------|
| node_id | varchar | not null | Node ID uniquely identifies different nodes in the database cluster. In MatrixOne, a node corresponds to a CN (Compute Node). <br> __Note:__ <br> - In the single-node version of MatrixOne, there is usually only one node and all processes run on this node, so all processes have the same node_id. <br> - In the distributed version of MatrixOne, each node has a unique node_id. System tenants can view the node_id corresponding to the nodes where all executing threads run. In contrast, non-system tenants can only see the node_id corresponding to the nodes where threads executing for their tenant are running. |
| conn_id | uint32 | not null | Connection ID used to identify different database connections. To terminate a specific database connection, use the `KILL CONNECTION conn_id;` command. Each connection in the database is assigned a unique conn_id for identification. <br> __Note:__ System tenants can view all conn_id, while non-system tenants can only see conn_id for their tenant. |
| session_id     | varchar   | not null  | Session ID                                                    |
| account        | varchar   | not null  | account <br>__Note:__ Under the system, account, sessions, and account names can be viewed. Non-system accounts can only view sessions and account names of their accounts.    |
| user           | varchar   | not null  | User                                                          |
| host           | varchar   | not null  | Hostname of client-server                                        |
| db             | varchar   |           | Database name                                                 |
| session_start  | varchar   |           | Session start time                                            |
| command        | varchar   | not null  | Command type, e.g., COM_QUERY                                 |
| info           | varchar   |           | Current or previous SQL statement                             |
| txn_id         | varchar   | not null  | Current or previous transaction ID                            |
| statement_id   | varchar   |           | Current or previous statement ID                              |
| statement_type | varchar   |           | Current or previous statement type                            |
| query_type     | varchar   |           | Query type, e.g., DDL, DML, etc.                              |
| sql_source_type| varchar   |           | SQL source type, e.g., external_sql, internal_sql, etc.       |
| query_start    | varchar   |           | Query start time                                              |

## **Examples**

```sql
mysql> SHOW PROCESSLIST;
+--------------------------------------+---------+--------------------------------------+---------+--------------------------------------+----------------+---------+----------------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------+--------------------------------------+------------------+------------+-----------------+----------------------------+
| node_id                              | conn_id | session_id                           | account | user                                 | host           | db      | session_start              | command   | info                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | txn_id                           | statement_id                         | statement_type   | query_type | sql_source_type | query_start                |
+--------------------------------------+---------+--------------------------------------+---------+--------------------------------------+----------------+---------+----------------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------+--------------------------------------+------------------+------------+-----------------+----------------------------+
| dd1dccb4-4d3c-41f8-b482-5251dc7a41bf |       1 | 97f85f80-2a5c-11ee-ae41-5ad2460dea4f | sys     | mo_logger                            | 127.0.0.1:6001 |         | 2023-07-24 19:59:27.005755 | COM_QUERY | COMMIT                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                  |                                      |                  |            | internal_sql    |                            |
| dd1dccb4-4d3c-41f8-b482-5251dc7a41bf |       8 | a056b7c6-2a5c-11ee-ae42-5ad2460dea4f | sys     | root                                 | 127.0.0.1:6001 | aab     | 2023-07-24 19:59:41.045851 | COM_QUERY | SHOW PROCESSLIST                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | c207acc30a19432f8d3cbac387c6e520 | 421aadaa-2a68-11ee-ae5b-5ad2460dea4f | Show Processlist | Other      | external_sql    | 2023-07-24 21:22:56.907266 |
| dd1dccb4-4d3c-41f8-b482-5251dc7a41bf |      24 | 0915f91a-2a63-11ee-ae4d-5ad2460dea4f | sys     | 3bf028e0-aa43-4917-b82f-ed533c0f401e | 127.0.0.1:6001 | mo_task | 2023-07-24 20:45:33.762679 | COM_QUERY | select
                                                task_id,
                                                        task_metadata_id,
                                                        task_metadata_executor,
                                                        task_metadata_context,
                                                        task_metadata_option,
                                                        task_parent_id,
                                                        task_status,
                                                        task_runner,
                                                        task_epoch,
                                                        last_heartbeat,
                                                        result_code,
                                                        error_msg,
                                                        create_at,
                                                        end_at
                                                from mo_task.sys_async_task where task_id>17 AND task_runner='dd1dccb4-4d3c-41f8-b482-5251dc7a41bf' AND task_status=1 order by task_id limit 3 |                                  |                                      |                  |            | internal_sql    |                            |
| dd1dccb4-4d3c-41f8-b482-5251dc7a41bf |      36 | d8aa4060-2a67-11ee-ae59-5ad2460dea4f | sys     | 3bf028e0-aa43-4917-b82f-ed533c0f401e | 127.0.0.1:6001 | mo_task | 2023-07-24 21:20:00.009746 | COM_QUERY | select
                                                cron_task_id,
                                                task_metadata_id,
                                                task_metadata_executor,
                                                task_metadata_context,
                                                task_metadata_option,
                                                cron_expr,
                                                next_time,
                                                trigger_times,
                                                create_at,
                                                update_at
                                                from mo_task.sys_cron_task                                                                                                                                                                        |                                  |                                      |                  |            | internal_sql    |                            |
+--------------------------------------+---------+--------------------------------------+---------+--------------------------------------+----------------+---------+----------------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------+--------------------------------------+------------------+------------+-----------------+----------------------------+
4 rows in set (0.01 sec)
```
