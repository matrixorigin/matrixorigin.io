# Write data to MatrixOne using DataX

This article describes how to write Oracle data offline to a MatrixOne database using the DataX tool.

## Prepare before you start

Before you can start writing data to MatrixOne using DataX, you need to complete the installation of the following software:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Install [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Install [Python 3.8 (or plus)](https://www.python.org/downloads/).
- Download the [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) installation package and unzip it.
- Download [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip) and extract it to the `plugin/writer/` directory in the root of your DataX project.
- Install [Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html).
- Install the <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>.

## Operational steps

### scott users using Oracle

This time you are using the user scott in Oracle to create the table (or other users, of course), and in Oracle 19c the scott user needs to be created manually and can be unlocked by command using the sqlplus tool.

```sql
sqlplus / as sysdba
create user scott identified by tiger;
grant dba to scott;
```

This can then be accessed via the scott user login:

```sql
sqlplus scott/tiger
```

### Creating Oracle Test Data

To create the employees\_oracle table in Oracle:

```sql
create table employees_oracle(
  id number(5),
  name varchar(20)
);
--Insert sample data:
insert into employees_oracle values(1,'zhangsan');
insert into employees_oracle values(2,'lisi');
insert into employees_oracle values(3,'wangwu');
insert into employees_oracle values(4,'oracle');
-- In sqlplus, transactions are not committed by default without exiting, so you need to commit the transaction manually after inserting the data (or perform the insertion with a tool such as DBeaver)
COMMIT;
```

### Creating a MatrixOne Test Sheet

Since DataX can only synchronize data, not table structure, we need to manually create the table in the target database (MatrixOne) before we can perform the task.

```sql
CREATE TABLE `oracle_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ;
```

### Creating a Job Profile

The task configuration file in DataX is in json format and the built-in task configuration template can be viewed by the following command:

```python
python datax.py -r oraclereader -w matrixonewriter
```

Go to the datax/job path and write the job file oracle2mo.json according to the template

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 8
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "scott",
            "password": "tiger",
            "column": [
              '*'
            ],
            "connection": [
              {
                "table": [
                  "employees_oracle"
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@xx.xx.xx.xx:1521:ORCLCDB"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "writeMode": "insert",
            "username": "root",
            "password": "111",
            "column": [
              '*'
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                "table": [
                  "oracle_datax"
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

### Starting a datax job

```bash
python /opt/module/datax/bin/datax.py /opt/module/datax/job/oracle2mo.json
```

### Viewing Data in MatrixOne Tables

```sql
mysql> select * from oracle_datax;
+------+----------+
| id   | name     |
+------+----------+
|    1 | zhangsan |
|    2 | lisi     |
|    3 | wangwu   |
|    4 | oracle   |
+------+----------+
4 rows in set (0.00 sec)
```