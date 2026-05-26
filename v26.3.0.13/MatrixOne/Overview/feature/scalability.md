# Scalability

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

* **Flexible Expansion of Distributed Architecture**: MatrixOne adopts a storage and computing-separated architecture. The separation of the storage, transaction, and computing layers allows MatrixOne to expand nodes when encountering system resource bottlenecks flexibly. The storage layer is mainly based on object storage and partly based on the cache on the computing nodes (CN). The transaction layer is based on stateless transaction nodes (TN). The computing layer is based on stateless computing nodes (CN). The multi-node architecture can more effectively distribute resources and avoid hot spots and resource contention.

* **Infinite Expansion Capability of S3 Object Storage**: The core storage of MatrixOne is completely based on S3 object storage. S3 object storage has naturally high availability and infinite scalability, making MatrixOne highly scalable in data storage. No matter how the data scale grows, MatrixOne can meet the demand by expanding S3 storage. In a private deployment environment, MatrixOne builds S3 services based on the open-source MinIO component. MatrixOne can seamlessly utilize the object storage service provided by the public cloud in a public cloud environment.

* **Stateless Computing and Transaction Nodes**: MatrixOne's computing nodes (CN) and transaction nodes (TN) are stateless, meaning they can be horizontally expanded anytime. Stateless design means that computing and transaction nodes do not need to store any persistent data

They can be easily added or deleted to cope with different load requirements. This design makes MatrixOne extremely scalable and flexible when dealing with large-scale concurrent requests. (The current 1.0 version TN node does not yet have expansion capabilities, but the TN mainly handles transaction submission information, and the load is lower, so a single TN is enough to take a large-scale cluster, and subsequent versions will improve TN's scalability.)

* **Independent Scaling for Different Workloads and Accounts**: MatrixOne utilizes the Proxy module to group multiple compute nodes (CN) into managed sets known as CN Sets, achieved through labeling. This enables the independent scaling of each CN Set. Users can assign different CN Sets to distinct tenants, ensuring load isolation and separate scaling between tenants. It's also possible to give various CN Sets to diverse workloads, such as read and write workloads, or transactional and analytical workloads, thereby achieving isolation and separate scaling between them.
