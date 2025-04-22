# Concepts related to backup and recovery

## Physical backup, snapshot backup and logical backup

### Physical backup

Physical backup is the process of copying database files directly to backup media (such as tape, hard disk, etc.). This method copies all physical data blocks of the database to the backup media, including data files, control files, redo log files, etc. The backed up data is binary data actually stored on disk, and recovery operations are usually fast.

### Snapshot backup

Database snapshot backup is a form of physical backup, but it is different from traditional physical backup in that it creates an instant copy of the data by capturing a read-only static view of the database at a specific point in time. This backup method uses the incremental storage mechanism to record only the data blocks that have changed since the last snapshot, thus using storage space efficiently. Snapshot backups enable fast recovery because they provide a complete consistent view of the database, making them suitable for data protection, report generation, analytics, and other scenarios that require data consistency. In addition, they usually rely on the snapshot function of the underlying storage system to provide the database with a secure copy of data access without affecting the normal operation of the database.

### Logical backup

Logical backup is to back up logical objects (such as tables, indexes, stored procedures, etc.) in the database through SQL statements. This backup method exports the definition and data of the logical objects to the backup file, but does not involve the binary data of the database file. Although recovery is slower, backup data is usually easier to read and modify.

### the difference

Data physical backup, logical backup and snapshot backup are three different data protection strategies: physical backup creates a complete copy of the database by directly copying the storage files of the database, which is suitable for quick recovery and large-scale data migration; logical backup exports the database Logical structures, such as SQL statements, store data and structures in text form to facilitate data migration across platforms and versions; snapshot backup is a read-only view of the database at a certain moment, using incremental storage technology to record changes, and is suitable for rapid Restoring to a state at a specific point in time usually relies on the support of the storage system.

## Full backup, incremental backup and differential backup

### Full backup

A full backup backs up the entire data set to the storage device, including all files and folders. Although usually time-consuming and requiring large storage space, data can be completely restored without the need for additional backup files.

### Incremental backup

Incremental backup only backs up recently changed or newly added files or data blocks. Only the changes since the last backup are backed up, usually with less backup time and less storage space. Typically performed between regular full backups to ensure backup data remains up to date. All incremental backups and the latest full backup are required to restore data.

### Differential backup

Differential backup backs up data that has changed since the last full backup, so the backup data volume is larger than incremental backup, and the backup time is longer. When restoring data, just restore the most recent full backup first and then the most recent differential backup. Since it does not rely on previous backup data, the recovery time is short and the backup and recovery process is relatively simple.

### The difference between full backup, incremental backup and differential backup

- Full backup provides complete data backup, but requires more time and storage space.
- Incremental backup is suitable for environments with less data changes, saving backup storage space and time, but recovery time is long and requires previous backup data.
- Differential backup is suitable for environments with a lot of data changes. The backup data is larger, the recovery time is shorter than incremental backup, and the backup and recovery process is relatively simple.

## recover

### Physical recovery

Physical recovery is the use of physical backup for database recovery. Typically used for serious failures such as hard drive failure, operating system failure, or file system failure. In physical recovery, professional recovery tools or software are used to read the actual data blocks in the backup file or storage media and try to repair the damaged blocks.
The advantage of physical recovery is to quickly restore the database because there is no need to execute SQL statements or other high-level operations and directly process data blocks. In addition, physical recovery can restore all database objects, including tables, indexes, stored procedures, etc.

### Complete recovery and incomplete recovery

- Full recovery: Apply all redo logs in the backup set and restore the data to the state where all logs in the backup have been committed.
- Incomplete recovery: Apply partial redo logs or additional backups of the backup set to restore the database to a certain point in time included in the backup redo logs.