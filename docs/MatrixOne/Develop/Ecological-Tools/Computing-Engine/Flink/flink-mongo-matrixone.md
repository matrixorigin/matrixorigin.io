# Write MongoDB data to MatrixOne using Flink

This chapter describes how to write MongoDB data to MatrixOne using Flink.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [lntelliJ IDEA (2022.2.1 or later version)](https://www.jetbrains.com/idea/download/).
- Select the [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) version to download and install depending on your system environment.
- Download and install [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz) with a minimum supported version of 1.11.
- Download and install [MongoDB](https://www.mongodb.com/).
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar), the recommended version is 8.0.33.

## Operational steps

### Turn on Mongodb replica set mode

Shutdown command:

```bash
mongod -f /opt/software/mongodb/conf/config.conf --shutdown
```

Add the following parameters to /opt/software/mongodb/conf/config.conf

```shell
replication: 
replSetName: rs0 #replication set name 
```

Restart mangod

```bash
mongod -f /opt/software/mongodb/conf/config.conf 
```

Then go into mongo and execute `rs.initiate()` then `rs.status()`

```shell
> rs.initiate()
{
"info2" : "no configuration specified. Using a default configuration for the set",
"me" : "xx.xx.xx.xx:27017",
"ok" : 1
}
rs0:SECONDARY> rs.status()
```

See the following information indicating that the replication set started successfully

```bash
"members" : [
{
"_id" : 0,
"name" : "xx.xx.xx.xx:27017",
"health" : 1,
"state" : 1,
"stateStr" : "PRIMARY",
"uptime" : 77,
"optime" : {
"ts" : Timestamp(1665998544, 1),
"t" : NumberLong(1)
},
"optimeDate" : ISODate("2022-10-17T09:22:24Z"),
"syncingTo" : "",
"syncSourceHost" : "",
"syncSourceId" : -1,
"infoMessage" : "could not find member to sync from",
"electionTime" : Timestamp(1665998504, 2),
"electionDate" : ISODate("2022-10-17T09:21:44Z"),
"configVersion" : 1,
"self" : true,
"lastHeartbeatMessage" : ""
}
],
"ok" : 1,

rs0:PRIMARY> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
test    0.000GB
```

### Create source table (mongodb) in flinkcdc sql interface

Execute in the lib directory in the flink directory and download the cdcjar package for mongodb

```bash
wget <https://repo1.maven.org/maven2/com/ververica/flink-sql-connector-mongodb-cdc/2.2.1/flink-sql-connector-mongodb-cdc-2.2.1.jar> 
```

Build a mapping table for the data source mongodb, the column names must also be identical

```sql
CREATE TABLE products (
  _id STRING,#There must be this column, and it must also be the primary key, because mongodb automatically generates an id for each row of data
  `name` STRING,
  age INT,
  PRIMARY KEY(_id) NOT ENFORCED
) WITH (
  'connector' = 'mongodb-cdc',
  'hosts' = 'xx.xx.xx.xx:27017',
  'username' = 'root',
  'password' = '',
  'database' = 'test',
  'collection' = 'test'
);
```

Once established you can execute `select * from` products; check if the connection is successful

### Create sink table in flinkcdc sql interface (MatrixOne)

Create a mapping table for matrixone with the same structure and no columns with ids

```sql
CREATE TABLE cdc_matrixone (
   `name` STRING,
   age INT,
   PRIMARY KEY (`name`) NOT ENFORCED
)WITH (
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/test',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'mongodbtest'   
);
```

### Turn on the cdc synchronization task

Once the sync task is turned on here, mongodb additions and deletions can be synchronized

```sql
INSERT INTO cdc_matrixone SELECT `name`,age FROM products;

#insert
rs0:PRIMARY> db.test.insert({"name" : "ddd", "age" : 90})
WriteResult({ "nInserted" : 1 })
rs0:PRIMARY> db.test.find()
{ "_id" : ObjectId("6347e3c6229d6017c82bf03d"), "name" : "aaa", "age" : 20 }
{ "_id" : ObjectId("6347e64a229d6017c82bf03e"), "name" : "bbb", "age" : 18 }
{ "_id" : ObjectId("6347e652229d6017c82bf03f"), "name" : "ccc", "age" : 28 }
{ "_id" : ObjectId("634d248f10e21b45c73b1a36"), "name" : "ddd", "age" : 90 }
#update
rs0:PRIMARY> db.test.update({'name':'ddd'},{$set:{'age':'99'}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
#delete
rs0:PRIMARY> db.test.remove({'name':'ddd'})
WriteResult({ "nRemoved" : 1 })
```