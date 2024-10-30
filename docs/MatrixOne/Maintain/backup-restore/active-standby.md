# MatrixOne active and backup disaster recovery function

MatrixOne supports the cold backup function of the active and standby clusters based on log replication. It ensures the consistency and high availability of the active and standby data by synchronizing the transaction logs of the primary database to the standby database in real time. When the primary database fails, the standby database can quickly take over the business to ensure uninterrupted operations; after the fault is restored, the system can synchronize the data in the standby database back to the primary database to achieve seamless switchback. This solution significantly reduces downtime, improves data reliability and service continuity, and is suitable for scenarios such as finance and e-commerce that have high requirements for high availability.

## Operation steps

### Main cluster configuration

#### Modify configuration file

Go to the /your_matrixone_path/etc/launch directory and add the standby configuration of fileservice. Both the normal copy and the non-voting copy need to be configured.

- Added log1.toml, the log node where the normal copy is located

```shell
service-type = "LOG"
data-dir = "./mo-data"
  
[log]
level = "info"
  
[malloc]
check-fraction = 65536
enable-metrics=true
[[fileservice]]
name = "STANDBY"
backend = "DISK"
data-dir = "mo-data/standby"
  
#For a normal logservice copy, add a configuration item to the bootstrap configuration group to start synchronization of the standby cluster.
[logservice.BootstrapConfig]
standby-enabled = true
```

- Added log2.toml, the log node where the non-voting copy is located

```shell
#You need to start at least one more logservice instance as a node running a non-voting replica, and configure locality for this instance: (127.0.0.1 in the configuration needs to be replaced with the actual IP address)
service-type = "LOG"
data-dir = "./mo-data"
  
[log]
level = "info"
  
[malloc]
check-fraction = 65536
enable-metrics=true
  
[[fileservice]]
name = "STANDBY"
backend = "DISK"
data-dir = "mo-data/standby"
  
[logservice]
deployment-id=1
uuid = "4c4dccb4-4d3c-41f8-b482-5251dc7a41bd" #UUID of the new node
raft-address = "127.0.0.1:32010" # The address of raft service
logservice-address = "127.0.0.1:32011" # The address of the logservice service
logservice-listen-address = "0.0.0.0:32011"
gossip-address = "127.0.0.1:32012" # The address of the gossip service
gossip-seed-addresses = [ # The gossip seed addresses of normal replicas
"127.0.0.1:32002",
"127.0.0.1:32012"
]
locality = "region:west" # Configure locality to run non-voting replicas
[logservice.BootstrapConfig]
bootstrap-cluster = false # Turn off bootstrap operation
standby-enabled = true # Start standy function
  
[hakeeper-client]
discovery-address="127.0.0.1:32001" # 32001 is the default HAKeeper address
```

- Modify launch.toml

```shell
logservices = [
      "./etc/launch/log1.toml",
      "./etc/launch/log2.toml"
  ]
  
  tnservices = [
      "./etc/launch/tn.toml"
  ]
  
  cnservices = [
      "./etc/launch/cn.toml"
  ]
```

#### Start non-voting replica

After the MO cluster is started, execute the SQL command to dynamically increase or decrease the non-voting replicas:

- Set non-voting locality, which needs to be the same as in the configuration file:

    ```bash
    mysql> set logservice settings non_voting_locality="region:west";
    Query OK, 0 rows affected (0.01 sec)
    ```

- Set the non-voting replica num. The following command sets the number of non-voting replicas to 1:

   ```
   mysql> set logservice settings non_voting_replica_num=1;
   Query OK, 0 rows affected (0.02 sec)
   ```

After executing the command, wait a moment and query the replica status through two SQL commands:

- show logservice stores;

   ```sql
    mysql> show logservice stores;
    +-----------------------------------------+------+-------------+---------------------------+-------------+-----------------+-----------------+-----------------+
    | store_id | tick | replica_num | replicas | locality | raft_address | service_address | gossip_address |
    +----------------------------------------+------+-------------+---------------------------+-------------+-----------------+-----------------+-----------------+
    | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd | 975 | 3 | 0:262148;1:262149;3:262150 | region:west | 127.0.0.1:32010 | 127.0.0.1:32011 | 127.0.0.1: 32012 |
    | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf | 974 | 3 | 0:131072;1:262145;3:262146 |
    +-----------------------------------------+------+-------------+---------------------------+-------------+-----------------+-----------------+-----------------+
    2 rows in set (0.02 sec)
   ```

- show logservice replicas;

   ```sql
   mysql> show logservice replicas;
   +----------+------------+--------------+-----------------------+------+-------+---------------------------------------+
   | shard_id | replica_id | replica_role | replica_is_non_voting | term | epoch | store_info |
   +----------+------------+---------------+-----------------------+------+-------+---------------------------------------+
   | 0 | 131072 | Leader | false | 2 | 1059 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   | 0 | 262148 | Follower | true | 2 | 1059 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   | 1 | 262145 | Leader | false | 2 | 120 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   | 1 | 262149 | Follower | true | 2 | 120 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   | 3 | 262146 | Leader | false | 2 | 12 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   | 3 | 262150 | Follower | true | 2 | 12 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   +----------+------------+--------------+-----------------------+------+-------+---------------------------------------+
   6 rows in set (0.01 sec)
   ```

### Copy data files to the standby cluster

1. Stop the main cluster, including the non-voting logservice service of the main cluster.
2. Copy the standby files to the mo-data/shared directory of the standby machine.

    ``` shell
    cp -r /your_matrixone_pathe/mo-data/standby/*<username>@<ip>:/your_matrixone_path/mo-data/shared/
    ```
  
3. Copy the data in the non-voting copy of the primary cluster to the logservice-data/directory of the standby machine.

    ``` shell
    cp -r /your_matrixone_pathe/mo-data/logservice-data/<uuid>/<username>@<ip>:/your_matrixone_pathe/mo-data/logservice-data/
    ```

    Where <uuid> is the uuid configured in the configuration file of the non-voting logservice instance.

### Start the standby cluster

#### Data synchronization

The standby cluster uses the logtail data synchronization tool `mo_ctl` to synchronize the data in the non-voting copy of the primary cluster to the logservice of the standby cluster. The command is as follows:

```shell
mo_ctl data-sync start --logservice-address=127.0.0.1:32001 --log-data-dir=/your_matrixone_path/mo-data/logservice-data/<uuid>/<main cluster hostname>/00000000000000000001/tandb
```

Where <uuid> is the uuid configured in the configuration file of the non-voting logservice instance.

!!! note
    mo_ctl is a tool for MatrixOne distributed enterprise-level management. You need to contact your account manager to obtain it.

#### Stop the logservice service

```shell
kill `ps -ef | grep mo-service | grep -v grep | awk '{print $2}'`
```

#### Start TN, CN and Log services

```
nohup ./mo-service -launch etc/launch/launch.to ml >mo.log 2>&1 &
```