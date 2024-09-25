# Write Oracle data to MatrixOne using Flink

This chapter describes how to write Oracle data to MatrixOne using Flink.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [lntelliJ IDEA (2022.2.1 or later version)](https://www.jetbrains.com/idea/download/).
- Select the [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) version to download and install depending on your system environment.
- Download and install [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz) with a minimum supported version of 1.11.
- Finished [installing Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html).
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar), the recommended version is 8.0.33.

## Operational steps

### Create a table in Oracle and insert data

```sql
create table flinkcdc_empt
(
    EMPNO    NUMBER not null primary key,
    ENAME    VARCHAR2(10),
    JOB      VARCHAR2(9),
    MGR      NUMBER(4),
    HIREDATE DATE,
    SAL      NUMBER(7, 2),
    COMM     NUMBER(7, 2),
    DEPTNO   NUMBER(2)
)
--Modify the FLINKCDC_EMPT table to support incremental logging
ALTER TABLE scott.FLINKCDC_EMPT ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
--Insert test data:
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(1, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(2, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(3, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(4, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(5, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(6, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(5989, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
```

### Creating a Target Table in MatrixOne

```SQL
create database test;
use test;
CREATE TABLE `oracle_empt` (
    `empno` bigint NOT NULL COMMENT "",
    `ename` varchar(10) NULL COMMENT "",
    `job` varchar(9) NULL COMMENT "",
    `mgr` int NULL COMMENT "",
    `hiredate` datetime NULL COMMENT "",
    `sal` decimal(7, 2) NULL COMMENT "",
    `comm` decimal(7, 2) NULL COMMENT "",
    `deptno` int NULL COMMENT ""
);
```

### Copy the jar package

Copy `flink-sql-connector-oracle-cdc-2.2.1.jar`, `flink-connector-jdbc_2.11-1.13.6.jar`, `mysql-connector-j-8.0.31.jar` to `flink-1.13.6/lib/`.

If flink is already started, you need to restart flink and load the effective jar package.

### Switch to the flink directory and start the cluster

```bash
./bin/start-cluster.sh 
```

### Start Flink SQL CLI

```bash
./bin/sql-client.sh 
```

### Turn on checkpoint

```bash
SET execution.checkpointing.interval = 3s; 
```

### Create source/sink table with flink ddl

```sql
-- Create source table (oracle)
CREATE TABLE `oracle_source` (
    EMPNO bigint NOT NULL,
    ENAME VARCHAR(10),
    JOB VARCHAR(9),
    MGR int,
    HIREDATE timestamp,
    SAL decimal(7,2),
    COMM decimal(7,2),
    DEPTNO int,
    PRIMARY KEY(EMPNO) NOT ENFORCED
) WITH (
     'connector' = 'oracle-cdc',
     'hostname' = 'xx.xx.xx.xx',
     'port' = '1521',
     'username' = 'scott',
     'password' = 'tiger',
     'database-name' = 'ORCLCDB',
     'schema-name' = 'SCOTT',
     'table-name' = 'FLINKCDC_EMPT',
     'debezium.database.tablename.case.insensitive'='false',
     'debezium.log.mining.strategy'='online_catalog'
    );
-- Creating a sink table (mo)
CREATE TABLE IF NOT EXISTS `oracle_sink` (
    EMPNO bigint NOT NULL, 
   ENAME VARCHAR(10), 
   JOB VARCHAR(9), 
   MGR int, 
   HIREDATE timestamp, 
   SAL decimal(7,2), 
   COMM decimal(7,2), 
   DEPTNO int, 
    PRIMARY KEY(EMPNO) NOT ENFORCED
) with (
'connector' = 'jdbc',
 'url' = 'jdbc:mysql://ip:6001/test',
  'driver' = 'com.mysql.cj.jdbc.Driver',
  'username' = 'root',
  'password' = '111',
  'table-name' = 'oracle_empt'
);
-- Read and insert the source table data into the sink table.
insert into `oracle_sink` select * from `oracle_source`;
```

### Query correspondence table data in MatrixOne

```sql
select * from oracle_empt; 
```

 <div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/flink-oracle.jpg?raw=true width=70% heigth=70%/>
</div>