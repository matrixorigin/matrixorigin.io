# Write PostgreSQL data to MatrixOne using Flink

This chapter describes how to write PostgreSQL data to MatrixOne using Flink.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [lntelliJ IDEA (2022.2.1 or later version)](https://www.jetbrains.com/idea/download/).
- Select the [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) version to download and install depending on your system environment.
- Install [PostgreSQL](https://www.postgresql.org/download/).
- Download and install [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz) with a minimum supported version of 1.11.
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar), the recommended version is 8.0.33.

## Operational steps

### Download Flink CDC connector

```bash
wget https://repo1.maven.org/maven2/com/ververica/flink-sql-connector-postgres-cdc/2.1.1/flink-sql-connector-postgres-cdc-2.1.1.jar 
```

### Copy the jar package

Copy the `Flink CDC connector` and the corresponding Jar packages for `flink-connector-jdbc_2.12-1.13.6.jar` and `mysql-connector-j-8.0.33.jar` to `flink-1.13.6/lib/` If flink is already started, restart flink and load the valid jar package.

### Postgresql Turn on cdc configuration

1. postgresql.conf Configuration

    ```conf
    #change the maximum number of wal send processes (default is 10), which is the same value as the solts setting above 
    max_wal_senders = 10 # max number of walsender processes #break replication connections that have been inactive for more than the specified number of milliseconds, you can set it appropriately a little larger (default 60s) 
    wal_sender_timeout = 180s # in milliseconds; 0 disables #change the maximum number of solts (default is 10), flink-cdc defaults to one table 
    max_replication_slots = 10 # max number of replication slots #specify as logical 
    wal_level = logical # minimal, replica, or logical
    ```

2. pg_hba.conf

    ```conf
    #IPv4 local connections: 
    host all all 0.0.0.0/0 password 
    host replication all 0.0.0.0/0 password 
    ```

### Create table in postgresql and insert data

```sql
create table student
(
    stu_id integer not null unique,
    stu_name varchar(50),
    stu_age integer,
    stu_bth date
);

INSERT  into student VALUES (1,"lisa",12,'2022-10-12');
INSERT  into student VALUES (2,"tom",23,'2021-11-10');
INSERT  into student VALUES (3,"jenny",11,'2024-02-19');
INSERT  into student VALUES (4,"henry",12,'2022-04-22');
```

### Building tables in MatrixOne

```sql
create table student
(
    stu_id integer not null unique,
    stu_name varchar(50),
    stu_age integer,
    stu_bth date
);
```

### Start cluster

Switch to the flink directory and execute the following command:

```bash
./bin/start-cluster.sh 
```

### Start Flink SQL CLI

```bash
./bin/sql-client.sh 
```

### Turn on checkpoint

Set up checkpoint every 3 seconds

```sql
SET execution.checkpointing.interval = 3s; 
```

### Create source table with flink ddl

```sql
CREATE TABLE pgsql_bog  (
      stu_id  int not null,
      stu_name    varchar(50),
      stu_age     int,
      stu_bth     date,
     primary key (stu_id) not enforced
) WITH (
      'connector' = 'postgres-cdc',
      'hostname' = 'xx.xx.xx.xx',
      'port' = '5432',
      'username' = 'postgres',
      'password' = '123456',
      'database-name' = 'postgres',
      'schema-name' = 'public',
      'table-name' = 'student',
      'decoding.plugin.name' = 'pgoutput' ,
      'debezium.snapshot.mode' = 'initial'
      ) ;
```

If it's table sql, pgoutput is the standard logical decode output plugin in PostgreSQL 10+. It needs to be set up. Without adding: `'decoding.plugin.name' = 'pgoutput'`, an error is reported: `org.postgresql.util.PSQLException: ERROR: could not access file "decoderbufs": No such file or directory`.

### Create sink table

```sql
CREATE TABLE test_pg (
      stu_id  int not null,
      stu_name    varchar(50),
      stu_age     int,
      stu_bth     date,
      primary key (stu_id) not enforced
) WITH (
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/postgre',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'student'
);
```

### Importing PostgreSQL data into MatrixOne

```sql
insert into test_pg select * from pgsql_bog; 
```

Query the corresponding table data in MatrixOne;

```sql
mysql> select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      1 | lisa     |      12 | 2022-10-12 |
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
+--------+----------+---------+------------+
4 rows in set (0.00 sec)
```

Data can be found to have been imported

### Adding data to postgrsql

```sql
insert into public.student values (51, '58', 39, '2020-01-03'); 
```

Query the corresponding table data in MatrixOne;

```sql
mysql>  select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      1 | lisa     |      12 | 2022-10-12 |
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
|     51 | 58       |      39 | 2020-01-03 |
+--------+----------+---------+------------+
5 rows in set (0.01 sec)
```

You can find that the data has been synchronized to the MatrixOne correspondence table.

To delete data:

```sql
delete from public.student where stu_id=1; 
```

If something goes wrong,

```sql
cannot delete from table "student" because it does not have a replica identity and publishes deletes 
```

then execute

```sql
alter table public.student replica identity full; 
```

Query the corresponding table data in MatrixOne;

```sql
mysql> select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
|     51 | 58       |      39 | 2020-01-03 |
+--------+----------+---------+------------+
4 rows in set (0.00 sec)
```