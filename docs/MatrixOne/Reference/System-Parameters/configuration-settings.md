# **Boot Parameters for standalone installation**

There are three configuration files *cn.toml*, *dn.toml* and *log.toml* in the *matrixone/etc/launch-tae-CN-tae-DN/* directory.

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

## dn.toml

|Parameters|Description|
|---|---|
|service-type = "DN" |Node Type|
|data-dir = "./mo-data"|Default data directory|
|[log]||
|level = "info" |Log level, can be modified to `info/debug/error/faltal`|
|format = "console" |Log format|
|max-size = 512|Log default length|
|[hakeeper-client]|HAkeeper default address and port, not recommended to change|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
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
|[[fileservice]]||
|name = "ETL"|fileservice storage type, ETL|
|backend = "DISK-ETL"|fileservice backend, DISK-ETL|
|[dn]||
|uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"|uuid of dn, cannot be modified|
|[dn.Txn.Storage]|The storage engine of the dn transaction backend, cannot be modified|
|backend = "TAE" ||
|log-backend = "logservice"||
|[dn.Ckp]|the checkpoint related parameters of dn, not recommended to change|
|flush-interval = "60s" |internal refresh interval|
|min-count = 100 |Minimum number of checkpoints|
|scan-interval = "5s"|internal scan interval|
|incremental-interval = "180s"|checkpoint increment interval|
|global-min-count = 60 |The global minimum number of dn checkpoints|
|[dn.LogtailServer]||
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
|num-of-dn-shards = 1|The number of shards of dn|
|num-of-log-shard-replicas = 1|The number of replicas of the logservice shard|
|init-hakeeper-members = [ <br>"131072:7c4dccb4-4d3c-41f8-b482-5251dc7a41bf",<br>]|Initialize members of hakeeper|
