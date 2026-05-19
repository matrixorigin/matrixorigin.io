# Cluster Deployment Guide

This document will focus on how to deploy a **MatrixOne cluster** based on an already existing **Kubernetes** and **S3** environment.

## Resource requirements

### Experience environment

The MatrixOne Cluster Experience Environment can be used for simple experience testing, learning or development, but is not suitable for business production. The following is a resource plan for the experience environment:

Container resource:

|Components |Roles |Service Replicas |Recommendations for Replica Distribution Policies |cpu(C) |Memory (G) |Storage Resource Types |Storage Volume Format |Storage Size (G) |Access Modes |
| :-------- | :------ | :------ | :---------------- | :---|:----- | :------ | :------- |:-------- |:------------ |
|logservice | prewrite logs WAL management | 3 | 3 nodes, 1 copy per node | 2 | 4 | PVC | file system | 100 | ReadWriteOnce|
|tn | Transaction Management | 1 | Single node, single copy | 4 | 8 | PVC | File Systems | 100 | ReadWriteOnce|
|cn | data computation | 1 | Single Node Single Replica | 2 | 4 | PVC | File System | 100 | ReadWriteOnce|

Object Storage Resource (S3):

| Components | Interface Protocols | Storage Size (G)|
| :----------------- | :------ | :------ |
| Business, monitoring, logging, and other data | s3v4 | >=50 |

### Recommended environment

The MatrixOne cluster recommendation environment offers high availability, reliability, and robust performance for real-world business production. The following is a resource plan for the recommended environment:

Container resource:

|Components |Roles |Service Replicas |Recommendations for Replica Distribution Policies |cpu(C) |Memory (G) |Storage Resource Types |Storage Volume Format |Storage Size (G) |Access Modes |
| :-------- | :------ | :------ | :---------------- | :---|:----- | :------ | :------- |:-------- |:------------ |
|logservice | prewrite logs WAL management | 3 | 3 nodes, 1 copy per node | 4 | 8 | PVC | file system | 100 | ReadWriteOnce|
|tn | Transaction Management | 1 | Single node, single copy | 16 | 64 | PVC | File System | 100 | ReadWriteOnce|
|cn | data computation | N | N Depending on business requirements, 2+ recommended for high availability. | 16 | 32 | PVC | File System | 100 | ReadWriteOnce|

Object Storage Resource (S3):

| Components | Interface Protocols | Storage Size (G) | IOPS | Bandwidth |
| :----------------- | :------ | :------ | :--------------------------------- | :------ |
| Business, monitoring, logs, and other data | s3v4 | Depends on business, recommended >=500 | Sequential read/write: >=2000, non-sequential read/write: >=10000 | >=10GB |

For more information on resource requirements, refer to the [experience environment](../deployment-topology/experience-deployment-topology.md) and [recommended production environment](../deployment-topology/recommended-prd-deployment-topology.md) in the cluster topology planning chapter.

## Preconditions

Before you begin, make sure you have the following environments ready:

- Kubernetes cluster environment and s3 environment that meet resource requirements

- A client machine that can connect to a Kubernetes cluster.

- The client machine needs to have the helm, kubectl client installed and configured to access the cluster's kubeconfig file with permissions to be able to deploy the helm chart package and install the CRD resource object.

- Have extranet access, such as github.io, hub.docker.com, etc. If you can't access the extranet, you need to provide a private mirror repository for uploading relevant mirrors, and in the mo cluster yaml definition, modify the mirror repository address to the private repository address.

- Cluster nodes have access to object stores, such as resolving domain names where objects are stored.

__Note__: The following actions are performed on the client machine unless otherwise indicated.

## Installing MatrixOne-Operator

[MatrixOne Operator](https://github.com/matrixorigin/matrixone-operator) is a standalone software tool for deploying and managing MatrixOne clusters on Kubernetes. You can choose to deploy online or offline.

- **Deploy online**

Follow these steps to install MatrixOne Operator on master0. We will create a separate namespace `matrixone-operator` for Operator.

1. Add the matrixone-operator address to the helm repository:

    ```
    helm repo add matrixone-operator https://matrixorigin.github.io/matrixone-operator 
    ```

2. Update the repository:

    ```
    helm repo update 
    ```

3. View the MatrixOne Operator version:

    ```
    helm search repo matrixone-operator/matrixone-operator --versions --devel 
    ```

4. Specify the release to install MatrixOne Operator:

    ```
    helm install matrixone-operator matrixone-operator/matrixone-operator --version <VERSION> --create-namespace --namespace matrixone-operator 
    ```

    !!! note The parameter VERSION is the version number of the MatrixOne Operator to be deployed, such as 1.0.0-alpha.2.

5. After a successful installation, confirm the installation status using the following command:

    ```
    kubectl get pod -n matrixone-operator 
    ```

    Ensure that all Pod states in the above command output are Running.

    ```
    [root@master0 matrixone-operator]# kubectl get pod -n matrixone-operator NAME READY STATUS RESTARTS AGE matrixone-operator-f8496ff5c-fp6zm 1/1 Running 0 3m26s 
    ```

The corresponding Pod states are normal as shown in the above code line.

- **Deploy offline**

You can select the Operator Release version installation package you need from the project's [Release list](https://github.com/matrixorigin/matrixone-operator/releases) for offline deployment.

1. Create a standalone namespace mo-op for Operator

    ```
    NS="mo-op" 
    kubectl create ns "${NS}" 
    kubectl get ns # return has mo-op 
    ```

2. Download and extract the matrixone-operator installation package

    ``` bash
    wget https://github.com/matrixorigin/matrixone-operator/releases/download/chart-1.1.0-alpha2/matrixone-operator-1.1.0-alpha2.tgz 
    tar xvf matrixone-operator-1.1.0-alpha2.tgz 
    ```

    If the original github address downloads too slowly, you can try downloading the mirror package from:

    ```bash

    wget https://githubfast.com/matrixorigin/matrixone-operator/releases/download/chart-1.1.0-alpha2/matrixone-operator-1.1.0-alpha2.tgz 
    ```
  
    After extraction it will be in the current directory production folder `matrixone-operator`.

3. Deploying matrixone-operator

    ```
    NS="mo-op" 
    cd matrixone-operator/ 
    helm install -n ${NS} mo-op ./charts/matrixone-operator --dependency-update # Success should return the status of deployed
    ```

    The above list of dependent docker mirrors is:

    - matrixone-operator
    - kruise-manager
  
    If you cannot pull a mirror from dockerhub, you can pull it from Aliyun using the following command:

     ```
     helm -n ${NS} install mo-op ./charts/matrixone-operator --dependency-update -set image.repository="registry.cn-hangzhou.aliyuncs.com/moc-pub/matrixone-operator" --set kruise.manager.image.repository="registry.cn-hangzhou.aliyuncs.com/moc-pub/kruise-manager" 
     ```

    See matrixone-operator/values.yaml for details.

4. Check operator deployment status

    ```
    NS="mo-op" 
    helm list -n "${NS}" # returns a corresponding helm chart package with deployed 
    kubectl get pod -n "${NS}" -owide # returns a copy of a pod with Running
    ```

To learn more about Matrixone Operator, check out [Operator Administration](../../Deploy/MatrixOne-Operator-mgmt.md).

## Deploying MatrixOne

This section describes two ways to deploy MatrixOne: YAML and Chart.

### Prepare before you start

1. Create namespace `mo` for MatrixOne:

    ```
    NS="mo" 
    kubectl create ns "${NS}" 
    kubectl get ns # return has mo 
    ```

    !!! note It is recommended that this namespace be separate from the namespace of MatrixOne Operator and not use the same one.

2. Create the Secret service for accessing s3 in namespace mo by executing the following command:

    S3 CA certificate not required if accessed via HTTP protocol

    ```
    NS="mo" 
    name="s3mo"

    kubectl -n "${NS}" create secret generic "${name}" --from-literal=AWS_ACCESS_KEY_ID=51e1bHqcbfKla0fuakAtoJ2LMEvKThg4NiMjxxxx --from-literal=AWS_SECRET_ACCESS_KEY=aDMWw1hO2rqxltyIcBN6sy8qE_leIgzo6Satxxxx #modify 
    kubectl get secret -n "${NS}" "${name}" -oyaml # normal output key information 
    ```

    S3 access via the HTTPS protocol requires a CA certificate, and before you begin, perform the relevant actions and configure the relevant files as follows:

    - Based on the ca certificate file, create a secret object for Kubernetes:

    ```
    NS=mo 
    ca_file_path="/data/deploy/csp_cert/ca.crt" # File path defined by the certificate in the key 
    ca_file_name="csp.cert" # File name defined by the certificate in the key 
    ca_secret_name="csp.cert" # Name of the certificate key itself
    # Creating a Key
    kubectl -n ${ns} create secret generic ${ca_secret_name} --from-file=${ca_file_name}=${ca_file_path} 
    ```

    - Configure the relevant settings in spec.logService.sharedStorage.s3.certificateRef in the yaml file of the MatrixOne cluster object (the mo.yaml and values.yaml files in the deployment steps below), as follows:

    ```
    sharedStorage:
      s3:
        endpoint: xx.yy.com
        path: mypath
        # secretRef is required when there is no environment based auth available.
        secretRef:
          # secretRef.name corresponds to ca_secret_name
          name: csp
        certificateRef:
          # certificateRef.name corresponds to ${ca_file_name}
          name: csp.cert
          files:
          # certificateRef.files The values below the array correspond to ${ca_file_path}
          - csp.cert
    ```

3. Label the machine

    The following tags need to be called to the node before deployment, otherwise scheduling fails. The following tags are recommended in principle to hit different nodes and multiple nodes depending on the copy, or at least 1 node if this is not possible. (7 different nodes are recommended)

    ```
    matrixone/cn: true
    matrixone/tn: true
    matrixone/lg: true
    ```

    The first group: find three different machines, each labeled cn.

    ```
    NODE_1="10.0.0.1" # Replace with actual IP
    NODE_2="10.0.0.2" # Replace with actual IP
    NODE_3="10.0.0.3" # Replace with actual IP

    kubectl label node ${NODE_1} matrixone/cn: true
    kubectl label node ${NODE_2} matrixone/cn: true
    kubectl label node ${NODE_3} matrixone/cn: true
    ```

    Group 2: Find the 4th different machine and label each with tn.

    ```
    NODE_4="10.0.0.4" # Replace with actual IP

    kubectl label node ${NODE_4} matrixone/tn: true
    ```

    Group 3: Find three different machines, each labeled log .

    ```
    NODE_5="10.0.0.5" # Replace with actual IP
    NODE_6="10.0.0.6" # Replace with actual IP
    NODE_7="10.0.0.7" # Replace with actual IP

    kubectl label node ${NODE_5} matrixone/lg: true
    kubectl label node ${NODE_6} matrixone/lg: true
    kubectl label node ${NODE_7} matrixone/lg: true
    ```

### yaml-style deployment

1. Customize the yaml file for the MatrixOne cluster by writing the following mo.yaml file (modify the resource request as appropriate):

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
      namespace: mo

    spec:
      # 1.  Configuring cn
      cnGroups:
      - cacheVolume:
          size: 800Gi
        config: |2
          [log]
          level = "info"
        name: cng1
        nodeSelector:# Add tags as appropriate
          matrixone/cn: "true"
        serviceType: NodePort
        nodePort: 31429
        replicas: 3
        resources:
          requests:
            cpu: 16000m
            memory: 64000Mi
          limits:
            cpu: 16000m
            memory: 64000Mi
        overlay:
          env:
          - name: GOMEMLIMIT
            value: "57600MiB"  
      # 2.  Configuring tn
      tn:
        cacheVolume:
          size: 100Gi
        config: |2

          [log]
          level = "info"
        nodeSelector:
          matrixone/tn: "true"
        replicas: 1
        resources:
          requests:
            cpu: 16000m
            memory: 64000Mi
          limits:
            cpu: 16000m
            memory: 64000Mi
      # 3. Configuring logservice
      logService:
        config: |2
          [log]
          level = "info"
        nodeSelector: 
          matrixone/lg: "true"
        pvcRetentionPolicy: Retain
        replicas: 3
        # Configuring s3 storage for logservice mapping
        sharedStorage:
          s3:
            endpoint: s3-qos.iot.qiniuec-test.com 
            path: mo-test
            s3RetentionPolicy: Retain
            secretRef: #Configure the key for accessing s3, i.e., secret, with the name s3mo.
              name: s3mo
        volume:
          size: 100Gi 
        resources:
          requests:
            cpu: 4000m
            memory: 16000Mi
          limits:
            cpu: 4000m
            memory: 16000Mi
      topologySpread:
      - kubernetes.io/hostname
      imagePullPolicy: IfNotPresent
      imageRepository: registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone
      version: 1.1.1 #This is the version of the MO image
    ```

2. Create a MatrixOne cluster by executing the following command

    ```
    kubectl apply -f ./mo.yaml
    ```

### chart way to deploy

1. Add a matrixone-operator repository to helm

    ```
    helm repo add matrixone-operator https://matrixorigin.github.io/matrixone-operator 
    ```

2. Update Repository

    ```
    helm repo update 
    ```

3. View MatrixOne Chart version

    ```
    helm search repo matrixone-operator/matrixone --devel 
    ```

    Example returns

    ```
    > helm search repo matrixone-operator/matrixone --devel
    NAME                                 	CHART VERSION	APP VERSION	DESCRIPTION
    matrixone-operator/matrixone         	0.1.0        	1.16.0     	A Helm chart to deploy MatrixOne on K8S
    matrixone-operator/matrixone-operator	1.1.0-alpha2 	0.1.0      	Matrixone Kubernetes Operator
    helm search repo matrixone-operator/matrixone --devel
    ```

4. Deploying MatrixOne

    Modify the values.yaml file, empty the original file, and replace it with the following (modify the resource request as appropriate):

    ```
    # 1. Configuring cn
    cnGroups:
    - cacheVolume:
        size: 800Gi
    config: |2
        [log]
        level = "info"
    name: cng1
    nodeSelector:
        matrixone/cn: "true"
    serviceType: NodePort
    nodePort: 31429
    replicas: 3 # Number of copies of cn
    resources:
        requests:
        cpu: 16000m
        memory: 64000Mi
        limits:
        cpu: 16000m
        memory: 64000Mi
    overlay:
        env:
        - name: GOMEMLIMIT
        value: "57600MiB"  
    # 2. Configuring tn
    tn:
    cacheVolume:
        size: 100Gi
    config: |2

        [log]
        level = "info"
    nodeSelector:
        matrixone/tn: "true"
    replicas: 1 # The number of copies of tn, which cannot be modified. The current version only supports a setting of 1.
    resources:
        requests:
        cpu: 16000m
        memory: 64000Mi
        limits:
        cpu: 16000m
        memory: 64000Mi
    # 3. Configuring logService
    logService:
    config: |2
        [log]
        level = "info"
    nodeSelector: 
        matrixone/lg: "true"
    pvcRetentionPolicy: Retain
    replicas: 3 # Number of copies of logService
    #Configuring s3 storage for logService mapping
    sharedStorage:
        s3:
        endpoint: s3-qos.iot.qiniuec-test.com  
        path: mo-test
        s3RetentionPolicy: Retain
        secretRef: #Configure the key for accessing s3, i.e., secret, with the name s3mo.
            name: s3mo
    volume:
        size: 100Gi
    resources:
        requests:
        cpu: 4000m
        memory: 16000Mi
        limits:
        cpu: 4000m
        memory: 16000Mi
    topologySpread:
    - kubernetes.io/hostname
    imagePullPolicy: IfNotPresent
    imageRepository: registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone
    version: 1.1.1 #This is the version of the MO image
    ```

    Install MatrixOne Chart (this deploys a MatrixOneCluster object)
  
    ```
    NS="mo"
    RELEASE_NAME="mo_chart"
    VERSION=v1
    helm install -n ${NS} ${RELEASE_NAME} matrixone-operator/matrixone --version ${VERSION} -f values.yaml
    ```

### Dynamic expansion

The Operator supports dynamic expansion of the cacheVolume configuration of TN and CN, but does not support the reduction operation. There is no need to restart the CN and TN pods before and after the expansion process. The specific steps are as follows:

1. Make sure the StorageClass supports the volume extension feature

    ```bash
    #View storageclass name
    >kubectl get pvc -n ${MO_NS}

    #Check whether StorageClass supports volume extension function
    >kubectl get storageclass ${SC_NAME} -oyaml |  grep allowVolumeExpansion #SC_NAME is the sc type of pvc used by the mo cluster
    allowVolumeExpansion: true #Only when true can subsequent steps be performed
    ```

2. Enter cluster configuration editing mode

    ```bash
    kubectl edit mo -n ${MO_NS} ${MO_NAME} # Among them, MO_NS is the namespace where the MO cluster is deployed, and MO_NAME is the name of the MO cluster; for example,MO_NS=matrixone; MO_NAME=mo_cluster
    ```

3. Modify the cacheVolume size of tn and cn as needed

    ```bash
    - cacheVolume:
            size: 900Gi
    ```

    - If it is a CN group, modify spec.cnGroups[0].cacheVolume (or spec.cnGroups[1].cacheVolume, where n in [n] is the array subscript of the CN Group);
    - If it is CN, modify spec.tp.cacheVolume;
    - If TN, modifies spec.tn.cacheVolume (or spec.dn.cacheVolume).

    Then save and exit: press `esq` keys, and `:wq`

4. View expansion results

    ```bash
    #The value of the `capacity` field is the value after expansion.
    >kubectl get pvc -n ${MO_NS}

    >kubectl get pv | grep ${NS}
    ```

### Checking cluster status

Observe cluster status until Ready

```
NS="mo" 
kubectl get mo -n "${NS}" # Wait status is Ready 
```

Observe pod status until all are Running

```
NS="mo" 
kubectl get pod -n "${NS}" -owide # waiting state is Running 
```

## Connecting a MatrixOne Cluster

In order to connect to a MatrixOne cluster, you need to map the port of the corresponding service to the MatrixOne node. Here is a guide for connecting to a MatrixOne cluster using `kubectl port-forward`:

- Allow local access only:

   ```
   nohup kubectl port-forward -nmo svc/svc_name 6001:6001 & 
   ```

- Specify that a machine or all machines access:

   ```
   nohup kubectl port-forward -nmo --address 0.0.0.0 svc/svc_name 6001:6001 & 
   ```

After specifying **allow local access** or **specifying a machine** or all, you can connect to MatrixOne using a MySQL client:

```
# Connect to MySQL service using 'mysql' command line tool
# Use 'kubectl get svc/svc_name -n mo -o jsonpath='{.spec.clusterIP}'' to get the cluster IP address of the service in the Kubernetes cluster
# The '-h' parameter specifies the hostname or IP address of the MySQL service
# The '-P' parameter specifies the port number of the MySQL service, in this case 6001
# '-uroot' means login as root
# '-p111' indicates that the initial password is 111
mysql -h $(kubectl get svc/svc_name  -n mo -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 163
Server version: 8.0.30-MatrixOne-v1.1.1 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

After explicitly `mysql>`, the distributed MatrixOne cluster setup connection completes.

!!! note
    The login account in the above code section is the initial account. Please change the initial password promptly after logging into MatrixOne, see [Password Management](../../Security/password-mgmt.md).
