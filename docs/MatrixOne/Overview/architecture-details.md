# MatrixOne Feature List

MatrixOne implements three independent layers, each with its object units and responsibilities. Different nodes can freely scale, no longer constrained by other layers. These three layers are:

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/architecture-1.png?raw=true)

- Compute Layer: Based on Compute Nodes (CNs), MatrixOne enables serverless computing and transaction processing with its cache, which is capable of random restarts and scaling.
- Transaction Layer: Based on Database Nodes and Log Services, MatrixOne provides complete logging services and metadata information, with built-in Logtail for recent data storage.
- Storage Layer: Full data is stored in object storage, represented by S3, implementing a low-cost, infinitely scalable storage method. A unified File Service enables seamless operations on underlying storage by different nodes.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/architecture-2.png?raw=true)

After deciding on TAE as the sole storage engine, multiple design adjustments were made to the fused TAE engine, resulting in the TAE storage engine. This engine has the following advantages:

- Columnar Storage Management: Uniform columnar storage and compression methods provide inherent performance advantages for OLAP businesses.
- Transaction Processing: Shared logs and DN nodes jointly support transaction processing for compute nodes.
- Hot and Cold Separation: Using S3 object storage as the target for File Service, each compute node has its cache.

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/architecture-3.png?raw=true)

The compute engine is based on the fundamental goal of being compatible with MySQL, with higher requirements for node scheduling, execution plans, and SQL capabilities. The high-performance compute engine has both MPP (massively parallel processing) and experimental architecture:

- MySQL Compatible: Supports MySQL protocol and syntax.
Fused Engine: Rebuilds execution plans based on DAG, capable of executing both TP and AP.
- Node Scheduling: Future support for adaptive intra-node and inter-node scheduling, meeting both concurrency and parallelism requirements.
- Comprehensive SQL Capability: Supports subqueries, window functions, CTE, and spill memory overflow processing.

## MatrixOne Key Performance

### Efficient Storage

MatrixOne chooses AWS S3 as an efficient storage solution, meeting the two core requirements of low cost and hot-cold data separation. Its reliable availability ensures low risk in public clouds and provides a compatible version for private deployment.

- Low cost: Reducing redundancy to achieve lower costs with acceptable performance.
- Hot-cold data separation: A necessary condition for fine-grained data management.

### Clear Transaction Division of Labor

- CN is responsible for all calculations and transaction logic, while DN is responsible for storing metadata, log information, and transaction adjudication.
- The Logtail object is introduced in the logs to save associated data from recent logs. Logtail data is regularly written to S3. When CN scales out, Logtail data can be synchronized to the cache in real-time to achieve partial data sharing.
- Set a threshold for transaction size. Transactions that exceed the threshold are directly written to S3 and logs only record write records. Transactions that do not exceed the threshold are still written by DN, significantly increasing throughput.

### HTAP Workload Isolation

As an HTAP database, it achieves isolation of different types of workloads:

- Server-level isolation: When hardware resources are sufficient, each component runs on a different physical machine and accesses the same object storage.
- Container-level isolation: When hardware resources are limited, the stateless nature of all nodes is utilized, and containers are used as isolation measures for each node.

### Flexible Resource Allocation

As an HTAP database, the ratio of different business scenarios constantly changes, and there are higher requirements for resource allocation. The resource allocation pattern under the old architecture is doomed to be unable to achieve flexible adjustment, and more refined management of each node is needed, including but not limited to the following:

- CN node division of labor: Users can divide CN for TP or AP business. When a business resource bottleneck occurs, CN is horizontally scaled out.
Dynamically judge the workload of different business CN groups and automatically allocate idle resources to busy groups.
- Complete isolation of analytical resources is achieved through the logical concept of tenants (accounts). Different tenants can use specified CN resources in a dedicated or shared manner.
