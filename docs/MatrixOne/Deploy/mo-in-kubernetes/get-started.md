# Using MatrixOne Operator deploy MatrixOne Cluster

This document will describe how to use [MatrixOne Operator](whats-mo-operator.md) to deploy a simple MatrixOne Cluster.

**Main Steps**:

<p><a href="#create_k8s">1. Create Kubernetes cluster</a></p>
<p><a href="#deploy_mo_operator">2. Deploy MatrixOne Operator</a></p>
<p><a href="#create_mo_cluster">3. Create MatrixOne cluster</a></p>
<p><a href="#connect_mo_cluster">4. Connect to MatrixOne cluster</a></p>

**Other Step**:

<p><a href="#delete_mo_cluster">Delete MatrixOne cluster</a></p>

## <h2><a name="create_k8s">1. Create Kubernetes cluster</a></h2>

### Before you start

Before starting Step 1, to make sure of the standard deployment and use of MatrixOne clusters, please read this chapter to learn about the tools and configuration requirements for creating Kubernetes clusters.

- Kubernetes

   **Version Requirements**: 1.18 or later

   **Function**: Install Kubernetes to assist MatrixOne clusters in deploying automatically, scaling, and managing containerized applications.

- kubectl

   **Version Requirements**: 1.18 or later

   **Function**: kubectl is an installation command-line tool that uses the Kubernetes API to communicate with the control plane of the Kubernetes cluster and assists the use of MatrixOne clusters for automatic deployment.

- Helm

   **Version Requirements**: 3.0 or later

   **Function**: Helm is the application package manager of Kubernetes; you can use Helm Charts to describe the application's structure. Using the Helm command-line interface, you can roll back deployments, monitor the status of applications, and track the history of MatrxiOne cluster deployments.

### The steps of creating and launching the Kubernetes cluster

This section describes three methods for creating Kubernetes clusters that can be used to test MatrixOne clusters managed with MatrixOne Operator. You can use **EKS**, **GKE**, or **Kind** to install and start a Kubernetes cluster.
**Description**

- Deploy an Amazon EKS cluster using the `eksctl` command line tool on your local machine or AWS Cloud Shell
- Deploy a Kubernetes cluster on Google Cloud Platform's Google Kubernetes Engine using Google Cloud Shell
- Use Kind to create Kubernetes running in Docker

#### Method 1: Create and launch Amazon EKS cluster

1. Refer to [Create Amazon EKS Cluster](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/create-cluster.html) official document to install and configure the `eksctl` command line tool .

2. Select the appropriate [Region](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) (such as ap-southeast-1), execute the following command to launch an EKS cluster:

```
$ eksctl create cluster --name matrixone --nodegroup-name db --node-type m5.xlarge --node3 3 --node-ami auto
```

#### Method 2: Create and launch Google GKE cluster

1. Refer to the official documentation of [Deploying applications to GKE clusters](https://cloud.google.com/kubernetes-engine/docs/deploy-app-cluster) to to install and configure the `gcloud` command-line tool.

2. Select the appropriate [Region](https://cloud.google.com/compute/docs/regions-zones#available) (such as asia-east2), and execute the following command to start a GKE cluster:

```
$ gcloud container clusters create matrixone --machine n2-standard-4 --region ${region} --num-nodes 3
```

#### Method 3: Create and launch Kind

!!! note
    The MatrixOne database deployed on the cluster deployed by Kind does not have the capability of multi-node high availability, so it is not recommended to be used in a production environment.

1. Refer to [Docker official documentation](https://docs.docker.com/get-docker/) to configure and launch the Docker process in the local environment.

2. Refer to [Kind Official Documentation](https://kind.sigs.k8s.io/docs/user/quick-start/) to install and configure the `kind` command line tool.

3. Execute the following command to deploy a Kubernetes cluster locally using Kind:

```
$ cat <<EOF > kind.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
- role: worker
EOF
$ kind create cluster --name matrixone --config kind.yaml
```

## <h2><a name="deploy_mo_operator">2. Deploy MatrixOne Operator</a></h2>

1. Execute the following command to create a namespace for matrixone-operator in the Kubernetes cluster:

    ```
    kubectl create namespace mo-system
    ```

2. Execute the following command to install matrixone-operator using `helm`:

    ```
    helm -n mo-system install mo ./charts/matrixone-operator --dependency-update
    ```

3. Execute the following command to verify that matrixone-operator is installed:

    ```
    helm -n mo-system ls
    kubectl -n mo-system get pod
    ```

4. If the matrixone-operator is installed successfully, you can see the installed `helm chart` and the running `matrixone-operator Pod` in the above command.

## <h2><a name="create_mo_cluster">3. Create MatrixOne cluster</a></h2>

1. Execute the following command to use an existing Namespace or create a new one to start cluster deployment:

    ```
    NS=${NAMESPACE_NAME}
    kubectl create namespace ${NS}
    ```

    In a distributed deployment, the MatrixOne database requires external shared storage. Currently, MatrixOne can use object storage that supports the S3 protocol (such as AWS S3, MinIO) or network file systems (such as NFS) as shared storage. For the steps to configure AWS S3 or MinIO, please refer to [Configure shared storage for MatrixOne cluster](configure-shared-memory.md).

2. Execute the following command to deploy a set of MinIO as shared storage in the target Kubernetes cluster. For information, refer to [Configure shared storage for MatrixOne cluster](configure-shared-memory.md).

    ```
    kubectl -n mo-system apply -f https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/minio.yaml
    # Prepare the MinIO credential in the NS that will be used by the MatrixOne cluster
    $ kubectl -n ${NS} create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=minio --from-literal=AWS_SECRET_ACCESS_KEY=minio123
    ```

3. Execute the following command to download the example MatrixOne cluster definition file:

    ```
    $ curl -O https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/mo-cluster.yaml
    ```

4. All components in the default cluster definition are not configured with resource requests and are only suitable for demonstration. You can edit *mo-cluster.yaml* to specify CPU and memory requests and limits for each component.

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
    spec:
      logService:
        replicas: 3
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +       cpu: 3
    +       memory: 14Gi
      dn:
        replicas: 2
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +     limits:
    +       cpu: 3
    +       memory: 14Gi
      tp:
        replicas: 2
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +     limits:
    +       cpu: 3
    +       memory: 14Gi
    ```

5. Execute the following command to create a MatrixOne cluster:

    ```
    kubectl -n ${NS} apply -f mo-cluster.yaml
    ```

6. Execute the following command to verify whether the MatrixOne cluster is successfully created:

    ```
    kubectl -n ${NS} get matrixonecluster --watch
    ```

7. Wait for the `Phase` of the cluster object to reach the `Ready` state, then the creation is successful. The code example is as follows:

    ```
    NAME   LOG   DN    TP    AP    VERSION            PHASE      AGE
    mo     3     2     2           nightly-63835b83   Ready          2m6s
    ```

## <h2><a name="connect_mo_cluster">4. Connect to MatrixOne cluster</a></h2>

1. Execute the following command to obtain the initial username and password of the MatrixOne cluster:

    ```
    SECRET_NAME=$(kubectl -n ${NS} get matrixonecluster mo --template='{{.status.credentialRef.name}}')
    MO_USR=$(kubectl -n ${NS} get secret ${SECRET_NAME} --template='{{.data.username}}' | base64 -d)
    MO_PWD=$(kubectl -n ${NS} get secret ${SECRET_NAME} --template='{{.data.password}}' | base64 -d)
    ```

2. The MatrixOne cluster configured by default only allows clients in the k8s cluster to access it. You can connect to a MatrixOne cluster by one of two methods listed below:

    - Start a temporary Pod in the k8s cluster, and connect to the MatrixOne cluster in the Pod:

    ```
    kubectl -n ${NS} run --rm mysql-shell -it --image=mysql -- mysql -h mo-tp-cn -P6001 -u${MO_USR} -p${MO_PWD}
    ```

    - Use kubectl port-forward to map the target service to a local port for access:

    ```
    nohup kubectl -n mo port-forward svc/mo-tp-cn 6001:6001 &
    mysql -h 127.0.0.1 -P6001 -u${MO_USR} -p${MO_PWD}
    ```

## <h2><a name="delete_mo_cluster">Delete MatrixOne cluster</a></h2>

If you need to delete the cluster, you only need to delete the MatrixOne object created in <a href="#create_mo_cluster">step 3</a>; you can execute the following command to delete:

```
kubectl -n ${NS} delete -f mo-cluster.yaml
```

If the data in MinIO is no longer needed, execute the following command to delete the MinIO created in <a href="#create_mo_cluster">step 3</a>:

```
kubectl -n mo-system delete -f https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/minio.yaml
```
