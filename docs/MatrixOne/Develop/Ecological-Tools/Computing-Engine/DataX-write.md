# Writing Data to MatrixOne Using DataX

## Overview

This article explains using the DataX tool to write data to offline MatrixOne databases.

DataX is an open-source heterogeneous data source offline synchronization tool developed by Alibaba. It provides stable and efficient data synchronization functions to achieve efficient data synchronization between various heterogeneous data sources.

DataX divides the synchronization of different data sources into two main components: **Reader (read data source)** and **Writer (write to the target data source)**. The DataX framework theoretically supports data synchronization work for any data source type.

MatrixOne is highly compatible with MySQL 8.0. However, since the MySQL Writer plugin with DataX is adapted to the MySQL 5.1 JDBC driver, the community has separately modified the MatrixOneWriter plugin based on the MySQL 8.0 driver to improve compatibility. The MatrixOneWriter plugin implements the functionality of writing data to the target table in the MatrixOne database. In the underlying implementation, MatrixOneWriter connects to the remote MatrixOne database via JDBC and executes the corresponding `insert into ...` SQL statements to write data to MatrixOne. It also supports batch commits for performance optimization.

MatrixOneWriter uses DataX to retrieve generated protocol data from the Reader and generates the corresponding `insert into ...` statements based on your configured `writeMode`. In the event of primary key or uniqueness index conflicts, conflicting rows are excluded, and writing continues. For performance optimization, we use the `PreparedStatement + Batch` method and set the `rewriteBatchedStatements=true` option to buffer data to the thread context buffer. The write request is triggered only when the data volume in the buffer reaches the specified threshold.

![DataX](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/datax.png)

!!! note
    To execute the entire task, you must have permission to execute `insert into ...`. Whether other permissions are required depends on the `preSql` and `postSql` in your task configuration.

MatrixOneWriter mainly aims at ETL development engineers who use MatrixOneWriter to import data from data warehouses into MatrixOne. At the same time, MatrixOneWriter can also serve as a data migration tool for users such as DBAs.

## Before you start

Before using DataX to write data to MatrixOne, you need to complete the installation of the following software:

- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or newer)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and unzip it to the `plugin/writer/` directory in the root directory of your DataX project.
- Install the [MySQL Client](https://dev.mysql.com/downloads/mysql).
- [Install and start MatrixOne](../../../Get-Started/install-standalone-matrixone.md).

## Steps

### Create a MatrixOne Table

Connect to MatrixOne using the MySQL Client and create a test table in MatrixOne:

```sql
CREATE DATABASE mo_demo;
USE mo_demo;
CREATE TABLE m_user(
    M_ID INT NOT NULL,
    M_NAME CHAR(25) NOT NULL
);
```

### Configure the Data Source

In this example, we use data generated **in memory** as the data source:

```json
"reader": {
   "name": "streamreader",  
   "parameter": {
       "column" : [ # You can write multiple columns
           {
               "value": 20210106,   # Represents the value of this column
               "type": "long"       # Represents the type of this column
           },
           {
               "value": "matrixone",
               "type": "string"
           }
       ],
       "sliceRecordCount": 1000     # Indicates how many times to print
   }
}
```

### Write the Job Configuration File

Use the following command to view the configuration template:

```shell
python datax.py -r {YOUR_READER} -w matrixonewriter
```

Write the job configuration file `stream2matrixone.json`:

```json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 1
            }
        },
        "content": [
            {
                 "reader": {
                    "name": "streamreader",
                    "parameter": {
                        "column" : [
                            {
                                "value": 20210106,
                                "type": "long"
                            },
                            {
                                "value": "matrixone",
                                "type": "string"
                            }
                        ],
                        "sliceRecordCount": 1000
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "writeMode": "insert",
                        "username": "root",
                        "password": "111",
                        "column": [
                            "M_ID",
                            "M_NAME"
                        ],
                        "preSql": [
                            "delete from m_user"
                        ],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/mo_demo",
                                "table": [
                                    "m_user"
                                ]
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### Start DataX

Execute the following command to start DataX:

```shell
$ cd {YOUR_DATAX_DIR_BIN}
$ python datax.py stream2matrixone.json
```

### View the Results

Connect to MatrixOne using the MySQL Client and use `select` to query the inserted results. The 1000 records in memory have been successfully written to MatrixOne.

```sql
mysql> select * from m_user limit 5;
+----------+-----------+
| m_id     | m_name    |
+----------+-----------+
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
+----------+-----------+
5 rows in set (0.01 sec)

mysql> select count(*) from m_user limit 5;
+----------+
| count(*) |
+----------+
|     1000 |
+----------+
1 row in set (0.00 sec)
```

## Parameter Descriptions

Here are some commonly used parameters for MatrixOneWriter:

| Parameter Name | Parameter Description | Mandatory | Default Value |
| --- | --- | --- | --- |
| **jdbcUrl** | JDBC connection information for the target database. DataX will append some attributes to the provided `jdbcUrl` during runtime, such as `yearIsDateType=false&zeroDateTimeBehavior=CONVERT_TO_NULL&rewriteBatchedStatements=true&tinyInt1isBit=false&serverTimezone=Asia/Shanghai`. | Yes | None |
| **username** | Username for the target database. | Yes | None |
| **password** | Password for the target database. | Yes | None |
| **table** | Name of the target table. Supports writing to one or more tables. If configuring multiple tables, make sure their structures are consistent. | Yes | None |
| **column** | Fields in the target table that must be written with data, separated by commas. For example: `"column": ["id","name","age"]`. To write all columns, you can use `*`, for example: `"column": ["*"]`. | Yes | None |
| **preSql** | Standard SQL statements to be executed before writing data to the target table. | No | None |
| **postSql** | Standard SQL statements to be executed after writing data to the target table. | No | None |
| **writeMode** | Controls the SQL statements used when writing data to the target table. You can choose `insert` or `update`. | `insert` or `update` | `insert` |
| **batchSize** | Size of records for batch submission. This can significantly reduce network interactions between DataX and MatrixOne, improving overall throughput. However, setting it too large may cause DataX to run out of memory. | No | 1024 |

## Type Conversion

MatrixOneWriter supports most MatrixOne data types, but a few types still need to be supported, so you need to pay special attention to your data types.

Here is a list of type conversions that MatrixOneWriter performs for MatrixOne data types:

| DataX Internal Type | MatrixOne Data Type |
| ------------------- | ------------------- |
| Long                | int, tinyint, smallint, bigint |
| Double              | float, double, decimal |
| String              | varchar, char, text |
| Date                | date, datetime, timestamp, time |
| Boolean             | bool |
| Bytes               | blob |

## Additional References

- MatrixOne is compatible with the MySQL protocol. MatrixOneWriter is a modified version of the MySQL Writer with adjustments for JDBC driver versions. You can still use the MySQL Writer to write to MatrixOne.

- To add the MatrixOne Writer in DataX, you need to download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and unzip it into the `plugin/writer/` directory in the root directory of your DataX project.

## Ask and Questions

**Q: During runtime, I encountered the error "Configuration information error, the configuration file you provided /{YOUR_MATRIXONE_WRITER_PATH}/plugin.json does not exist." What should I do?**

A: DataX attempts to find the plugin.json file by searching for similar folders when it starts. If the matrixonewriter.zip file also exists in the same directory, DataX will try to find it in `.../datax/plugin/writer/matrixonewriter.zip/plugin.json`. In the MacOS environment, DataX will also attempt to see it in `.../datax/plugin/writer/.DS_Store/plugin.json`. In this case, you need to delete these extra files or folders.
