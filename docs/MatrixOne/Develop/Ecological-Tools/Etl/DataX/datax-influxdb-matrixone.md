# Write InfluxDB data to MatrixOne using DataX

This article describes how to write InfluxDB data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download and install [InfluxDB](https://www.influxdata.com/products/influxdb/).
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Download [influxdbreader](https://github.com/wowiscrazy/InfluxDBReader-DataX) to the datax/plugin/reader path.
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Steps

### Creating test data in influxdb

Log in with your default account

```bash
influx -host 'localhost' -port '8086'
```

```sql
--Creating and using databases
create database testDb;
use testDb;
--insert data
insert air_condition_outdoor,home_id=0000000000000,sensor_id=0000000000034 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000001,sensor_id=0000000000093 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000197 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000198 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000199 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000200 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000201 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000202 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000203 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000204 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
```

### Create a test account

```sql
create user "test" with password '123456' with all privileges;
grant all privileges on testDb to test;
show grants for test;
```

### Turn on database authentication

```bash
vim /etc/influxdb/influxdb.conf 
```

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/datax/datax-influxdb-01.jpg?raw=true width=50% heigth=50%/>
</div>

### Restart influxdb

```bash
systemctl restart influxdb 
```

### Test Authentication Login

```bash
influx -host 'localhost' -port '8086' -username 'test' -password '123456' 
```

### Creating a Target Table in MatrixOne

```sql
mysql> create database test;
mysql> use test;
mysql> create  table air_condition_outdoor(
time  datetime,
battery_voltage float,
home_id  char(15),
humidity int,
sensor_id   char(15),
temperature  int
);
```

### Edit the json template file for datax

Go to the datax/job path and fill in the following at influxdb2mo.json

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
                    "name": "influxdbreader",
                    "parameter": {
                        "dbType": "InfluxDB",
                        "address": "http://xx.xx.xx.xx:8086",
                        "username": "test",
                        "password": "123456",
                        "database": "testDb",
                        "querySql": "select * from air_condition_outdoor limit 20",
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "username": "root",
                        "password": "111",
                        "writeMode": "insert",
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["air_condition_outdoor"]
                            }
                        ],
                        "column": ["*"],
                    }
                }
            }
        ]
    }
}
```

### Start the datax job

Seeing results similar to the following indicates successful import

```bash
#python bin/datax.py job/influxdb2mo.json
2024-04-28 13:51:19.665 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-04-28 13:51:08
任务结束时刻                    : 2024-04-28 13:51:19
任务总计耗时                    :                 10s
任务平均流量                    :                2B/s
记录写入速度                    :               0rec/s
读出记录总数                    :                  20
读写失败总数                    :                   0
```