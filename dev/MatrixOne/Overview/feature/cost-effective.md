# Cost-Effective

MatrixOne is a newly designed database, the architectural design philosophy emphasizing high-cost performance. The high cost-performance of MatrixOne is mainly reflected in the following aspects:

## Single Cluster Supports Mixed Load HTAP

With the rapid popularization and diversified development of big data applications, traditional data processing solutions are increasingly unable to meet the demand for real-time analysis of massive data. Modern data application requirements tend to consider both high-concurrent OLTP transactional business and large-scale data OLAP analytical business simultaneously.

MatrixOne is specifically designed to solve the problem of mixed loads. MatrixOne can support OLTP and OLAP in the same cluster, achieving Hybrid Transaction and Analytical Processing (HTAP). Users no longer need to build two separate database systems for OLTP and OLAP, a single database can support mixed loads. This avoids the cost of building and maintaining two systems and the ETL process of synchronizing data from the OLTP system to the OLAP system. Users can easily handle business and analysis in the same cluster.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/high-cost-performance/HTAP.png?raw=true)

## Single Storage Engine Achieves HTAP

In databases, achieving HTAP usually requires encapsulating an OLTP engine and an OLAP engine into a single database product. Although the conversion process between the two storage engines is hidden from the user, who only sees a unified SQL interface, the data is stored twice, once in each machine, and the cost of hardware and storage is not reduced.

Different from the engine mentioned above encapsulation method, MatrixOne achieves HTAP using a single storage engine. As shown below, MatrixOne achieves single-engine HTAP by grouping other computing nodes (CN) and distinguishing between load-running links. When a user's application request enters the MatrixOne cluster, the Proxy module distributes OLAP-like requests to the CN group designed explicitly for OLAP. These requests usually need to read or write data on a large scale and interact directly with object storage via the CN nodes. For OLTP-like requests, such as small amounts of `INSERT`, `UPDATE`, and `DELETE`, these go through another group of CN designed explicitly for OLTP, and the TN nodes handle transaction information and write shared logs to LogService. TN also constantly compresses and merges small transactional data from LogService and writes them back to object storage.

In summary, the data written into MatrixOne by users only exists once and is processed by a single storage engine, significantly reducing the cost of storage and computing hardware.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/high-cost-performance/HTAP-single-engine.png?raw=true)

## Flexible Resource Allocation Increases Utilization

The system primarily serves transactional business based on CRUD in actual data application business scenarios. However, at specific points in time, such as at night, at the end of the month, or at the end of the year, it is necessary to analyze the overall data over a period of time. At this time, if the user only has one database system, they will need to temporarily reduce the business load or conduct OLAP analytical tasks when the business load is low. However, in such cases, there are often problems like long analysis time and cannot affect the long running time of business. If users deploy a separate database system for OLAP analytical business, the actual analytical business is often difficult to maximize, leading to a specific waste of resources.

As introduced in the previous section, MatrixOne achieves HTAP by grouping stateless computing nodes and supporting OLTP and OLAP business at the underlying layer through different links. This architecture allows MatrixOne to adjust resources flexibly.

Allocation according to actual business needs increases machine utilization and achieves true cost-effectiveness.
When CRUD-type business requirements are high, you can allocate more CN nodes to OLTP. In addition, when analytical business requirements increase, you can give more CN nodes to OLAP. These adjustments are fully dynamic and configurable.

Take the following diagram as an example; suppose that the user needs 3 computing nodes to handle OLTP business and 3 computing nodes to handle OLAP business. And these hardware resources are fully bound, i.e., nodes serving OLTP cannot provide services for OLAP and vice versa. Moreover, users' planning for machine resources often exceeds the upper limit of actual demand. However, the time to reach the total peak demand is quite limited in real business. If you plan to use the MatrixOne cluster to support these businesses, you can adjust to 4 computing nodes; typically, 3 nodes handle OLTP business, and 1 node takes OLAP business. Then, at the end of the month or other periods when the demand for analysis is high, you can adjust to 1 computing node to handle the OLTP business and 3 computing nodes to run the OLAP business; after the peak period, you can return to the original configuration, thereby improving machine resource utilization by 40%.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/high-cost-performance/usage-optimize.png?raw=true)

## Efficient and Low-Cost Object Storage

At the storage level, MatrixOne mainly uses object storage. This storage uses the principle of erasure coding and only needs a redundancy as low as 33% to ensure the high availability of data. Compared with the standard method of providing high availability through multiple copies, erasure coding has a higher space utilization rate under the same reliability.

In the MatrixOne cluster, take the minimum configuration recommended by the official Minio for private deployment (4 nodes × 4 disks) as an example; MatrixOne can support at least 4 disks as erasure coding disks and 12 disks as data disk architecture, with redundancy of 1.33.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/high-cost-performance/erasure-code.png?raw=true)

In addition, object storage also supports low-cost storage media such as HDD disks. In usage scenarios where the demand for cluster computing performance is not high, and storage is the main focus, it can further reduce the usage cost.

## High data compression ratio brought by column storage

When structured data is stored, the data structure of each column is the same. In the MatrixOne storage layer, data is stored in column format. This feature gives the data better compression characteristics:

- Free compression algorithm: Each column is stored separately, and different columns can choose the most suitable compression algorithm for their data structure. These algorithms can use column data characteristics such as duplicate values, ordering, and data type-specific compression techniques to achieve better results. In contrast, the compression algorithms used by traditional row-store databases are often more general and fail to take full advantage of the characteristics of column data.
- High redundancy of intra-column data: Column storage databases store data in the same column together so that similar values ​​will be clustered together, resulting in higher redundancy, allowing the compression algorithm to more effectively identify and compress the same or Similar data items, thus improving the compression ratio.

The overall data compression rate of MatrixOne can be as low as 1%. The specific compression rate is affected by many factors, such as the data structure of the actual data and the degree of data redundancy.

MatrixOne's columnar storage method will significantly compress your actual storage space and greatly reduce your storage costs.

## Compatibility with MySQL

MatrixOne maintains compatibility with MySQL, the most popular open-source database on the market, regarding syntax, protocol, and ecological tools. This allows users familiar with MySQL or who have used MySQL to migrate and learn at a meager cost.

For detailed information on MatrixOne's compatibility with MySQL, please look at the [MySQL Compatibility Section](mysql-compatibility.md).
