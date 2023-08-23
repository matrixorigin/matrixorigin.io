# **Boot Parameters for standalone installation**

There are three configuration files *cn.toml*, *tn.toml* and *log.toml* in the *matrixone/etc/launch-tae-CN-tae-TN/* directory.

The parameters contained in each configuration file are explained as follows:

### cn.toml

|Parameters|Description|
|---|---|
|service-type = "CN" |Node Type|
|data-dir = "./mo-data"|Default data directory|
|[log]||
|level = "info" |Log level, can be modified to `info/debug/error/faltal`|
|format = "console" |Log format|
|max-size = 512|Log default length|
|[hakeeper-client]|HAkeeper default address and port, not recommended to change|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[metacache]|Metadata Cache|
|memory-capacity = "512MB"|Set the cache size for metadata, default is 512MB. The data caching feature results in slower first-time queries, but subsequent queries will be faster.|
|[[fileservice]] |fileservice, not recommended to change|
|name = "LOCAL"|fileservice storage type, local storage|
|backend = "DISK"|fileservice backend, disk|
|[[fileservice]]||
|name = "SHARED" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
|[fileservice.cache]||
|memory-capacity = "512MB"|cache memory size used by fileservice|
|disk-capacity = "8GB"|cache disk size used by fileservice|
|disk-path = "mo-data/file-service-cache"|fileservice disk cache path|
|disk-min-evict-interval = "7m"|Interval for disk cache recovery, in seconds (s) or minutes (m)|
|disk-evict-target = 0.8|Target capacity for disk cache recovery, parameter is the ratio of template capacity to total capacity|
|[[fileservice]]||
|name = "ETL"|fileservice storage type, ETL|
|backend = "DISK-ETL"|fileservice backend, DISK-ETL|
|[observability]|Observability parameter, disabled by default|
|disableTrace = true||
|disableMetric = true||
|[cn] |cn code number, cannot be modified|
|uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"||
|[cn.Engine]|Storage engine of the cn node, distributed tae, cannot be modified|
|type = "distributed-tae"||
|[cn.txn]||
|enable-sacrificing-freshness = false| When set to true and push mode, this parameter does not guarantee that a transaction can see the latest committed data. Instead, it uses the latest Logtail commit timestamp received by the current CN as the transaction start time. This setting ensures that a transaction on the same database connection can see the data written by its previously committed transactions.|
|enable-cn-based-consistency = false|When the above parameter is set to true, it ensures external consistency on the same CN. When a transaction starts, it can see the data written by previously committed transactions.|

## tn.toml

|Parameters|Description|
|---|---|
|service-type = "TN" |Node Type|
|data-dir = "./mo-data"|Default data directory|
|[log]||
|level = "info" |Log level, can be modified to `info/debug/error/faltal`|
|format = "console" |Log format|
|max-size = 512|Log default length|
|[hakeeper-client]|HAkeeper default address and port, not recommended to change|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[metacache]|Metadata Cache|
|memory-capacity = "512MB"|Set the cache size for metadata, default is 512MB. The data caching feature results in slower first-time queries, but subsequent queries will be faster.|
|[[fileservice]] |fileservice, not recommended to change|
|name = "LOCAL"|fileservice storage type, local storage|
|backend = "DISK"|fileservice backend, disk|
|[[fileservice]]||
|name = "SHARED" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
|[fileservice.cache]||
|memory-capacity = "512MB"|cache memory size used by fileservice|
|disk-capacity = "8GB"|cache disk size used by fileservice|
|disk-path = "mo-data/file-service-cache"|fileservice disk cache path|
|disk-min-evict-interval = "7m"|Interval for disk cache recovery, in seconds (s) or minutes (m)|
|disk-evict-target = 0.8|Target capacity for disk cache recovery, parameter is the ratio of template capacity to total capacity|
|[[fileservice]]||
|name = "ETL"|fileservice storage type, ETL|
|backend = "DISK-ETL"|fileservice backend, DISK-ETL|
|[tn]||
|uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"|uuid of TN, cannot be modified|
|[tn.Txn.Storage]|The storage engine of the TN transaction backend, cannot be modified|
|backend = "TAE" ||
|log-backend = "logservice"||
|[tn.Txn]||
|incremental-dedup = false|If set to false, TN initiates deduplication for all data. If set to true, TN will only deduplicate primary key data after the snapshot timestamp.|
|[tn.Ckp]|the checkpoint related parameters of TN, not recommended to change|
|flush-interval = "60s" |internal refresh interval|
|min-count = 100 |Minimum number of checkpoints|
|scan-interval = "5s"|internal scan interval|
|incremental-interval = "180s"|checkpoint increment interval|
|global-min-count = 60 |The global minimum number of TN checkpoints|
|[tn.LogtailServer]||
|listen-address = "0.0.0.0:32003"|logtail listening port|
|service-address = "127.0.0.1:32003"|logtail internal access address|
|rpc-max-message-size = "16KiB"|maximum rpc message size used by logtail|
|rpc-payload-copy-buffer-size = "16KiB"|rpc copy buffer size|
|rpc-enable-checksum = true|whether to enable rpc checksum|
|logtail-collect-interval = "2ms"|logtail statistics collection interval|
|logtail-response-send-timeout = "10s"|logtail sending timeout|
|max-logtail-fetch-failure = 5|The maximum number of failures allowed by fetching logtail|

## log.toml

|Parameters|Description|
|---|---|
|service-type = "LOG" |Node Type|
|data-dir = "./mo-data"|Default data directory|
|[log]||
|level = "info" |Log level, can be modified to `info/debug/error/faltal`|
|format = "console" |Log format|
|max-size = 512|Log default length|
|[[fileservice]] |fileservice configuration, not recommended to change|
|name = "LOCAL"|fileservice storage type, local storage|
|backend = "DISK"|fileservice backend media, disk|
|[[fileservice]]||
|name = "SHARED" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
|[fileservice.cache]||
|memory-capacity = "512MB"|cache memory size used by fileservice|
|disk-capacity = "8GB"|cache disk size used by fileservice|
|disk-path = "mo-data/file-service-cache"|fileservice disk cache path|
|disk-min-evict-interval = "7m"|Interval for disk cache recovery, in seconds (s) or minutes (m)|
|disk-evict-target = 0.8|Target capacity for disk cache recovery, parameter is the ratio of template capacity to total capacity|
|[[fileservice]]||
|name = "ETL"|fileservice storage type, ETL|
|backend = "DISK-ETL"|fileservice backend, DISK-ETL|
|[observability]|Monitor parameters|
|statusPort = 7001|Reserve the monitoring port of Prometheus|
|enableTraceDebug = false|Enable the dbug mode of the trace|
|[hakeeper-client]|HAkeeper default address and port, not recommended to change|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[logservice] |The parameters of logservice, cannot be modified|
|deployment-id = 1 |Deployment ID of logservice|
|uuid = "7c4dccb4-4d3c-41f8-b482-5251dc7a41bf"|Node ID of logservice|
|raft-address = "127.0.0.1:32000"|The address of the raft protocol|
|logservice-address = "127.0.0.1:32001"|logservice address|
|gossip-address = "127.0.0.1:32002" |The address of the gossip protocol|
|gossip-seed-addresses = [<br>"127.0.0.1:32002",<br>]|The root node address of the gossip protocol|
|gossip-allow-self-as-seed = true|Whether to allow the gossip protocol to use this node as a root node|
|[logservice.BootstrapConfig]|Bootstrap parameters, cannot be modified|
|bootstrap-cluster = true|Whether bootstrap cluster launchs|
|num-of-log-shards = 1|The number of shards of logservice|
|num-of-tn-shards = 1|The number of shards of tn|
|num-of-log-shard-replicas = 1|The number of replicas of the logservice shard|
|init-hakeeper-members = [ <br>"131072:7c4dccb4-4d3c-41f8-b482-5251dc7a41bf",<br>]|Initialize members of hakeeper|
