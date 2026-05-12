# Detailed Proxy Architecture

Proxy, the sole component in MatrixOne responsible for load balancing and SQL request distribution, adapts to various scenarios by implementing session-level SQL routing through CN grouping and Proxy's SQL distribution.

The architecture diagram of its SQL request distribution is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/proxy/proxy-arch.png?raw=true width=70% heigth=70%/>
</div>

- The Kubernetes Library layer utilizes built-in Kubernetes features to ensure high availability and load balancing of the Proxy layer.
- SQL Proxy implements long connections, allowlists, and SQL request distribution, achieving load balancing and request forwarding for CNs.
- CN does not have the concept of read-only replicas and is divided only by manual grouping.

## Technical Implementation

Based on the multi-CN architecture of MatrixOne's storage-compute separation and the responsibilities of Proxy, the concept of CN label groups is introduced in HAKeeper and Proxy, that is, CN collections with fixed names and quantities.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/proxy/proxy-arch-2.png?raw=true width=40% heigth=40%/>
</div>

As shown in the figure above, the technical implementation process is explained as follows:

1. Create different CN labels through configuration options in the `yaml` file (including configuration, replica count, and tenant).
2. When the MatrixOne cluster starts, MatrixOne will launch the same number of Pods according to the replica count of each CN label, and HAKeeper will uniformly apply the corresponding labels.
3. MatrixOne Operator (i.e., MatrixOne cluster resource manager in Kubernetes) is responsible for dynamically maintaining the CN quantity within the CN label group. After a CN node goes down, it launches the same number of CNs.
4. The Proxy component determines the connection session parameters and forwards a specific session to the corresponding CN group, implementing SQL routing.

   - If a session request does not have a matching CN label, it will search for CNs with empty labels. If found, it will connect to the CN group with blank labels; otherwise, the connection will fail.
   - During expansion, Proxy migrates existing connections based on the session count of existing CN nodes, moving existing sessions to new CN nodes. The session count of the migrated nodes is close to being balanced, achieving load balancing.
   - During contraction, the Proxy migrates existing sessions of CN nodes that are about to go offline to other nodes. The session count of the migrated nodes is close to being balanced, thus achieving load balancing.

5. Proxy is responsible for intra-group load balancing within the same CN label group.

The Proxy analyzes the parameters in the session request to determine whether the request matches the CN label. In implementing SQL routing, session parameters are used to find the CN label group matching the request. Specifically, the Proxy may examine specific fields in the CN label, such as tenant information, replica count, etc., to route the request to the appropriate CN label group. This way, the Proxy can match session requests with CN labels and ensure that requests are routed to the correct CN node.

## Reference

To learn more about implementing load balancing through Proxy, see [Using Proxy for Tenant and Load Independent Resource Management](../../Deploy/mgmt-cn-group-using-proxy.md).
