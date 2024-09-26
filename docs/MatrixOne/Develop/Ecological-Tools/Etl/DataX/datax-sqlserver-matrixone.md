# Write data to MatrixOne using DataX

This article describes how to write SQL Server data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Completed [SQL Server 2022](https://www.microsoft.com/en-us/sql-server/sql-server-downloads).
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Operational steps

### Create sql server test data

```sql
CREATE TABLE test.dbo.test2 (
	id int NULL,
	age int NULL,
	name varchar(50) null
);

INSERT INTO test.dbo.test2
(id, age, name)
VALUES(1, 1, N'shdfhg '),
(4, 4, N' dhdhdf '),
(2, 2, N' ndgnh '),
(3, 3, N' dgh '),
(5, 5, N' dfghnd '),
(6, 6, N' dete ');
```

### Creating a Target Table in MatrixOne

Since DataX can only synchronize data, not table structure, we need to manually create the table in the target database (MatrixOne) before we can perform the task.

```sql
CREATE TABLE test.test_2 (
	id int not NULL,
	age int NULL,
	name varchar(50) null
);
```

### Creating a Job Profile

The task configuration file in DataX is in json format and the built-in task configuration template can be viewed by the following command:

```bash
python datax.py -r sqlserverreader -w matrixonewriter 
```

Go to the datax/job path and, according to the template, write the job file `sqlserver2mo.json`:

```json
{
    "job": {
        "content": [
            {
                "reader": {
                    "name": "sqlserverreader",
                    "parameter": {
                        "column": ["id","age","name"],
                        "connection": [
                            {
                                "jdbcUrl": ["jdbc:sqlserver://xx.xx.xx.xx:1433;databaseName=test"],
                                "table": ["dbo.test2"]
                            }
                        ],
                        "password": "123456",
                        "username": "sa"
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "column": ["id","age","name"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx:6001/test",
                                "table": ["test_2"]
                            }
                        ],
                        "password": "111",
                        "username": "root",
                        "writeMode": "insert"
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

### Starting a datax job

```bash
python  datax.py  sqlserver2mo.json
```

### Viewing data in the mo table

```sql
select * from test_2;
```

<div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/datax/datax-sqlserver-02.jpg?raw=true width=50% heigth=50%/>
</div>