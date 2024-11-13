# **MatrixOne Introduction**

MatrixOne is a hyper-converged cloud & edge native distributed database with a structure that separates storage, computation, and transactions to form a consolidated HSTAP data engine. This engine enables a single database system to accommodate diverse business loads such as OLTP, OLAP, and stream computing. It also supports deployment and utilization across public, private, and edge clouds, ensuring compatibility with diverse infrastructures.

MatrixOne touts significant features, including real-time HTAP, multi-tenancy, stream computation, extreme scalability, cost-effectiveness, enterprise-grade availability, and extensive MySQL compatibility. MatrixOne unifies tasks traditionally performed by multiple databases into one system by offering a comprehensive ultra-hybrid data solution. This consolidation simplifies development and operations, minimizes data fragmentation, and boosts development agility.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/architeture241113_en.png?raw=true)

MatrixOne is designed for scenarios that require real-time data ingestion, large-scale data management, fluctuating workloads, and multi-modal data management. It is particularly suited for environments that combine transactional and analytical workloads, such as generative AI applications, mobile internet applications, IoT data processing, real-time data warehouses, and SaaS platforms.

## **Key Features**

### **Hyper-converged Engine**

* **Monolithic Engine**

     HTAP data engine that supports a mix of workloads such as TP, AP, time series, and machine learning within a single database.

* **Built-in Streaming Engine**

     Built-in stream computing engine that enables real-time data inflow, transformation, and querying.

### **Cloud & Edge Native**

* **Storage-Computation Separation Structure**

     Separates the storage, computation, and transaction layers, leveraging a containerized design for ultimate scalability.

* **Multi-Infrastructure Compatibility**

      MatrixOne provides industry-leading latency control with optimized consistency protocol.

### **Extreme Performance**

* **High-Performance Execution Engine**

      The flexible combination of Compute Node and Transaction node accommodates point queries and batch processing, delivering peak performance for OLTP and OLAP.

* **Enterprise-Grade High Availability**

     Establishes a consistently shared log under a leading Multi-Raft replication state machine model. It ensures high cluster availability while preventing data duplication, thus achieving RTO=0.

### **Ease of Use**

* **Built-in Multi-Tenancy Capability**

      Offers inherent multi-tenancy, where tenants are isolated from each other, independently scalable yet uniformly manageable. This feature simplifies the complexity of multi-tenancy design in upper-level applications.

* **High Compatibility with MySQL**

      MatrixOne exhibits high compatibility with MySQL 8.0, including transmission protocol, SQL syntax, and ecosystem tools, lowering usage and migration barriers.

### **Cost-Effective**

* **Efficient Storage Design**

      Employs cost-effective object storage as primary storage. High availability can be achieved through erasure coding technology with only about 150% data redundancy. It also provides high-speed caching capabilities, balancing cost and performance via a multi-tiered storage strategy that separates hot and cold data.

* **Flexible Resource Allocation**

      Users can adjust the resource allocation ratio for OLTP and OLAP according to business conditions, maximizing resource utilization.

### **Enterprise-Level Security and Compliance**

      MatrixOne employs Role-Based Access Control (RBAC), TLS connections, and data encryption to establish a multi-tiered security defense system, safeguarding enterprise-level data security and compliance.

## **User Values**

* **Simplify Database Management and Maintenance**

      With business evolution, the number of data engines and middleware enterprises employ increases. Each data engine relies on 5+ essential components and stores 3+ data replicas. Each engine must be independently installed, monitored, patched, and upgraded. This results in high and uncontrollable data engine selection, development, and operations costs. Under MatrixOne's unified architecture, users can employ a single database to serve multiple data applications, reducing the number of introduced data components and technology stacks by 80% and significantly simplifying database management and maintenance costs.

* **Reduce Data Fragmentation and Inconsistency**

     Data flow and copy between databases make data sync and consistency increasingly tricky. The unified and incrementally materialized view of MatrixOne allows the downstream to support real-time upstream updates and achieve end-to-end data processing without redundant ETL processes.

* **Decoupling Data Architecture From Infrastructure**

     Currently, the architecture design across different infrastructures is complicated, causing new data silos between cloud and edge, cloud and on-premise. MatrixOne is designed with a unified architecture to support simplified data management and operations across different infrastructures.

* **Extremely Fast Complex Query Performance**

     Poor business agility results from slow, complex queries and redundant intermediate tables in current data warehousing solutions. MatrixOne supports blazing-fast experience even for star and snowflake schema queries, improving business agility with real-time analytics.

* **An Solid OLTP-like OLAP Experience**

     Current data warehousing solutions have the following problems: high latency and absence of immediate visibility for data updates. MatrixOne brings OLTP (Online Transactional Processing) level consistency and high availability to CRUD operations in OLAP (Online Analytical Processing).

* **Seamless and Non-disruptive Scaling**

     It is challenging to balance performance and scalability to achieve an optimum price-performance ratio in current data warehousing solutions. MatrixOne's disaggregated storage and compute architecture makes it fully automated and efficient to scale in/out and up/down without disrupting applications.

## **Scenarios**

* **Traditional Application System Scenarios Requiring Scalability and Analytical Reporting Capabilities**

     With the expansion of businesses, the performance needs of traditional single-machine databases cannot meet enterprises' usual systems such as OA, ERP, CRM, etc., especially during special periods requiring business analysis. Many enterprises equip a separate analytical database system to meet statistical report needs at essential points like month-end, quarter-end, etc. Using MatrixOne; these needs can be met with a single database system, providing strong scalability that seamlessly scales with business growth.

* **Dashboard/BI Report Scenarios Requiring Real-Time Analytical Capabilities**

     For typical OLAP-type applications in enterprises, such as dashboards, BI reports, etc., analyzing massive amounts of data often leads to a performance bottleneck when the data volume is significantly large, resulting in poor timeliness. MatrixOne's robust analysis performance and scalability enable the acceleration of various complex and large-scale SQL queries, providing a near-instant experience and enhancing enterprise decision-making analysis's agility.

* **Data Platform Scenarios for Real-Time Influx and Processing of Massive Heterogeneous Data Applications**

     With the extensive use of sensor and network technology, numerous IoT devices generate substantial data, such as manufacturing factory production lines, new energy vehicles, city security surveillance cameras, etc. Their scale can easily reach hundreds of TB or even PB levels. The demand for digitization also requires enterprises to store and use these data increasingly. Traditional database solutions cannot meet the requirements of such massive and large-scale real-time data writing and processing applications. MatrixOne's powerful streaming data writing and processing capabilities and robust scalability can adapt to any load and data volume scale, fully meeting these requirements.

* **Data Middle-End Scenarios Where Various Internal Enterprise Data Converges**

     Medium and large enterprises often have multiple business systems. To fully understand the enterprise's overall status, many enterprises build a data middle-end that connects data sources from various systems. Traditional solutions to carry the data middle-end are based on the Hadoop system, which is complex, posing high development and operation thresholds for many enterprises. MatrixOne's one-stop HTAP architecture makes using a data middle-end as convenient as using MySQL, significantly reducing costs.

* **Business Scenarios with Dramatic and Frequent Internet Business Fluctuations**

     Internet applications such as games, e-commerce, entertainment, social networking, news, etc., have a massive user base, and the business fluctuates dramatically and frequently. During hot events, these applications often need many computing resources to support business needs. MatrixOne's fully cloud-native architecture has superior scalability, enabling automatic and rapid scaling with business changes, significantly reducing user operation and maintenance difficulties.

* **Enterprise SaaS Service Business Scenarios**

     Enterprise SaaS applications have seen explosive growth in recent years. In developing SaaS applications, they all need to consider their multi-tenant model. Traditional schemes offer two modes of multi-tenant shared database instances and single-tenant exclusive database instances, but they face the dilemma of management cost and isolation. MatrixOne comes with multi-tenant capabilities; tenants are naturally load-isolated and can be independently scaled. At the same time, it provides unified management capabilities, balancing the enterprise's needs for cost, management simplicity, and isolation, making it an optimal choice for SaaS applications.

## **Learn More**

This section describes the basic introduction of MatrixOne. If you want to learn more detailed information about MatrixOne, see the following content:

* [MatrixOne Architecture](architecture/matrixone-architecture-design.md)
* [Deploy standalone MatrixOne](../Get-Started/install-standalone-matrixone.md)
