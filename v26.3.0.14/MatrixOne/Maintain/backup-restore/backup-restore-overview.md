# MatrixOne Backup and Recovery Overview

Database backup and recovery is one of the core operations of any database management system and an important guarantee for data security and availability. MatrixOne also provides flexible and powerful database backup and recovery functions to ensure the integrity and continuity of user data. This article will introduce the importance, backup strategies, and backup methods of MatrixOne database backup and recovery.

## Backup and recovery strategy

Database backups can be used to restore operational status in various disaster recovery scenarios.

The following are backup and recovery methods for different situations:

1. **Operating system crashes**:

    - If there is a physical backup: After a crash, restore the entire database state through physical backup, restore the backup to a normal hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: Rebuild the database schema and data on the new server through logical backup. First install the database software, execute the SQL statements in the logical backup to create tables, indexes, etc., and then import the data.
  
2. **Power supply (detection) failed**:

    - If there is a physical backup: After failure, the database can be restored through the physical backup, the backup can be restored to the normal hardware environment, and redo logs can be used to ensure data consistency.
    - If there is a logical backup: Again, rebuild the database on the new server via the logical backup.

3. **File system crash**:

    - If there is a physical backup: Use the physical backup to restore the database, restore the backup to a normal hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: After a crash, rebuild the database schema and data on the new server.

4. **Hardware problems (hard disk, motherboard, etc.)**:

    - If there is a physical backup: restore the database through the physical backup, restore the backup to the new hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: Use the logical backup to rebuild the database on the new hardware environment.

The following strategies can be followed for backup and recovery:

1. **Backup Frequency**: Determine the frequency of backup, usually divided into full backup and incremental backup. Full backup will take up more storage space and time, but the recovery speed is faster, while incremental backup is more economical.

2. **Backup Storage**: Choose a safe backup storage location to ensure that the backup data is not easily damaged or lost. Offline storage media or cloud storage are usually used to store backups.

3. **Backup retention period**: Determine the retention period of backup data so that historical data can be retrieved and restored when needed. Develop appropriate data retention policies based on regulations and business needs.

Regardless of the recovery situation, the following principles should be followed:

1. Consider stopping the database to prevent data changes.
2. Select the appropriate backup according to the backup type to restore.
3. Restore the backup files.
4. Consider applying corresponding redo logs to ensure data consistency.
5. Start the database and perform necessary tests.

## Database backup method

MatrixOne provides a variety of backup methods, and you can select the appropriate backup method based on factors such as database requirements, performance, resources, and recovery time.

MatrixOne database provides a variety of backup tools to meet different scenarios and needs:

1. **mo-dump**: used to export data and schema in the database. It generates recoverable SQL scripts for logical backups.

2. **mo-backup**: used for physical backup and recovery. `mo-backup` is the physical backup and recovery tool for MatrixOne enterprise-class services, helping you protect its MatrixOne database and perform reliable recovery operations when needed.

!!! note
       **mo-backup**is a physical backup and recovery tool for enterprise-level services. You need to contact your MatrixOne account manager to obtain the tool download path.

### Logical backup and recovery

#### Backup using `SELECT INTO OUTFILE`

Use the `SELECT ... INTO OUTFILE` command to export the retrieved data into a formatted file created by the MatrixOne service, only on the MatrixOne server host. Exporting to the client file system is not supported. Do not rename files in the export directory to avoid overwriting with new files.

For operation steps and examples, see [`SELECT INTO...OUTFILE`](../../Develop/export-data/select-into-outfile.md)

#### Use `mo-dump` to backup

MatrixOne supports logical backup using the `mo-dump` tool, which generates SQL statements that can be used to recreate database objects and data.

For operation steps and examples, see [`mo-dump tool written`](../../Develop/export-data/modump.md)

#### Use command line to batch import recovery

MatrixOne supports using the `LOAD DATA` command to insert a large number of rows into a database table, and also supports using the `SOURCE` command to import table structures and data into the entire database.

For more information, refer to [Bulk Import](../../Develop/import-data/bulk-load/bulk-load-overview.md)

### Physical backup and recovery

#### Backup and restore using `mo_br`

MatrixOne supports regular physical backups, snapshot backups, and PITR backups using the `mo_br` tool.

For operation steps and examples, see [`mo-br Usage Guide`](../backup-restore/mobr-backup-restore/mobr.md)

#### Backup and restore using SQL

MatrixOne supports snapshots, PITR backup and recovery using SQL.

For methods of using SQL for snapshots, PITR backup and recovery, please refer to the documentation:

- [CREATE SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [DROP SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/drop-snapshot.md)
- [SHOW SNAPSHOTS](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE ... FROM SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/restore-snapshot.md)
- [CREATE PITR](../../Reference/SQL-Reference/Data-Definition-Language/create-pitr.md)
- [DROP PITR](../../Reference/SQL-Reference/Data-Definition-Language/drop-pitr.md)
- [SHOW PITR](../../Reference/SQL-Reference/Data-Definition-Language/create-pitr.md)
- [RESTORE ... FROM PITR](../../Reference/SQL-Reference/Data-Definition-Language/restore-pitr.md)
