# Product Frequently Asked Questions

## Product related

**What is MatrixOne?**

MatrixOne is a future-proof, hyperconverged, heterogeneous cloud-native database that supports hybrid workloads such as transaction/analysis/streaming with a hyperconverged data engine and cross-room/multi-site/cloud-side collaboration with a heterogeneous cloud-native architecture. MatrixOne wanted to simplify the costs of data system development and operations, reduce data fragmentation between complex systems, and break down the boundaries of data convergence.  
To learn more about MatrixOne, you can browse the [Introduction to MatrixOne](../Overview/matrixone-introduction.md).

**Is MatrixOne developed based on MySQL or another database?**

 MatrixOne is a new database built from scratch. MatrixOne is compatible with some of MySQL's syntax and semantics, and will produce more semantics in the future than MySQL, so we can make it a more powerful hyper-converged database. For compatibility with MySQL, see [MySQL compatibility](../Overview/feature/mysql-compatibility.md).

**What programming language was MatrixOne developed in?**

MatrixOne currently primarily uses **Golang** as the primary programming language.

**What programming languages are currently supported for connecting to MatrixOne?**

MatrixOne supports Java, Python, Golang languages, and ORM connections. Other languages can also connect MO as MySQL.

**What compression algorithm does MatrixOne column storage use?**

MatrixOne column storage currently uses the LZ4 compression algorithm and does not support modification via configuration.

**Can I upgrade the lower version to the latest version?**

Both MatrixOne 0.8.0 and above can be upgraded directly from a lower version to the latest version using `mo_ctl upgrade latest`. You can refer to the [mo_ctl tool](../Maintain/mo_ctl.md). Versions prior to 0.8.0 are recommended to back up data, reload and import if required for upgrades.

Is MatrixOne stable **now? Which version is recommended?**

MatrixOne is now available in version v25.2.1.0. We've done a lot of optimization work on stability, and it's ready to be used in the production business.

**Is there a cloud version of MatrixOne? Want a quick test to see**.

There is. Now mo cloud has started public testing. Details View [MatrixOne Cloud Documentation](https://docs.matrixorigin.cn/zh/matrixonecloud/MatrixOne-Cloud/Get-Started/quickstart/)

## Architecture related

Are **MatrixOne permissions also designed based on the RBAC model? Is it possible to grant permissions directly to the user?**

MatrixOne's rights management is designed and implemented using a combination of role-based access control (RBAC) and autonomous access control (DAC) security models. MatrixOne does not support granting rights directly to users and requires authorization through roles.

**How does a highly available architecture work?**

There is currently no highly available architecture for the standalone version of MatrixOne, and the highly available architecture for the master-slave version is still being designed. Distributed versions are inherently highly available, and both k8s and s3 are inherently highly available architectures. MatrixOne's nodes cn and tn are stateless, hang can be pulled up at any time, the log service is stateful, its 3 nodes are a distributed architecture that provides a raft group, hang 1 is okay, keep running, hang 2 systems will be unavailable.

**Does the current tn node of the k8s cluster node support expansion?**

Scaling is not yet supported by the current tn node of MatrixOne.

What are the **various components used for? Minimize how many instances do you need to deploy? Can you support non-stop non-sensual expansion later?**

The MatrixOne core has 4 components, proxy,cn,tn,log service. cn is the stateless compute node, tn is the transaction node, and log service is the log of the transaction, equivalent to WAL. proxy is used for load balancing and resource group management. It can be done in 3 physical/virtual machines if they are all deployed in a hybrid. Senseless expansion is possible, mo is memory separated, and the expansion of storage is the expansion of s3. The calculated expansion is cn, itself based on k8s, cn stateless, and a container that can be expanded quickly.

 **How is resource isolation achieved between multiple tenants?**

The resource isolation core of MatrixOne is that the ACCOUNT can correspond to the resource group of the CN Set, or the tenant isolation can be considered the container isolation of the CN. In addition to different resource groups that can be assigned by multi-tenants, CN resource groups can be further assigned within a single tenant based on business type for more granular control. For a complete description of resource isolation, see [Load and Tenant](../Deploy/mgmt-cn-group-using-proxy.md) Isolation

Can the table engine in **MySQL be migrated directly? Is it compatible with engines like InnoDB?**

MatrixOne does not support MySQL's InnoDB, MyISAM and other engines, but can use MySQL's statements directly. MatrixOne ignores these engines, and there is only one storage engine in MatrixOne, TAE, which has been developed completely independently and can be applied to all kinds of scenarios in a friendly manner without using ENGINE=XXX to replace the engine.

## Functionally related

**What applications does MatrxOne support?**

  MatrixOne provides users with the ultimate HTAP service. MatrixOne can be used in enterprise data centers, big data analytics and other scenarios.

**Which database is MatrixOne compatible with?**

MatrixOne remains highly compatible with MySQL 8.0 in usage, including SQL syntax, transfer protocols, operators and functions, and more. A list of differences with MySQL 8.0 compatibility can be found in the [MySQL compatibility list](../Overview/feature/mysql-compatibility.md).

**How about MySQL compatibility, is it used directly as MySQL in BI?**

MatrixOne is highly compatible with MySQL 8.0 and is generally consistent with MySQL in terms of communication protocols, SQL syntax, connectivity tools, and development mode. Many administrative and ecological tools can also reuse MySQL's tools. BI can be used directly as MySQL, please refer to [FineBI for visual reports](../Develop/Ecological-Tools/BI-Connection/FineBI-connection.md), [Yonghong BI for](../Develop/Ecological-Tools/BI-Connection/yonghong-connection.md) visual reports and [Superset for visual monitoring](../Develop/Ecological-Tools/BI-Connection/Superset-connection.md).

## Database Comparison Related

**How does MatrixOne stand-alone and MySQL performance compare?**

The standalone version of MatrixOne slightly outperforms MySQL in TP performance, but far outperforms MySQL in Load, Stream Write, Analyze queries.

**What is the difference with HTAP database TiDB?**

MatrixOne is not the same architecture as TiDB. MatrixOne is memory-separated, a cloud-based shared storage architecture with data in one place, one copy, and HTAP implemented with one engine. And TiDB is Share nothing architecture, data to be fragmented, TiKV to do TP, TiFlash to do AP, using two engines with an ETL to do the HTAP, data to be stored in two copies.

## Other

* **Can I participate in contributing to the MatrixOne project?**

MatrixOne is an open source project entirely on Github and all developers are welcome to contribute. See our [Contribution Guide](../Contribution-Guide/make-your-first-contribution.md) for more information.

* **Is there an alternative to official documentation for MatrixOne knowledge acquisition?**

Currently, [MatrixOne documentation](https://docs.matrixorigin.cn) is the most important and timely way to gain knowledge about MatrixOne. In addition, we have a number of technology communities at Slack and WeChat. For any requests, please contact [opensource@matrixorigin.io](mailto:opensource@matrixorigin.io).
