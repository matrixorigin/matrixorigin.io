# Backup and Recovery Related Concepts

## Physical, snapshot and logical backups

### Physical backup

Physical backup is the process of copying database files directly to backup media such as tape, hard drives, etc. This method copies all physical blocks of the database to backup media, including data files, control files, and redo log files. Backed-up data is binary data that is actually stored on disk, and recovery operations are usually quick.

### snapshot backup

Database snapshot backup is a form of physical backup, but unlike traditional physical backup, it creates an instant copy of data by capturing a read-only static view of the database at a specific point in time. This backup method utilizes an incremental storage mechanism that records only blocks of data that have changed since the last snapshot, making efficient use of storage space. Snapshot backups support fast recovery because they provide a complete, consistent view of the database for data protection, report generation, analysis, and other scenarios that require data consistency. In addition, they typically rely on the snapshot capabilities of the underlying storage system to provide a secure copy of data access to the database without affecting its proper operation.

### Logical backup

A logical backup is a backup of logical objects (such as tables, indexes, stored procedures, etc.) in a database through SQL statements. This backup method exports definitions and data for logical objects to a backup file, but does not involve binary data for database files. While recovery is slower, backup data is often easier to read and modify.

### The difference

Data physical backup, logical backup, and snapshot backup are three different data protection strategies: physical backup creates a full copy of the database by directly replicating the database's storage files for rapid recovery and large-scale data migration; logical backup exports the logical structure of the database, such as SQL statements, to store data and structure in text to facilitate data migration across platforms and versions; and snapshot backup is a read-only view of the database at a given point in time, using incremental storage technology to record changes for rapid recovery to a specific point in time state, often dependent on storage system support.

## Full, incremental, and differential backups

### Full backup

Full backup backs up the entire data set to the storage device, including all files and folders. Although often time consuming and requiring large storage space, data can be fully restored without additional backup files.

### incremental backup

Incremental backups back up only recently changed or added files or blocks. Back up only changes since the last backup, usually with less backup time and storage. Usually performed between regular full backups to ensure backup data is kept up to date. All incremental and up-to-date full backups are used to restore data.

### Differential backup

Differential backups are backups of data that has changed since the last full backup, so backup data is larger and takes longer than incremental backups. When restoring data, simply restore the most recent full backup and then the most recent differential backup. The backup and recovery process is relatively simple due to shorter recovery times without relying on previously backed up data.

### Differences between full, incremental, and differential backups

- Full backup provides full data backup, but requires more time and storage.
- Incremental backups are suitable for environments with less data change, saving backup storage space and time, but with long recovery times and reliance on front backup data.
- Differential backup is suitable for environments with more data changes, larger backup data, shorter recovery time than incremental backup, and a relatively simple backup recovery process.

## Recovery

### Physical Recovery

Physical recovery is database recovery using physical backups. Typically used for critical failures such as hard disk failures, operating system failures, or file system failures. In physical recovery, use professional recovery tools or software to read the actual data blocks in a backup file or storage medium and try to repair the damaged blocks.

Physical recovery has the advantage of quickly restoring the database by processing blocks directly without SQL statements or other high-level operations. In addition, physical recovery restores all database objects, including tables, indexes, stored procedures, etc.

### Full versus incomplete recovery

- Full Recovery: Apply all redo logs from the backup set and restore the data to a committed state for all logs in the backup.
- Incomplete Recovery: Apply a backup set of partial redo logs or add-ons to restore the database to a point in time that the backup redo logs contain.
