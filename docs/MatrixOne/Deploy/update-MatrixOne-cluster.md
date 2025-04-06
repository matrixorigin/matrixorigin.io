# MatrixOne Distributed Cluster Upgrade

This document will introduce how to **Rolling upgrade** or **Reinstall upgrade** MatrixOne clusters.

The upgraded environment introduced in this document will be based on the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

## Rolling upgrade

Rolling upgrade is an online upgrade method; the MatrixOne cluster completes the software upgrade while ensuring that some or all services are available.

According to the introduction in [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md), the overall installation of MatrixOne is based on Kubernetes and MatrixOne Operator. Therefore, the rolling upgrade process is to realize automatic version updates by dynamically modifying the MatrixOne image version number in MatrixOne Operator.

### Steps

1. Execute the following command on the terminal on the master0 node to enter the interface for dynamically modifying the `yaml` configuration file the operator uses.

    ```
    mo_ns="mo-hn" #the namespace of matrixone cluster
    mo_cluster_name="mo" # The cluster name of matrixone, generally mo, is specified according to the name in the YAML file of the matrixonecluster object during deployment or can be confirmed by kubectl get matrixonecluster -n${mo_ns}
    # mo-hn and mo have been set in the mo.yaml file of the installation and deployment
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

2. After entering edit mode, modify the value of `spec.version`; the parameters are as below:

    - ${TAG}: corresponds to the image tag of Matrixone on dockerhub, for example: nightly-f0d52530

    - ${REPO_URL}: public mirror repository for Matrixone, the default is matrixorigin/matrixone. If the target version does not exist in the public mirror warehouse of MatrixOne, you also need to modify the URL of the mirror warehouse to the existing warehouse:

    ![image-20230407094237806](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/image-20230407094237806.png?raw=true)

    ![image-20230407094251938](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/image-20230407094251938.png?raw=true)

3. After completing the modification, press `:wq` to save. MatrixOne Operator will automatically pull the new version of the image and restart the component services, including Log Service, TN, and CN. You can also observe its running status through the following commands.

    ```
    watch -e "kubectl get pod -n${mo_ns}"
    ```

    ```
    NAME                                 READY   STATUS    RESTARTS      AGE
    matrixone-operator-f8496ff5c-fp6zm   1/1     Running   0             24h
    mo-tn-0                              1/1     Running   1 (51s ago)   18h
    mo-log-0                             1/1     Running   0             18h
    mo-log-1                             1/1     Running   1 (5s ago)    18h
    mo-log-2                             1/1     Running   1 (53s ago)   18h
    mo-tp-cn-0                           1/1     Running   1 (53s ago)   18h
    ```

    If an error, crashbackoff, etc., occurs, you can further troubleshoot the problem by viewing the component log.

    ```
    #pod_name is the name of the pod, such as mo-tn-0, mo-tp-cn-0
    pod_name=mo-tn-0
    kubectl logs ${pod_name} -nmo-hn > /tmp/tn.log
    vim /tmp/tn.log
    ```

4. After the `Restart` of the components in the MatrixOne cluster is completed, you can use the MySQL Client to connect to the cluster. The upgrade is successful if the connection is successful and the user data is complete.

    ```
    # Connect to the MySQL server using the 'mysql' command line tool
    # Use 'kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}' ' to get the cluster IP address of the service in the Kubernetes cluster
    # The '-h' parameter specifies the hostname or IP address of the MySQL service
    # The '-P' parameter specifies the port number of the MySQL service, here is 6001
    # '-uroot' means log in with root user
    # '-p111' means the initial password is 111
    mysql -h $(kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
    root@master0 ~]# mysql -h $(kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
    Welcome to the MariaDB monitor.  Commands end with ; or \g.
    Your MySQL connection id is 1005
    Server version: 8.0.30-MatrixOne-v2.1.0 MatrixOne

    Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    MySQL [(none)]> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | mo_task            |
    | information_schema |
    | mysql              |
    | system_metrics     |
    | system             |
    | test               |
    | mo_catalog         |
    +--------------------+
    7 rows in set (0.01 sec)
    ```

    !!! info
        The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](../Security/password-mgmt.md).

5. The rolling update may be suspended due to incorrect configuration (such as specifying a non-existing version when upgrading). At this point, you can re-modify the dynamic configuration of the operator, reset the version number, roll back the changes, and the failed Pods will be re-updated.

6. You can check the version number of the current MatrixOne deployment with the following command:

    ```
    [root@master0 matrixone-operator]# kubectl get matrixoneclusters -n mo-hn -o yaml | grep version
            {"apiVersion":"core.matrixorigin.io/v1alpha1","kind":"MatrixOneCluster","metadata":{"annotations":{},"name":"mo","namespace":"mo-hn"},"spec":{"tn":{"cacheVolume":{"size":"5Gi","storageClassName":"local-path"},"config":"[dn.Txn.Storage]\nbackend = \"TAE\"\nlog-backend = \"logservice\"\n[dn.Ckp]\nflush-interval = \"60s\"\nmin-count = 100\nscan-interval = \"5s\"\nincremental-interval = \"60s\"\nglobal-interval = \"100000s\"\n[log]\nlevel = \"error\"\nformat = \"json\"\nmax-size = 512\n","replicas":1,"resources":{"limits":{"cpu":"200m","memory":"1Gi"},"requests":{"cpu":"100m","memory":"500Mi"}}},"imagePullPolicy":"IfNotPresent","imageRepository":"matrixorigin/matrixone","logService":{"config":"[log]\nlevel = \"error\"\nformat = \"json\"\nmax-size = 512\n","pvcRetentionPolicy":"Retain","replicas":3,"resources":{"limits":{"cpu":"200m","memory":"1Gi"},"requests":{"cpu":"100m","memory":"500Mi"}},"sharedStorage":{"s3":{"endpoint":"http://minio.mostorage:9000","path":"minio-mo","secretRef":{"name":"minio"},"type":"minio"}},"volume":{"size":"1Gi"}},"tp":{"cacheVolume":{"size":"5Gi","storageClassName":"local-path"},"config":"[cn.Engine]\ntype = \"distributed-tae\"\n[log]\nlevel = \"debug\"\nformat = \"json\"\nmax-size = 512\n","nodePort":31429,"replicas":1,"resources":{"limits":{"cpu":"200m","memory":"2Gi"},"requests":{"cpu":"100m","memory":"500Mi"}},"serviceType":"NodePort"},"version":"nightly-54b5e8c"}}
        version: nightly-54b5e8c
    ```

## Reinstall and upgrade

Reinstalling and upgrading mean all MatrixOne clusters will be deleted and the data discarded and reinstalled.

**Applicable scene**:

- no need for old data
- The versions before and after the upgrade are not compatible with each other due to special reasons

!!! note
    Before the operation, please ensure the data has been backed up (see modump backup tool) and the business knows that the database has stopped.

### Steps

#### 1. Delete the old version cluster

In master0, the old version cluster can be deleted in any of the following ways:

```
# Method 1: Delete through the YAML file of the mo cluster during deployment, for example:
kubectl delete -f /root/deploy/mo.yaml
# Method 2: By deleting the matrixonecluster object, where mo is the name
kubectl delete matrixonecluster.core.matrixorigin.io mo -nmo-hn
```

Confirm that mo-related resources have been deleted by checking the pod status:

```
kubectl get pod -nmo-hn
```

In addition, if the PVC used by mo has not been deleted, use the following command to delete it manually:

```
kubectl get pvc -nmo-hn
# For example, the PVC used by the log service has not been deleted, delete it manually
kubectl delete pvc mo-data-mo-log-0 -nmo-hn
kubectl delete pvc mo-data-mo-log-1 -nmo-hn
kubectl delete pvc mo-data-mo-log-2 -nmo-hn
```

#### 2. Empty bucket data

On the MinIO control page, delete the data in the bucket used by MinIO used by MO, including subdirectories such as mo-data, etc.

![image-minio-delete-bucket](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/image-minio-delete-bucket.png?raw=true)

Or operate through the MinIO client mc:

```
mc rb --force minio/minio-mo/data/
mc rb --force minio/minio-mo/etl
```

In addition, if you do not want to delete old data, you can create a new MinIO bucket and specify a unique bucket name in the YAML file for deploying the MatrixOne cluster.

![image-minio-new-bucket](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/image-minio-new-bucket.png?raw=true)

#### 3. Deploy the new version cluster

Edit the yaml file that defines the MO cluster, refer to the **Rolling Upgrade** chapter, modify the `.spec.version` field to the latest version, and redeploy the MatrixOne cluster:

```
vi mo.yaml
# content omitted
...
kubectl apply -f mo.yaml
```

#### 4. Check if the upgrade is successful

Please check if MatrixOne has started successfully with the following command.

As shown in the following code example, when the Log Service, TN, and CN are all running normally, the MatrixOne cluster starts successfully. Connecting through the MySQL Client can also check if the database functions correctly.

```
[root@master0 ~]# kubectl get pods -n mo-hn      
NAME                                  READY   STATUS    RESTARTS     AGE
matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
mo-tn-0                               1/1     Running   0            2m13s
mo-log-0                              1/1     Running   0            2m47s
mo-log-1                              1/1     Running   0            2m47s
mo-log-2                              1/1     Running   0            2m47s
mo-tp-cn-0                            1/1     Running   0            111s
```
