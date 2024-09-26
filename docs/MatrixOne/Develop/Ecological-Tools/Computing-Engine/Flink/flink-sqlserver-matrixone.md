# Write SQL Server data to MatrixOne using Flink

This chapter describes how to write SQL Server data to MatrixOne using Flink.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [lntelliJ IDEA (2022.2.1 or later version)](https://www.jetbrains.com/idea/download/).
- Select the [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) version to download and install depending on your system environment.
- Download and install [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz) with a minimum supported version of 1.11.
- Completed [SQL Server 2022](https://www.microsoft.com/en-us/sql-server/sql-server-downloads).
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar), the recommended version is 8.0.33.

## Operational steps

### Create libraries, tables, and insert data in SQL Server

```sql
create database sstomo;
use sstomo;
create table sqlserver_data (
    id INT PRIMARY KEY,
    name NVARCHAR(100),
    age INT,
    entrytime DATE,
    gender NVARCHAR(2)
);

insert into sqlserver_data (id, name, age, entrytime, gender)
values  (1, 'Lisa', 25, '2010-10-12', '0'),
        (2, 'Liming', 26, '2013-10-12', '0'),
        (3, 'asdfa', 27, '2022-10-12', '0'),
        (4, 'aerg', 28, '2005-10-12', '0'),
        (5, 'asga', 29, '2015-10-12', '1'),
        (6, 'sgeq', 30, '2010-10-12', '1');
```

### SQL Server Configuration CDC

1. Verify that the current user has sysadmin privileges turned on Queries for the current user permissions. The CDC (Change Data Capture) feature must be enabled for the database to be a member of the sysadmin fixed server role. query the sa user for sysadmin by the following command

    ```sql exec sp_helpsrvrolemember 'sysadmin';```

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-01.jpg?raw=true width=70% heigth=70%/>
    </div>

2. Queries if the current database has CDC (Change Data Capture Capability) enabled

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/%EF%BF%BCflink-sqlserver-02.jpg?raw=true width=60% heigth=60%/>
    </div>

    Remarks: 0: means not enabled; 1: means enabled

    If not, execute the following sql open:

    ```sql
    use sstomo; exec sys.sp_cdc_enable_db; 
    ```

3. Query whether the table has CDC (Change Data Capture) enabled

    ```sql
    select name,is_tracked_by_cdc from sys.tables where name = 'sqlserver_data'; 
    ```

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-03.jpg?raw=true width=50% heigth=50%/>
    </div>

    Remarks: 0: means not enabled; 1: means enabled If not, execute the following sql to turn it on:

    ```sql
    use sstomo;
    exec sys.sp_cdc_enable_table 
    @source_schema = 'dbo', 
    @source_name = 'sqlserver_data', 
    @role_name = NULL, 
    @supports_net_changes = 0;
    ```

4. Table sqlserver_data Start CDC (Change Data Capture) Feature Configuration Completed

    Looking at the system tables under the database, you will see more cdc-related data tables, where cdc.dbo_sqlserver_flink_CT is the record of all DML operations that record the source tables, each corresponding to an instance table.

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-04.jpg?raw=true width=50% heigth=50%/>
    </div>

5. Verify that the CDC agent starts properly

    Execute the following command to see if the CDC agent is on:

    ```sql
    exec master.dbo.xp_servicecontrol N'QUERYSTATE', N'SQLSERVERAGENT'; 
    ```

    If the status is `Stopped`, you need to turn on the CDC agent.

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-05.jpg?raw=true width=50% heigth=50%/>
    </div>

    Open the CDC agent in a Windows environment: On the machine where the SqlServer database is installed, open Microsoft Sql Server Managememt Studio, right-click the following image location (SQL Server agent), and click Open, as shown below:

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-06.jpg?raw=true width=50% heigth=50%/>
    </div>

    Once on, query the agent status again to confirm that the status has changed to running

    <div align="center">
        <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-07.jpg?raw=true width=50% heigth=50%/>
    </div>

    At this point, the table sqlserver_data starts the CDC (Change Data Capture) function all complete.

### Creating target libraries and tables in MatrixOne

```sql
create database sstomo;
use sstomo;
CREATE TABLE sqlserver_data (
     id int NOT NULL,
     name varchar(100) DEFAULT NULL,
     age int DEFAULT NULL,
     entrytime date DEFAULT NULL,
     gender char(1) DEFAULT NULL,
     PRIMARY KEY (id)
);
```

### Start flink

1. Copy the cdc jar package

    Copy `link-sql-connector-sqlserver-cdc-2.3.0.jar`, `flink-connector-jdbc_2.12-1.13.6.jar`, `mysql-connector-j-8.0.33.jar` to the lib directory of flink.

2. Start flink

    Switch to the flink directory and start the cluster

    ```bash
    ./bin/start-cluster.sh 
    ```

    Start Flink SQL CLIENT

    ```bash
    ./bin/sql-client.sh 
    ```

3. Turn on checkpoint

    ```bash
    SET execution.checkpointing.interval = 3s; 
    ```

### Create source/sink table with flink ddl

```sql
-- Create source table
CREATE TABLE sqlserver_source (
id INT,
name varchar(50),
age INT,
entrytime date,
gender varchar(100),
PRIMARY KEY (`id`) not enforced
) WITH( 
'connector' = 'sqlserver-cdc',
'hostname' = 'xx.xx.xx.xx',
'port' = '1433',
'username' = 'sa',
'password' = '123456',
'database-name' = 'sstomo',
'schema-name' = 'dbo',
'table-name' = 'sqlserver_data');

-- Creating a sink table
CREATE TABLE sqlserver_sink (
id INT,
name varchar(100),
age INT,
entrytime date,
gender varchar(10),
PRIMARY KEY (`id`) not enforced
) WITH( 
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/sstomo',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'sqlserver_data'
);

-- Read and insert the source table data into the sink table.
Insert into sqlserver_sink select * from sqlserver_source;
```

### Query correspondence table data in MatrixOne

```sql
use sstomo; 
select * from sqlserver_data; 
```

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-08.jpg?raw=true width=50% heigth=50%/>
</div>

### Inserting data to SQL Server

Insert 3 pieces of data into the SqlServer table sqlserver_data:

```sql
insert into sstomo.dbo.sqlserver_data (id, name, age, entrytime, gender)
values (7, 'Liss12a', 25, '2010-10-12', '0'),
      (8, '12233s', 26, '2013-10-12', '0'),
      (9, 'sgeq1', 304, '2010-10-12', '1');
```

Query corresponding table data in MatrixOne:

```sql
select * from sstomo.sqlserver_data; 
```

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-09.jpg?raw=true width=50% heigth=50%/>
</div>

### Deleting incremental data in SQL Server

Delete two rows with ids 3 and 4 in SQL Server:

```sql
delete from sstomo.dbo.sqlserver_data where id in(3,4); 
```

Query table data in mo, these two rows have been deleted synchronously:

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-10.jpg?raw=true width=50% heigth=50%/>
</div>

### Adding new data to SQL Server

Update two rows of data in a SqlServer table:

```sql
update sstomo.dbo.sqlserver_data set age = 18 where id in(1,2); 
```

Query table data in MatrixOne, the two rows have been updated in sync:

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-sqlserver-11.jpg?raw=true width=50% heigth=50%/>
</div>