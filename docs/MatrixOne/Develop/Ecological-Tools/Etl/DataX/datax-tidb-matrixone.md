# Write data to MatrixOne using DataX

This article describes how to write TiDB data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- TiDB standalone deployment completed.
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Operational steps

### Creating Test Data in TiDB

```sql
CREATE TABLE `tidb_dx` (
    `id` bigint(20) NOT NULL,
    `name` varchar(100) DEFAULT NULL,
    `salary` decimal(10,0) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `entrytime` date DEFAULT NULL,
    `gender` char(1) DEFAULT NULL,
    PRIMARY KEY (`id`)
);

insert into testdx2tidb values
(1,"lisa",15660,30,'2022-10-12',0),
(2,"tom",15060,24,'2021-11-10',1),
(3,"jenny",15000,28,'2024-02-19',0),
(4,"henry",12660,24,'2022-04-22',1);
```

### Creating a Target Table in MatrixOne

Since DataX can only synchronize data, not table structure, we need to manually create the table in the target database (MatrixOne) before we can perform the task.

```sql
CREATE TABLE `testdx2tidb` (
    `id` bigint(20) NOT NULL COMMENT "",
    `name` varchar(100) NULL COMMENT "",
    `salary` decimal(10, 0) NULL COMMENT "",
    `age` int(11) NULL COMMENT "",
    `entrytime` date NULL COMMENT "",
    `gender` varchar(1) NULL COMMENT "",
    PRIMARY KEY (`id`)
);
```

### Configure the json file

tidb can be read directly using mysqlreader. in the job directory of datax. Edit the configuration file `tidb2mo.json`:

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
                        "username": "root",
                        "password": "root",
                        "column": [ "*" ],
                        "splitPk": "id",
                        "connection": [
                            {
                                "table": [ "tidb_dx" ],
                                "jdbcUrl": [
                                   "jdbc:mysql://xx.xx.xx.xx:4000/test"
                                ]
                            }
                        ]
                    }
                },
                "writer": {
                     "name": "matrixonewriter",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["testdx2tidb"]
                            }
                        ],
                        "password": "111",
                        "username": "root",
                        "writeMode": "insert"
                    }
                }
            }
        ]
    }
}
```

### Carrying out tasks

```bash
python bin/datax.py job/tidb2mo.json 
```

### View target table data in MatrixOne

```sql
mysql> select * from testdx2tidb;
+------+-------+--------+------+------------+--------+
| id   | name  | salary | age  | entrytime  | gender |
+------+-------+--------+------+------------+--------+
|    1 | lisa  |  15660 |   30 | 2022-10-12 | 0      |
|    2 | tom   |  15060 |   24 | 2021-11-10 | 1      |
|    3 | jenny |  15000 |   28 | 2024-02-19 | 0      |
|    4 | henry |  12660 |   24 | 2022-04-22 | 1      |
+------+-------+--------+------+------------+--------+
4 rows in set (0.01 sec)
```

Data import succeeded.