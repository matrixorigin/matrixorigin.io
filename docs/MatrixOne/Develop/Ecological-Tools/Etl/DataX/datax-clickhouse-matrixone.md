# Write ClickHouse data to MatrixOne using DataX

This article describes how to write ClickHouse data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Completed [ClickHouse](https://packages.clickhouse.com/tgz/stable/) installation deployment
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Steps

### Log in to the clickhouse database to create test data

```sql
create database source_ck_database;
use source_ck_database; 

create table if not exists student(
`id` Int64 COMMENT '学生 id', 
`name` String COMMENT '学生姓名',
`birthday` String COMMENT '学生出生日期',
`class` Int64 COMMENT '学生班级编号',
`grade` Int64 COMMENT '学生年级编号',
`score` decimal(18,0) COMMENT '学生成绩'
) engine = MergeTree 
order by id;
```

### Importing data using datax

#### Using clickhousereader

Note: Datax cannot synchronize table structures, so you need to create the table MatrixOne build statement in MatrixOne in advance:

```sql
CREATE TABLE  datax_db.`datax_ckreader_ck_student` (
  `id` bigint(20) NULL COMMENT "",
  `name` varchar(100) NULL COMMENT "",
  `birthday` varchar(100) NULL COMMENT "",
  `class` bigint(20) NULL COMMENT "",
  `grade` bigint(20) NULL COMMENT "",
  `score` decimal(18, 0) NULL COMMENT ""
); 

CREATE TABLE  datax_db.`datax_rdbmsreader_ck_student` (
  `id` bigint(20) NULL COMMENT "",
  `name` varchar(100) NULL COMMENT "",
  `birthday` varchar(100) NULL COMMENT "",
  `class` bigint(20) NULL COMMENT "",
  `grade` bigint(20) NULL COMMENT "",
  `score` decimal(18, 0) NULL COMMENT ""
); 
```

Upload clikchousereader to the $DATAX\_HOME/plugin/reader directory Unzip the installation package:

```bash
[root@root ~]$ unzip clickhousereader.zip 
```

Move the archive to the /opt/ directory:

```bash
[root@root ~] mv clickhousereader.zip /opt/
 ```

Writing a task json file

```bash
[root@root ~] vim $DATAX_HOME/job/ck2sr.json 
```

```json
{
  "job": {
    "setting": {
      "speed": {
"channel": "1"
      }
    },
    "content": [
      {
        "reader": {
          "name": "clickhousereader",
          "parameter": {
            "username": "default",
            "password": "123456",
            "column": [
              "*"
            ],
            "splitPK": "id",
            "connection": [
              {
                "table": [
                  "student"
                ],
                "jdbcUrl": [
                  "jdbc:clickhouse://xx.xx.xx.xx:8123/source_ck_database"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "column": [
              "*"
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/datax_db",
                "table": [
                  "datax_ckreader_ck_student"
                ]
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

Perform import tasks

```bash
[root@root ~] cd $DATAX_HOME/bin 
[root@root ~] ./python datax.py ../jobs/ck2sr.json 
```

#### Importing with Rdbmsreader

Upload the ClickHouse JDBC driver to the $DATAX\_HOME/plugin/reader/rdbmsreader/libs/ directory

Modify the configuration file

```bash
[root@root ~] vim $DATAX_HOME/plugin/reader/rdbmsreader/plugin.json
```

```json
{
    "name": "rdbmsreader",
    "class": "com.alibaba.datax.plugin.reader.rdbmsreader.RdbmsReader",
    "description": "useScene: prod. mechanism: Jdbc connection using the database, execute select sql, retrieve data from the ResultSet. warn: The more you know about the database, the less problems you encounter.",
    "developer": "alibaba",
    "drivers":["dm.jdbc.driver.DmDriver", "com.sybase.jdbc3.jdbc.SybDriver", "com.edb.Driver", "org.apache.hive.jdbc.HiveDriver","com.clickhouse.jdbc.ClickHouseDriver"]
}
```

Writing a json task file

```bash
[root@root ~]  vim $DATAX_HOME/job/ckrdbms2sr.json
```

```json
{
  "job": {
    "setting": {
      "speed": {
        "byte": 1048576
      }
    },
    "content": [
      {
        "reader": {
          "name": "rdbmsreader",
          "parameter": {
            "username": "default",
            "password": "123456",
            "column": [
              "*"
            ],
            "splitPK": "id",
            "connection": [
              {
                "table": [
                  "student"
                ],
                "jdbcUrl": [
                  "jdbc:clickhouse://xx.xx.xx.xx:8123/source_ck_database"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "column": [
              "*"
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/datax_db",
                "table": [
                  "datax_rdbmsreader_ck_student"
                ]
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

Perform the import task

```bash
[root@root ~] cd $DATAX_HOME/bin 
[root@root ~] ./python datax.py ../jobs/ckrdbms2sr.json
```