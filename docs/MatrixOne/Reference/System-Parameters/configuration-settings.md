# **General Parameters Settings**

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
|name = "S3" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
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
|name = "S3" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
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
|global-interval = "100000s" |Global checkpoint interval|

## log.toml

|Parameters|Description|
|---|---|
|service-type = "LOG" |Node Type|
|data-dir = "./mo-data"|Default data directory|
|[log]||
|level = "info" |Log level, can be modified to `info/debug/error/faltal`|
|format = "console" |Log format|
|max-size = 512|Log default length|
|[[fileservice]]||
|name = "S3" |fileservice storage type, S3|
|backend = "DISK"|fileservice backend, disk|
|data-dir = "mo-data/s3"|s3 storage data directory|
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
|gossip-seed-addresses = [<br>"127.0.0.1:32002",<br>]|
The root node address of the gossip protocol|
|gossip-allow-self-as-seed = true|Whether to allow the gossip protocol to use this node as a root node|
|[logservice.BootstrapConfig]|Bootstrap parameters, cannot be modified|
|bootstrap-cluster = true|Whether bootstrap cluster launchs|
|num-of-log-shards = 1|The number of shards of logservice|
|num-of-dn-shards = 1|The number of shards of dn|
|num-of-log-shard-replicas = 1|The number of replicas of the logservice shard|
|init-hakeeper-members = [ <br>"131072:7c4dccb4-4d3c-41f8-b482-5251dc7a41bf",<br>]|Initialize members of hakeeper|
