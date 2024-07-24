# mo_ts_perf_test Tool Guide

`mo_ts_perf_test` is a timed write and query test tool for MatrixOne.

!!! Note
    The `mo_ts_perf_test` tool is currently only supported for deployment on Linux system x86 architectures.

## Pre-dependency

- Finished [installing and starting](../../Get-Started/install-standalone-matrixone.md) MatrixOne.
- Installed wget

## Install mo_ts_perf_test

```bash
wget https://github.com/matrixorigin/mo_ts_perf_test/archive/refs/tags/v1.0.1.zip unzip v1.0.1.zip 
```

## Configuration

Modify the db.conf configuration file in the matrixone/conf directory as appropriate

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.0/matrixone/conf# cat db.conf 
[dbInfo]
host = 127.0.0.1
port = 6001
user = root
password = 111
tablePrefix = d
point_query_ts_condition = '2017-07-14 10:40:06.379'
loadFilePath = /root/soft/perf/
```

**Configuration instructions:**

- tablePrefix: When writing to multiple tables for lookup, the prefix of the table name, for example, with a value of d, will automatically create three tables: d0, d1, d2;
- point_query_ts_condition: Filter criteria value for the ts field when querying for points;
- loadFilePath: When importing for load data infile, the directory where the local csv file is to be imported; note: the loadFilePath path must be local to the MO database, that is: the csv file is to be placed on the server where the MO database is located.

## Perform write tests with mo-write

mo-write is the MO write test tool with the command:

```bash
mo-write -T -r -n -retry -mode -txc -tType -wType -wType
```

!!! note
    All writes are to tables under the test database, single-table writes are to d0 tables, multi-table writes are to d0, d1, d2, and so on (the number is determined by the client data).

**Parameter description**

- -T: Indicates the number of clients writing concurrently, which defaults to 7;
- -r: Indicates the number of data rows submitted per write, default 10000;
- -n: Indicates the total number of data rows to import per client, default 500,000;
- -retry: Indicates the number of tests (eventually the average write speed is calculated automatically), default 1;
- -mode: Indicates write mode, single for single table writes, multi for multi table writes, default multi;
- -txc: Indicates the number of writes per transaction commit, value >=0, default 0 (0 means no transactions open);
- -tType: Indicates the type of table written to, ts, tsPK, intPK, respectively, default ts, ts for a time series table without a primary key, tsPK for a time series table with a primary key, and intPK for a normal table with a primary key of type int;
- -wType: Indicates the type of write, divided into insert, loadLine, loadFile, insert denotes insert into values for writing data, loadLine denotes load data inline for writing, and loadFile denotes load data infile for importing into a local csv file (local csv data file fetch: can be automatically generated in its parent data directory via sr-write).

### Examples

- **Example 1**

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.0/matrixone/mo-write# ./mo-write 
r=10000, T=7, n=500000, mode=multi, retry=1, txc=0, tType=ts, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:7
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
db connection[6] created.
db connection[7] created.
mo-data of all clinet(7 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:7.255468 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:7.405524 s
1 test: 3500000/7.405524 = 472620.159086 records/second
======== avg test: 472620.159086/1 = 472620.159086 records/second txc=0 ===========
```

- **Example 2**

Each of the 2 clients uses insert into to write 100,000 pieces of data to a time series table (d0) with a primary key:

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 2 -n 100000 -mode single -tType tsPK -wType insert
r=10000, T=2, n=100000, mode=single, retry=1, txc=0, tType=tsPK, wType=insert 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:2
db connection[1] created.
db connection[2] created.
mo-data of all clinet(2 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:0.819425 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:11.388648 s
1 test: 200000/11.388648 = 17561.347089 records/second
======== avg test: 17561.347089/1 = 17561.347089 records/second txc=0 ===========
```

- **Example 3**

1 client tests a set of data by writing 500,000 pieces of data to a normal table (d0) with a primary key of type int using load data inline:

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 1 -tType=intPK -retry 1
r=10000, T=1, n=500000, mode=multi, retry=1, txc=0, tType=intPK, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:1
db connection[1] created.
mo-data of all clinet(1 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:1.583363 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:5.062582 s
1 test: 500000/5.062582 = 98763.826906 records/second
======== avg test: 98763.826906/1 = 98763.826906 records/second txc=0 ===========
```

- **Example 4**

Using load data inline, 8 clients write 500,000 pieces of data to a time series table (d0......d7) without a primary key via a transaction commit (10 writes per commit), automatically testing 3 groups for averaging:

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 8 -txc 10 -retry 3
r=10000, T=8, n=500000, mode=multi, retry=3, txc=10, tType=ts, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:8
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
db connection[6] created.
db connection[7] created.
db connection[8] created.
mo-data of all clinet(8 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:7.854798 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=10 

start test 1 …….
开始事务提交写入, 一次事务提交的写入: 10
spend time:9.482012 s
1 test: 4000000/9.482012 = 421851.388088 records/second
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第2次测试, txc=10 

start test 2 …….
tables has truncated and start insert data ……
开始事务提交写入, 一次事务提交的写入: 10
spend time:10.227261 s
2 test: 4000000/10.227261 = 391111.576833 records/second
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第3次测试, txc=10 

start test 3 …….
tables has truncated and start insert data ……
开始事务提交写入, 一次事务提交的写入: 10
spend time:8.994586 s
3 test: 4000000/8.994586 = 444711.979564 records/second
======== avg test: 1257674.944485/3 = 419224.981495 records/second txc=10 ===========
```

## Perform query testing with mo-query

mo-query is a query testing tool that tests the time of queries such as select \*, point queries, common aggregate queries, time windows, etc. All queries query only the table d0 in the test library. The command is:

```bash
mo-query -T 
```

**Parameter description**

**-T:** Indicates the number of clients executing select * queries concurrently. Defaults to 1.

### Examples

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-query# ./mo-query -T 5
T=5 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:5
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
mo all clinet(5 thread) has ready!

 count value is:200000
'count(*)' query spend time:0.062345 s

'select *' (5 client concurrent query) spend time:0.850350 s
query speed: 1000000/0.850350 = 1175985.806764 records/second

 point query sql: select * from test.d0 where ts='2017-07-14 10:40:06.379'
'point query' spend time:0.001589 s

 avg value is: 0.07560730761790913
'avg(current)' query spend time:0.026116 s

 sum value is: 15121.461523581824
'sum(current)' query spend time:0.023109 s

 max value is: 3.9999022
'max(current)' query spend time:0.054021 s

 min value is: -3.9999993
'min(current)' query spend time:0.035809 s

TimeWindow query sql:select _wstart, _wend, max(current), min(current) from d0 interval(ts, 60, minute) sliding(60, minute)
2017-07-14 02:00:00 +0000 UTC 2017-07-14 03:00:00 +0000 UTC 3.9999022 -3.9999993
TimeWindow query spend time:0.180333 s
```