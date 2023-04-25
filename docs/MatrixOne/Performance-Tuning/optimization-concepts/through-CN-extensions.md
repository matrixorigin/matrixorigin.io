# Scaling CN for better performance

MatrixOne is a distributed database; its most distinctive feature is that it can improve the system's overall performance through node expansion. In MatrixOne's storage-computing separation architecture, CN is a stateless computing node, and the rapid expansion of CN nodes is the core of the performance improvement of the entire cluster.

Generally, we can extend CN in two ways:

1. Vertically expand CN nodes: improve performance by adjusting the resources of a single CN node. This includes the improvement of the entire CN resource and cache.

2. Horizontal expansion of CN nodes: Improve performance by increasing the number of CN nodes.

One of the smallest MatrixOne distributed cluster architectures is shown in the following figure:

![mo_arch_minimum](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/mo_arch_minimum.png?raw=true)

CN mainly performs the user's query request. Therefore, the resource size of the CN node is proportional to the computing power. The most direct expansion method is to expand the resources of a single CN node vertically. At the same time, the queried data is stored in the CN cache as hot data. If the cache is hit, the query can be returned directly from the cache without obtaining cold data from the object store. After the upper capacity limit is exceeded, the cache will only replace the data with the LRU algorithm, so the cache size is also helpful for improving performance.

In addition, we can also improve performance by horizontally expanding CN nodes. The horizontal expansion has two technical characteristics that can improve performance. First, multiple user connection requests can be dispersed to different CN nodes, spreading the load on each CN. Secondly, other CN nodes also have different caches. When the CN node that receives the query request finds that the request data is not in its cache, it will find the CN node containing the request data cache through the metadata and forward the request to it for processing to improve the cache hit rate.

The expansion of the MatrixOne distributed cluster components can be done through the Operator. For the operation method, please look at the expansion and contraction chapter of the MatrixOne cluster. Please note that the vertical expansion of the CN node needs to be carried out on a single node, while the horizontal expansion of the CN node needs to be carried out on multiple nodes.

## How to operate

The expansion of MatrixOne distributed cluster components can be done through the Operator. For more information, see [Scaling MatrixOne Cluster](../../Deploy/MatrixOne-cluster-Scale.md).
