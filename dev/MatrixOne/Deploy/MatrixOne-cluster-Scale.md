# Scaling MatrixOne Cluster

This document will introduce how to scale the MatrixOne cluster, including the Kubernetes cluster and scaling of individual MatrixOne services.

The environment introduced in this document will be based on the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

### When is it necessary to scale

To determine whether the MatrixOne service needs to be scaled up or down, users need to monitor the nodes where the MatrixOne cluster resides and the resources used by the Pods corresponding to related components. You can do this with the `kubectl top` command. For more detailed operation steps, please refer to [Health Check and Resource Monitoring](health-check-resource-monitoring.md).

In general, if the resource usage of a node or Pod exceeds 60% and lasts for some time, consider expanding capacity to cope with the peak load. In addition, capacity expansion operations must also be considered if a high TPS request volume is observed according to business indicators.

## Scaling Kubernetes

Kubernetes manages and allocates essential hardware resources in the distributed MatrixOne cluster. Kubernetes can expand or contract the hardware nodes in the cluster using the kuboard spray graphical management page. For more information on tutorials, see [kuboard spray official documents](https://kuboard-spray.cn/guide/maintain/add-replace-node.html).

You need to add a working node to the cluster, and the overall hardware configuration resources are shown in the following table:

| **Host**     | **Internal IP**        | **External IP**      | **mem** | **CPU** | **Disk** | **Role**    |
| ------------ | ------------- | --------------- | ------- | ------- | -------- | ----------- |
| kuboardspray | 10.206.0.6    | 1.13.2.100      | 2G      | 2C      | 50G      | 跳板机      |
| master0      | 10.206.134.8  | 118.195.255.252 | 8G      | 2C      | 50G      | master etcd |
| node0        | 10.206.134.14 | 1.13.13.199     | 8G      | 2C      | 50G      | worker      |
| node1        | 10.206.134.16 | 129.211.211.29  | 8G      | 2C      | 50G      | worker      |

## Scaling MatrixOne Services

Scaling of services refers to expanding or contracting the core component services within the MatrixOne cluster, such as Log Service, TN, and CN. Based on the architectural characteristics of MatrixOne, the following conditions apply to these service nodes:

- Log Service has only 3 nodes.
- TN has only 1 node.
- The number of CN nodes is flexible.

Therefore, scaling of Log Service and TN nodes is possible only through vertical scaling. However, CN nodes can be scaled both vertically and horizontally.

### Horizontal scaling

Horizontal scaling refers to the increase or decrease in the number of copies of a service. You can change the number of service replicas by modifying the value of the `.spec.[component].replicas` field in the MatrixOne Operator startup yaml file.

1. Use the following command to activate the value of the `.spec.[component].replicas` field in the yaml file:

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n ${mo_ns}
    ```

2. Enter edit mode:

    ```
    tp:
        replicas: 2 #Changed from 1 CN to 2 CNs
    #Other content is ignored
    ```

    !!! note
        You can also refer to the above steps to change the field value of `replicas` for scaling down.

3. After editing the number of `replicas`, saving, and exiting, MatrixOne Operator will automatically start a new CN. You can observe the new CN status with the following command:

    ```
    [root@master0 ~]# kubectl get pods -n mo-hn      
    NAME                                  READY   STATUS    RESTARTS     AGE
    matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
    mo-tn-0                               1/1     Running   0            11m
    mo-log-0                              1/1     Running   0            12m
    mo-log-1                              1/1     Running   0            12m
    mo-log-2                              1/1     Running   0            12m
    mo-tp-cn-0                            1/1     Running   0            11m
    mo-tp-cn-1                            1/1     Running   0            63s
    ```

In addition, Kubernetes' SVC will automatically ensure CN load balancing and user connections will be evenly distributed to different CNs. You can view the number of connections on each CN through the built-in `system_metrics.server_connections` table of MatrixOne.

### Vertical scaling

Vertical scaling refers to the resources required to serve a copy of a single component, such as adjusting CPU or memory.

1. Use the following command to modify the configuration of `requests` and `limits` in the corresponding component's `.spec.[component].resources`. The example is as follows:

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n ${mo_ns}
    ```

2. Enter edit mode:

    ```
    metadata:
      name: mo
      # content omitted
    spec:
      tp:
    		resources:
          requests:
            cpu: 1
            memory: 2Gi
          limits:
            cpu: 1
            memory: 2Gi
    ...
    # content omitted
    ```

### Node Scheduling

By default, Matrixone-operator does not configure topology rules for each component's Pod but uses Kubernetes' default scheduler to schedule according to each Pod's resource request. If you need to set specific scheduling rules, such as scheduling the cn component to two specific nodes, node0, and node1, you can follow the steps below:

1. Set labels for `node0` and `node1`.

2. Set `nodeSelector` in the MatrixOne cluster so the service can be scheduled to the corresponding node.

3. (Optional) Set the `TopologySpread` field in the MatrixOne cluster to achieve an even distribution of services across nodes.

4. Set the number of replicas `replicas` in the MatrixOne cluster.

#### Set node label

1. Execute the following command to view the status of the cluster nodes:

    ```
    [root@master0 ~]# kubectl get node
    NAME      STATUS   ROLES                  AGE   VERSION
    master0   Ready    control-plane,master   47h   v1.23.17
    node0     Ready    <none>                 47h   v1.23.17
    node1     Ready    <none>                 65s   v1.23.17
    ```

2. According to the above-returned results and actual needs, you can label the nodes; see the following code example:

    ```
    NODE="[node to be labeled]" # According to the above results, it may be IP, hostname, or alias, such as 10.0.0.1, host-10-0-0-1, node01, then set NODE = "node0"
    LABEL_K="mo-role" # The key of the label, which can be defined on demand, or can be directly used as an example
    LABEL_V="mo-cn" # The value of the label, which can be defined as needed, or can be directly used as an example

    kubectl label node ${NODE} ${LABEL_K}=${LABEL_V}
    ```

3. In this case, you can also write the following two statements:

    ```
    kubectl label node node0 "mo-role"="mo-cn"
    kubectl label node node1 "mo-role"="mo-cn"
    ```

4. Use the following command to confirm that the node label is printed:

    ```
    [root@master0 ~]# kubectl get node node0 --show-labels | grep mo_role     
    node0   Ready    <none>   47h   v1.23.17   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=node0,kubernetes.io/os=linux,mo_role=mo_cn
    [root@master0 ~]# kubectl get node node1 --show-labels | grep mo_role
    node1   Ready    <none>   7m25s   v1.23.17   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=node1,kubernetes.io/os=linux,mo_role=mo_cn
    ```

5. Execute the following command to delete tags as needed:

    ```
    kubectl label node ${NODE} ${LABEL_K}-
    ```

#### Set service scheduling rules, uniform distribution, and number of copies

1. Execute the following command to view the current distribution of Pods on multiple nodes:

    ```
    [root@master0 mo]# kubectl get pod -nmo-hn -owide
    NAME         READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
    mo-tn-0      1/1     Running   0          34m   10.234.60.120   node0   <none>           2/2
    mo-log-0     1/1     Running   0          34m   10.234.168.72   node1   <none>           2/2
    mo-log-1     1/1     Running   0          34m   10.234.60.118   node0   <none>           2/2
    mo-log-2     1/1     Running   0          34m   10.234.168.73   node1   <none>           2/2
    mo-tp-cn-0   1/1     Running   0          33m   10.234.168.75   node1   <none>           2/2
    ```

2. According to the above output and actual requirements, it can be seen that there is only one CN at present, and we need to set the scheduling rules for the CN component. We will modify it in the properties of the MatrixOne cluster object. The new CN will be scheduled to node0 under the rule of uniform distribution within the scheduling scope. Execute the following command to enter edit mode:

    ```
    mo_ns="mo-hn"
    mo_cluster_name="mo" # The general name is mo, specified by the name in the yaml file of the matrixonecluster object during deployment, or confirmed by kubectl get matrixonecluster -n${mo_ns}
    kubectl edit matrixonecluster ${mo_cluster_name} -n ${mo_ns}
    ```

3. In edit mode, according to the above scenario, we will set the number of copies of CN to 2 and schedule on nodes labeled `mo-role:mo-cn` to achieve uniform distribution within the scheduling range. We will use `spec.[component].nodeSelector` to specify the tag selector for a specific component. Here is the edited content of the example:

    ```
    metadata:
      name: mo
    # Intermediate content omitted
    spec:
    # Intermediate content omitted
      tp:
        # Set the number of replicas
        replicas: 2
        # Set scheduling rules
        nodeSelector:
          mo-role: mo-cn
        # Set the uniform distribution within the scheduling range
        topologySpread:
          - topology.kubernetes.io/zone
          - kubernetes.io/hostname
    #Other content omitted
    ```

4. After the change takes effect, execute the following command to check that the two CNs are already on the two nodes:

    ```
    [root@master0 ~]# kubectl get pod -nmo-hn -owide      
    NAME         READY   STATUS    RESTARTS        AGE     IP              NODE    NOMINATED NODE   READINESS GATES
    mo-tn-0      1/1     Running   1 (2m53s ago)   3m6s    10.234.168.80   node1   <none>           2/2
    mo-log-0     1/1     Running   0               3m40s   10.234.168.78   node1   <none>           2/2
    mo-log-1     1/1     Running   0               3m40s   10.234.60.122   node0   <none>           2/2
    mo-log-2     1/1     Running   0               3m40s   10.234.168.77   node1   <none>           2/2
    mo-tp-cn-0   1/1     Running   0               84s     10.234.60.125   node0   <none>           2/2
    mo-tp-cn-1   1/1     Running   0               86s     10.234.168.82   node1   <none>           2/2
    ```

It should be noted that the configuration in the above example will make the Pods in the cluster evenly distributed on the two dimensions `topology.kubernetes.io/zone` and `kubernetes.io/hostname`. The tag keys specified in `topologySpread` are ordered. In the example above, Pods is first distributed evenly across the Availability Zones dimension, and then Pods within each Availability Zone are evenly distributed across the nodes within that zone.

Using the `topologySpread` function can increase the availability of the cluster and reduce the possibility of destroying the majority of replicas in the cluster due to a single point or regional failure. But this also increases the scheduling requirements and the need to ensure that the cluster has enough resources available in each region.
