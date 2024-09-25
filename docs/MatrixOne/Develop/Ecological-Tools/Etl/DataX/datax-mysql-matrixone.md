# Writing MySQL data to MatrixOne using DataX

This article describes how to write MySQL data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

## Steps

### Create table and insert data in mysql

```sql
CREATE TABLE `mysql_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
     `salary` decimal(10,0) DEFAULT NULL,
     `age` int(11) DEFAULT NULL,
     `entrytime` date DEFAULT NULL,
     `gender` char(1) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--Insert sample data
insert into mysql_datax valus
(1,"lisa",15660,30,'2022-10-12',0),
(2,"tom",15060,24,'2021-11-10',1),
(3,"jenny",15000,28,'2024-02-19',0),
(4,"henry",12660,24,'2022-04-22',1);
```

### Create target library table in Matrixone

Since DataX can only synchronize data, not table structure, we need to manually create the table in the target database (Matrixone) before we can perform the task.

```sql
CREATE TABLE `mysql_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
     `salary` decimal(10,0) DEFAULT NULL,
     `age` int(11) DEFAULT NULL,
     `entrytime` date DEFAULT NULL,
     `gender` char(1) DEFAULT NULL,
      PRIMARY KEY (`id`)
);
```

### Creating a Job Profile

The task configuration file in DataX is in json format and the built-in task configuration template can be viewed by the following command:

```bash
python datax.py -r mysqlreader -w matrixonewriter
```

Go to the datax/job path and, according to the template, write the job file `mysql2mo.json`:

```json
{
    "job": {
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": ["jdbc:mysql://xx.xx.xx.xx:3306/test"],
                                "table": ["mysql_datax"]
                            }
                        ],
                        "password": "root",
                        "username": "root",
                        "where": ""
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["mysql_datax"]
                            }
                        ],
                        "password": "111",
                        "preSql": [],
                        "session": [],
                        "username": "root",
                        "writeMode": "insert"  --目前仅支持replace,update 或 insert 方式
                    }
                }
            }
        ],
        "setting": {
            "speed": {
                "channel": "1"
            }
        }
    }
}
```

### Start the datax job

```bash
python /opt/module/datax/bin/datax.py /opt/module/datax/job/mysql2mo.json
```

### View data in a MatrixOne table

```sql
mysql> select * from mysql_datax;
+------+-------+--------+------+------------+--------+
| id   | name  | salary | age  | entrytime  | gender |
+------+-------+--------+------+------------+--------+
|    1 | lisa  |  15660 |   30 | 2022-10-12 | 0      |
|    2 | tom   |  15060 |   24 | 2021-11-10 | 1      |
|    3 | jenny |  15000 |   28 | 2024-02-19 | 0      |
|    4 | henry |  12660 |   24 | 2022-04-22 | 1      |
+------+-------+--------+------+------------+--------+
4 rows in set (0.00 sec)
```