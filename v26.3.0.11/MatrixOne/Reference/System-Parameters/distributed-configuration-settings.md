# Distributed Common Parameters Configuration

In the *matrixone/etc/launch-with-proxy/* directory, there are four configuration files: *cn.toml*, *tn.toml*, *proxy.toml*, and *log.toml*. The parameters contained in these configuration files are explained below:

## cn.toml

### Default Parameters

The *cn.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [cn]              | cn node, not editable                     | /                        |
| port-base         | Starting port number used by "cn". Find an available port for internal services by incrementing from this base port number, continuously checking the next 20 ports | port-base = 18000       |
| service-host      | Service connection address used for registration with HAKeeper | service-host = "127.0.0.1" |
| [cn.frontend]     | Frontend configuration section            |                          |
| port              | Port for MatrixOne to listen on and for client connections | port = 6001             |
| host              | Listening IP address                      | host = "0.0.0.0"       |
|[fileservice.s3]	|S3| File service configuration section|	|
|bucket|	S3 bucket name|	bucket = "my-bucket"|
|key-prefix|	S3 key prefix|	key-prefix = "prefix/"|

### Extended Parameters

In the *cn.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "log1.log"          |
| [cn.frontend]      | Frontend configuration section            |                           |
| unix-socket        | Listen on Unix domain socket              | unix-socket = "/tmp/mysql.sock"               |
| lengthOfQueryPrinted | Console output query length             | lengthOfQueryPrinted = 200000 |
| enableTls          | Enable TLS                                | enableTls = false         |
| tlsCaFile          | Client SSL CA list file path              | tlsCaFile = ''            |
| tlsCertFile        | Client X509 PEM format key file path      | tlsCertFile = ''          |
| tlsKeyFile         | Client X509 PEM format key file path      | tlsKeyFile = ''           |
| saveQueryResult    | Save query results                        | saveQueryResult = false   |
| queryResultTimeout | Query result timeout                      | queryResultTimeout = 24   |
| queryResultMaxsize | Maximum query result size                 | queryResultMaxsize = 100  |
| lowerCaseTableNames| Case sensitivity of identifiers. The default value is 1, which means case-insensitive | lowerCaseTableNames = 1   |
| [cn.Txn]           | Transaction configuration section         |                           |
| isolation          | Transaction isolation level. This parameter configures the isolation level on the node (cn). The isolation level defines how transactions behave when dealing with concurrent operations. By default, if the isolation level (Isolation) is not set and the transaction mode (Mode) is set to optimistic, the isolation level will be set to Serializable Isolation (SI). When the transaction mode is pessimistic, the isolation level will be set to Read Committed Isolation (RC). Default: RC | isolation = "RC"          |
| mode               | Transaction mode. This parameter configures the transaction mode on the node (cn). The transaction mode defines how operations and concurrency are handled in transactions. Valid values are optimistic and pessimistic, with the default being pessimistic. | mode = "pessimistic"       |
| [fileservice.s3]   |                        |                           |
| endpoint           | S3 endpoint address                      | endpoint = "s3.amazonaws.com"|
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| disk-path          | Disk cache path                           | disk-path = "/var/matrixone/cache"|
| disk-capacity      | Disk cache capacity                       | disk-capacity = "8GB"|
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0              |

## tn.toml

### Default Parameters

The *tn.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [dn]              | TN node, not editable                     |                        |
| uuid              | Unique identifier of TN, not editable      | uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| port-base         | Starting port number used by "TN". Find an available port for internal services by incrementing from this base port number, continuously checking the next 20 ports | port-base = 19000       |
| service-host      | Service connection address used for registration with HAKeeper | service-host = "0.0.0.0" |
|[fileservice.s3]	|S3| File service configuration section|	|
|bucket|	S3 bucket name|	bucket = "my-bucket"|
|key-prefix|	S3 key prefix|	key-prefix = "prefix/"|

### Extended Parameters

In the *tn.toml* file, you can also customize and add the following configuration parameters:

| Parameter          |

 Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "log1.log"          |
| [dn.LogtailServer]| Logtail server configuration section      |                           |
| rpc-enable-checksum| Enable RPC checksum                       | rpc-enable-checksum = false|
| [fileservice.s3]   |                        |                           |
| endpoint           | S3 endpoint address                      | endpoint = "s3.amazonaws.com"|
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| disk-path          | Disk cache path                           | disk-path = "/var/matrixone/cache"|
| disk-capacity      | Disk cache capacity                       | disk-capacity = "8GB"|
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0              |

## log.toml

### Default Parameters

The *log.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]            | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [logservice]      | Logservice configuration section          |                        |
| uuid              | Unique identifier of Logservice, not editable | uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| data-dir          | Default data directory                    | data-dir = "./mo-data/logservice"  |
|[fileservice.s3]	|S3| File service configuration section|	|
|bucket|	S3 bucket name|	bucket = "my-bucket"|
|key-prefix|	S3 key prefix|	key-prefix = "prefix/"|

### Extended Parameters

In the *log.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "log1.log"          |
|[logservice.BootstrapConfig]|||
|num-of-log-shards   ||num-of-log-shards = 0|
|num-of-tn-shards    ||num-of-tn-shards = 0|
|num-of-log-shard-replicas||num-of-log-shard-replicas = 0|
| [fileservice.s3]   |                        |                           |
| endpoint           | S3 endpoint address                      | endpoint = "s3.amazonaws.com"|
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| disk-path          | Disk cache path                           | disk-path = "/var/matrixone/cache"|
| disk-capacity      | Disk cache capacity                       | disk-capacity = "8GB"|
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0              |

## proxy.toml

### Default Parameters

The *proxy.toml* file contains the following default parameters:

| Parameter          | Explanation                                | Example                  |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | Log configuration section                 |                          |
| level             | Log level, default is info, can be modified to different levels | level = "info"        |
| [proxy]           | Proxy configuration section               |                        |
| listen-address    | Listen address, default is `0.0.0.0:6009` | listen-address = "0.0.0.0:6009" |
|[fileservice.s3]	|S3| File service configuration section|	|
|bucket|	S3 bucket name|	bucket = "my-bucket"|
|key-prefix|	S3 key prefix|	key-prefix = "prefix/"|

### Extended Parameters

In the *proxy.toml* file, you can also customize and add the following configuration parameters:

| Parameter          | Explanation                                | Example                   |
|-------------------|-------------------------------------------|---------------------------|
| [log]             | Log configuration section                 |                           |
| format             | Log save format as JSON or other           | format = "console"        |
| filename           | Log filename                              | filename = "log1.log

"          |
| [proxy]            | Proxy configuration section               |                            |
| rebalance-interval | Rebalance interval. This is the time interval between two rebalance operations. In distributed systems, rebalance operations are performed to balance the load between servers, ensuring each server has a similar workload. | rebalance-interval = 30   |
| rebalance-disabled | Rebalance disabled flag. If set to true, the rebalance is disabled, and the system won't perform rebalance operations automatically. | rebalance-disabled = false|
| rebalance-tolerance| Rebalance tolerance. This parameter indicates the tolerance level of the rebalance. When the number of connections exceeds the average value avg * (1 + tolerance), the connections will be migrated to other CN (Compute Node) servers. The tolerance value should be less than 1, defining to what extent the number of connections can exceed the average without triggering a rebalance operation. For example, if tolerance is set to 0.3 when the number of connections on a server exceeds 30% of the average connection count, rebalance operations will migrate connections to other servers to balance the load. | rebalance-tolerance = 0.3 |
| [fileservice.s3]   |                        |                           |
| endpoint           | S3 endpoint address                      | endpoint = "s3.amazonaws.com"|
| [fileservice.cache]| File service cache configuration section |                           |
| memory-capacity    | Cache memory size                         | memory-capacity = "512MB" |
| disk-path          | Disk cache path                           | disk-path = "/var/matrixone/cache"|
| disk-capacity      | Disk cache capacity                       | disk-capacity = "8GB"|
| [observability]    | Observability parameters                  |                           |
| host               | Exposed metrics service listening IP. This parameter specifies the IP address that the metrics service listens on. | host = "0.0.0.0"          |
| statusPort         | Prometheus monitoring port. This parameter defines the port number that the metrics service listens on. Metrics services typically provide metric data via HTTP. This parameter and the host parameter form the access address for the metrics service. | statusPort = 7001         |
| enableMetricToProm | Enable metric service. If set to true, metric service will be enabled | enableMetricToProm = false|
| disableMetric      | Disable metric collection. If set to true, the system will not collect any metric data, and the metric service port will not be listened to | disableMetric = false     |
| disableTrace       | Disable trace collection. If set to true, the system will stop collecting any trace, metric, and log data | disableTrace = false      |
| longQueryTime      | Log queries that exceed execution time. This parameter defines a threshold in seconds to filter out queries that exceed this threshold in execution time. The execution plans (ExecPlan) of these queries are then logged for later analysis. If set to 0.0, all execution plans of queries will be logged. | longQueryTime = 1.0              |
