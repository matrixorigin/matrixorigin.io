# MatrixOne Operator Management

## MatrixOne Operator overview

[MatrixOne Operator](https://github.com/matrixorigin/matrixone-operator) is used to define and manage the resource requirements of MatrixOne clusters in Kubernetes, consisting of a set of Kubernetes custom resources (CustomResourceDefinitions, CRD), a set of Kubernetes controllers and a set of WebHook services:

- **CRD**: In Kubernetes, CRD is an object that registers a new custom resource type into Kubernetes APIServer. The CRDs contained in MatrixOne Operator register various custom resources, including MatrixOneCluster resources used to describe MatrixOne clusters and resources such as CNSet, DNSet, and LogSet used to describe components in the cluster. After the registration, the client can read and write these resources on the Kubernetes APIServer.

- **Controller**: The controller is a long-running automation program responsible for monitoring the desired state of resources in Kubernetes, collecting the actual state of these resources, and automatically operating and maintaining them to drive the actual state to the desired state. The controller in matrixone-operator monitors resources such as MatrixOneCluster, CNSet, DNSet, LogSet, etc., and is responsible for realizing the desired state declared by the user through these resources.

- **Webhook service**: A webhook service is a long-running HTTP service. When Kubernetes APIServer receives a request from a user to read and write resources such as MatrixOneCluster, CNSet, DNSet, and LogSet, it will forward the request to the Webhook service, and the Webhook service will perform logic such as request verification and default value filling.

When using Helm chart to install Matrixone-Operator, it will automatically submit the required CRDs to Kubernetes APIServer, complete the registration of custom resources, and deploy a long-running Matrixone-Operator application. The controller mentioned above, and webhook services are packaged in this application.

### Cluster Management

MatrixOne Operator provides users with declarative cluster management capabilities through MatrixOneCluster resources. Specifically, when deploying a MatrixOne cluster on Kubernetes, the user can declare a MatrixOneCluster object in YAML format to describe the cluster, and the controller of the operator will realize the orchestration of the cluster according to the description and update the cluster status to the .status of the MatrixOneCluster object field.

A MatrixOneCluster cluster consists of components such as Compute Node (CN), Database Node (DN), and Log Service, which correspond to sub-resources such as CNSet, DNSet, and LogSet. Therefore, the controller of the MatrixOneCluster resource orchestrates these sub-resources and relies on the controllers of these sub-resources to complete their orchestration.

![image-operator](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/image-operator.png?raw=true)

## Deployment, Operation, Maintenance

The deployment, operation, and maintenance environment introduced in this chapter will be based on the environment of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

The following operations are performed on the master0 node.

### Deployment

Please look at the MatrixOne-Operator deployment chapter of [MatrixOne Distributed Cluster Deployment](deploy-MatrixOne-cluster.md).

### Check Status

We use the Helm tool to deploy MatrixOne Operator. [Helm](https://helm.sh/zh/docs/intro/using_helm/) is a Kubernetes application package management tool for managing charts, pre-configured installation package resources, similar to Ubuntu's APT and CentOS YUM. You can use the `helm list` command to check the deployment status of the Operator.

```
NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
matrixone-operator      mo-hn           1               2023-04-04 16:37:10.517301608 +0800 CST deployed        matrixone-operator-0.7.0-alpha.1        0.1.0 
```

### Update

The MatrixOne-Operator project is a long-term maintenance and update project; please update to the latest version. You can download the new version of Operator on [Github](https://github.com/matrixorigin/matrixone-operator/releases), for example: `matrixone-operator-0.7.0-alpha.4`.

Unzip the file with the following command:

```
tar xvf ./matrixone-operator-0.7.0-alpha.4.tgz
cd matrixone-operator
```

You can use the `helm upgrade` command to upgrade Matrixone-Operator, but you need to specify the operator image's version. You can get the mirror version with the following command:

```
#Get the mirror version
kubectl get pod -nmo-hn `kubectl get pod -nmo-hn | grep operator | head -1 | awk '{print $1}'` -ojsonpath='{.spec.containers[0].image}'
matrixorigin/matrixone-operator:sha-eea8d16
# Specify to set the image version
IMAGE_TAG="sha-65d111e"
helm upgrade -n mo-hn matrixone-operator ./ --dependency-update --set image.tag=sha-65d111e
```

After the upgrade is successful, the code display is as follows:

```
Release "matrixone-operator" has been upgraded. Happy Helming!
NAME: matrixone-operator
LAST DEPLOYED: Thu Apr 6 18:02:08 2023
NAMESPACE: mo-hn
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

After upgrading Matrixone-Operator, a new Pod of `matrixone-operator-xxxx-xxx` will be regenerated under the `mo-hn` namespace, and then the old Pod will be deleted.

!!! note
    After the upgrade is complete, if the changes brought about by the Matrixone-Operator upgrade will also update the default `.spec`, then it is possible to roll over the related services or configurations of the MatrixOne cluster so that the MatrixOne service may be restarted. You can monitor the upgrade process with the command: `watch -e "kubectl get pod -nmo-hn -owide"`.

### Scaling

Since Operators often use limited resources, there are relatively few scenarios for vertical scaling. Generally speaking, we only need to consider horizontal scaling, increasing or decreasing the number of replicas. Usually, the Operator has a single copy. If we need to enhance the high availability of the Operator, consider expanding it, for example, to two copies. This way, even if the first replica fails (for example, pulling an image fails on its node), the other replica can still function normally. We can expand and shrink the number of Operator replicas by using the Helm Upgrade command and specifying the number of replicaCount in the deployment directory of the current Operator version. This is very important for the deployment and O&M management operations of MO clusters.

Before scaling up, we can use the following command to view the number of Operators:

```
watch -e "kubectl get pod -nmo-hn -owide"
NAME                                  READY   STATUS    RESTARTS      AGE    IP              NODE     NOMINATED NODE   READINESS GATES
matrixone-operator-5bdf6f8db6-7dwtj   1/1     Running   0             6m2s   10.234.60.101   node0    <none>           <none>
mo-dn-0                               1/1     Running   0             40h    10.234.60.93    node0    <none>           2/2
mo-log-0                              1/1     Running   0             40h    10.234.60.95    node0    <none>           2/2
mo-log-1                              1/1     Running   0             40h    10.234.60.92    node0    <none>           2/2
mo-log-2                              1/1     Running   0             40h    10.234.60.88    node0    <none>           2/2
mo-tp-cn-0                            1/1     Running   0             39h    10.234.60.97    node0    <none>           2/2
mo-tp-cn-1                            1/1     Running   3 (19h ago)   39h    10.234.60.96    node0    <none>           2/2
mo-tp-cn-2                            1/1     Running   2 (19h ago)   39h    10.234.60.98    node0    <none>           2/2
```

- **Expansion**: Use the following command line to expand capacity:

```
# number of replicas
NUM=2
cd matrixone-operator
helm upgrade -n mo-hn matrixone-operator ./ --dependency-update --set image.tag=sha-65d111e --set replicaCount=${NUM}
```

The expansion is successful, and the printing code example is as follows:

```
Release "matrixone-operator" has been upgraded. Happy Helming!
NAME: matrixone-operator
LAST DEPLOYED: Thu Apr 6 18:42:45 2023
NAMESPACE: mo-hn
STATUS: deployed
REVISION: 4
TEST SUITE: None
```

You can continue to observe the number of operators with the following command:

```
watch -e "kubectl get pod -nmo-hn -owide"
NAME                                  READY   STATUS    RESTARTS      AGE     IP              NODE     NOMINATED NODE   READINESS GATES
matrixone-operator-5bdf6f8db6-7dwtj   1/1     Running   0             11m     10.234.60.101   node0    <none>           <none>
matrixone-operator-5bdf6f8db6-82mh2   1/1     Running   0             6m55s   10.234.60.106   node0    <none>           <none>
mo-dn-0                               1/1     Running   0             40h     10.234.60.93    node0    <none>           2/2
mo-log-0                              1/1     Running   0             40h     10.234.60.95    node0    <none>           2/2
mo-log-1                              1/1     Running   0             40h     10.234.60.92    node0    <none>           2/2
mo-log-2                              1/1     Running   0             40h     10.234.60.88    node0    <none>           2/2
mo-tp-cn-0                            1/1     Running   0             40h     10.234.60.97    node0    <none>           2/2
mo-tp-cn-1                            1/1     Running   3 (19h ago)   40h     10.234.60.96    node0    <none>           2/2
mo-tp-cn-2                            1/1     Running   2 (19h ago)   39h     10.234.60.98    node0    <none>           2/2
```

If you need to scale down horizontally, you can use `helm upgrade` to reduce the number of `replicaCount` to complete the reduction of the number of replicas of the operator.

### Uninstall

!!! warning
    Before uninstalling Matrixone-Operator, confirm clearly, because the uninstallation operation will directly uninstall the resources related to the Matrixone cluster, including SVC, Pod, etc. (but not including the PVC resources used by the log service).

Uninstall Matrixone-Operator with the following command:

```
helm uninstall matrixone-operator -n mo-hn
```
