# MatrixOne Backup and Recovery Overview

Database backup and recovery is one of the core operations of any database management system and an important guarantee of data security and availability. MatrixOne also provides flexible and robust database backup and recovery capabilities to ensure the integrity and continuity of user data. This article describes the importance of MatrixOne database backup and recovery, backup strategies, and backup methods.

## Backup and recovery strategies

Under different disaster recovery scenarios, a database backup can be used to restore health.

Here are backup recovery methods for different scenarios:

1. **Operating system crash**:

    - If there is a physical backup: After a crash, restore the entire database state through a physical backup, restore the backup to a normal hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: Rebuild the database schema and data on the new server through a logical backup. Install the database software and execute the SQL statements in the logical backup to create tables, indexes, etc. before importing the data.

2. **Power supply (detection) failed**:

    - If there is a physical backup: After failure, the database can be restored through a physical backup, restoring the backup to a normal hardware environment, and applying redo logs to ensure data consistency.
    - If there is a logical backup: Again, rebuild the database on the new server through a logical backup.

3. **File system crash**:

    - If there is a physical backup: Restore the database using a physical backup, restore the backup to a normal hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: After a crash, rebuild the database schema and data on the new server.

4. **Hardware issues (hard drives, motherboards, etc.):**

    - If there is a physical backup: restore the database through a physical backup, restore the backup to a new hardware environment, and apply redo logs to ensure data consistency.
    - If there is a logical backup: Use the logical backup to rebuild the database in the new hardware environment.

The following strategies can be followed for backup recovery:

1. **Frequency of backups**: Determine the frequency of backups, usually divided into full and incremental backups. Full backups take up more storage and time, but restore faster, while incremental backups are more economical.

2. **Backup storage**: Choose a secure backup storage location to ensure backup data is not vulnerable to corruption or loss. Offline storage media or cloud storage is often used to house backups.

3. **Backup Retention Period**: Determine the retention period for backup data for retrieval and recovery of historical data when needed. Develop appropriate data retention policies based on regulations and business needs.

Whatever the recovery scenario, the following principles should be followed:

1. Consider stopping database operation to prevent data changes.
2. Select the appropriate backup for recovery based on the backup type.
3. Restore the backup file.
4. Consider applying the appropriate redo logs to ensure data consistency.
5. Start the database and perform the necessary tests.

## Database backup method

MatrixOne offers a variety of backup methods that take into account factors such as database requirements, performance, resources, and recovery time.

The MatrixOne database provides multiple backup tools to meet different scenarios and needs:

1. **mo-dump**: Used to export data and patterns from a database. It generates recoverable SQL scripts for logical backups.

2. **mo-backup**: for physical backup and recovery. `mo-backup` is a physical backup and recovery tool for MatrixOne enterprise-class services that helps you protect your MatrixOne databases and perform reliable recovery operations when needed.

   !!! note
        **mo-backup** Physical backup and recovery tool for enterprise level services, you need to contact your MatrixOne account manager for the tool download path.

### Logical Backup and Recovery

#### Backup with `SELECT INTO OUTFILE`

Use the `SELECT ... INTO OUTFILE` command to export the retrieved data to a file in format, created by the MatrixOne service and only on the MatrixOne server host. Export to client file system is not supported, export directory do not rename files to avoid overwriting new files.

For operational steps and examples, see [`SELECT INTO...OUTFILE`](../../Develop/export-data/select-into-outfile.md)

#### Backup with `mo-dump`

MatrixOne supports logical backups using the `mo-dump` tool to generate SQL statements that can be used to recreate database objects and data.

For operational steps and examples, see the [`mo-dump tool Write`](../../Develop/export-data/modump.md) Out

#### Bulk Import Recovery Using the Command Line

MatrixOne supports inserting large numbers of rows into database tables using the `LOAD DATA` command. It also supports importing table structures and data into the entire database using the `SOURCE` command.

For more information, see [Batch Import](../../Develop/import-data/bulk-load/bulk-load-overview.md)

### Physical Backup and Recovery

#### Backup and restore with `mo_br`

MatrixOne supports regular physical and snapshot backups using the `mo_br` tool.

See the [`mo-br User Guide`](../backup-restore/mobr-backup-restore/mobr.md) for steps and examples

#### Using SQL Backup and Recovery

MatrixOne supports snapshot backup and recovery using SQL.

Refer to the documentation for methods of snapshot backup and recovery using SQL:

- [CREATE SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [DROP SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/drop-snapshot.md)
- [SHOW SNAPSHOTS](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE ACCOUNT](../../Reference/SQL-Reference/Data-Definition-Language/restore-account.md)
