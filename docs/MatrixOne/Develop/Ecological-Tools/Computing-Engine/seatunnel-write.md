# Writing Data to MatrixOne Using SeaTunnel

## Overview

[SeaTunnel](https://seatunnel.apache.org/) is a distributed, high-performance, and highly scalable data integration platform that focuses on synchronizing and transforming massive data, including offline and real-time data. MatrixOne supports using SeaTunnel to synchronize data from other databases and can efficiently handle hundreds of billions of records.

This document will explain how to use SeaTunnel to write data to MatrixOne.

## Before you start

Before using SeaTunnel to write data to MatrixOne, make sure to complete the following preparations:

- Install and start MatrixOne by following the steps in [Install standalone MatrixOne](../../../Get-Started/install-standalone-matrixone.md).

- Install SeaTunnel Version 2.3.3 by downloading it from [here](https://www.apache.org/dyn/closer.lua/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz). After installation, you can define the installation path of SeaTunnel using a shell command:

```shell
export SEATNUNNEL_HOME="/root/seatunnel"
```

## Steps

### Create Test Data

1. Create a MySQL database named `test1` and create a table named `test_table` within it. Store this in a file named `mysql.sql` under the root directory. Here's the MySQL DDL statement:

    ```sql
    create database test1;
    use test1;
    CREATE TABLE `test_table` (
      `name` varchar(255) DEFAULT NULL,
      `age` int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ```

2. Use the [mo_ctl](https://docs.matrixorigin.cn/1.1.2/MatrixOne/Maintain/mo_ctl/) tool to import the MySQL DDL statements into MatrixOne directly. Execute the following command:

    ```shell
    mo_ctl sql /root/mysql.sql
    ```

### Install the Connectors Plugin

This document will explain how to use SeaTunnel's `connector-jdbc` connection plugin to connect to MatrixOne.

1. In the `${SEATNUNNEL_HOME}/config/plugin_config` file of SeaTunnel, add the following content:

    ```shell
    --connectors-v2--
    connector-jdbc
    --end--
    ```

2. SeaTunnel binary package version 2.3.3 does not provide connector dependencies by default. You need to install the connectors when using SeaTunnel for the first time by running the following command:

    ```shell
    sh bin/install-plugin.sh 2.3.3
    ```

    __Note:__ This document uses the SeaTunnel engine to write data to MatrixOne without relying on Flink or Spark.

## Define the Task Configuration File

In this document, we use the `test_table` table in the MySQL database as the data source, and we write data directly to the `test_table` table in the MatrixOne database without data processing.

Due to data compatibility issues, you need to configure the task configuration file `${SEATNUNNEL_HOME}/config/v2.batch.config.template`, which defines how SeaTunnel handles data input, processing, and output logic after it starts.

Edit the configuration file with the following content:

```shell
env {
  execution.parallelism = 2
  job.mode = "BATCH"
}

source {
    Jdbc {
        url = "jdbc:mysql://192.168.110.40:3306/test"
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
        url = "jdbc:mysql://192.168.110.248:6001/test"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "111"
        query = "insert into test_table(name,age) values(?,?)"
   }
}
```

### Install Database Dependencies

Download [mysql-connector-java-8.0.33.jar](https://downloads.mysql.com/archives/get/p/3/file/mysql-connector-j-8.0.33.zip) and copy the file to the `${SEATNUNNEL_HOME}/plugins/jdbc/lib/` directory.

### Run the SeaTunnel Application

Execute the following command to start the SeaTunnel application:

```shell
./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local
```

### View the Results

After SeaTunnel finishes running, it will display statistics similar to the following, summarizing the time taken for this write operation, the total number of data read, the total number of writes, and the total number of write failures:

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

You have successfully synchronized data from a MySQL database into the MatrixOne database.
