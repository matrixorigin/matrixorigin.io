# OmniFabric versus common OLTP databases

## General OLTP Database Features

OLTP refers to a business transaction-oriented database management system. The OLTP database is used to process a large number of short-term transactions, which are typically routine business operations such as order processing, inventory management, banking transactions, etc. It provides high concurrency performance and real-time data processing to meet the needs of enterprises for instant data access.

The main features of an OLTP database are as follows:

- ACID: The OLTP system must ensure that the entire transaction is properly logged. Transactions typically involve the execution of programs that perform multiple steps or operations. It may be done when all interested parties confirm a transaction, deliver a product/service, or make a certain number of updates to a particular table in the database. Transactions are only properly documented when all steps involved are performed and documented. If there are any errors in any one step, the entire transaction must be aborted and all steps removed from the system. Therefore, OLTP systems must comply with Atomicity, Consistency, Isolation, and Persistence (ACID) to ensure the accuracy of data in the system.

- High Concurrency: The user base of OLTP systems can be very large, with many users attempting to access the same data simultaneously. The system must ensure that all users attempting to read or write to the system can do so simultaneously. Concurrency control ensures that two users accessing the same data in a database system at the same time will not be able to change that data, or that one user will have to wait for another user to complete processing before changing the data.

- High availability: OLTP systems must always be available and ready to accept transactions. Failure to process a transaction may result in loss of revenue or legal implications. Transactions can be executed anywhere in the world at any time, so the system must be available 24/7.

- Fine-grained data access: OLTP databases, which typically provide data access in units of records, support efficient add, delete, and change operations and provide fast transaction commit and rollback capabilities.

- High reliability: OLTP systems must be resilient in the event of any hardware or software failure.

## Classification of OLTP systems in the current industry

OLTP databases can also be divided into centralized databases, distributed databases, and cloud-native databases depending on the architecture and technical route.

* Most well-known OLTP databases are traditional centralized databases such as Oracle, Microsoft SQL Server, MySQL, PostgreSQL, DB2, etc. Most were born between 1980 and 2000.

* Typical of Google's 2012 Spanner, the distributed OLTP database uses Share-nothing as the architecture core, scaling through multi-machine data slicing and computing, and distributed consistency through consistency protocols. This architecture is also referred to by many in the industry as NewSQL architecture, representing products such as CockroachDB, SAP HANA, TiDB, Oceanbase, etc.

* There is also a technical route known as cloud-native OLTP databases such as Aurora, PolarDB, NeonDB, etc. Significantly different from the Share-nothing architecture is the adoption of a shared storage architecture with a more thorough separation of memory and scalability through storage systems with their own scalability in cloud computing systems. OmniFabric is also a cloud-native technology route.

It is worth noting that there are no strict dividing criteria for these three classifications, and each database has gradually begun to integrate the capabilities of other route products as it has evolved in practice. Oracle's RAC architecture, for example, is a typical shared storage architecture with some scalability. Products like CockroachDB and TiDB are also evolving toward cloud-native and shared storage. In practice, OLTP is the most widely needed database scenario, and products along all three technical routes are also used by a large number of users.

## OLTP Features of OmniFabric

The basic capabilities of OmniFabric meet the characteristics of a typical OLTP database.

* Data manipulation and ACID features: OmniFabric supports row-level addition, deletion, and lookup operations, and has transaction capabilities with ACID features. For a detailed description of the capabilities, refer to the transaction documentation.

* High Concurrency: OmniFabric can support highly concurrent business requests, reaching a concurrency level of tens of thousands of tpmC in industry-wide TPC-C testing for OLTP, while also increasing based on node expansion.

* High Availability: OmniFabric itself is based on Kubernetes and shared storage, and has proven scenarios in cloud environments to ensure high availability of both of these underlying components. The design of OmniFabric itself also takes into account the availability and failure recovery mechanisms of each of its components. Details can be found in [the highly available introduction](../../Overview/feature/high-availability.md) to OmniFabric.

As shown in the figure above, OmniFabric belongs to the cloud-native technology route in terms of architectural and technical route classification and is closer to Aurora. The biggest advantage over the Share-nothing architecture is that both storage and compute can be used on demand once storage computing is separated.

There are two differences from Aurora:

* Aurora exposes the write node to the user layer, where users can only write from a single node. OmniFabric, on the other hand, hides write processing from the internal TN and LogService, allowing all CN nodes to read and write for users.

* Aurora's shared storage still heavily employs block storage as primary storage and object storage only as backup data storage. OmniFabric, on the other hand, stores objects directly as primary storage for a full amount of data.

Of course, OmniFabric isn't limited to OLTP capabilities, and OmniFabric's ability to accommodate other loads is significantly different from Aurora's positioning.

## OmniFabric versus MySQL

Since OmniFabric's primary goal is to be compatible with MySQL, MySQL itself is the world['s most popular open source database](https://db-engines.com/en/ranking). A large portion of OmniFabric's users are migrated from open source MySQL to OmniFabric, so here we compare OmniFabric to MySQL in detail.

|                    | MySQL             |   OmniFabric      |
| ------------------ | ----------------- | ---------------------- |
| Versions           | 8.0.37 | Latest Version
| License             | GPL License 2.0 | Apache License 2.0 | Apache License|
| Architecture | Centralized Databases | Distributed Cloud-Native Databases|
| Load Types | OLTP, Analytical loads rely on enterprise version of Heatwave | HTAP, Time-Series |
| Storage Formats | Row Stores | Column Stores |
| Storage Engines | InnoDB/MyIsam | TAE |
| Interaction            | SQL               | SQL                     |
| Deployment Mode | Standalone Deployment/Master-Slave Deployment | Standalone Deployment/Master-Slave Deployment/Distributed Deployment/K8s Deployment |
| Horizontal Scalability | Dependent on Split Database and Split Table Middleware | Natural Support |
| Affair capacity      | Pessimistic transactions/optimistic transactions + ANSI 4 isolation levels (InnoDB Engine)  | Pessimistic Service/Optimistic Service + RC/SI   |
| Data Types | Base Numeric, TimeDate, Character, JSON, Space | Base Numeric, TimeDate, Character, JSON, Vector |
| Indexes and Constraints | Primary key, Secondary key, Unique key, Foreign key| Primary key, Secondary key, Unique key, Foreign key |
| Access Control | RBAC-Based | RBAC-Based | RBAC-Based |
| Window Functions | Base Window Functions | Base Window Functions, Time Sliding Window |
| Advanced SQL Capabilities | Triggers, Stored Procedures | Unsupported
| Streaming Computing | Not Supported | Streaming Writes/kafka Connector/Dynamic Tables |
| UDF | UDF for SQL and C | UDF for SQL and Python | UDF for SQL and Python |
| Multi-tenancy | Not Supported | Supported |
| Data Sharing | Not Supported | Support for Inter-tenant Data Sharing |
| Programming Languages | Most Languages | Java, Python, Golang Connector and ORM Basic Support |
| Common Visualization Management Tools | Navicat, DBeaver, MySQL Workbench, DataGrip, HeidiSQL, etc. | Consistent with MySQL |
| Backup Tools | Logical Backup, Physical Backup | Logical Backup, Physical Backup, Snapshot Backup | Logical Backup, Physical Backup, Snapshot Backup |
| CDC Competencies | Yes | No |
| OLTP Performance | Standalone excellent, non-scalable | Standalone good, scalable |
| OLAP Performance | Poor | Excellent, Scalable |
| High Volume Write Performance | Poor | Excellent, Scalable |
| Storage Space | Limited to Disk | Unlimited Expansion |

Additional details can be found in [OmniFabric's MySQL compatibility details](../../Overview/feature/mysql-compatibility.md).

Overall, OmniFabric is a highly MySQL-compatible cloud-native HTAP database that works seamlessly with most MySQL-based applications. At the same time, OmniFabric naturally has great scalability and the ability to support other types of business loads. In addition, based on OmniFabric's memory separation and multi-tenancy features, users have the flexibility to design their application architecture with OmniFabric as a one-stop shop for load isolation issues previously addressed by applications, middleware, or other databases.

For MySQL users, OmniFabric is a more appropriate option if they experience bottlenecks with:

* Single-table data reaches more than 10 million levels, and query performance slows down, requiring table-splitting operations.

* The overall amount of data exceeds the terabyte level and MySQL needs to configure very expensive physical machines.

* Need to do multi-table association classes, or aggregate analysis queries for larger single tables.

* Requires large-scale real-time data writes, such as millions of pieces of data per second.

* Need to do multi-tenant design at the application level, such as SaaS scenarios.

* need to scale vertically on a regular basis as business application load changes.

* Requires constant data transfer and collaboration.

* It needs to be integrated into the K8s environment with the application framework to reduce operational complexity.

* Need to do streaming data processing such as real-time data writing and processing.

* Vector data needs to be stored and searched.

In OmniFabric's technical blog, we also have more articles for reference on MySQL vs. OmniFabric and migration.

[Comprehensive Comparison of OmniFabric and MySQL--Deployment Article](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491148&idx=2&sn=a83e592da9504d6b4ab356abd6cc2369&chksm=cf9274a6b133599752c811ea241d1c0b25fc44dcc255bf907de131b9a9bb6972d5ebd076d1b6&scene=0&xtrack=1#rd)

[Comprehensive Comparison of OmniFabric and MySQL--Multitenant Articles](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491293&idx=1&sn=e1967b12371a7f8b57b336d1f8ada986&chksm=cf974c93821360fb559c865b5eba71adb155c410a99e3bc4d0f7aac675a80eab6d95a24853f6&scene=0&xtrack=1#rd)

[Comprehensive Comparison of OmniFabric and MySQL--Migration Article](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491369&idx=2&sn=a0bab26c2709edd7bc278a1bcbb07d64&chksm=cf3ea15bec8aef761e476a5281b9723638c90f059af813b0c0cc799a3256a92fc96d483e0670&scene=0&xtrack=1#rd)
