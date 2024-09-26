# Writing MySQL data to MatrixOne using SeaTunnel

This chapter describes how to write MySQL data to MatrixOne using SeaTunnel.

## Prepare before you start

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.

- Finished [installing SeaTunnel Version 2.3.3](https://www.apache.org/dyn/closer.lua/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz). Once installed, the installation path for SeaTunnel can be defined from the shell command line:

```shell
export SEATNUNNEL_HOME="/root/seatunnel" 
```

- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

- Download [mysql-connector-java-8.0.33.jar](https://downloads.mysql.com/archives/get/p/3/file/mysql-connector-j-8.0.33.zip) and copy the file to the `${SEATNUNNEL_HOME}/plugins/jdbc/lib/` directory.

## Operational steps

### Create Test Data

1. Create a MySQL database named `test1` and create a table named `test_table` in it, stored in `mysql.sql` under root. Here is the DDL statement for MySQL:

      ```sql
    create database test1;
    use test1;
    CREATE TABLE `test_table` (
      `name` varchar(255) DEFAULT NULL,
      `age` int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ```

2. Use the [mo_ctl](../../../../Reference/mo-tools/mo_ctl_standalone.md) tool to import MySQL's DDL statements directly into MatrixOne. Execute the following command:

    ```shell
    mo_ctl sql /root/mysql.sql 
    ```

### Install the Connectors plug-in

Connect to MatrixOne using SeaTunnel's `connector-jdbc` connection plug-in.

1. In SeaTunnel's `${SEATNUNNEL_HOME}/config/plugin_config` file, add the following:

    ```shell
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

In this document, we use the `test_table` table of the MySQL database as the data source and write the data directly to the `test_table` table of the MatrixOne database without data processing.

Well, due to data compatibility issues, you need to configure the task configuration file `${SEATNUNNEL_HOME}/config/v2.batch.config.template`, which defines how and how data is entered, processed, and exported after SeaTunnel is started.

Edit the configuration file as follows:

```shell
env {
  execution.parallelism = 2
  job.mode = "BATCH"
}

source {
    Jdbc {
        url = "jdbc:mysql://xx.xx.xx.xx:3306/test"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "123456"
        query = "select * from test_table"
    }
}

transform {

}

sink {
   jdbc {
        url = "jdbc:mysql://xx.xx.xx.xx:6001/test"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "111"
        query = "insert into test_table(name,age) values(?,?)"
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
Start Time                : 2023-08-07 16:45:02
End Time                  : 2023-08-07 16:45:05
Total Time(s)             :                   3
Total Read Count          :             5000000
Total Write Count         :             5000000
Total Failed Count        :                   0
***********************************************
```

You have successfully synchronously written data from the MySQL database to the MatrixOne database.
