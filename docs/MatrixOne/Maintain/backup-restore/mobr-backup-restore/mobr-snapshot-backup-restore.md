# mo_br tool for snapshot backup recovery

## Snapshot Backup Recovery Implementation Principles

Database snapshot backup restores by creating a read-only static view of the database at a specific point in time, known as a snapshot. Snapshots utilize the storage system's copy-on-write (COW) technology to copy and store the original data page only before it is modified, creating a stateful copy of the database at the time the snapshot was created. When you need to recover data, you can pick the data from the snapshot and copy or restore it to a new or existing database. Snapshot files are initially small and grow as the source database changes, so their size needs to be monitored and managed as necessary. Snapshots must be on the same server instance as the source database, and since they are read-only, writes cannot be made directly on them. Note that snapshot recovery operations overwrite the current data, so caution is required.

## Application scenarios

Database snapshots are a powerful tool to improve database availability and performance in multiple scenarios. Here are some application scenarios for snapshots:

- **Data Backup and Recovery**: Snapshots can be used as a way to backup a database, allowing a read-only copy of the database to be created for data backup and recovery without stopping the database service.

- **Reports and Data Analysis**: Snapshots can be used to avoid impacting online transactions when databases are required to remain static for report generation or data analysis.

- **Development and testing**: Before developing a new feature or testing system, a copy of the database can be created by snapshot so that testing can be done without affecting the production environment.

- **Data migration**: During data migration, snapshots can be used to ensure data consistency and avoid data changes during migration.

- **High-risk operational protection**: Before performing operations that may have an impact on database stability, such as database upgrades, structural changes, etc., snapshots can be created so that they can be quickly restored if the operation fails.

## MatrixOne support for snapshots

MatrixOne supports two ways to perform tenant-level snapshot backup restores:

- sql statement
- mo_br tool

This document focuses on using `mo_br` for tenant-level snapshot backup restores.

!!! note
    mo_br Backup and recovery tool for enterprise services, you need to contact your MatrixOne account manager for the tool download path.

## Prepare before you start

- Completed [standalone deployment of](../../../Get-Started/install-standalone-matrixone.md) MatrixOne

- Completed mo_br tool deployment

## Examples

## Example 1 Table Level Recovery

- Connecting Matrixone System Tenants to Execute Table-Building Statements

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```

- Create a snapshot

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_01" --account "sys" 

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_01        	2024-05-10 02:06:08.01635	account       	sys         	             	          	
```

- Connect the Matrixone system tenant by deleting some of the data in the table.

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|       50 |
+----------+
```

- Table level restored to this tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- Connect Matrixone System Tenant Query Recovery

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```

## Example 2 Database Level Recovery

- Connect Matrixone system tenant to execute sql statement

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);
create table test_snapshot_read_1(a int);
INSERT INTO test_snapshot_read_1 (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      200 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.01 sec)
```

- Create a snapshot

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_02" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_02        	2024-05-10 02:47:15.638519	account       	sys          	             	          	
```

- Connection Matrixone system tenant deletes some data

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;
delete from snapshot_read.test_snapshot_read_1 where a >= 50;

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|       49 |
+----------+
1 row in set (0.01 sec)
```

- Database level restore to this tenant
  
```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- Connect Matrixone System Tenant Query Recovery

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      200 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)
```

## Example 3 Tenant Level Recovery

Tenant Level Recovery

- Connect Matrixone system tenant to execute sql statement

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

- Create a snapshot

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_03" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_03        	2024-05-11 03:20:16.065685	account       	sys           	             	          	          	          	
```

- Connecting Matrixone System Tenant Delete Database

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

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03"
```

- Tenant level restored to new tenant

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```

- Connect Matrixone System Tenant Query Recovery

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

- Connect New Tenant acc2 Query Recovery

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