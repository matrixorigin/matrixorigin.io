# HTAP

MatrixOne is a database capable of supporting Hybrid Transaction Analytical Processing (HTAP), aiming to provide a solution that fulfills all the requirements for transaction processing (TP) and analytical processing (AP) within a single database. With its decoupled architecture for storage and transaction computations, MatrixOne can support online transactions and real-time statistical analysis in the same data engine while providing an efficient resource isolation mechanism. This design dramatically preserves data freshness, eliminating the need for building real-time data warehouses in many business scenarios, thus helping customers realize their business value.

## Business Requirements

With the expansion of business scale, the continuous growth of data volume, and the increasing complexity of business systems, traditional online databases have to face the issue of splitting. However, the architecture after splitting cannot meet some needs for associated statistics and real-time analysis. At this time, products like real-time data warehouses come into play. However, due to the complex architecture and high cost of real-time data warehouses, not all enterprises can build a complete ecological link. MatrixOne's HTAP mode was born in response to this situation. It can use one engine to support high concurrent online throughput while providing real-time online analysis capability for massive data. This provides momentum for enterprises to improve efficiency and continuous innovation.

## Advantages

- **One-stop experience**: Satisfy all the needs for transaction processing (TP) and analytical processing (AP) within a single database, and users can enjoy a one-stop experience covering all TP and AP scenarios.
- **Simplified integration work**: Users using MatrixOne only need to do a small amount of integration work to achieve extensive use of TP and AP scenarios, especially significantly reducing the complex ETL work from TP database synchronization to AP database.
- **Cost-effective**: MatrixOne uses a single storage engine to implement HTAP; compared with traditional multi-engine solutions, users only need to maintain a set of clusters and store one set of data, which can significantly reduce hardware investment.

## Architecture

MatrixOne implements HTAP through modular storage, calculation, transaction architecture, a multi-level storage system, and load processing link isolation mode.

### Modular Separation of Storage, Computation, and Transaction

The overall technical architecture of MatrixOne adopts a separate architecture of storage and computation. The modular design separates the database's computation, storage, and transaction processing into independent modules, thus forming a database system with independent scalability for each component. As shown in the following figure, MatrixOne is composed of three independent layers:

 <div align="center">
  <img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch.png?raw=true width=80% heigth=80%/>
 </div>

- **Computation layer**, with Compute Node as the unit, realizes serverless computation and transaction processing. It has its Cache, supporting random restarts and scaling; multiple Compute Nodes can calculate parallel to improve query efficiency.
- **Transaction layer**, composed of Transaction Node and Log Service, provides complete log service and metadata information, with built-in Logtail for storing recently written new data.
- **Storage layer**, all data are saved in object storage represented by S3, which achieves low-cost, infinitely expandable storage method. Through a unified file operation service named File Service, it realizes the invisible operation of different nodes on the underlying storage.

### Multi-level Storage System

As illustrated in the previous section, the storage system of MatrixOne is composed of shared storage for all data, a small number of shared logs, and a stateless cache on the computing nodes.

- All data are stored in object storage, the primary storage for the entire database and the only location for data persistence. Object storage has the characteristics of being low-cost and nearly infinitely scalable.
- The LogService provides shared log services for saving state information of transactions such as writes/updates across the entire cluster. It is the only component in the entire cluster with a state. Therefore, LogService must ensure high availability through three nodes using the distributed Raft protocol. However, it only retains transaction logs for a certain period, which we call Longtail. After some time, there will be TN to help compress historical logs and store them in S3. Therefore, Logtail can maintain a very slim data size, generally a few GB.
- Each computing node CN has a cache. When a user queries for the first time, it will read related data from object storage and put it into the cache as hot data. When the customer queries the same content again, if the cache is hit, the query result will be returned to the user quickly. The technical feature of cold and hot data separation brought by the cache can refer to [Detailed Explanation of Data Caching and Cold-Hot Data Separation Architecture](../architecture/architecture-cold-hot-data-separation.md). In addition to reading data from object storage, CN nodes will also subscribe to Logtail data from LogService, and new updates in LogService will be pushed to CN immediately.

### Load Processing Link Isolation

#### Custom Load Isolation

User requests first enter the MatrixOne cluster and go through the Proxy module. Proxy is a module used to implement the grouping and isolation of computing nodes. This module groups computing nodes CN into several groups through configuration and uses tags to distinguish various tenants or loads, allowing users to set different CN groups to handle other businesses according to different business needs.

For specific operations of Proxy using CN groups, refer to [Manage CN Groups Using Proxy](../../Deploy/mgmt-cn-group-using-proxy.md).

#### Isolation of TP/AP Load Links

At the execution level, MatrixOne will route it to different processing links according to the request type, thus realizing the isolation of OLTP and OLAP. Below we will explain how to implement load isolation based on the processing methods of read and write requests.

##### Write Request Processing

 <div align="center">
  <img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/write.png?raw=true width=40% heigth=40%/>
 </div>

As shown in the figure, when processing write requests (INSERT/UPDATE/DELETE):

1. CN node will start a transaction and check whether there are primary key conflicts or other transaction-related issues in the write request. If so, it will return an error to the user directly.

2. Next, CN will decide on the operation link based on the data size of the write request. If the data size does not exceed the set threshold (usually 10MB), the CN node will send the data to the TN node. The TN node will perform operations like write conflict detection and transaction arbitration. After confirming no mistakes, these data will be written into LogService as logs to form Longtail.

3. The updated Logtail will be immediately pushed to the CN nodes that have subscribed to Logtail data for queries. If the data size exceeds the threshold, the CN node will directly write the data into object storage and send the commit information to TN. The TN node will perform operations like write conflict detection and transaction arbitration. After confirming no errors, the transaction will be committed.

From the figure above, it is known that small data volume OLTP-type write requests will go through the processing link from CN to TN and then to LogService, while large data volume write requests, such as Load, etc., will mainly go through CN to S3, and a small amount from CN to TN.

##### Read Request Processing

<div align="center">
  <img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/read.png?raw=true width=40% heigth=40%/>
 </div>

As shown in the figure, the CN node will first check the subscribed Logtail data when handling read requests. If the data directly hits Logtail, it is in the latest part of the written data and can be directly returned. If it does not hit Logtail, CN will check its cache and other visible CNs. If it hits the cache, it will directly return the result. If it does not hit the cache, CN will judge whether a large amount of data needs to be read through the execution plan. Multiple CN nodes will read in parallel from the object storage if it exceeds a certain threshold (such as 200 block sizes). A single CN node will read from object storage if it does not exceed the threshold.

As shown above, OLTP and OLAP read requests will go through the processing link from CN to S3. Through the isolation of CN nodes by Proxy, further isolation of CN can be achieved.

## Scenarios

Whether in finance, telecommunications, manufacturing, or emerging industries like the internet and technology, HTAP has many application scenarios.

For example, in the financial field, HTAP databases can meet the needs of high-speed transaction processing and real-time risk management, support high throughput and low latency requirements of financial transactions, and provide real-time data analysis functions to support decision-making and risk monitoring.

In the telecommunications industry, HTAP databases can be used for real-time billing and network optimization. They can handle much real-time data, track user communication and network activities, and support real-time analysis and intelligent decision-making to improve service quality, network performance, and user experience.

In the Internet of Things field, HTAP databases can be used for device management and real-time monitoring. They can handle many sensor data and device status information and provide real-time device monitoring and management functions. This is significant for real-time decision-making, remote fault diagnosis, and predictive maintenance of IoT systems.

### Real-time Financial Risk Control System

As a leading city commercial bank, a specific bank has a real-time risk control system for its credit card business. This system is mainly responsible for monitoring and evaluating credit card transactions, identifying transaction risks, and taking restrictive measures promptly.

The following table shows the core business requirements of this system and how MatrixOne's HTAP can meet these needs:

| Core Business Requirements                | Business Type                                   | HTAP Capabilities of MatrixOne                                                                                           |
| ----------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Real-time acquisition of transaction data | Fast and low-latency data writing               | MatrixOne can efficiently write massive amounts of data concurrently, further enhancing performance by expanding multiple CN nodes and object storage. |
| Offline calculation of a large amount of data indicators, analysis of user behavior and risk factors | Complex analytical queries, needing to process data at the TB level | MatrixOne can handle massive star and snowflake data analysis and parallel computation across multiple CN nodes can linearly enhance analytical capabilities. |
| Real-time analysis of transaction data, computation of risk indicators | Typical AP business, needing to calculate data results within a specified time | MatrixOne's parallel computing capabilities of multiple CN nodes can meet the calculation needs of large-scale data reports while providing fast data reading performance. |
| Facing frequent and drastic business fluctuations | Need for a flexible, scalable architecture to cope with large load fluctuations | MatrixOne's storage and calculation separation architecture has strong scalability. It can quickly scale up and down during business fluctuations to match business needs. |

### Telecommunications Business Management System

A specific company is a provincial telecommunications operator serving tens of millions of users, mainly providing telephone communication services, and needs to support the use and statistical analysis of many users.

The following table shows the core business scenarios of this system and how MatrixOne's HTAP can meet these needs:

| Core Business Scenarios                    | Business Type                           | MatrixOne's HTAP Solution                                                                      |
| ------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Query user call charge deposit status and real-time shutdown | High-concurrent short transactions, requiring low latency | MatrixOne has OLTP capabilities, and its distributed architecture across multiple CN nodes ensures stable performance under high concurrency while achieving load balancing. |
| Real-time account balance update after user recharge | High-concurrent short transactions, requiring low latency | MatrixOne's TP capabilities can meet the high-concurrent and low-latency TP requirements, and the distributed architecture across multiple CN nodes provides load balancing features. |
| Bulk adjustment of user packages and effect in the next month | Super large transaction, requiring high performance | MatrixOne can write directly to S3, avoiding contention in Logservice under high concurrency, thus achieving fast batch data writing. |
| Perform daily, weekly, monthly, quarterly, and annual statistics on user data | Typical AP business, needing to calculate data results within a specified time | MatrixOne's parallel computing capabilities of multiple CN nodes can meet the calculation needs of large-scale data reports while providing fast data reading performance. |

### Manufacturing Execution System

A specific company is an electronic product manufacturer with dozens of production lines for various consumer electronic products. Its Manufacturing Execution System (MES) must manage personnel, machines, materials, and processes on the production line and regularly analyze production efficiency and energy consumption issues.

The following table shows the core business scenarios of this system and how MatrixOne's HTAP can meet these needs:

| Core Business Scenarios            | Business Type                               | MatrixOne's HTAP Solution                                                                          |
| -----------------------------------| --------------------------------------------| ----------------------------------------------------------------------------------------------- |
| Manage production, warehousing, and quality | High-concurrent short transactions, requiring low latency | MatrixOne has OLTP capabilities, distributed across multiple CN nodes to ensure stable performance under high concurrency while achieving load balancing. |
| Real-time collection of a large amount of machine production data | High-concurrent multi-data type data writing | MatrixOne can efficiently write massive amounts of data concurrently, further enhancing performance by expanding multiple CN nodes and object storage. |
| Analysis of the origin of a large number of historical production records | Need for multidimensional query analysis of massive
