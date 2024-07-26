# Write ElasticSearch data to MatrixOne using DataX

This article describes how to write ElasticSearch data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Finished [installing and starting](../../../Get-Started/install-standalone-matrixone.md) MatrixOne.
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download and install [ElasticSearch](https://www.elastic.co/cn/downloads/elasticsearch).
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Download [elasticsearchreader.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/datax_es_mo/elasticsearchreader.zip) and extract it to the datax/plugin/reader directory.
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Steps

### Import data into ElasticSearch

#### Create Index

Create an index with the name person (username and password in ElasticSearch after the -u parameter below, which can be modified or deleted as needed for local testing):

```bash
curl -X PUT "<http://127.0.0.1:9200/person>" -u elastic:elastic
```

Output the following message to indicate successful creation:

```bash
{"acknowledged":true,"shards_acknowledged":true,"index":"person"} 
```

#### Add a field to the index person

```bash
curl -X PUT "127.0.0.1:9200/person/_mapping" -H 'Content-Type: application/json' -u elastic:elastic -d'{  "properties": {    "id": { "type": "integer" },    "name": { "type": "text" },    "birthday": {"type": "date"}  }}'
```

Output the following message to indicate successful setup:

```bash
{"acknowledged":true} 
```

#### Adding data to an ElasticSearch index

Add three pieces of data via the curl command:

```bash
curl -X POST '127.0.0.1:9200/person/_bulk' -H 'Content-Type: application/json' -u elastic:elastic -d '{"index":{"_index":"person","_type":"_doc","_id":1}}{"id": 1,"name": "MatrixOne","birthday": "1992-08-08"}{"index":{"_index":"person","_type":"_doc","_id":2}}{"id": 2,"name": "MO","birthday": "1993-08-08"}{"index":{"_index":"person","_type":"_doc","_id":3}}{"id": 3,"name": "墨墨","birthday": "1994-08-08"}
```

Output the following message to indicate successful execution:

```bash
{"took":5,"errors":false,"items":[{"index":{"_index":"person","_type":"_doc","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1,"status":201}},{"index":{"_index":"person","_type":"_doc","_id":"2","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":1,"_primary_term":1,"status":201}},{"index":{"_index":"person","_type":"_doc","_id":"3","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":2,"_primary_term":1,"status":201}}]}
```

### Building tables in MatrixOne

```sql
create database mo;
CREATE TABLE mo.`person` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`birthday` DATE DEFAULT NULL
);
```

### Writing Migration Files

Go to the datax/job path and write the job file `es2mo.json`:

```json
{
    "job":{
        "setting":{
            "speed":{
                "channel":1
            },
            "errorLimit":{
                "record":0,
                "percentage":0.02
            }
        },
        "content":[
            {
                "reader":{
                    "name":"elasticsearchreader",
                    "parameter":{
                        "endpoint":"http://127.0.0.1:9200",
                        "accessId":"elastic",
                        "accessKey":"elastic",
                        "index":"person",
                        "type":"_doc",
                        "headers":{

                        },
                        "scroll":"3m",
                        "search":[
                            {
                                "query":{
                                    "match_all":{

                                    }
                                }
                            }
                        ],
                        "table":{
                            "filter":"",
                            "nameCase":"UPPERCASE",
                            "column":[
                                {
                                    "name":"id",
                                    "type":"integer"
                                },
                                {
                                    "name":"name",
                                    "type":"text"
                                },
                                {
                                    "name":"birthday",
                                    "type":"date"
                                }
                            ]
                        }
                    }
                },
                "writer":{
                    "name":"matrixonewriter",
                    "parameter":{
                        "username":"root",
                        "password":"111",
                        "column":[
                            "id",
                            "name",
                            "birthday"
                        ],
                        "connection":[
                            {
                                "table":[
                                    "person"
                                ],
                                "jdbcUrl":"jdbc:mysql://127.0.0.1:6001/mo"
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### Perform migration tasks

Enter the datax installation directory and execute the following command to start the migration job:

```bash
cd datax 
python bin/datax.py job/es2mo.json 
```

After the job is executed, the output is as follows:

```bash
2023-11-28 15:55:45.642 [job-0] INFO  StandAloneJobContainerCommunicator - Total 3 records, 67 bytes | Speed 6B/s, 0 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.456s | Percentage 100.00%2023-11-28 15:55:45.644 [job-0] INFO  JobContainer - 
任务启动时刻                    : 2023-11-28 15:55:31
任务结束时刻                    : 2023-11-28 15:55:45
任务总计耗时                    :                 14s
任务平均流量                    :                6B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   3
读写失败总数                    :                   0
```

### View post-migration data in MatrixOne

View the results in the target table in the MatrixOne database to confirm that the migration is complete:

```sql
mysql> select * from mo.person;
+------+-----------+------------+
| id   | name      | birthday   |
+------+-----------+------------+
|    1 | MatrixOne | 1992-08-08 |
|    2 | MO        | 1993-08-08 |
|    3 | 墨墨      | 1994-08-08 |
+------+-----------+------------+
3 rows in set (0.00 sec)
```