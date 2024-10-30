# mo_br tool for snapshot backup and recovery

## Snapshot backup and recovery implementation principle

Database snapshot backup and recovery create a read-only static view of the database at a specific point in time. This view is called a snapshot. Snapshots use the storage system's copy-on-write (COW) technology to copy and store the original data page only before it is modified, thereby generating a copy of the state of the database at the time the snapshot was created. When data needs to be restored, the data in the snapshot can be selected and copied or restored to a new or existing database. Snapshot files start small and gradually grow as changes are made to the source database, so their size needs to be monitored and managed if necessary. Snapshots must be on the same server instance as the source database, and since they are read-only, write operations cannot be performed directly on them. It should be noted that the snapshot recovery operation will overwrite the current data, so you need to operate with caution.

## Application scenarios

Database snapshots are a powerful tool that can improve database availability and performance in a variety of scenarios. The following are some application scenarios of snapshots:

- **Data Backup and Recovery**: Snapshot can be used as a method of database backup, which allows the creation of a read-only copy of the database without stopping the database service for data backup and recovery.

- **Reporting and Data Analysis**: When the database needs to remain static for report generation or data analysis, snapshots can be used to avoid affecting online transaction processing.
- **Development and Testing**: Before developing new features or testing the system, a copy of the database can be created through a snapshot so that testing can be performed without affecting the production environment.

- **Data Migration**: During the data migration process, snapshots can be used to ensure data consistency and avoid data changes during the migration process.

- **High-risk operation protection**: Before performing operations that may affect database stability (such as database upgrades, structural changes, etc.), you can create a snapshot so that you can quickly recover if the operation fails.

## MatrixOne support for snapshots

MatrixOne supports the following two methods for snapshot backup and recovery:

- sql statement
- mo_br tool

This document mainly introduces how to use `mo_br` to perform cluster/tenant level snapshot backup and recovery.

!!! note
    mo_br enterprise-level service backup and recovery tool, you need to contact your MatrixOne account manager to obtain the tool download path.

## Preparation before starting

- Completed [Standalone Deployment MatrixOne](../../../Get-Started/install-standalone-matrixone.md)

- Completed mo_br tool deployment

## Example

## Example 1 Table level recovery

- Connect to the Matrixone system tenant to execute table creation statements

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11) , (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), ( 24), (25), (26), (27), (28), (29), (30), (31), (32), (33), (34), (35), (36) , (37), (38), (39), (40), (41), (42), (43), (44), (45), (46), (47), (48), ( 49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61) , (62), (63), (64), (65), (66), (67), (68), (69), (70), (71), (72), (73), ( 74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86) , (87), (88), (89), (90), (91), (92), (93), (94), (95), (96), (97), (98), ( 99), (100);
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 100 |
+----------+
```

- Create snapshot

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_01" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME TIMESTAMP SNAPSHOT LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME
sp_01 2024-05-10 02:06:08.01635 account sys
```

- Connect to the Matrixone system tenant and delete some data in the table.

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 50       |
+----------+
```

- Table level restored to this tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- Connect to the Matrixone system tenant to query the recovery status

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 100      |
+----------+
```

## Example 2 Database level recovery

- Connect to the Matrixone system tenant to execute sql statements

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11) , (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), ( 24), (25), (26), (27), (28), (29), (30), (31), (32), (33), (34), (35), (36) , (37), (38), (39), (40), (41), (42), (43), (44), (45), (46), (47), (48), ( 49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61) , (62), (63), (64), (65), (66), (67), (68), (69), (70), (71), (72), (73), ( 74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86) , (87), (88), (89), (90), (91), (92), (93), (94), (95), (96), (97), (98), ( 99), (100);
create table test_snapshot_read_1(A int);
INSERT INTO test_snapshot_read_1 (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11) , (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), ( 24), (25), (26), (27), (28), (29), (30), (31), (32), (33), (34), (35), (36) , (37), (38), (39), (40), (41), (42), (43), (44), (45), (46), (47), (48), ( 49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61) , (62), (63), (64), (65), (66), (67), (68), (69), (70), (71), (72), (73), ( 74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86) , (87), (88), (89), (90), (91), (92), (93), (94), (95), (96), (97), (98), ( 99), (100);
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 200      |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
| 100 |
+----------+
1 row in set (0.01 sec)
```

- Create snapshot

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_02" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME TIMESTAMP SNAPSHOT LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME
sp_02 2024-05-10 02:47:15.638519 account sys
```

- Connect to Matrixone system tenant to delete some data

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;
delete from snapshot_read.test_snapshot_read_1 where a >= 50;
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 100      |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
| 49       |
+----------+
1 row in set (0.01 sec)
```

- Database level recovery to this tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- Connect to the Matrixone system tenant to query the recovery status

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
| 200      |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
| 100      |
+----------+
1 row in set (0.00 sec)
```

## Example 3 Tenant level recovery

Tenant level recovery

- Connect to the Matrixone system tenant to execute sql statements

```sql
create database if not exists snapshot_read;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
8 rows in set (0.00 sec)
```

- Connect the Matrixone system tenant to delete the database

```sql
drop database snapshot_read;

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
```

- Tenant level restored to this tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03"
```

- Tenant level reversion to new tenant

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```

- Connect to the Matrixone system tenant to query the recovery status

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
8 rows in set (0.00 sec)
```

- Connect to the new tenant acc2 to query the recovery status

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.00 sec)
```

## Example 4 Cluster level recovery

```sql
--Executed under tenant acc1, acc2
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
```

- Create snapshot

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "cluster" --sname "cluster_sp1"

>./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --cluster "sys"
SNAPSHOT NAME TIMESTAMP SNAPSHOT LEVEL ACCOUNT NAME DATABASE NAME TABLE NAME
cluster_sp1 2024-10-14 03:52:55.657359 cluster
```

- Connect the Matrixone system tenant to delete the database

```sql
--Executed under tenant acc1, acc2
drop database db1;

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
```

- recover
  
```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --sname "cluster_sp1"
```

- Connect to tenants acc1 and acc2 to query the recovery status

```sql
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
```