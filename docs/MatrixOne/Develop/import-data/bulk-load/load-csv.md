# Import the *.csv* data

This document will guide you on how to import large amounts of *.csv* format data to MatrixOne.

## Before you start

Make sure you have already [Deployed and Launched standalone MatrixOne](../../../Get-Started/install-standalone-matrixone.md).


## Using the `Load data` command in MySQL Client

You can use `Load Data` to import data from big data files. Currently, MatrixOne only supports `csv` format. A `csv`(comma-separated values) file is a delimited text file that uses a comma to separate values.

1. Before executing `Load Data` in MatrixOne, the table needs to be created in advance. For now, the data file is required to be at the same machine with MatrixOne server, a file transfer is necessary if they are in separate machines.


2. Launch the MySQL Client in the MatrixOne local server for accessing the local file system.

    ```
    mysql -h 127.0.0.1 -P 6001 -udump -p111
    ```

3. Execute `LOAD DATA` with the corresponding file path in MySQL client.

    ```
    mysql> LOAD DATA INFILE '/tmp/xxx.csv'
    INTO TABLE xxxxxx
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    ```

### Example using `Load data` with `docker` version

If you install MatrixOne by `docker`, the file system is inside the docker image by default. To work with local directory, you need to bind a local directory to the container. In the following example, the local file system path `~/tmp/docker_loaddata_demo/` is binded to the MatrixOne docker image, with a mapping to the `/ssb-dbgen-path` path inside the docker.
We will walk you through the whole process of loading data with MatrixOne 0.6.0 docker version in this example.

1. Download the dataset file and store the data in *~/tmp/docker_loaddata_demo/*:

    ```
    cd ~/tmp/docker_loaddata_demo/
    wget https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/lineorder_flat.tar.bz2
    ```

2. Unzip the dataset:

    ```
    tar -jxvf lineorder_flat.tar.bz2
    ```

3. Use Docker to launch MatrixOne, and mount the directory *~/tmp/docker_loaddata_demo/* that stores data files to a directory in the container. The container directory is */sb-dbgen-path* as an example:

    ```
    sudo docker run --name matrixone --privileged -d -p 6001:6001 -v ~/tmp/docker_loaddata_demo/:/ssb-dbgen-path:rw matrixorigin/matrixone:0.6.0
    ```

4. Connect to MatrixOne server:

    ```
    mysql -h 127.0.0.1 -P 6001 -udump -p111
    ```

5. Create *lineorder_flat* tables in MatrixOne, and import the dataset into MatriOne:

    ```
    mysql> create database if not exists ssb;
    mysql> use ssb;
    mysql> drop table if exists lineorder_flat;
    mysql> CREATE TABLE lineorder_flat(
      LO_ORDERKEY bigint key,
      LO_LINENUMBER int,
      LO_CUSTKEY int,
      LO_PARTKEY int,
      LO_SUPPKEY int,
      LO_ORDERDATE date,
      LO_ORDERPRIORITY char(15),
      LO_SHIPPRIORITY tinyint,
      LO_QUANTITY double,
      LO_EXTENDEDPRICE double,
      LO_ORDTOTALPRICE double,
      LO_DISCOUNT double,
      LO_REVENUE int unsigned,
      LO_SUPPLYCOST int unsigned,
      LO_TAX double,
      LO_COMMITDATE date,
      LO_SHIPMODE char(10),
      C_NAME varchar(25),
      C_ADDRESS varchar(25),
      C_CITY char(10),
      C_NATION char(15),
      C_REGION char(12),
      C_PHONE char(15),
      C_MKTSEGMENT char(10),
      S_NAME char(25),
      S_ADDRESS varchar(25),
      S_CITY char(10),
      S_NATION char(15),
      S_REGION char(12),
      S_PHONE char(15),
      P_NAME varchar(22),
      P_MFGR char(6),
      P_CATEGORY char(7),
      P_BRAND char(9),
      P_COLOR varchar(11),
      P_TYPE varchar(25),
      P_SIZE int,
      P_CONTAINER char(10)
    );
    mysql> load data infile '/ssb-dbgen-path/lineorder_flat.tbl' into table lineorder_flat FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';
    ```

6. After the import is successful, you can run SQL statements to check the rows of imported data:

    ```
    select count(*) from lineorder_flat;
    /*
        expected results:
     */
    +----------+
    | count(*) |
    +----------+
    | 10272594 |
    +----------+
    ```
