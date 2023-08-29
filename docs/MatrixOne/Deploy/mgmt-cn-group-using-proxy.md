# Managing CN Groups with Proxy

Proxy is a new system component introduced in MatrixOne's 0.8 version. It can achieve account and load isolation, among other functionalities, through traffic proxying and forwarding. For the technical design of the Proxy, refer to [Detailed Proxy Architecture](../Overview/architecture/architecture-proxy.md).

This document primarily explains using Proxy to establish different CN groups for independent resource management of accounts and loads.

## System Architecture

As illustrated below, users first connect to the Proxy module. Based on the identity and label information in the user connection string, the Proxy component distributes the user's database connection to the corresponding CN group. Other CN groups will not receive this user connection nor participate in the computation process related to this connection.

A CN group is a logical CN group composed of CN nodes with the same attributes and size. It is a unit in the MatrixOne cluster used to isolate different resource groups. Each CN group can contain from 1 to infinite CN nodes and can use a series of labels to define its attributes. For example, determining the Account label corresponding to an account and forwarding the connection to a CN group with corresponding labels can realize account resource and business load isolation. With the feature that CN nodes in a CN group can scale horizontally indefinitely, an independent expansion for accounts or specified loads can be achieved.

To ensure the high availability of Proxy, at least 2 replicas should be set up in the cluster.

![proxy-cn-group](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/proxy-cn-group.png?raw=true)

When performing CN (Compute Node) downsizing, Proxy behaves as follows in the YAML file:

- Session Migration with the Same Label: When the number of CN replicas decreases, sessions with the same label will be migrated to other downsized CN nodes. This ensures the continuity and availability of sessions associated with specific labels.

- Session Migration with Different Labels: If a CN replica with a particular label is set to 0 or removed, based on label matching rules, sessions associated with that label will be migrated to idle labels in future sessions.

- Label Cancellation without Matching Labels: If a label is cancelled and no matching label exists, related sessions will be closed because there are no target CNs to receive these sessions.

Proxy manages session migration and closure during CN downsizing to ensure the isolation between workloads and tenants, as well as the continuity of business operations.

## Steps

The environment discussed in this document for managing CN groups using Proxy is based on the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

To help you understand resource isolation and allocation, you can refer to the table below, which illustrates the distribution of each hardware node in the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md), as follows:

| **Host**     | **Internal IP**        | **External IP**      | **Memory** | **CPU** | **Disk** | **Role**    |
| ------------ | ------------- | --------------- | ------- | ------- | -------- | ----------- |
| kuboardspray | 10.206.0.6    | 1.13.2.100      | 2G      | 2C      | 50G      | Jump server      |
| master0      | 10.206.134.8  | 118.195.255.252 | 8G      | 2C      | 50G      | master etcd |
| node0        | 10.206.134.14 | 1.13.13.199     | 8G      | 2C      | 50G      | worker      |

### Step One: Enable Proxy

To enable the Proxy component in the MatrixOne distributed cluster, you need to specify the required Proxy topology when creating the cluster, or after adding the Proxy topology to the existing cluster, execute `kubectl apply` to enable the Proxy component. The detailed steps are as follows:

1. Modify the `mo.yaml` file of the MatrixOne cluster:

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + proxy:
    +   replicas: 2 # For high availability, at least 2 replicas are required for the Proxy
    ```

2. After the modifications, run the `mo.yaml` file using the command below:

    ```
    kubectl apply -f mo.yaml
    ```

3. Run `kubectl get pod -nmo-hn` to check if the Proxy has started properly:

    ```
    root@HOST-10-206-134-16:~# kubectl get pod -nmo-hn
    NAME             READY   STATUS    RESTARTS   AGE
    mo-tn-0          1/1     Running   0          2m51s
    mo-log-0         1/1     Running   0          3m25s
    mo-log-1         1/1     Running   0          3m25s
    mo-log-2         1/1     Running   0          3m25s
    mo-proxy-69zjf   1/1     Running   0          2m51s
    mo-proxy-fpn2g   1/1     Running   0          2m51s
    mo-tp-cn-0       1/1     Running   0          2m25s
    ```

4. The code example for a successful start is shown above. This completes the start of the minimized Proxy component. You can use `kubectl get svc -nmo-hn` to connect to the cluster via the Proxy's SVC address.

    ```
    root@HOST-10-206-134-16:~# kubectl get svc -nmo-hn
    NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
    mo-tn-headless      ClusterIP   None          <none>        <none>           70m
    mo-log-discovery    ClusterIP   10.96.3.186   <none>        32001/TCP        71m
    mo-log-headless     ClusterIP   None          <none>        <none>           71m
    mo-proxy            NodePort    10.96.1.153   <none>        6001:31429/TCP   70m
    mo-tp-cn            ClusterIP   10.96.1.43    <none>        6001/TCP         70m
    mo-tp-cn-headless   ClusterIP   None          <none>        <none>           70m
    root@HOST-10-206-134-16:~# mysql -h 10.96.1.153 -P6001 -uroot -p111
    mysql: [Warning] Using a password on the command line interface can be insecure.
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 2064
    Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

    Copyright (c) 2000, 2023, Oracle and/or its affiliates.

    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective owners.

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

    mysql>
    ```

If multiple CNs exist in the entire cluster, Proxy will automatically implement connection-level load balancing and evenly distribute the user's connections to different CNs. You can query the system table `system_metrics.server_connections` to view the number of user connections on each CN.

### Step Two: Set Up CN Groups

In the `mo.yaml` file of the MatrixOne cluster, you need to configure CN groups by setting the `cnGroups` field and configure the `cnLabels` field in each `cnGroups` to set the labels of all CNs in the CN group. The Proxy will route and forward according to the connection labels. For example, you have set up two CN groups named `cn-set1` and `cn-set2` in the following example. Each CN group can have an independent number of replicas, log levels, CN parameter configurations, and CN labels.

The labels of CN groups adopt one-to-many groups of Key/value formats, in which there is a one-to-many relationship between each group of Key and value, i.e., each Key can have multiple values.

The detailed steps are as follows:

1. Refer to the configuration parameter example below to configure the labels of the CN group:

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + cnGroups:
    + - name: cn-set1
    +  	replicas: 1
    +  	cnLabels:
    +  	- key: "cn-set1"
    +  	  values: ["1", "high"]
    +   - key: "account"
    +     values: ["acc1"]
    +
    + - name: cn-set2
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "cn-set2"
    +			values: ["2", "medium"]
    +   - key: "account"
    +     values: ["acc2"]  
    ```

2. After the modifications, run the `mo.yaml` file using the command below:

    ```
    kubectl apply -f mo.yaml
    ```

3. Run `kubectl get pod -nmo-hn` to check if the Proxy has adequately started:

```
root@HOST-10-206-134-16:~# kubectl get pod -nmo-hn
NAME              READY   STATUS    RESTARTS   AGE
mo-cn-set1-cn-0   1/1     Running   0          6s
mo-cn-set2-cn-0   1/1     Running   0          6s
mo-tn-0           1/1     Running   0          97m
mo-log-0          1/1     Running   0          97m
mo-log-1          1/1     Running   0          97m
mo-log-2          1/1     Running   0          97m
mo-proxy-69zjf    1/1     Running   0          97m
mo-proxy-fpn2g    1/1     Running   0          97m
```

The code example for a successful start is shown above.

The label setting of CN groups is very flexible, but it is most commonly used for account and load isolation.

For how to achieve account isolation and load isolation, continue to the following sections.

#### Implementing account Isolation

MatrixOne 0.7 version supports [About MatrixOne Privilege Management](../Security/role-priviledge-management/about-privilege-management.md) data isolation. If account load isolation is to be implemented, it must be done by configuring Proxy and CN groups.

##### Ordinary accounts

In the label setting of CN groups, the `account` label is a reserved field used to match accounts.

In this chapter, assuming that account load isolation needs to be implemented for `acc1` and `acc2`, you can refer to the detailed steps below:

!!! note
    Only users with system account permissions can configure load isolation for ordinary accounts.

1. Log into the MatrixOne cluster using the system account. For the username and password, please look at your company's *Database Administrator*. After logging into the MatrixOne cluster, create two new accounts, `acc1` and `acc2`:

    ```sql
    -- Create a new account acc1 with a password of 123456 (a simple password is set here, which is only used as an example)
    mysql> create account acc1 admin_name 'admin' identified by '123456';
    -- Create a new account acc2 with a password of 123456 (a simple password is set here, which is only used as an example)
    mysql> create account acc2 admin_name 'admin' identified by '123456';
    ```

2. Modify the `mo.yaml` file of the MatrixOne cluster, and label the two CN groups with `account:acc1` and `account:acc2` respectively, corresponding to tenants named `acc1` and `acc2` respectively:

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + cnGroups:
    + - name: cn-set1
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "account"
    +     values: ["acc1"]
    +
    + - name: cn-set2
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "account"
    +     values: ["acc2"]  
    ```

3. Modify the `mo.yaml` file of the MatrixOne cluster, and label the two CN groups with `account:acc1` and `account:acc2` respectively, corresponding to the accounts named `acc1` and `acc2` respectively:

```sql
-- acc1 account login MatrixOne
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc1:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32309
Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
-- acc1 checks which CN groups are used for login
mysql> show backend servers;
+--------------------------------------+-------------------------------------------------------+------------+------------------------------+
| UUID                                 | Address                                               | Work State | Labels                       |
+--------------------------------------+-------------------------------------------------------+------------+------------------------------+
| 32333337-3966-3137-3032-613035306561 | mo-cn-set1-cn-0.mo-cn-set1-cn-headless.mo-hn.svc:6001 | Working    | account:acc1;cn-set1:1,high; |
+--------------------------------------+-------------------------------------------------------+------------+------------------------------+
1 row in set (0.00 sec)
```

```sql
-- acc2 account login MatrixOne
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc2:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32640
Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
-- acc2 checks which CN groups are used for login
mysql> show backend servers;
+--------------------------------------+-------------------------------------------------------+------------+--------------------------------+
| UUID                                 | Address                                               | Work State | Labels                         |
+--------------------------------------+-------------------------------------------------------+------------+--------------------------------+
| 33663265-3234-3365-3737-333030613535 | mo-cn-set2-cn-0.mo-cn-set2-cn-headless.mo-hn.svc:6001 | Working    | account:acc2;cn-set2:2,medium; |
+--------------------------------------+-------------------------------------------------------+------------+--------------------------------+
1 row in set (0.00 sec)
```

If an ordinary account does not have a corresponding CN group, then the account cannot log in successfully. For example, if you create a account `acc3` that does not correspond to a CN group label and try to log in, you will get a `no available CN server` error.

```
mysql> create account acc3 admin_name 'admin' identified by '123456';
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc3:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): internal error: no available CN server
```

##### System account

For system accounts, MatrixOne will automatically select an appropriate CN group to connect in the following order:

* Highest priority: Select the CN group configuring the `account` label as `sys`.
* Second highest priority: Select the CN group configuring other labels but not the `account` label.
* Medium priority: Select the CN group that has not configured labels.
* Low priority: If none of the above CN groups exist, then choose randomly from the existing CN groups.

Based on this principle, system accounts will prioritize the CN groups specifically reserved for themselves or not for other accounts. However, suppose the above conditions are not met. In that case, the system account might share a CN group with other accounts and thus cannot ensure load isolation between the system account and ordinary accounts.

#### Implementing Load Isolation

The use case for the Proxy agent is load isolation. In many standard business environments, such as high-concurrency writes, report generation, backup, and significant data export, traditional database solutions often require the deployment of specific instances to achieve load isolation. This approach also results in an additional burden of data synchronization.

MatrixOne uses a Proxy to implement resource group division, which can flexibly combine CN groups with user-specified load labels. In the event of load changes, MatrixOne can adjust the scale of the resource group through software configuration, thus better adapting to changes.

Using the above example, you can set the load labels of two CNs to `olap` and `oltp`, respectively. Then, use SSB to simulate the OLTP load and TPCH to simulate the OLAP load.

!!! note
    When performing performance testing, you must first scale out the entire cluster.

```
metadata:
  name: mo
  namespace: mo-hn
spec:
+ cnGroups:
+ - name: cn-set1
+  	replicas: 1
+  	cnLabels:
+  	- key: "workload"
+     # The load label is set to olap
+  	  values: ["olap"]
+
+ - name: cn-set2
+  	replicas: 1
+  	cnLabels:
+   - key: "workload"
+     # The load label is set to oltp
+			values: ["oltp"]
```

After configuring the load of the cluster, you can connect to the cluster for load testing:

1. Connect via JDBC:

    Specify connection attributes in the JDBC connection string, and set the corresponding key and value. A colon separates the key and value `:`, and a comma separates multiple key-values `,`. Examples are as follows:

    ```
    jdbc:mysql://localhost:6001/test_db1?serverTimezone=UTC&connectionAttributes=workload:olap,another_key:test_value
    ```

2. Connect via MySQL client:

     Use the MySQL client to connect by extending the username field. Add `?` after the username (username), and the subsequent writing method follows the connectionAttributes format in JDBC. The difference from the connectionAttributes format in JDBC is that the key and value are separated by `=`, and between multiple key-values, Use commas `,` to separate them; examples are as follows:

     ```
     mysql -h127.0.0.1 -uuser1?workload=olap,another_key=test_value -P6001 -pxxx
     ```
