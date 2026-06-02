# Standalone Common Parameters Configuration

Four configuration files are in the *matrixone/etc/launch/* directory: *cn.toml*, *tn.toml*, *proxy.toml*, and *log.toml*, used to configure standard parameters.

## cn.toml

### Default Parameters

The *cn.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [cn]              | cn node, not editable                     | /                        |
| port-base         | Starting port number used by "cn", continuously finding 20 available ports for internal services starting from this port number | port-base = 18000       |
| service-host      | Service connection address used for registration to HAKeeper | service-host = "127.0.0.1" |
| [cn.frontend]     | Frontend configuration section            |                          |
| port              | Port for MatrixOne to listen and for client connections | port = 6001             |
| host              | Listening IP address                       | host = "0.0.0.0"       |

### Extended Parameters

In the *cn.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "mo.log"          |
| [cn.frontend]     | Frontend configuration section            |                           |
| unix-socket        | Listen to Unix domain interface           | unix-socket = "/tmp/mysql.sock"
| lengthOfQueryPrinted | Console output query length             | lengthOfQueryPrinted = 200000 |
| enableTls          | Enable TLS                                | enableTls = false         |
| tlsCaFile          | Client SSL CA list file path              | tlsCaFile = ''            |
| tlsCertFile        | Client X509 PEM format key file path      | tlsCertFile = ''          |
| tlsKeyFile         | Client X509 PEM format key file path      | tlsKeyFile = ''           |
| saveQueryResult    | Save query results                        | saveQueryResult = false   |
| queryResultTimeout | Query result timeout time                 | queryResultTimeout = 24   |
| queryResultMaxsize | Query result maximum size                 | queryResultMaxsize = 100  |
| lowerCaseTableNames| Identifier case sensitivity, the default parameter value is 1, indicating case insensitivity | lowerCaseTableNames = 1   |
| [cn.Txn]           | Transaction configuration section         |                           |
| isolation          | Transaction isolation level, used to configure the transaction isolation level on the "cn" node. The isolation level defines the behavior of transactions during concurrent operations. By default, if the isolation level (Isolation) is not set, it will be set to Serializable Isolation (SI) when the transaction mode (Mode) is set to optimistic and to Read Committed Isolation (RC) when the transaction mode is set to pessimistic. Default: RC | isolation = "RC"          |
| mode               | Transaction mode configures the transaction mode on the "cn" node. The transaction mode defines how operations and concurrency are handled in a transaction. Possible values are optimistic and pessimistic, with the default value being optimistic. | mode = "optimistic"       |
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0             |

## tn.toml

### Default Parameters

The *tn.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [dn]              | TN node, not editable                     |                        |
| uuid              | Unique identifier of TN, not editable      | uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| port-base         | Starting port number used by "TN", continuously finding 20 available ports for internal services starting from this port number | port-base = 19000       |
| service-host      | Service connection address used for registration to HAKeeper | service-host = "0.0.0.0" |

### Extended Parameters

In the *tn.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "tn.log"          |
| [dn.LogtailServer] | Logtail Server configuration section      |                           |
| rpc-enable-checksum| Enable RPC checksum                       | rpc-enable-checksum = false|
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically

 Provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0             |

## log.toml

### Default Parameters

The *log.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [logservice]      | Logservice configuration section          |                        |
| uuid              | Unique identifier of Logservice, not editable | uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| data-dir          | Default data directory                    | data-dir = "./mo-data"  |

### Extended Parameters

In the *log.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "log1.log"          |
| [logservice]      | Logservice configuration section          |                           |
| logservice-address| Logservice address                        | logservice-address = "0.0.0.0:32000" |
| raft-address      | Raft address                              | raft-address = "0.0.0.0:32001"     |
| gossip-address    | Gossip address                            | gossip-address = "0.0.0.0:32002"   |
| gossip-seed-addresses | Gossip seed node addresses            | gossip-seed-addresses = " "      |
| [LogtailServer.BootstrapConfig] | LogtailServer bootstrap configuration section |                            |
| init-hakeeper-members | Initial HAKeeper members                | init-hakeeper-members = " "      |
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0             |

## proxy.toml

### Default Parameters

The *proxy.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [proxy]           | Proxy configuration section               |                        |
| listen-address   | Listen address, default is `0.0.0.0:6009` | listen-address = "0.0.0.0:6009" |

### Extended Parameters

In the *proxy.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "proxy.log"          |
| [proxy]           | Proxy configuration section               |                           |
| rebalance-interval | Rebalance interval. This is the time interval between two rebalance operations. In distributed systems, rebalance operations are performed to balance the load between servers and ensure each server has a similar workload. | rebalance-interval = 30   |
| rebalance-disabled | Rebalance disable flag. If set to true, the rebalance will be disabled, and the system will not automatically perform rebalance operations. | rebalance-disabled = false|
| rebalance-tolerance | Rebalance tolerance. This parameter indicates the tolerance of the rebalance. When the number of connections exceeds the average value avg * (1 + tolerance), the connections will be migrated to other CN (compute node) servers. The tolerance value should be less than 1, defining to what extent the number of connections can exceed the average value without triggering a rebalance operation. For example, suppose tolerance is set to 0.3 when a server's connections exceed 30% of the average connection count. In that case, the rebalance operation will migrate connections to other servers to balance the load. | rebalance-tolerance = 0.3 |
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| [observability]    | Observability parameters

 |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0             |
