# Audit

## Overview

The audit function records user behaviors and major internal events in the database. After logging in to the database, it registers all users' database operations and major internal events. It is also one of the essential features of many enterprise databases.

In daily database operation and maintenance, an audit is a very effective means to ensure that all behaviors of database users comply with the law. When important events occur in the database, such as start and stop, node breakdown, and so on., the audit content can be very convenient for tracing the behavior of the protective device library before and after the period.

It is necessary to enable database audit when you need to effectively and completely monitor necessary service information tables or system configuration tables. For example, it monitors all user A's behaviors in the database to discover the source of data modification or deletion promptly. For the monitoring of major internal events in the database, the fault can be rectified immediately, and the root cause of the accident can be traced back.

MatrixOne supports auditing user behavior, operation logs, and SQL statements. The audit data of MatrixOne is stored in the database table, and the audit data can be queried directly through SQL interaction.

## Enable Audit

To enable the audit, execute the following SQL statements:

```sql
drop database if exists mo_audits;
create database mo_audits;
use mo_audits;
create view mo_user_action as select request_at,user,host,statement,status from system.statement_info where user in (select distinct user_name from mo_catalog.mo_user) and statement not like '______internal_%' order by request_at desc;
create view mo_events as select timestamp,level,message from system.log_info where level in ('error','panic','fatal') order by timestamp desc;
```

## Audit Query

To audit user behaviors, execute the following SQL statement:

```sql
mysql> select * from mo_audits.mo_user_action;
```

The example query result as below:

```
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
| request_at                 | user | host    | statement                                                                                                                                                                                                                                      | status  |
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
| 2023-02-10 19:54:28.831970 | root | 0.0.0.0 | create view mo_user_action as select request_at, user, host, statement, status from system.statement_info where user in (select distinct user_name from mo_catalog.mo_user) and statement not like "______internal_%" order by request_at desc | Success |
| 2023-02-10 19:54:14.079939 | root | 0.0.0.0 | show tables                                                                                                                                                                                                                                    | Success |
| 2023-02-10 19:54:14.076260 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:54:14.071728 | root | 0.0.0.0 | use mo_audits                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:54:14.071108 | root | 0.0.0.0 | select database()                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:54:01.007241 | root | 0.0.0.0 | create database mo_audits                                                                                                                                                                                                                      | Success |
| 2023-02-10 19:53:48.924819 | root | 0.0.0.0 | drop database if exists mo_audits                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:59.668646 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:30:53.438212 | root | 0.0.0.0 | show locks                                                                                                                                                                                                                                     | Success |
| 2023-02-10 19:30:44.258894 | root | 0.0.0.0 | show index from t                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:43.662063 | root | 0.0.0.0 | create table t (a int, b int, c int, primary key (a))                                                                                                                                                                                          | Success |
| 2023-02-10 19:30:23.104830 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:30:20.062010 | root | 0.0.0.0 | show tables                                                                                                                                                                                                                                    | Success |
| 2023-02-10 19:30:20.060324 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:30:20.055515 | root | 0.0.0.0 | use aab                                                                                                                                                                                                                                        | Success |
| 2023-02-10 19:30:20.055186 | root | 0.0.0.0 | select database()                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:17.152087 | root | 0.0.0.0 | create database aab                                                                                                                                                                                                                            | Success |
| 2023-02-10 19:30:10.621294 | root | 0.0.0.0 | create aab                                                                                                                                                                                                                                     | Failed  |
| 2023-02-10 19:29:59.983433 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:29:45.370956 | root | 0.0.0.0 | show index from t                                                                                                                                                                                                                              | Failed  |
| 2023-02-10 19:29:44.875580 | root | 0.0.0.0 | create table t (a int, b int, c int, primary key (a))                                                                                                                                                                                          | Failed  |
| 2023-02-10 19:29:44.859588 | root | 0.0.0.0 | drop table if exists t                                                                                                                                                                                                                         | Success |
| 2023-02-10 19:29:19.974775 | root | 0.0.0.0 | show index                                                                                                                                                                                                                                     | Failed  |
| 2023-02-10 19:29:11.188286 | root | 0.0.0.0 | show locks                                                                                                                                                                                                                                     | Success |
| 2023-02-10 19:29:06.618778 | root | 0.0.0.0 | show node list                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:19:11.319058 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Failed  |
| 2023-02-10 19:19:06.809302 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:18:52.840282 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Failed  |
| 2023-02-10 10:54:09.892254 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 10:54:04.468721 | root | 0.0.0.0 | select @@version_comment limit 1                                                                                                                                                                                                               | Success |
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
30 rows in set (0.81 sec)
```

Query database internal status change query, execute the following SQL statement to view:

```sql
mysql> select * from mo_events;
```

The example query result as below:

```
|
| 2022-10-18 15:26:20.293735 | error | error: timeout, converted to code 20429                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2022-10-18 15:26:20.293725 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:20.288695 | error | failed to set initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2022-10-18 15:26:20.288559 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:20.285384 | error | failed to set initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2022-10-18 15:26:20.285235 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:18.473472 | error | failed to join the gossip group, 1 error occurred:
	* Failed to join 127.0.0.1:32022: dial tcp 127.0.0.1:32022: connect: connection refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2022-10-18 15:26:18.469029 | error | failed to join the gossip group, 1 error occurred:
	* Failed to join 127.0.0.1:32012: dial tcp 127.0.0.1:32012: connect: connection refused       
```

## Disable Audit

To disable the audit, execute the following SQL statement:

```sql
> drop database if exists mo_audits;
```
