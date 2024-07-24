# mo_datax_writer Tool Guide

`mo_datax_writer` is a tool to help you migrate data from mysql to matrixone.

!!! Note
    The `mo_datax_writer` tool is currently only supported for deployment on Linux system x86 architectures.

## Pre-dependency

- Finished [installing and starting](../../Get-Started/install-standalone-matrixone.md) MatrixOne
- Download [DataX Tools](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz)
- Download and install [MySQL](<https://www.mysql.com/downloads/>)
- Finished installing [Python 3.8 (or plus)](https://www.python.org/downloads/)
- Installed wget
- Set environment encoding to UTF-8  

## Install mo_datax_writer

```bash
wget https://github.com/matrixorigin/mo_datax_writer/archive/refs/tags/v1.0.1.zip
unzip v1.0.1.zip 
cd mo_datax_writer-1.0.1/ 
#Extract mo_datax_writer into the datax/plugin/writer/ directory
unzip matrixonewriter.zip -d ../datax/plugin/writer/
```

## Initialize the MatrixOne data table

### Creating a database

```sql
create database test; 
```

### Creating a table

```sql
use test;

CREATE TABLE `user` (
`name` VARCHAR(255) DEFAULT null,
`age` INT DEFAULT null,
`city` VARCHAR(255) DEFAULT null
);
```

## Initialize MySQL data table

### Creating a database

```SQL
create database test; 
```

### Creating a table

```sql
use test;

CREATE TABLE `user` (
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Import Data

```sql
insert into user values('zhangsan',26,'Shanghai'),('lisi',24,'Chengdu'),('wangwu',28,'Xian'),('zhaoliu',22,'Beijing'),('tianqi',26,'Shenzhen');

mysql> select * from user;
+----------+------+----------+
| name     | age  | city     |
+----------+------+----------+
| zhangsan |   26 | Shanghai |
| lisi     |   24 | Chengdu  |
| wangwu   |   28 | Xian     |
| zhaoliu  |   22 | Beijing  |
| tianqi   |   26 | Shenzhen |
+----------+------+----------+
5 rows in set (0.00 sec)
```

## Importing data using DataX

### Writing configuration files

Add the datax configuration file **mysql2mo.json** to the datax/job directory as follows:

```json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 1
            },
            "errorLimit": {
                "record": 0,
                "percentage": 0
            }
        },
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
					    // MySQL Database User Name
                        "username": "root",
						// MySQL Database Password
                        "password": "111",
						// Column Names for MySQL Data Table Reads
                        "column": ["name","age","city"],
                        "splitPk": "",
                        "connection": [
                            {
							    // MySQL Data Tables
                                "table": ["user"],
								// MySQL Connection Information
                                "jdbcUrl": [
                                    "jdbc:mysql://127.0.0.1:3306/test?useSSL=false"
                                ]
                            }
                        ]
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
					    // Database User Name
                        "username": "root",
						// Database Password
                        "password": "111",
						// Column names of tables to be imported
                        "column": ["name","age","city"],
						// SQL statements that need to be executed before the import task starts
                        "preSql": [],
						// SQL statement to execute after the import task is complete
                        "postSql": [],
						// Batch write count, i.e., how many pieces of data to read and then execute load data inline import task
                        "maxBatchRows": 60000,
						// Batch write size, i.e. how much data to read and then perform load data inline import task
                        "maxBatchSize": 5242880,
						// Import task execution interval, i.e. after how long the load data inline import task is executed
                        "flushInterval": 300000,
                        "connection": [
                            {
							    // Database Connection Information
                                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/test?useUnicode=true&useSSL=false",
								// database name
                                "database": "test",
								// database table
                                "table": ["user"]
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### Perform DataX tasks

Go to the datax installation directory and execute the following command

```bash
python bin/datax.py job/mysql2mo.json 
```

When the execution is complete, the output is as follows:

```bash
2024-06-06 06:26:52.145 [job-0] INFO  StandAloneJobContainerCommunicator - Total 5 records, 75 bytes | Speed 7B/s, 0 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.012s | Percentage 100.00%
2024-06-06 06:26:52.147 [job-0] INFO  JobContainer - 
任务启动时刻                    : 2024-06-06 14:26:41
任务结束时刻                    : 2024-06-06 14:26:52
任务总计耗时                    :                 10s
任务平均流量                    :                7B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   5
读写失败总数                    :                   0
```

### View Results

View the results in the MatrixOne database and see that the data has been synchronized from MySQL into MatrixOne

```sql
mysql> select * from user;
+----------+------+-----------+
| name     | age  | city      |
+----------+------+-----------+
| zhangsan |   26 | Shanghai  |
| lisi     |   24 | Chengdu   |
| wangwu   |   28 | Xian      |
| zhaoliu  |   22 | Beijing   |
| tianqi   |   26 | Shenzhen  |
+----------+------+-----------+
5 rows in set (0.01 sec)
```