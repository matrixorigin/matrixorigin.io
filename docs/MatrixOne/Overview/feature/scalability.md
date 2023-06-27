# High Scalability

MatrixOne is a superior integration of heterogeneous cloud-native databases. Its structure is based on a storage, computing, and transaction separation architecture, which boasts impressive elastic scalability that quickly adapts to user workload changes. As data volumes and businesses expand, enterprises' demand for database scalability is ever-increasing.

Generally, whether user data grows from 0 to 100TB or concurrent operations increase from several hundred to hundreds of thousands, MatrixOne can meet performance demands through its unparalleled scalability.

## Business Requirements

The demand for database scalability in enterprises primarily originates from the following pain points:

- **Growth in Data Volume**: With business development, an enterprise's data volume will continue to grow. Suppose the scalability of the database could be better. In that case, it might not be able to effectively process a large amount of data, leading to a decline in query speed and affecting the regular operation of the business.
- **Increase in Concurrent Requests**: As the number of users grows, the number of concurrent requests a database needs to handle also increases. Suppose the scalability of the database could be better. In that case, it might not effectively process many concurrent requests, leading to an extension in response time and affecting the user experience.
- **Change in Business Needs**: The business needs of an enterprise may change over time. Suppose the scalability of the database could be better. In that case, it might be unable to flexibly adapt to these changes, causing the enterprise to invest more resources to adjust and optimize the database.
- **System Availability**: If the scalability of the database could be better, it might not effectively handle hardware or network failures, resulting in lower system availability, which affects business continuity.

If a database has good scalability, it can help enterprises improve data processing capabilities, thus effectively coping with the growth of data volume, handling the increase in concurrent requests, and ensuring system availability.

## Architecture

MatrixOne adopts a comprehensive cloud-native architecture. All components exist in the form of containers and are uniformly managed by Kubernetes. Kubernetes itself has strong container orchestration and management capabilities. In MatrixOne, the manual expansion only requires modifying the Kubernetes configuration.

![scalability](https://github.com/matrixorigin/artwork/blob/main/docs/overview/scalability.png)

## Advantages

From the technical architecture perspective, the unparalleled scalability of MatrixOne mainly manifests in the following aspects:

* **Flexible Expansion of Distributed Architecture**: MatrixOne adopts a storage and computing-separated architecture. The separation of the storage, transaction, and computing layers allows MatrixOne to expand nodes when encountering system resource bottlenecks flexibly. The storage layer is mainly based on object storage and partly based on the cache on the computing nodes (CN). The transaction layer is based on stateless transaction nodes (DN). The computing layer is based on stateless computing nodes (CN). The multi-node architecture can more effectively distribute resources and avoid hot spots and resource contention.

* **Infinite Expansion Capability of S3 Object Storage**: The core storage of MatrixOne is completely based on S3 object storage. S3 object storage has naturally high availability and infinite scalability, making MatrixOne highly scalable in data storage. No matter how the data scale grows, MatrixOne can meet the demand by expanding S3 storage. In a private deployment environment, MatrixOne builds S3 services based on the open-source MinIO component. MatrixOne can seamlessly utilize the object storage service provided by the public cloud in a public cloud environment.

* **Stateless Computing and Transaction Nodes**: MatrixOne's computing nodes (CN) and transaction nodes (DN) are stateless, meaning they can be horizontally expanded anytime. Stateless design means that computing and transaction nodes do not need to store any persistent data

They can be easily added or deleted to cope with different load requirements. This design makes MatrixOne extremely scalable and flexible when dealing with large-scale concurrent requests. (The current 0.8 version DN node does not yet have expansion capabilities, but the DN mainly handles transaction submission information, and the load is lower, so a single DN is enough to take a large-scale cluster, and subsequent versions will improve DN's scalability.)

* **Independent Expansion of Different Loads and Accounts**: MatrixOne can manage multiple computing nodes (CN) into groups through the Proxy module to form a CN Set and implement independent expansion of each CN Set through tags. Users can assign different CN Sets to accounts, allowing load isolation and independent expansion between accounts. Different CN Sets can also be specified for different loads, such as read and write or transactional and analytical loads, to achieve their isolation and independent expansion.

## Performance Scalability

To demonstrate the performance scalability of the product, we used a relatively high system configuration for testing.

The specific distribution of machine configurations is as follows:

| Name  | **Host**     | CPU    | Memory | System Disk | Data Disk | **Role**                    |
| ----- | ------------ | ------ | ------ | ----------- | --------- | ---------------------------|
| Node0 | 10.206.32.16 | 2 Core | 4GB    | 50GB        | N/A       | k8s master                  |
| Node1 | 10.206.32.5  | 8 Core | 64GB   | 50GB        | 500GB*3   | k8s node, Minio, MO Proxy   |
| Node2 | 10.206.32.6  | 8 Core | 64GB   | 50GB        | 100GB*2   | K8s node, MO Logservice, CN |
| Node3 | 10.206.32.7  | 8 Core | 64GB   | 50GB        | 100GB*2   | K8s node, MO Logservice, CN |
| Node4 | 10.206.32.9  | 8 Core | 64GB   | 50GB        | 100GB*2   | K8s node, MO Logservice, CN |
| Node5 | 10.206.32.13 | 8 Core | 64GB   | 50GB        | 100GB     | K8s node, MO CN             |
| Node6 | 10.206.32.14 | 8 Core | 64GB   | 50GB        | 100GB     | K8s node, MO CN             |
| Node7 | 10.206.32.17 | 8 Core | 64GB   | 50GB        | 100GB     | K8s node, MO DN             |
