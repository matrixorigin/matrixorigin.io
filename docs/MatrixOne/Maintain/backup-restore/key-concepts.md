# Backup and Recovery Concepts

## Physical Backup vs. Logical Backup

### Physical Backup

Physical backup directly copies database files to a backup medium, such as tape or disk. This method involves copying all physical data blocks of the database, including data files, control files, and redo log files. The backed-up data is the binary data stored on disk, making recovery operations typically faster.

### Logical Backup

Logical backup involves backing up logical objects (e.g., tables, indexes, stored procedures) in the database using SQL statements. This backup method exports the definitions and data of logical objects to a backup file but does not include the binary data of database files. Although recovery may be slower, backup data is usually more readable and modifiable.

### Differences Between Physical and Logical Backup

The primary difference between physical and logical backup lies in the form of the backed-up data. Physical backup copies the binary data on disk, while logical backup backs up the definitions and data of analytical objects. The two methods have differences in backup speed, data size, and backup flexibility.

## Full Backup, Incremental Backup, and Differential Backup

### Full Backup

Full backup involves backing up the entire dataset to storage devices, including all files and folders. While it is typically time-consuming and requires substantial storage space, it can restore data without relying on other backup files.

### Incremental Backup

Incremental backup only backs up recently changed or added files or data blocks. It backs up changes made since the last backup, typically consuming less backup time and storage space. Incremental backups are often performed between regular full backups to ensure the backup data stays up-to-date. You need all incremental backups and the latest full backup to restore data.

### Differential Backup

Differential backup backs up data that has changed since the last full backup, resulting in more extensive backup data and longer backup times than incremental backups. When restoring data, you only need to restore the latest full and differential backups. As it does not depend on previous backup data, the recovery process is relatively simpler, and backup and restoration times are shorter.

### Differences Between Full, Incremental, and Differential Backup

- Full backup provides a complete data backup but requires more time and storage space.
- Incremental backup is suitable for environments with minimal data changes, saving backup storage space and time but requiring reliance on previous backup data.
- Differential backup suits environments with significant data changes, resulting in more extensive backup data, shorter recovery times, and a relatively straightforward backup and recovery process.

## Recovery

### Physical Recovery

Physical recovery involves database recovery using physical backups. It is typically used in severe failures such as disk failures, operating system failures, or file system failures. In physical recovery, specialized recovery tools or software read backup files or storage media's actual data blocks and attempt to repair damaged blocks.

Physical recovery can quickly restore the database without executing SQL statements or other high-level operations. Additionally, physical recovery can restore all database objects, including tables, indexes, stored procedures, and more.

### Complete Recovery vs. Incomplete Recovery

- Complete Recovery: Applies all redo logs from the backup set, restoring data to a point where all logs are committed.
- Incomplete Recovery: Applies some redo logs or incremental backups, restoring data to a specific time defined by the backup redo logs.
