# HTAP of MatrixOne

MatrixOne database redefines the concept of HTAP database and aims to provide users with all the needs of Transaction Processing (TP) and Analytical Processing (AP) within a single database.

## Functional advantages

- **One-stop experience**: Meet all the needs of transaction processing (TP) and analytical processing (AP) in a single database, and users can get a one-stop experience covering the entire TP and AP scenarios.
- **Simplified integration work**: Users only need a small amount of integration work to use MatrixOne to realize comprehensive TP and AP scenarios.
- **Get rid of restrictions**: Users can eliminate the bloated architecture and various limits of traditional big data platforms and improve data processing efficiency and flexibility.

## Architecture Advantages

### Traditional architecture

#### Row storage architecture to database memory architecture

In the row storage architecture, data is stored as rows, and all columns in the record can be quickly accessed. However, this architecture has inherent disadvantages for queries and limits OLAP performance. The row store architecture was transformed into a database in-memory architecture to solve these problems.

The database memory architecture allows data in the buffer cache as rows. It can also fill the In-Memory Column Store in columns, significantly improving query performance. When an SQL request comes in, the optimizer will automatically send OLTP requests to the row storage memory area and send OLAP requests to the column storage memory area. This optimization saves application developers and DBAs additional operations while enabling the reading of different storage formats.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/oracle-htap-arch.png?raw=true)

While the advantages of this architecture are clear, there are also some disadvantages. For example, manual intervention with In-Memory lists is required, which increases memory overhead.

#### Columnstore index architecture

Columnstore indexes are nonclustered columnstore indexes similar to rowstores, which can significantly improve write performance. This index is established on the column storage table and stored as column storage from the bottom layer, which can meet both OLTP and OLAP scenarios.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/sqlserver-htap-arch.png?raw=true)

Although the advantages of columnstore indexes are apparent, creating non-clustered columnstore indexes on columnstore index tables requires more storage to hold copies of data, which increases storage overhead.

#### HeateWave plugin

The HeateWave plugin's memory-based column storage management can significantly improve query performance. In the database cluster, installing the plug-in HeateWave can put the data into the memory of the HeateWave cluster and save it as column storage. By controlling the total memory number of HeateWave nodes, the total amount of data stored in memory can be adjusted.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mysql-htap-arch.png?raw=true)

However, as the amount of data increases, the hardware resources required by HeateWave will also increase accordingly. In addition, HeateWave nodes need to re-read data after the database service is restarted, which is also a disadvantage.

### MatrixOne Architecture

MatrixOne provides three solutions to support HTAP scenario isolation: columnar storage provided by the storage layer, isolation of computing resources between computing nodes, and conversion of raw data, resulting in data through streaming and materialized views.

#### Columnar storage

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-1.png?raw=true)

TAE is the storage engine of MatrixOne, which can support TP and AP capabilities at the same time, and supports a cloud-native distributed architecture that separates storage and computing. TAE stores data in the form of tables, and the data of each table is organized into an LSM tree, including L0, L1, and L2. L0 is small enough to reside entirely in memory, while L1 and L2 reside on the hard disk. The smallest IO unit of TAE is the column block, organized according to a fixed number of rows.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-2.png?raw=true)

MatrixOne will introduce the concept of Column Family in version 0.9, and TAE can achieve flexible load adaptation. Users can easily switch between row and column storage; specify it in the DDL table definition. If all columns are a Column Family, that is, all column data is stored together, then it can exhibit similar behavior of row storage; if each column is an independent Column Family, that is, each column is held independently, then it is typical column storage. This flexible design enables TAE to support different loads and provide better performance and flexibility.

#### Resource Isolation

In addition to MatrixOne's columnar storage engine TAE, the distributed computing node CN can also realize the isolation of computing resources by configuring CN Label. In this way, SQL requests that require TP and AP resources can be assigned to different CNs for execution, achieving complete isolation of computing resources.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-3.png?raw=true)

Different SQL requests can be assigned to other CN Label groups by configuring CN Label, thereby completely isolating AP and TP requests from the computing resource level. By configuring policies, resources can be dynamically divided in the future, and computing resources can be allocated to the most needed business scenarios.

#### Materialized Views

The MatrixOne engine has two data storage methods: base table (Base Table) and materialized view (Materialized View).

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-4.png?raw=true)

The base table is a table that stores data in a relational database. It is the source of data and the basis of other tables. The base table includes multiple rows of records, each row represents an entity or object, and each column represents an attribute of the entity. The base table is the most basic data storage structure in the database.

Unlike ordinary views, a materialized view is an actual table that contains a snapshot of the base table data rather than query results based on the base table. In contrast, a materialized view is a calculated and stored view in the database that includes data from one or more base tables. Materialized views can improve query performance while reducing access pressure on base tables by avoiding the need to recalculate each query.

## Scenarios

HATP is widely used and pivotal in finance, communications, manufacturing, and emerging industries such as the Internet and big data. The following is a typical HTAP application scenario.

### Typical Scenario

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/scenario.png?raw=true)

A certain enterprise is a provincial-level telecommunications operator, serving tens of millions of users, and its main business is telephone communication.

|Main Business Scenario|Business Type|MatrixOne Solution|
|---|---|---|
|Query the user's payment status and shut down in real time|High concurrency and short transactions require low latency|The Column Family feature provided by MatrixOne's storage engine TAE, as well as distributed multi-CN nodes, can ensure stable performance under high concurrency, and realize Load balancing to prevent a certain CN node from becoming a hotspot. |
|Accept user recharge and update the account balance in real-time |High concurrency and short transactions require low latency|MatrixOne's storage engine TAE can meet the high concurrency and low latency TP requirements and simultaneously provide the load balancing feature of distributed multi-CN nodes. |
|Adjust user plans in batches and take effect next month|Ultra-large transactions require high performance|MatrixOne's storage engine TAE provides the feature of directly writing to S3, avoiding the contention of Logservice under high concurrency, and realizing fast batch data writing. |
|Daily, weekly, monthly, quarterly, and annual user data statistics|Typical AP business needs to calculate data results within a specified time|MatrixOne's columnar storage and multi-CN parallel computing can meet the calculation of large-scale data reports requirements while providing fast data read performance. |
|Real-time update of current equipment and base station business load conditions|Real-time query requires real-time presentation of results|Realize fast data reading and real-time update through materialized views and stream engines based on multiple base tables. |
