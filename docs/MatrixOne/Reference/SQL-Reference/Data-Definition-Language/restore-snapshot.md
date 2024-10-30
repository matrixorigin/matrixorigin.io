# RESTORE ... FROM SNAPSHOT

## Syntax description

`RESTORE ... FROM SNAPSHOT` is used to restore data at the cluster/tenant/database/table level from a previously created cluster/tenant level snapshot.

## Grammar structure

```
> RESTORE [CLUSTER]|[[ACCOUNT <account_name>] [DATABASE database_name [TABLE table_name]]]FROM SNAPSHOT <snapshot_name> [TO ACCOUNT <account_name>];
```

## Example

### Example 1: Restoring the cluster
  
```sql
--Executed under tenants acc1, acc2
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
create snapshot cluster_sp1 for cluster;--Create a snapshot of the cluster

--Executed under tenants acc1, acc2
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
restore cluster FROM snapshot cluster_sp1;--Perform snapshot recovery on the cluster under the system tenant

--Executed under tenants acc1, acc2
mysql> show databases;--Recovery successful
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

### Example 2: Restoring a tenant

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

create snapshot acc1_snap1 for account acc1;--Create snapshot
drop database db1;--Delete database db1,db2
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

restore account acc1 FROM snapshot acc1_snap1;--Restoring a tenant-level snapshot

mysql> show databases;--Recovery successful
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

### Example 3: Restoring the database

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

create snapshot acc1_db_snap1 for account acc1;--Create snapshot
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

restore account acc1 database db1 FROM snapshot acc1_db_snap1;--Restoring a database-level snapshot

mysql> show databases;--Recovery successful
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

### Example 4: Restoring a table

```sql
--在租户 acc1 下执行
CREATE TABLE t1(n1 int);
INSERT INTO t1 values(1);

mysql> SELECT * FROM t1;
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

create snapshot acc1_tab_snap1 for account acc1;--Create snapshot
truncate TABLE t1;--Clear t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

restore account acc1 database db1 TABLE t1 FROM snapshot acc1_tab_snap1;--Restore snapshot

mysql> SELECT * FROM t1;--Recovery successful
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

### Example 5: System tenant restores ordinary tenant to ordinary tenant

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
create snapshot acc1_snap1 for account acc1;--Create a snapshot for acc1

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
restore account acc1 FROM snapshot acc1_snap1 TO account acc1;--在系统租户下对 acc1 进行快照恢复

--Executed under tenant acc1
mysql> show databases;--Recovery successful
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

### Example 6: System tenant restores normal tenant to new tenant

```sql
--Execute under tenant acc1
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
create snapshot acc1_snap1 for account acc1;--Create a snapshot for acc1

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
create account acc2 ADMIN_NAME admin IDENTIFIED BY '111';--New tenants to be targeted need to be created in advance
restore account acc1 FROM snapshot acc1_snap1 TO account acc2;--Perform snapshot recovery on acc1 under the system tenant and restore it to acc2

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

## limit

- Only tenant-level snapshots can be restored at the database/table level.

- System tenant restoration from a normal tenant to a new tenant only allows tenant level restoration.

- Only the system tenant can perform restore data to the new tenant, and only tenant-level restores are allowed. New tenants need to be created in advance. In order to avoid object conflicts, it is best to create new tenants.