# RESTORE ACCOUNT

## Syntax Description

`RESTORE ACCOUNT` Restores a tenant/database/table to a state corresponding to a timestamp based on a snapshot created under the current tenant.

## Syntax structure

```
> RESTORE ACCOUNT account_name [DATABASE database_name [TABLE table_name]] FROM SNAPSHOT snapshot_name [TO ACCOUNT account_name];
```

## Examples

- Example 1: Restore tenant to this tenant
  
```sql
--Executed under tenant acc1
CREATE database db1;
CREATE database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)

create snapshot acc1_snap1 for account acc1;--Creating a Snapshot
drop database db1;--Delete databases db1,db2
drop database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

restore account acc1 FROM snapshot acc1_snap1;--Restore tenant-level snapshots

mysql> show databases;--Successful recovery
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.01 sec)
```

- Example 2: Restore database to this tenant

```sql
--Executed under tenant acc1
CREATE database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)

create snapshot acc1_db_snap1 for account acc1;--Creating a Snapshot
drop database db1;--Delete database db1

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

restore account acc1 database db1 FROM snapshot acc1_db_snap1;--Recovering database-level snapshots

mysql> show databases;--Successful recovery
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)
```

- Example 3: Restore table to this tenant

```sql
--Executed under tenant acc1
CREATE TABLE t1(n1 int);
INSERT INTO t1 values(1);

mysql> SELECT * FROM t1;
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

create snapshot acc1_tab_snap1 for account acc1;--Creating a Snapshot
truncate TABLE t1;--Clear t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

restore account acc1 database db1 TABLE t1 FROM snapshot acc1_tab_snap1;--Restore Snapshot

mysql> SELECT * FROM t1;--Successful recovery
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

- Example 4: System tenant restores normal tenant to normal tenant This tenant

```sql
--Executed under tenant acc1
create database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--Execute under system tenant sys
create snapshot acc1_snap1 for account acc1;--Creating a snapshot for acc1

--Executed under tenant acc1
drop database db1;--Delete database db1

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--Execute under system tenant sys
restore account acc1 FROM snapshot acc1_snap1 TO account acc1;--Snapshot recovery of acc1 under system tenant

--Executed under tenant acc1
mysql> show databases;--Successful recovery
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

- Example 5: System tenant restores normal tenant to new tenant

```sql
--Executed under tenant acc1
create database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--Execute under system tenant sys
create snapshot acc1_snap1 for account acc1;--Creating a snapshot for acc1

--Executed under tenant acc1
drop database db1;--Delete db1

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--Execute under system tenant sys
create account acc2 ADMIN_NAME admin IDENTIFIED BY '111';--Need to create new tenants to be targeted in advance
restore account acc1 FROM snapshot acc1_snap1 TO account acc2;--Snapshot recovery of acc1 under system tenant to acc2

--Executed under tenant acc1
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.00 sec)

--Executed under tenant acc2
mysql> show databases;--Revert to acc2
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

## Limitations

- Currently only tenant/database/table level recovery is supported, not clustered.

- System tenant recovery normal tenant to new tenant allows only tenant level recovery.

- Only system tenants can perform restore data to a new tenant, and only tenant-level restores are allowed. New tenants need to be created in advance, and in order to avoid object conflicts, it is best to have a new tenant.