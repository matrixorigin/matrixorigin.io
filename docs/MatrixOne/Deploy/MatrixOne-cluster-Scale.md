# Scaling MatrixOne Cluster

This document will introduce how to scale the MatrixOne cluster, including the Kubernetes cluster and scaling of individual MatrixOne services.

The upgraded environment introduced in this document will be based on the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

## Scaling Kubernetes

Kubernetes manages and allocates essential hardware resources in the distributed MatrixOne cluster. Kubernetes can expand or contract the hardware nodes in the cluster using the kuboard spray graphical management page. For more information on tutorials, see [kuboard spray official documents](https://kuboard-spray.cn/guide/maintain/add-replace-node.html #%E5%B7%A5%E4%BD%9C%E8%8A%82%E7%82%B9).

## Scaling MatrixOne Services

Scaling of services refers to expanding or contracting the core component services within the MatrixOne cluster, such as Log Service, DN, and CN. Based on the architectural characteristics of MatrixOne, the following conditions apply to these service nodes:

- Log Service has only 3 nodes.
- DN has only 1 node.
- The number of CN nodes is flexible.

Therefore, scaling of Log Service and DN nodes is possible only through vertical scaling. However, CN nodes can be scaled both vertically and horizontally.

### Horizontal scaling

Horizontal scaling refers to the increase or decrease in the number of copies of a service. You can change the number of service replicas by modifying the value of the `.spec.[component].replicas` field in the MatrixOne Operator startup yaml file.

1. Use the following command to activate the value of the `.spec.[component].replicas` field in the yaml file:

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n ${mo_ns}
    ```

2. Enter edit mode:

    ```
    tp:
        replicas: 2 #1CN-->2CN
    #Other content is ignored
    ```

3. After editing the number of `replicas`, saving, and exiting, MatrixOne Operator will automatically start a new CN. You can observe the new CN status with the following command:

    ```
    [root@master0 ~]# kubectl get pods -n mo-hn      
    NAME                                  READY   STATUS    RESTARTS     AGE
    matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
    mo-dn-0                               1/1     Running   0            11m
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

## Resource monitoring of MatrixOne services

To determine whether the MatrixOne service needs to be scaled up or down, users often need to monitor the resources used by the Node where the MatrixOne cluster resides and the pods corresponding to the components.

You can use the `kubectl top` command to complete it. For detailed commands, please take a look at the [Kubernetes official website document](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#top) of

### Node Monitoring

1. Use the following command to view the details of MatrixOne cluster nodes:

    ```
    kubectl get node
    ```

2. Check a node's resource usage according to the above command's return result.

    __Note:__ The CPU unit Node monitors is 1000m, meaning 1 Core.

    ```
    NODE="[node to be monitored]" # According to the above results, it may be IP, hostname, or alias, such as 10.0.0.1, host-10-0-0-1, node01
    kubectl top node ${NODE}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_26882_o0_zGd-Bas_79VSn_1681273662?w=1136&h=424)

3. View the resource usage of all nodes in the MatrixOne cluster:

    ```
    kubectl top node
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_262920_-FbamlYNvfA3MZ_Q_1681274050?w=1222&h=176)

### Pod Monitoring

1. Run the following command to check the Pods of the MatrixOne cluster:

    ```
    NS="mo-hn"
    kubectl get pod -n ${NS}
    ```

2. Check the resource usage of a Pod according to the return result of the above command:

    ```
    POD="[pod name to be monitored]" # According to the above results, for example dn is mo-dn-0, cn is mo-tp-cn-0, mo-tp-cn-1, ..., logservice is mo -log-0, mo-log-1, ...
    kubectl top pod ${POD} -n ${NS}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_868871_vHRDl2Xto4ZMN6S4_1681273933?w=1372&h=594)

3. Use the following command to view the resource usage of all components of MatrixOne:
    ```
    kubectl top pod -n${NS}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_855850_Otf-sCx5KPZhaprO_1681274035?w=1274&h=384)
