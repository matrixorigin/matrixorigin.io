# Backup and Restore by using mo-dump

It is essential to back up your databases to recover your data and be up and running again in case problems occur, such as system crashes, hardware failures, or users deleting data by mistake. Backups are also essential as a safeguard before upgrading a MatrixOne installation, and they can be used to transfer a MatrixOne building to another system.

MatrixOne currently only supports logical backup through the `modump` utility. `modump` is a command-line utility used to generate the logical backup of the MatrixOne database. It produces SQL Statements that can be used to recreate the database objects and data. You can look up the syntax and usage guide in the [modump](../../Develop/export-data/modump.md) chapter.

We will take a simple example to walk you through the backup and restore process with the `modump` utility.

## Steps

### 1. [Build the modump binary](../../Develop/export-data/modump.md)

For more information on how to build the `modump` binary, see [Build the modump binary](../../Develop/export-data/modump.md).

If the `modump` binary has been built, you can continue to browse the next chapter **Generate the backup of a single database**.

### 2. Generate the backup of a single database

We have a database **t** which is created by the following SQL.

```
DROP DATABASE IF EXISTS `t`;
CREATE DATABASE `t`;
USE `t`;
create table t1
(
    c1  int primary key auto_increment,
    c2  tinyint not null default 4,
    c3  smallint,
    c4  bigint,
    c5  tinyint unsigned,
    c6  smallint unsigned,
    c7  int unsigned,
    c8  bigint unsigned,
    c9  float,
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
insert into t1 values (1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '2019-01-01', '2019-01-01 00:00:00', '2019-01-01 00:00:00', 'a', 'a', '{"a":1}','1212.1212', 'a', 'aza', '00000000-0000-0000-0000-000000000000');
```

If you want to generate the backup of the single database, run the following command. The command will generate the backup of the **t** database with structure and data in the `t.sql` file.

```
./modump -u root -p 111 -h 127.0.0.1 -P 6001 -db t > t.sql
```

If you want to generate the backup of a single table in a database, run the following command. The command will generate the backup of the `t1` table of  `t` database with structure and data in the `t.sql` file.

```
./modump -u root -p 111 -db t -tbl t1 > t1.sql
```

!!! note
    If you have multiple databases, you need to run `modump` multiple times to generate SQLs one by one.

### 3. Restore the backup to MatrixOne server

Restoring a MatrixOne database using the exported 'sql' file is very simple. To restore the database, you must create an empty database and use `mysql client` to restore.

Connect to MatrixOne with MySQL client in the same server, and make sure the exported `sql` file is also in the same machine as the MySQL client.

```
mysql> create database t if not exists;
mysql> source /YOUR_SQL_FILE_PATH/t.sql
```

Once command executes successfully, execute the following command to verify that all objects have been created on the `t` database.

```
mysql> use t;
mysql> show tables;
mysql> select count(*) from t1;
```
