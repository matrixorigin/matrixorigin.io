# Write MongoDB data to MatrixOne using DataX

This article describes how to write MongoDB data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download and install [MongoDB](https://www.mongodb.com/).
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Steps

### Creating MongoDB Test Data

Create database test or test if test does not exist

```sql
>create database test;
>use test
#Viewing the current database
>db
test
#Create collection db.createCollection("collection name")
>db. createCollection('test')
#Insert document data db.collection name.insert(document content)
>db.test. insert({"name" : " aaa ", "age" : 20})
>db.test. insert({"name" : " bbb ", "age" : 18})
>db.test. insert({"name" : " ccc ", "age" : 28})
#View Data
>db.test.find()
{ "_id" : ObjectId("6347e3c6229d6017c82bf03d"), "name" : "aaa", "age" : 20 }
{ "_id" : ObjectId("6347e64a229d6017c82bf03e"), "name" : "bbb", "age" : 18 }
{ "_id" : ObjectId("6347e652229d6017c82bf03f"), "name" : "ccc", "age" : 28 }
```

### Creating a Target Table in MatrixOne

```sql
mysql> create database test;
mysql> use test;
mysql> CREATE TABLE `mongodbtest` (
  `name` varchar(30) NOT NULL COMMENT "",
  `age` int(11) NOT NULL COMMENT ""
);
```

### Edit the json template file for datax

Go to the datax/job path, create a new file `mongo2matrixone.json` and fill in the following:

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
          "name": "mongodbreader",
          "parameter": {
            "address": [
              "xx.xx.xx.xx:27017"
            ],
            "userName": "root",
            "userPassword": "",
            "dbName": "test",
            "collectionName": "test",
            "column": [
              {
                "name": "name",
                "type": "string"
              },
              {
                "name": "age",
                "type": "int"
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "username": "root",
            "password": "111",
            "column": ["*"],
            "connection": [
              {
                "table": ["mongodbtest"],
                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### Start the datax job

```bash
python bin/datax.py job/mongo2matrixone.json
2024-04-28 13:51:19.665 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-04-28 13:51:08
任务结束时刻                    : 2024-04-28 13:51:19
任务总计耗时                    :                 10s
任务平均流量                    :                2B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   3
读写失败总数                    :                   0
```