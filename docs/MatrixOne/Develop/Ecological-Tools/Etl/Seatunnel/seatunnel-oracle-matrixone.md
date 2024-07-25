# Write data to MatrixOne using SeaTunnel

This document describes how to write Oracle data to MatrixOne using SeaTunnel.

## Prepare before you start

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.

- Finished [installing Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html).

- Finished [installing SeaTunnel Version 2.3.3](https://www.apache.org/dyn/closer.lua/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz). Once installed, the installation path for SeaTunnel can be defined from the shell command line:

```shell
export SEATNUNNEL_HOME="/root/seatunnel" 
```

- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

- Download ojdbc8-23.3.0.23.09.jar and copy the file to the ${SEATNUNNEL\_HOME}/plugins/jdbc/lib/ directory.

## Operational steps

### Create test data with scott user in Oracle

This time you are using the user scott in Oracle to create the table (or other users, of course), and in Oracle 19c the scott user needs to be created manually and can be unlocked by command using the sqlplus tool.

- Access to the database

```sql
sqlplus / as sysdba
```

- Create a scott user and specify a password

```sql
create user scott identified by tiger; 
```

- To facilitate testing, we grant the scott dba role:

```sql
grant dba to scott; 
```

- Subsequent access is available via the scott user login:

```sql
sqlplus scott/tiger 
```

- Creating Test Data in Oracle

```sql
create table employees_oracle(
id number(5),
name varchar(20)
);

insert into employees_oracle values(1,'zhangsan');
insert into employees_oracle values(2,'lisi');
insert into employees_oracle values(3,'wangwu');
insert into employees_oracle values(4,'oracle');
COMMIT;
--View table data:
select * from employees_oracle;
```

### Build tables in advance in MatrixOne

Since SeaTunnel can only synchronize data, not table structure, we need to manually create the table in the target database (mo) before we can perform the task.

```sql
CREATE TABLE `oracle_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ;
```

### Install the Connectors plug-in

Next, explain how to connect to MatrixOne using SeaTunnel's `connector-jdbc` connection plug-in.

1. In SeaTunnel's `${SEATNUNNEL_HOME}/config/plugin_config` file, add the following:

    ```conf
    --connectors-v2--
    connector-jdbc
    --end--
    ```

2. The SeaTunnel binary package for version 2.3.3 does not provide connector dependencies by default. You need to install the connector by executing the following command the first time you use SeaTunnel:

    ```shell
    sh bin/install-plugin.sh 2.3.3
    ```

    __Note:__ This document uses the SeaTunnel engine to write data to MatrixOne without relying on Flink or Spark.

### Define Task Profile

In this section, we use the `employees_oracle` table of the Oracle database as the data source and write the data directly to the `oracle_datax` table of the MatrixOne database without data processing.

Well, due to data compatibility issues, you need to configure the task configuration file `${SEATNUNNEL_HOME}/config/v2.batch.config.template`, which defines how and how data is entered, processed, and exported after SeaTunnel is started.

Edit the configuration file as follows:

```conf
env {
  # You can set SeaTunnel environment configuration here
  execution.parallelism = 10
  job.mode = "BATCH"
  #execution.checkpoint.interval = 10000
  #execution.checkpoint.data-uri = "hdfs://localhost:9000/checkpoint"
}

source {
    Jdbc {
        url = "jdbc:oracle:thin:@xx.xx.xx.xx:1521:ORCLCDB"
        driver = "oracle.jdbc.OracleDriver"
        user = "scott"
        password = "tiger"
        query = "select * from employees_oracle"
    }
}

sink {
   Jdbc {
        url = "jdbc:mysql://xx.xx.xx.xx:6001/test"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "111"
        query = "insert into oracle_datax values(?,?)"
   }
}
```

### Run the SeaTunnel app

Launch the SeaTunnel app by executing the following command:

```shell
./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local 
```

### View run results

At the end of the SeaTunnel run, statistics similar to the following are displayed summarizing the time taken for this write, the total number of read data, the total number of writes, and the total number of write failures:

```shell
***********************************************
           Job Statistic Information
***********************************************
Start Time : 2023-08-07 16:45:02
End Time : 2023-08-07 16:45:05
Total Time(s) :                       3
Total Read Count :                   4
Total Write Count :                   4
Total Failed Count :                   0
***********************************************
```

You have successfully synchronously written data from the Oracle database to the MatrixOne database.
