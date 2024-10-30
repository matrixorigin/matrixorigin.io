# mo-dump backup and recovery

For enterprises, a large amount of data is generated every day, so database backup is very important. In the event of a system crash, hardware failure, or user misoperation, you can restore data and restart the system without causing data loss.

In addition, data backup also serves as a safeguard before upgrading the MatrixOne installation, and data backup can also be used to transfer the MatrixOne installation to another system.

MatrixOne supports logical backup via the `mo-dump` utility. `modump` is a command line utility for generating logical backups of MatrixOne databases. It generates SQL statements that can be used to recreate database objects and data. You can find its syntax description and usage guidelines in the [mo-dump](../../Develop/export-data/modump.md) chapter.

We will use a simple example to describe how to use the `mo-dump` utility to complete the data backup and restore process.

## Steps

### 1. Deploy mo-dump

See the [mo-dump tool writing](../../Develop/export-data/modump.md) chapter to complete the deployment of the `mo-dump` tool.

### 2. Generate a backup of a single database

The example is as follows, database *t*and its table *t1*created using the following SQL:

```sql
DROP DATABASE IF EXISTS `t`;
CREATE DATABASE `t`;
USE `t`;
create table t1
(
    c1 int primary key auto_increment,
    c2 tinyint not null default 4,
    c3 smallint,
    c4 bigint,
    c5 tinyint unsigned,
    c6 smallint unsigned,
    c7 int unsigned,
    c8 bigint unsigned,
    c9 float,
    c10 double,
    c11 date,
    c12 datetime,
    c13 timestamp on update current_timestamp,
    c14 char,
    c15 varchar,
    c16 json,
    c17 decimal,
    c18 text,
    c19 blob,
    c20 uuid
);
insert into t1 values ​​(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '2019-01-01', '2019-01-01 00:00:00', '2019-01 -01 00:00:00', 'a', 'a', '{"a":1}','1212.1212', 'a', 'aza', '00000000-0000-0000-0000-000000000000' );
```

If you want to generate a backup of a single database, you can run the following command. This command will generate a backup of the database named *t*that contains the structure and data in the *t.sql*file.

```bash
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db t > t.sql
```

If you want to generate a backup of a single table in your database, you can run the following command. This command will generate a backup of the *t1*table for the database named *t*, containing the structure and data in the *t.sql*file.

```bash
./mo-dump -u root -p 111 -db t -tbl t1 > t1.sql
```

!!! note
    If you want to generate backups of multiple databases/tables, you need to separate the database names/table names with `,`.

### 3. Restore backup to MatrixOne server

Restoring exported *sql*files to a MatrixOne database is relatively simple. To restore your database, you must first create an empty database and restore it using the *MySQL client*.

Connect MatrixOne to the same server as the MySQL client, and make sure the exported *sql*file is also on the same server.

```sql
mysql> create database t if not exists;
mysql> source /YOUR_SQL_FILE_PATH/t.sql
```

After successfully executing the above command, execute the following command to check whether all objects are created on the database named *t*.

```sql
mysql> use t;
mysql> show tables;
mysql> select count(*) from t1;
```