# **Complete a TPC-C Test with MatrixOne**

By walking through this tutorial, you'll learn how to complete a TPC-C Test with MatrixOne.

## **TPC-C Overview**

TPC-C is an industry-standard benchmark for OLTP databases. TPC-C models a warehouse-centric order processing application, and the database used in the TPC-C benchmark consists of nine tables, such as Warehouse, Customer, Order, Item, and so on (See the below ER diagram). Except for the item table, each record is populated on a per-warehouse basis, and the number of warehouses can be configurable as a scale factor.

![TPCC diagram](https://miro.medium.com/max/1400/1*oZOCQB2c84bVxOqbCW1Fsw.webp)

TPC-C has five transaction types: NewOrder, Payment, OrderStatus, Delivery, and StockLevel. The request rate of each transaction is defined in the specification, and almost 90% of transactions are NewOrder and Payment, which are write-intensive. TPC-C transactions mostly access a single (local) warehouse, but about 10% of transactions interact with another (remote) warehouse.

## **Before you start**

Make sure you have already [Deployed standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

### Clone mo-tpcc repository

```
git clone https://github.com/matrixorigin/mo-tpcc.git
```

## Steps

### Introduction

This section will teach you how to generate the TPCC data, create TPCC tables, load data to MatrixOne, and run TPCC.

Now you can execute commands step by step as the following descriptions.

### 1. Configure the *props.mo* file

After the mo-tpcc repository is cloned, open the *mo-tpcc* directory, and modify the configuration items of the *props.mo* file. The number of warehouses
can be configurable by the `warehouse=XX` row in this file.

```
db=mo
driver=com.mysql.cj.jdbc.Driver
conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
user=root
password=111

//the number of warehouse
warehouses=10
loadWorkers=4

//the num of terminals that will simultaneously run
//must be less than warehouses*10
terminals=1
//To run specified transactions per terminal- runMins must equal zero
runTxnsPerTerminal=0
//To run for specified minutes- runTxnsPerTerminal must equal zero
runMins=1
//Number of total transactions per minute
limitTxnsPerMin=0
```

After the modifications are complete, save the *props.mo* file.

### 2. Create TPCC database and tables

Open a new terminal window, execute the following command:

```
cd mo-tpcc
./runSQL.sh props.mo tableCreates
```

__Npte__: If you get an error like `java:command not found` while running `./runSQL.sh props.mo tableCreates`, install or reinstall Java and the JDK on your computer.

The above code means to enter the *mo-tpcc* directory and create the TPCC database and table.

The following is an example of the command output:

```
# ------------------------------------------------------------
# Loading SQL file ./sql/tableCreates.sql
# ------------------------------------------------------------
drop database if exists tpcc;
create database if not exists tpcc;
use tpcc;
create table bmsql_config (
cfg_name    varchar(30) primary key,
cfg_value   varchar(50)
);
create table bmsql_warehouse (
w_id        integer   not null,
w_ytd       decimal(12,2),
w_tax       decimal(4,4),
w_name      varchar(10),
w_street_1  varchar(20),
w_street_2  varchar(20),
w_city      varchar(20),
w_state     char(2),
w_zip       char(9),
primary key (w_id)
) PARTITION BY KEY(w_id);
create table bmsql_district (
d_w_id       integer       not null,
d_id         integer       not null,
d_ytd        decimal(12,2),
d_tax        decimal(4,4),
d_next_o_id  integer,
d_name       varchar(10),
d_street_1   varchar(20),
d_street_2   varchar(20),
d_city       varchar(20),
d_state      char(2),
d_zip        char(9),
primary key (d_w_id, d_id)
) PARTITION BY KEY(d_w_id);
create table bmsql_customer (
c_w_id         integer        not null,
c_d_id         integer        not null,
c_id           integer        not null,
c_discount     decimal(4,4),
c_credit       char(2),
c_last         varchar(16),
c_first        varchar(16),
c_credit_lim   decimal(12,2),
c_balance      decimal(12,2),
c_ytd_payment  decimal(12,2),
c_payment_cnt  integer,
c_delivery_cnt integer,
c_street_1     varchar(20),
c_street_2     varchar(20),
c_city         varchar(20),
c_state        char(2),
c_zip          char(9),
c_phone        char(16),
c_since        timestamp,
c_middle       char(2),
c_data         varchar(500),
primary key (c_w_id, c_d_id, c_id)
) PARTITION BY KEY(c_w_id);
create table bmsql_history (
hist_id  integer auto_increment,
h_c_id   integer,
h_c_d_id integer,
h_c_w_id integer,
h_d_id   integer,
h_w_id   integer,
h_date   timestamp,
h_amount decimal(6,2),
h_data   varchar(24),
primary key (hist_id)
);
create table bmsql_new_order (
no_w_id  integer   not null,
no_d_id  integer   not null,
no_o_id  integer   not null,
primary key (no_w_id, no_d_id, no_o_id)
) PARTITION BY KEY(no_w_id);
create table bmsql_oorder (
o_w_id       integer      not null,
o_d_id       integer      not null,
o_id         integer      not null,
o_c_id       integer,
o_carrier_id integer,
o_ol_cnt     integer,
o_all_local  integer,
o_entry_d    timestamp,
primary key (o_w_id, o_d_id, o_id)
) PARTITION BY KEY(o_w_id);
create table bmsql_order_line (
ol_w_id         integer   not null,
ol_d_id         integer   not null,
ol_o_id         integer   not null,
ol_number       integer   not null,
ol_i_id         integer   not null,
ol_delivery_d   timestamp,
ol_amount       decimal(6,2),
ol_supply_w_id  integer,
ol_quantity     integer,
ol_dist_info    char(24),
primary key (ol_w_id, ol_d_id, ol_o_id, ol_number)
) PARTITION BY KEY(ol_w_id);
create table bmsql_item (
i_id     integer      not null,
i_name   varchar(24),
i_price  decimal(5,2),
i_data   varchar(50),
i_im_id  integer,
primary key (i_id)
) PARTITION BY KEY(i_id);
create table bmsql_stock (
s_w_id       integer       not null,
s_i_id       integer       not null,
s_quantity   integer,
s_ytd        integer,
s_order_cnt  integer,
s_remote_cnt integer,
s_data       varchar(50),
s_dist_01    char(24),
s_dist_02    char(24),
s_dist_03    char(24),
s_dist_04    char(24),
s_dist_05    char(24),
s_dist_06    char(24),
s_dist_07    char(24),
s_dist_08    char(24),
s_dist_09    char(24),
s_dist_10    char(24),
primary key (s_w_id, s_i_id)
) PARTITION BY KEY(s_w_id);
```

### 3. Generate TPCC data

To generate the TPCC data execute the following command:

```
./runLoader.sh props.mo filelocation /yourpath/
```

The following is an example of the command output:

```
Starting BenchmarkSQL LoadData

props.mo
driver=com.mysql.cj.jdbc.Driver
conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
user=root
password=***********
warehouses=10
loadWorkers=4
fileLocation (not defined)
csvNullValue (not defined - using default '')

Worker 000: Loading ITEM
Worker 001: Loading Warehouse      1
Worker 002: Loading Warehouse      2
Worker 003: Loading Warehouse      3
Worker 000: Loading ITEM done
Worker 000: Loading Warehouse      4
Worker 003: Loading Warehouse      3 done
Worker 003: Loading Warehouse      5
Worker 001: Loading Warehouse      1 done
Worker 001: Loading Warehouse      6
Worker 002: Loading Warehouse      2 done
Worker 002: Loading Warehouse      7
Worker 000: Loading Warehouse      4 done
Worker 000: Loading Warehouse      8
Worker 003: Loading Warehouse      5 done
Worker 003: Loading Warehouse      9
Worker 000: Loading Warehouse      8 done
Worker 000: Loading Warehouse     10
Worker 002: Loading Warehouse      7 done
Worker 001: Loading Warehouse      6 done
Worker 000: Loading Warehouse     10 done
Worker 003: Loading Warehouse      9 done
```

You will find in your designated path 10 csv files. Each csv file maps to a table created in the second step.

```
config.csv
cust-hist.csv
customer.csv
district.csv
item.csv
new-order.csv
order-line.csv
order.csv
stock.csv
warehouse.csv
```

### 4. Load TPCC data to MatrixOne

Use MySQL client to connect to MatrixOne and execute the following statements to load the csv files into MatrixOne.

```
mysql> load data infile '/yourpath/config.csv' INTO TABLE bmsql_config FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/cust-hist.csv' INTO TABLE bmsql_history FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/data/customer.csv' INTO TABLE bmsql_customer FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/data/district.csv' INTO TABLE bmsql_district FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/data/warehouse.csv' INTO TABLE bmsql_warehouse FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/item.csv' INTO TABLE bmsql_item FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/new-order.csv' INTO TABLE bmsql_new_order FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/order-line.csv' INTO TABLE bmsql_order_line FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/stock.csv' INTO TABLE bmsql_stock FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
load data infile '/yourpath/order.csv' INTO TABLE bmsql_oorder FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";

```

### 5. Run TPCC test

To run the TPCC test, execute the following command:

```
./runBenchmark.sh props.mo
```

The following is an example of the command output:

```
.:./lib/*
2022-12-22 21:15:35 INFO  jTPCC:78 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:79 - Term-00, +-------------------------------------------------------------+
2022-12-22 21:15:35 INFO  jTPCC:80 - Term-00,      BenchmarkSQL v5.0
2022-12-22 21:15:35 INFO  jTPCC:81 - Term-00, +-------------------------------------------------------------+
2022-12-22 21:15:35 INFO  jTPCC:82 - Term-00,  (c) 2003, Raul Barbosa
2022-12-22 21:15:35 INFO  jTPCC:83 - Term-00,  (c) 2004-2016, Denis Lussier
2022-12-22 21:15:35 INFO  jTPCC:84 - Term-00,  (c) 2016, Jan Wieck
2022-12-22 21:15:35 INFO  jTPCC:85 - Term-00, +-------------------------------------------------------------+
2022-12-22 21:15:35 INFO  jTPCC:86 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, db=mo
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, driver=com.mysql.cj.jdbc.Driver
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, user=root
2022-12-22 21:15:35 INFO  jTPCC:93 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, warehouses=10
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, terminals=1
2022-12-22 21:15:35 INFO  jTPCC:100 - Term-00, runMins=1
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, limitTxnsPerMin=0
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, terminalWarehouseFixed=false
2022-12-22 21:15:35 INFO  jTPCC:108 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, newOrderWeight=45
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, paymentWeight=43
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, orderStatusWeight=4
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, deliveryWeight=4
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, stockLevelWeight=4
2022-12-22 21:15:35 INFO  jTPCC:115 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, resultDirectory=my_result_%tY-%tm-%td_%tH%tM%tS
2022-12-22 21:15:35 INFO  jTPCC:63 - Term-00, osCollectorScript=null
2022-12-22 21:15:35 INFO  jTPCC:119 - Term-00,
2022-12-22 21:15:35 INFO  jTPCC:710 - Term-00, Loading database driver: 'com.mysql.cj.jdbc.Driver'...
2022-12-22 21:15:35 INFO  jTPCC:219 - Term-00, copied props.mo to my_result_2022-12-22_211535/run.properties
2022-12-22 21:15:35 INFO  jTPCC:239 - Term-00, created my_result_2022-12-22_211535/data/runInfo.csv for runID 1
2022-12-22 21:15:35 INFO  jTPCC:255 - Term-00, writing per transaction results to my_result_2022-12-22_211535/data/result.csv
2022-12-22 21:15:35 INFO  jTPCC:268 - Term-00,
2022-12-22 21:15:36 INFO  jTPCC:324 - Term-00, C value for C_LAST during load: 28
2022-12-22 21:15:36 INFO  jTPCC:325 - Term-00, C value for C_LAST this run:    132
2022-12-22 21:15:36 INFO  jTPCC:326 - Term-00,
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Session started!   Memory Usage: 17MB / 245MB          
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Creating 1 terminal(s) with -1 transaction(s) per terminal...
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Terminal Warehouse is NOT fixed
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Transaction Weights: 45% New-Order, 43% Payment, 4% Order-Status, 4% Delivery, 4% Stock-Level
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Number of Terminals      1
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Creating database connection for Term-01...
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Term-01  7
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Transaction      Weight
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, % New-Order      45
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, % Payment        43
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, % Order-Status   4
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, % Delivery       4
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, % Stock-Level    4
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Transaction Number       Terminal        Type    Execution Time (ms)             Comment
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Created 1 terminal(s) successfully!
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, Starting all terminals...
2022-12-22 21:15:36 INFO  jTPCC:710 - Term-00, All terminals started executing 2022-12-22 21:15:36
Term-00, Running Average tpmTOTAL: 60000.00    Current tpmTOTAL: 12    Memory Usage: 19MB / 245MB   2022-12-22 21:15:36 INFO  jTPCCTerminal:350 - Term-01, Executing for a limited time...
2022-12-22 21:16:42 INFO  jTPCC:710 - Term-00, The time limit has been reached.: 21MB / 245MB          
2022-12-22 21:16:42 INFO  jTPCC:710 - Term-00, Signalling all terminals to stop...
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01,
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01, Terminal received stop signal!
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01, Finishing current transaction before exit...
2022-12-22 21:16:42 INFO  jTPCC:710 - Term-00, Waiting for all active transactions to end...
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01, OTAL: 24    Memory Usage: 22MB / 245MB          
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01, Closing statement and connection...
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01,
2022-12-22 21:16:42 INFO  jTPCCTerminal:350 - Term-01, Terminal 'Term-01' finished after 0 transaction(s).
2022-12-22 21:16:42 INFO  jTPCC:710 - Term-00, All terminals finished executing 2022-12-22 21:16:42

2022-12-22 21:16:42 INFO  jTPCC:694 - Term-00,
2022-12-22 21:16:42 INFO  jTPCC:695 - Term-00,
2022-12-22 21:16:42 INFO  jTPCC:696 - Term-00, Measured tpmC (NewOrders) = 2.74
2022-12-22 21:16:42 INFO  jTPCC:697 - Term-00, Measured tpmTOTAL = 3.66
2022-12-22 21:16:42 INFO  jTPCC:698 - Term-00, Measured tpmE (ErrorCount) = 0.0
2022-12-22 21:16:42 INFO  jTPCC:699 - Term-00, Session Start     = 2022-12-22 21:15:36
2022-12-22 21:16:42 INFO  jTPCC:700 - Term-00, Session End       = 2022-12-22 21:16:42
2022-12-22 21:16:42 INFO  jTPCC:701 - Term-00, Transaction Count = 3
2022-12-22 21:16:42 INFO  jTPCC:702 - Term-00, Transaction Error = 0
2022-12-22 21:16:42 INFO  jTPCC:703 - Term-00, Transaction NewOrders = 3
2022-12-22 21:16:42 INFO  jTPCC:710 - Term-00, Session finished!
```

The value of tpmC(transactions per minute) is given in the result.
