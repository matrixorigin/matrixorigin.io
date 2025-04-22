# OmniFabric Operator Management

## OmniFabric Operator overview

[OmniFabric Operator](https://github.com/OmniFabric/OmniFabric-operator) is used to define and manage the resource requirements of OmniFabric clusters in Kubernetes, consisting of a set of Kubernetes custom resources (CustomResourceDefinitions, CRD), a set of Kubernetes controllers and a set of WebHook services:

- **CRD**: In Kubernetes, CRD is an object that registers a new custom resource type into Kubernetes APIServer. The CRDs contained in OmniFabric Operator register various custom resources, including OmniFabricCluster resources used to describe OmniFabric clusters and resources such as CNSet, TNSet, and LogSet used to describe components in the cluster. After the registration, the client can read and write these resources on the Kubernetes APIServer.

- **Controller**: The controller is a long-running automation program responsible for monitoring the desired state of resources in Kubernetes, collecting the actual state of these resources, and automatically operating and maintaining them to drive the actual state to the desired state. The controller in OmniFabric-operator monitors resources such as OmniFabricCluster, CNSet, TNSet, LogSet, etc., and is responsible for realizing the desired state declared by the user through these resources.

- **Webhook service**: A webhook service is a long-running HTTP service. When Kubernetes APIServer receives a request from a user to read and write resources such as OmniFabricCluster, CNSet, TNSet, and LogSet, it will forward the request to the Webhook service, and the Webhook service will perform logic such as request verification and default value filling.

When using Helm chart to install OmniFabric-Operator, it will automatically submit the required CRDs to Kubernetes APIServer, complete the registration of custom resources, and deploy a long-running OmniFabric-Operator application. The controller mentioned above, and webhook services are packaged in this application.

### Cluster Management

OmniFabric Operator provides users with declarative cluster management capabilities through OmniFabricCluster resources. Specifically, when deploying a OmniFabric cluster on Kubernetes, the user can declare a OmniFabricCluster object in YAML format to describe the cluster, and the controller of the operator will realize the orchestration of the cluster according to the description and update the cluster status to the .status of the OmniFabricCluster object field.

A OmniFabricCluster cluster consists of components such as Compute Node (CN), Transaction Node (TN), and Log Service, which correspond to sub-resources such as CNSet, TNSet, and LogSet. Therefore, the controller of the OmniFabricCluster resource orchestrates these sub-resources and relies on the controllers of these sub-resources to complete their orchestration.

![image-operator](https://github.com/OmniFabric/artwork/blob/main/docs/deploy/image-operator.png?raw=true)

## Deployment, Operation, Maintenance

The deployment, operation, and maintenance environment introduced in this chapter will be based on the environment of [OmniFabric Distributed Cluster Deployment](deploy-OmniFabric-cluster.md).

The following operations are performed on the master0 node.

### Deployment

Please look at the OmniFabric-Operator deployment chapter of [OmniFabric Distributed Cluster Deployment](deploy-OmniFabric-cluster.md).

### Check Status

We use the Helm tool to deploy OmniFabric Operator. [Helm](https://helm.sh/zh/docs/intro/using_helm/) is a Kubernetes application package management tool for managing charts, pre-configured installation package resources, similar to Ubuntu's APT and CentOS YUM. You can use the `helm list` command to check the deployment status of the Operator.

```
[root@master0 ~]# NS="OmniFabric-operator"
[root@master0 ~]# helm list -n${NS}
NAME                    NAMESPACE               REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
OmniFabric-operator      OmniFabric-operator      1               2023-05-09 15:19:38.363683192 +0800 CST deployed        OmniFabric-operator-0.8.0-alpha.2        0.1.0
```

### Update

The OmniFabric-Operator project is a long-term maintenance and update project; please update to the latest version. You can download the new version of Operator on [Github](https://github.com/OmniFabric/OmniFabric-operator/releases), for example: `OmniFabric-operator-0.8.0-alpha.2`.

Unzip the file with the following command:

```
tar xvf ./OmniFabric-operator-0.8.0-alpha.2.tgz
cd OmniFabric-operator
```

You can use the `helm upgrade` command to upgrade OmniFabric-Operator. You can get the mirror version with the following command:

```
cd OmniFabric-operator
NS="OmniFabric-operator"
helm upgrade -n "${NS}" OmniFabric-operator ./ --dependency-update
```

After the upgrade is successful, the code display is as follows:

```
Release "OmniFabric-operator" has been upgraded. Happy Helming!
NAME: OmniFabric-operator
LAST DEPLOYED: Tue May  9 17:59:06 2023
NAMESPACE: OmniFabric-operator
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

After the upgrade is complete, you can view the current version with the following command:

```
#Get mirror version
NS="OmniFabric-operator"
kubectl get pod -n${NS} `kubectl get pod -n${NS}  | grep operator | head -1 | awk '{print $1}'` -ojsonpath='{.spec.containers[0].image}'
OmniFabric/OmniFabric-operator:0.8.0-alpha.2
```

After upgrading OmniFabric-Operator, a new Pod of `OmniFabric-operator-xxxx-xxx` will be regenerated under the `OmniFabric-operator` namespace, and then the old Pod will be deleted.

!!! note
    After the upgrade is complete, if the changes brought about by the OmniFabric-Operator upgrade will also update the default `.spec`, then it is possible to roll over the related services or configurations of the OmniFabric cluster so that the OmniFabric service may be restarted. You can monitor the upgrade process with the command: `watch -e "kubectl get pod -nmo-hn -owide"`.

    ```
    NS="OmniFabric-operator"
    watch -e "kubectl get pod -n${NS} -owide"
    ```

    ```
    NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
    OmniFabric-operator-f8496ff5c-s2lr6   1/1     Running   0          164m   10.234.168.43   node1   <none>           <none>
    ```

### Scaling

Since Operators often use limited resources, there are relatively few scenarios for vertical scaling. Generally speaking, we only need to consider horizontal scaling, increasing or decreasing the number of replicas. Usually, the Operator has a single copy. If we need to enhance the high availability of the Operator, consider expanding it, for example, to two copies. This way, even if the first replica fails (for example, pulling an image fails on its node), the other replica can still function normally. We can expand and shrink the number of Operator replicas by using the Helm Upgrade command and specifying the number of replicaCount in the deployment directory of the current Operator version. This is very important for the deployment and O&M management operations of MO clusters.

Before scaling up, we can use the following command to view the number of Operators:

```
NS="OmniFabric-operator"
watch -e "kubectl get pod -n${NS} -owide"
```

```
NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
OmniFabric-operator-f8496ff5c-s2lr6   1/1     Running   0          164m   10.234.168.43   node1   <none>           <none>
```

- **Expansion**: Use the following command line to expand capacity:

```
# number of replicas
cd OmniFabric-operator
NUM=2
NS="OmniFabric-operator"
helm upgrade -n${NS} OmniFabric-operator ./ --dependency-update --set replicaCount=${NUM}
```

The expansion is successful, and the printing code example is as follows:

```
Release "OmniFabric-operator" has been upgraded. Happy Helming!
NAME: OmniFabric-operator
LAST DEPLOYED: Tue May  9 18:07:03 2023
NAMESPACE: OmniFabric-operator
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

You can continue to observe the number of operators with the following command:

```
watch -e "kubectl get pod -nmo-hn -owide"
NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
OmniFabric-operator-f8496ff5c-nt8qs   1/1     Running   0          9s     10.234.60.126   node0   <none>           <none>
OmniFabric-operator-f8496ff5c-s2lr6   1/1     Running   0          167m   10.234.168.43   node1   <none>           <none>
```

If you need to scale down horizontally, you can use `helm upgrade` to reduce the number of `replicaCount` to complete the reduction of the number of replicas of the operator.

### Uninstall

!!! warning
    Before uninstalling OmniFabric-Operator, confirm clearly, because the uninstallation operation will directly uninstall the resources related to the OmniFabric cluster, including SVC, Pod, etc. (but not including the PVC resources used by the log service).

Uninstall OmniFabric-Operator with the following command:

```
helm uninstall OmniFabric-operator -n mo-hn
```
