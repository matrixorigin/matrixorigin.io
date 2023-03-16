# MatrixOne Distributed Cluster Deployment

This document will mainly describe how to deploy MatrixOne distributed database, based on a private Kubernetes cluster that separates computing and storage resources in a cloud-native manner, starting from scratch.

## **Main Steps**

1. Deploy Kubernetes cluster
2. Deploy object storage MinIO
3. Create and connect MatrixOne cluster

## **Key Concepts**

As this document involves many Kubernetes-related terms, to help everyone understand the deployment process, we will provide brief explanations of important terms related to Kubernetes. If you need to know more about Kubernetes-related content, see [Kubernetes Documentation](https://kubernetes.io/docs/home/)

- Pod

   Pod is the smallest resource management component in Kubernetes and the smallest resource object for running containerized applications. A Pod represents a process running in the cluster. In simple terms, we can consider a group of applications that provide specific functions as a pod containing one or more container objects that work together to provide services to the outside world.

- Storage Class

   Storage Class, abbreviated as SC, marks the characteristics and performance of storage resources. According to the description of SC, we can intuitively understand the aspects of various storage resources and then apply storage resources according to the application's requirements. Administrators can define storage resources as a specific category, just as storage devices describe their configuration profiles.

- PersistentVolume

   PersistentVolume, abbreviated as PV, mainly includes setting key information such as storage capacity, access mode, storage type, recycling strategy, and backend storage type as a storage resource.

- PersistentVolumeClaim

   PersistentVolumeClaim, or PVC, is used as a user's request for storage resources, mainly including the setting of information such as storage space request, access mode, PV selection conditions, and storage category.

## **1. Deploying a Kubernetes Cluster**

As MatrixOne's distributed deployment relies on a Kubernetes cluster, we need to have one in place. This article will guide you through setting up a Kubernetes cluster using Kuboard-Spray.

### **Preparing the Cluster Environment**

To prepare the cluster environment, you need to do the following:

- Have three VirtualBox virtual machines
- Use Ubuntu 20.04 as the operating system (by default, it does not allow root account remote login, so you need to modify the configuration file for sshd in advance to enable remote login for root). Two machines will be used for deploying Kubernetes and other dependencies for MatrixOne, while the third will act as a jump host to set up the Kubernetes cluster.

The specific distribution of the machines is shown below:

| **host** | **IP** | **mem** | **cpu** | **disk** | **role** |
| --- | --- | --- | --- | --- | --- |
| kuboardspray | 192.168.56.9 | 2G | 1C | 50G | Jump server |
| master0 | 192.168.56.10 | 4G | 2C | 50G | master etcd |
| node0 | 192.168.56.11 | 4G | 2C | 50G | worker |

### **Deploying Kuboard Spray on a Jump Server**

Kuboard Spray is a tool used for visualizing the deployment of Kubernetes clusters. It uses Docker to quickly launch a web application that can visualize the deployment of a Kubernetes cluster. Once the Kubernetes cluster environment has been deployed, the Docker application can be stopped.

#### **Preparing the Jump Server Environment**

- Installing Docker

Since Docker will be used, the environment must have Docker installed. Use the following command to install and start Docker on the jump server:

```
sudo apt-get update && sudo apt-get install -y docker.io
```

Once the environment is prepared, Kuboard Spray can be deployed.

#### **Deploying Kuboard Spray**

Execute the following command to install Kuboard Spray:

```
docker run -d \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  eipwork/kuboard-spray:v1.2.2-amd64
```

If the image pull fails due to network issues, use the backup address below:

```
docker run -d \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  swr.cn-east-2.myhuaweicloud.com/kuboard/kuboard-spray:latest-amd64
```

After executing the command, open the Kuboard Spray web interface by entering `http://192.168.56.9` (jump server IP address) in a web browser, then log in to the Kuboard Spray interface using the username `admin` and the default password `Kuboard123`, as shown below:

![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-1.png?raw=true)

After logging in, the Kubernetes cluster deployment can be started.

### **Visual Deployment of Kubernetes Cluster**

After logging into the Kuboard-Spray interface, you can begin visually deploying a Kubernetes cluster.

#### **Importing Kubernetes-related Resource Packages**

The installation interface will download the Kubernetes cluster's corresponding resource package via online downloading to achieve offline installation of the Kubernetes cluster.

1. Click **Resource Package Management** and select the appropriate version of the Kubernetes resource package to download:

    Download `spray-v2.19.0c_Kubernetes-v1.24.10_v2.9-amd64` 版本

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-2.png?raw=true)

2. Click **Import > Load Resource Package**, select the appropriate download source, and wait for the resource package to finish downloading.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-3.png?raw=true)

3. This will `pull` the related image dependencies:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-4.png?raw=true)

4. After the image resource package is successfully pulled, return to the Kuboard-Spray web interface. You can see that the corresponding version of the resource package has been imported.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-5.png?raw=true)

#### **Installing a Kubernetes Cluster**

This chapter will guide you through the installation of a Kubernetes cluster.

1. Select **Cluster Management** and choose **Add Cluster Installation Plan**:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-6.png?raw=true)

2. In the pop-up dialog box, define the name of the cluster, select the version of the resource package that was just imported, and click **OK**, as shown in the following figure:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-7.png?raw=true)

##### **Cluster Planning**

Based on the predefined roles, the Kubernetes cluster is deployed with a pattern of 1 master + 1 worker + 1 etcd.

After defining the cluster name and selecting the resource package version, click **OK**, and then proceed to the cluster planning stage.

1. Select the corresponding node roles and names:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-8.png?raw=true)

    - Master node: select the ETCD and control nodes, and fill in the name as master0.
    - Worker node: select only the worker node, and fill in the name as node0.

2. After filling in the roles and node names for each node, please fill in the corresponding connection information on the right, as shown in the following figure:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-9.png?raw=true)

3. After filling in all the roles, click **Save**. You can now prepare to install the Kubernetes cluster.

#### **Installing Kubernetes Cluster**

After completing all roles and saving in the previous step, click **Execute** to start installing the Kubernetes cluster.

1. Click **OK** as shown in the figure below to start installing the Kubernetes cluster:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-10.png?raw=true)

2. When installing the Kubernetes cluster, the `ansible` script will be executed on the corresponding node to install the Kubernetes cluster. The overall installation time will vary depending on the machine configuration and network. Generally, it takes 5 to 10 minutes.

    __Note:__ If an error occurs, you can check the log to confirm whether the version of Kuboard-Spray is mismatched. If the version is mismatched, please replace it with a suitable version.

3. After the installation is complete, execute `kubectl get node` on the master node of the Kubernetes cluster:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-11.png?raw=true)

4. The command result shown in the figure above indicates that the Kubernetes cluster has been successfully installed.

## **2. Deploying Helm**

The installation of Operator depends on Helm, so Helm needs to be installed first.

__Note:__ All operations in this section are performed on the master0 node.

1. Download the Helm installation package:

    ```
    wget https://get.helm.sh/helm-v3.10.2-linux-amd64.tar.gz
    ```

    If the download is slow due to network issues, you can download the latest binary installation package from the official website and upload it to the server.

2. Extract and install:

    ```
    tar -zxf helm-v3.10.2-linux-amd64.tar.gz
    mv linux-amd64/helm /usr/local/bin/helm
    ```

3. Verify the version to check if it is installed:

    ```
    [root@k8s01 home]# helm version
    version.BuildInfo{Version:"v3.10.2", GitCommit:"50f003e5ee8704ec937a756c646870227d7c8b58", GitTreeState:"clean", GoVersion:"go1.18.8"}
    ```

    The version information shown above indicates that the installation is complete.

## **3. CSI Deployment**

CSI is a storage plugin for Kubernetes that provides storage services for MinIO and MatrixOne. This section will guide you through the use of the `local-path-provisioner` plugin.

__Note:__ All the commands in this section should be executed on the master0 node.

1. Install CSI using the following command line:

    ```
    wget https://github.com/rancher/local-path-provisioner/archive/refs/tags/v0.0.23.zip
    unzip v0.0.23.zip
    cd local-path-provisioner-0.0.23/deploy/chart/local-path-provisioner
    helm install --set nodePathMap[0].paths[0]="/opt/local-path-provisioner",nodePathMap[0].node=DEFAULT_PATH_FOR_NON_LISTED_NODES  --create-namespace --namespace local-path-storage local-path-storage ./
    ```

2. After a successful installation, the command line should display as follows:

    ```
    root@master0:~# kubectl get pod -n local-path-storage
    NAME                                                        READY   STATUS    RESTARTS   AGE
    local-path-storage-local-path-provisioner-57bf67f7c-lcb88   1/1     Running   0          89s
    ```

    __Note:__ After installation, this storageClass will provide storage services in the "/opt/local-path-provisioner" directory on the worker node. You can modify it to another path.

3. Set the default `storageClass`:

    ```
    kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
    ```

4. After setting the default, the command line should display as follows:

    ```
    root@master0:~# kubectl get storageclass
    NAME                   PROVISIONER                                               RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
    local-path (default)   cluster.local/local-path-storage-local-path-provisioner   Delete          WaitForFirstConsumer   true                   115s
    ```

## **4. MinIO Deployment**

MinIO is used to provide object storage for MatrixOne. This section will guide you through the deployment of a single-node MinIO.

__Note:__ All the commands in this section should be executed on the master0 node.

### **Installation and Startup**

1. The command line for installing and starting MinIO is as follows:

    ```
    helm repo add minio https://charts.min.io/
    helm install --create-namespace --namespace mostorage --set resources.requests.memory=512Mi --set replicas=1 --set persistence.size=10G --set mode=standalone --set rootUser=rootuser,rootPassword=rootpass123 --set consoleService.type=NodePort minio minio/minio
    ```

    !!! note
         - `--set resources.requests.memory=512Mi` sets the minimum memory consumption of MinIO
         - `--set persistence.size=1G` sets the storage size of MinIO to 1G
         - `--set rootUser=rootuser,rootPassword=rootpass123` the parameters set for rootUser and rootPassword are required for creating the secrets file for the Kubernetes cluster later, so use something that you can remember.

2. After a successful installation and start, the command line should display as follows:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-12.png?raw=true)

    Then, execute the following command line to connect mo-log to port 9000:

    ```
    nohup kubectl port-forward --address 0.0.0.0 pod-name -n most storage 9000:9000 &
    ```

3. After starting, you can log in to the MinIO page using the IP address of any machine in the Kubernetes cluster and port 32001. As shown in the following figure, the account password is the `rootUser` and `rootPassword` set in the previous step, i.e., `--set rootUser=rootuser,rootPassword=rootpass123`:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-13.png?raw=true)

4. After logging in, you need to create object storage related information:

    a. Fill in the **Bucket Name** with **minio-mo** under **Bucket > Create Bucket**. After filling it in, click the **Create Bucket** button at the bottom right.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-14.png?raw=true)

    b. In the current **minio-mo** bucket, click **Choose or create a new path**, and fill in the name **test** in the **New Folder Path** field. After filling it in, click **Create** to complete the creation.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/deploy-mo-cluster-15.png?raw=true)

## **5. Deploying a MatrixOne Cluster**

This section will guide you through the process of deploying a MatrixOne cluster.

__Note:__ All steps in this section are performed on the master0 node.

### **Installing the matrixone-operator**

Use the following command to install the matrixone-operator:

```
wget https://github.com/matrixorigin/matrixone-operator/releases/download/0.7.0-alpha.1/matrixone-operator-0.7.0-alpha.1.tgz
tar -xvf matrixone-operator-0.7.0-alpha.1.tgz
cd /root/matrixone-operator/
helm install --create-namespace --namespace mo-hn matrixone-operator ./ --dependency-update
```

After the installation is successful, use the following command to confirm again:

```
root@master0:~# kubectl get pod -n mo-hn
NAME                                  READY   STATUS    RESTARTS   AGE
matrixone-operator-66b896bbdd-qdfrp   1/1     Running   0          2m28s
```

As shown in the above line of code, the status of the corresponding Pods is normal.

### **Create a MatrixOne cluster**

Customize the `yaml` file of the MatrixOne cluster; the example is as follows:

1. Write the following `mo.yaml` file:

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
      namespace: mo-hn
    spec:
      dn:
        config: |
          [dn.Txn.Storage]
          backend = "TAE"
          log-backend = "logservice"
          [dn.Ckp]
          flush-interval = "60s"
          min-count = 100
          scan-interval = "5s"
          incremental-interval = "60s"
          global-interval = "100000s"
          [log]
          level = "error"
          format = "json"
          max-size = 512
        replicas: 1
      logService:
        replicas: 3
        sharedStorage:
          s3:
            type: minio
            path: minio
            endpoint: http://minio.mostorage:9000
            secretRef:
              name: minio
        pvcRetentionPolicy: Retain
        volume:
          size: 1Gi
        config: |
          [log]
          level = "error"
          format = "json"
          max-size = 512
      tp:
        serviceType: NodePort
        config: |
          [cn.Engine]
          type = "distributed-tae"
          [log]
          level = "debug"
          format = "json"
          max-size = 512
        replicas: 1
      version: nightly-556de418
      imageRepository: matrixorigin/matrixone
      imagePullPolicy: Always
    ```

2. Define the secret service for MatrixOne to access MinIO:

    ```
    kubectl -n mo-hn create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=rootuser --from-literal=AWS_SECRET_ACCESS_KEY=rootpass123
    ```

    The user name and password use the rootUser and rootPassword set when creating the MinIO cluster.

3. Deploy the MatrixOne cluster using the following command line:

    ```
    kubectl apply -f mo.yaml
    ```

4. Wait for about 10 minutes. If the pod restarts, please continue to wait. Until the following display indicates that the deployment is successful:

    ```
    root@k8s-master0:~# kubectl get pods -n mo-hn
    NAME                                  READY   STATUS    RESTARTS      AGE
    matrixone-operator-66b896bbdd-qdfrp   1/1     Running   1 (99m ago)   10h
    mo-dn-0                               1/1     Running   0             46m
    mo-log-0                              1/1     Running   0             47m
    mo-log-1                              1/1     Running   0             47m
    mo-log-2                              1/1     Running   0             47m
    mo-tp-cn-0                            1/1     Running   1 (45m ago)   46m
    ```

## **6. Connect to MatrixOne cluster**

Since the pod id of the CN that provides external access is not the node IP, you need to map the port of the corresponding service to the MatrixOne node. This chapter will guide you to use `kubectl port-forward` to connect to the MatrixOne cluster.

- Only allow local access:

   ```
   nohup kubectl port-forward svc/mo-tp-cn 6001:6001 &
   ```

- Specify a specific machine or all machines to access:

   ```
   nohup kubectl port-forward --address 0.0.0.0 svc/mo-tp-cn 6001:6001 &
   ```

After specifying **Allow local access** or **Specify a specific machine or all machines to access**, use the MySQL client to connect to MatrixOne:

```
mysql -h $(kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}') -P 6001 -udump -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1004
Server version: 638358 MatrixOne

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

After explicit `mysql>`, the distributed MatrixOne cluster is established and connected.
