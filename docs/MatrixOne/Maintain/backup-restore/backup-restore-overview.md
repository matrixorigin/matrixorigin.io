# MatrixOne Backup and Recovery Overview

Database backup and recovery are core operations for any database management system and are crucial for ensuring data security and availability. MatrixOne provides flexible and powerful database backup and recovery capabilities to ensure the integrity and continuity of user data. This article provides an overview of the importance of MatrixOne database backup and recovery, backup strategies, and backup methods.

## Backup and Recovery Strategies

Database backup and recovery can restore operational status in various disaster recovery scenarios.

Here are backup and recovery methods for different situations:

1. **Operating System Crash**:

    - With Physical Backup: Restore the entire database state using physical backup after a crash. Restore the backup to normal hardware conditions and apply redo logs to ensure data consistency.
    - With Logical Backup: Rebuild the database architecture and data on a new server using logical backup. First, install the database software, execute SQL statements from the logical backup to create tables, indexes, and more, and then import the data.

2. **Power (Detection) Failure**:

    - With Physical Backup: Recover the database using physical backup after a failure. Restore the backup to normal hardware conditions and apply redo logs for data consistency.
    - With Logical Backup: Similarly, rebuild the database on a new server using logical backup.

3. **File System Crash**:

    - With Physical Backup: Use a physical backup to recover the database, restore the backup to normal hardware conditions, and apply redo logs for data consistency.
    - With Logical Backup: After a crash, rebuild the database architecture and data on a new server.

4. **Hardware Issues (e.g., Hard Drive, Motherboard)**:

    - With Physical Backup: Recover the database using physical backup, restoring the backup to new hardware conditions and applying redo logs for data consistency.
    - With Logical Backup: Rebuild the database on new hardware using logical backup.

For backup and recovery, consider the following strategies:

1. **Backup Frequency**: Determine the frequency of backups, typically divided into full and incremental backups. Full backups consume more storage space and time but offer faster recovery, while incremental backups are more economical.

2. **Backup Storage**: Choose a secure backup storage location to ensure backup data is not easily compromised or lost. Typically, use offline storage media or cloud storage for backups.

3. **Backup Retention Period**: Determine the retention period for backup data to facilitate historical data retrieval and recovery when needed. Establish data retention policies based on regulations and business requirements.

Regardless of the recovery scenario, follow these principles:

1. Consider stopping database operations to prevent data changes.
2. Choose an appropriate backup for recovery based on backup type.
3. Restore backup files.
4. Consider applying corresponding redo logs to ensure data consistency.
5. Start the database and perform the necessary testing.

## Database Backup Methods

MatrixOne provides multiple backup methods, considering database requirements, performance, resources, and recovery time.

MatrixOne databases offer various backup tools to meet different scenarios and needs:

1. **modump**: Used for exporting data and schemas from the database. It generates recoverable SQL scripts for logical backups.

2. **mo-backup**: Used for physical backup and recovery. `mo-backup` is a tool for physical backup and recovery of MatrixOne enterprise services, helping protect your MatrixOne database and perform reliable recovery operations when needed. 

    !!! note
        **mo-backup** is a physical backup and recovery tool for enterprise-level services. Contact your MatrixOne account manager for the tool download path and user guide.

### Logical Backup and Recovery

#### Using `SELECT INTO OUTFILE` for Backup

Use the `SELECT ... INTO OUTFILE` command to export retrieved data in a specific format to a file. The exported file is created by the MatrixOne service and is only available on the MatrixOne server host. Exporting to the client file system is not supported. Ensure that the export directory does not have files with the same name to avoid overwriting new files.

For more information on operational steps and examples, see [Export data by SELECT INTO](../../Develop/export-data/select-into-outfile.md).

#### Using `modump` for Backup

MatrixOne supports logical backup using the `modump` tool, which generates SQL statements that can be used to recreate database objects and data.

For more information on operational steps and examples, see [Export data by MODUMP](../../Develop/export-data/modump.md).

#### Using Command-Line Batch Import for Recovery

MatrixOne supports inserting many rows into database tables using the `LOAD DATA` command. It also supports importing table structures and data into the entire database using the' SOURCE' command.

For more information, see [Bulk Load Overview](../../Develop/import-data/bulk-load/bulk-load-overview.md).
