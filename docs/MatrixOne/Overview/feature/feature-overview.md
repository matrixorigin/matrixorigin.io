# MatrixOne Features Overview

## **Features**

In MatrixOne, it has the following features to make you more efficient in the process of using MatrixOne:

### **Distributed Architecture**

In MatrixOne, the distributed storage and computing separation architecture is adopted. The separation of the storage, data, and computing layers enables MatrixOne to flexibly realize node expansion when encountering system resource bottlenecks. At the same time, resources can be allocated more efficiently under the multi-node architecture, avoiding hotspots and resource requisition to a certain extent.

### **Transactions and Isolation**

In MatrixOne, transactions are isolated using optimistic transactions and snapshots.

Optimistic transactions can achieve better performance in a distributed architecture with fewer conflicts. At the same time, snapshot isolation with a higher isolation level can be achieved in terms of implementation. In order to ensure the ACID four elements of the transaction, MatrixOne currently supports and only supports one snapshot isolation level. Compared with the ordinary read-committed isolation level, this is stricter, which can effectively prevent dirty reads and better adapt to distributed optimistic transactions.

### **Cloud Native**

MatrixOne is a cloud-native database. From the storage layer, it adapts to various storage methods such as local disks, AWS S3, and NFS and realizes non-aware management of multiple types of storage through File service. MatrixOne clusters can run stably in a variety of infrastructure environments, can adapt to private enterprise clouds, and provide services in different public cloud vendor environments.

### **Load Balancing**

Under the distributed database architecture, load differences inevitably exist between different nodes, which may lead to performance bottlenecks in specific business scenarios or idle computing resources. Therefore, to ensure that other nodes are kept as close as possible in resource allocation, MatrixOne implements the load-balancing function of computing resources.

### **SQL Routing**

SQL routing is often used in early sub-database and sub-table database scenarios. It determines which instance/library/table to send the request to according to the data distribution after receiving an SQL request.

In MatrixOne, although the capacity of the storage engine no longer limits the size of the database, under the multi-CN architecture, there are still scenarios for load balancing between multiple CNs and resource isolation between different accounts. Therefore, in MatrixOne, SQL routing is implemented to send SQL requests to other CN nodes for execution according to predefined rules. This solves the situation that a database instance cannot load many data access requirements.

### **Allowlist**

Allowlist is a security policy that controls access to restricted resources, systems, or networks. It is based on a core idea that only authorized and trusted entities are allowed to access, while other unauthorized access attempts are denied. These authorized entities may include specific users, IP addresses, programs, or others. The opposite of an allowlist is a blocklist, a policy that specifies a list of prohibited entities that will be prevented from accessing a restricted resource, system, or network. Under the blocklist policy, entities outside the blocklist can access.

The allowlist has the following characteristics:

- Only users or systems on the pre-defined list are allowed to access; other users or systems not included in the allowlist are denied access.
- Using an allowlist policy can improve security but may limit access for legitimate users. Therefore, a trade-off exists between security and user convenience when implementing an allowlist policy.
- In the database system, the allowlist is mainly used to restrict user access, only allowing specific users to access the database of a particular server or network segment, thereby improving the security of the database.

### Multi-Account

The multi-account mode of a single cluster can provide benefits such as resource sharing, simplified management, improved scalability, and security isolation. It is precious for scenarios needing database services for multiple accounts simultaneously.

MatrixOne's multi-account mode can provide independent database instances for different accounts and adopts a logical isolation method to ensure the security and independence of each account's data, effectively preventing the risk of data leakage and tampering.

## MatrixOne Key Performance

### Efficient Storage

MatrixOne chooses AWS S3 as an efficient storage solution, meeting the two core requirements of low cost and hot-cold data separation. Its reliable availability ensures low risk in public clouds and provides a compatible version for private deployment.

- Low cost: Reducing redundancy to achieve lower costs with acceptable performance.
- Hot-cold data separation: A necessary condition for fine-grained data management.

### Clear Transaction Division of Labor

- CN is responsible for all calculations and transaction logic, while TN is responsible for storing metadata, log information, and transaction adjudication.
- The Logtail object is introduced in the logs to save associated data from recent logs. Logtail data is regularly written to S3. When CN scales out, Logtail data can be synchronized to the cache in real-time to achieve partial data sharing.
- Set a threshold for transaction size. Transactions that exceed the threshold are directly written to S3 and logs only record write records. Transactions that do not exceed the threshold are still written by TN, significantly increasing throughput.

### HTAP Workload Isolation

As an HTAP database, it achieves isolation of different types of workloads:

- Server-level isolation: When hardware resources are sufficient, each component runs on a different physical machine and accesses the same object storage.
- Container-level isolation: When hardware resources are limited, the stateless nature of all nodes is utilized, and containers are used as isolation measures for each node.

### Flexible Resource Allocation

As an HTAP database, the ratio of different business scenarios constantly changes, and there are higher requirements for resource allocation. The resource allocation pattern under the old architecture is doomed to be unable to achieve flexible adjustment, and more refined management of each node is needed, including but not limited to the following:

- CN node division of labor: Users can divide CN for TP or AP business. When a business resource bottleneck occurs, CN is horizontally scaled out.
Dynamically judge the workload of different business CN groups and automatically allocate idle resources to busy groups.
- Complete isolation of analytical resources is achieved through the logical concept of accounts (accounts). Different accounts can use specified CN resources in a dedicated or shared manner.
