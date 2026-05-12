# Matrixone-Operator Design and Implementation Details

MatrixOne is a cloud-native distributed database that naturally adapts to cloud infrastructure and is optimized for cloud-oriented cost models. And unlike typical SaaS services, databases in serious scenarios often need to follow the application, running on the same infrastructure as the application, out of a need for performance and data security. To serve as many users as possible, MatrixOne needs to adapt to all types of public, private, and even hybrid clouds. And the largest of these conventions is Kubernetes (K8S). That's why MatrixOne uses K8S as the default operating environment for distributed deployments, adapting to different clouds in a unified way. MatrixOne-Operator is exactly MatrixOne's automated deployment operations software on the K8S. It extends the K8S to provide external operations management capabilities of the MatrixOne cluster in a K8S-style declarative API.

This article will explain the design and implementation of MatrixOne-Operator and share our empirical thinking.

## MatrixOne-Operator Design

Although K8S natively provides a StatefulSet API to serve the orchestration of stateful apps, K8S natively does not support managing app state due to the difficulty of uniform abstraction of app layer state across different stateful apps. To solve this problem, the Operator model emerged. A typical K8S Operator consists of an API and a controller:

- API

Typically declared through K8S' CustomResourceDefinition (CRD) object, after committing a K8S CRD to K8S's api-server, the api-server registers a corresponding Restful API with itself. All K8SClients can get, LIST, POST, DELETE, etc. on this newly declared API in a similar way to manipulating native resources. By convention, within each API object, the `.spec` structure is managed by the user to declare the desired state of the object, and the `.status` structure is managed by the controller below to expose the actual state of the object.

- Controller

A controller is an ongoing piece of code that monitors (watches) a range of K8S objects, including the API objects we just defined. Then, automation is performed based on the expected state of these objects and the actual state collected from the reality (note: the actual state here is collected from the reality and rewritten into `.status`, not directly from `.status`) to drive the actual state to the desired state. The process continues in a loop, graphically known as a control loop, and in some places with a more classical word, reconciliation loop, cleverly keeping the flavors aligned with K8S's word for "orchestration."

The following diagram provides a general description of the process using the simplified MatrixOneCluster API as an example:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/mo-op-1.png?raw=true width=70% heigth=70%/>
</div>

MatrixOne-Operator provides not only load-based APIs such as MatrixOneCluster for managing MO clusters, but also task-based APIs such as backup recovery and resource-based APIs such as object buckets. Each API and their controller are designed with unique considerations in mind, but invariably, all APIs and controllers are built in the above pattern. Next, we'll continue exploring the tradeoffs in each API design.

## Cluster API Design

A distributed MO cluster consists of multiple components such as log services, transaction nodes, compute nodes, and proxies, where compute nodes also have explicit heterogeneous requirements to achieve model optimization for load and capabilities across clouds, cloud edges, and more. Centralizing the management of an entire cluster into one API object and declaring another controller to manage, while easy to use, is a code maintenance nightmare. Therefore, MatrixOne-Operator made the principle of **loosely coupled fine-grained APIs** clear at the beginning of its design, designing clear APIs with responsibilities such as LogSet, CNSet, ProxySet, BucketClaim, and controllers that are independent of each other. To maintain ease of use, the MatrixOneCluster API was also introduced. Responsible for MatrixOneCluster controllers not duplicating the work of other controllers—when a cluster requires a LogSet to provide logging services, the MatrixOneCluster controller simply creates a LogSet object and delegates the rest to the LogSet controller.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/mo-op-2.png?raw=true width=60% heigth=60%/>
</div>

With this design, while there are many APIs, users always only need to care about the MatrixOneCluster API, and the developers of MatrixOne-Operator are adding features or solving problems, often with problem domains no larger than a fine-grained API and controller.

Of course, there are certain dependencies between multiple API objects, such as transaction nodes and compute nodes that rely on HAKeeper running in the log service to get cluster information for service discovery. This requires that the logging service be started and HAKeeper bootstrap completed when the cluster is deployed before the transaction and compute nodes can continue to start. While this type of logic can be implemented by a MatrixOneCluster controller, it also means that the business knowledge of other controllers is compromised and the implementation of the individual controls still creates coupling. Therefore, in mo-operator, we implement the business logic that creates dependencies between all components on the relying party, which exposes itself to the outside world only through the convention `.status` field. For example, when a controller is tuning a CNset, it actively waits for the LogSet pointed to by the CNSet to be ready before following up. Neither the LogSet controller nor the upper MatrixOneCluster controller need to be aware of this.

The loosely coupled fine-grained API adapts well to CN's heterogeneous orchestration scenarios. In MatrixOne-Operator, in addition to the convenient usage of declaring multiple CN groups in MatrixOneCluster for heterogeneous orchestration, it is also possible to directly create a CNSet to join an existing cluster, which means that the new CNSet can be deployed in another set of K8S clusters with network-level support for MO orchestration across clouds or cloud-side scenarios.

During iterations of individual controllers, MatrixOne-Operator also tends to add new features by adding new API objects. For example, when implementing object storage management, MatrixOne-Operator needs to ensure that there is no intersection between object storage paths used by different clusters and that they are cleaned up automatically after the cluster is destroyed. MatrixOne-Operator's solution is to add a BucketClaim API that references the control logic of K8S PersistentVolumeClaim to complete lifecycle management of an object storage path in a standalone controller, avoiding complex race condition handling and code coupling issues.

## Controller implementation

K8S provides the controller-runtime package to help developers implement their own controllers, but for versatility the interface design is relatively low-level:

```
Reconcile(ctx context.Context, req Request)(Result, error) 
```

The controller needs to implement the Reconcile interface, which is then registered through the controller-runtime interface, declare the objects to listen on, and some filtering rules for listening. The controller-runtime calls the controller's Reconcile method each time the object changes or retries Reconcile, and passes the identifier of the target object in the req parameter. There will be a lot of template code within this interface, usually represented by pseudocode:

```
func tuning(Namespace+Name of object A) {
  Get the Spec of object A
  if object A is being deleted {
    Execute the cleanup logic
    update the cleanup progress to A.status
    remove finalizer on object A
  } else {
    Add finalizer to A
    Execute the tuning logic
    Update tuning progress to A.status
  }
}
```

Similar logic recurs in various community controller implementations, and developers need to care about a lot more than business: handling finalizers correctly to ensure that resources are not leaked, updating progress and errors to status in a timely manner to increase visibility, and more detailed loggers with context and kubeClient with cache issues.

Since there is no need to consider versatility, there is a more specialized abstraction within MatrixOne-Operator, designing the Actor interface:

```
type Actor[T client.Object] interface {  
    Observe(*Context[T]) (Action[T], error)  
    Finalize(*Context[T]) (done bool, err error)  
}

type Action[T client.Object] func(*Context[T]) error
```

Behind that, the generic controller framework logic takes care of all the logic and details similar to the template code above, preparing within Context\[T] the objects that currently need to be reconciled and the Logger, EventRecorder, KubeClient objects that have already taken care of the context. Finally:

- When tuning an undeleted object, call Actor.Observe to have real business logic perform the tuning;

- When tuning an object in progress, Actor.Finalize is called to perform resource cleanup behavior within the business logic, retrying until Finalize returns completion before removing the object's finalizer.

The state machine for an object is as follows:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/mo-op-3.png?raw=true width=70% heigth=70%/>
</div>

Under this process, a controller is straightforward about the implementation of both the create and destroy parts of API object lifecycle management. Nothing more than calling K8S's API to request storage, deploy workloads, configure service discovery, or conversely destroying all external resources created while the API is in the delete phase, in conjunction with MO's operational knowledge. The object's updated tuning operation is also regular diff logic to MatrixOneCluster's. The cnSets field, for example, can be represented by the following pseudocode:

```
func sync(c MatrixOneCluster) {
  existingCNSets := Collect all CNSets for this cluster
  for _, desired := range c.spec.CNSets {
    cnSet := build CNSet(desired)
    if _, ok := existingCNSets[cnSet.Name]; ok {
      // 1. CNSet exist,update CNSet
      ....
      // 2. Marks this cnSet as needed in the desired state.
      delete(existingCNSets, cnSet.Name)
    } else {
      // CNSet does not exist, create
      ....
    }
  }
  for _, orphan := range existingCNSets {
    // Cleanup for CNSets that actually exist but do not exist in the desired state
  }
}
```

More error-prone is ConfigMap / Secret's update logic. MO, like many apps, requires a configuration file and restarts to reread the configuration each time it is updated, which is usually stored with K8S native ConfigMap objects. One easy place to tread the pit is that the contents of the ConfigMap object are mutable, whereas most apps tend to read the configuration file within the ConfigMap only once at startup and never reload later. Therefore, viewing the content within the ConfigMap that the Pod is currently referencing does not determine the configuration that the Pod is currently using (it is possible that the ConfigMap content has changed since startup). Also, if you want to update your app on a rolling basis after a ConfigMap change, a common practice is to make a hash of the contents of the ConfigMap into the PodTemplate's Annotation and update this Annotation after each update of the ConfigMap change triggers a rolling update of your app. But this can also happen unexpectedly by modifying ConfigMap in place:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/mo-op-4.png?raw=true width=70% heigth=70%/>
</div>

For example, let's assume that the ConfigMap Hash in Annotation is updated from 123 to 321, and 321 is not ready after startup because of a problem with the ConfigMap configuration. At this point, with the right policy configuration, the rolling update will get stuck to avoid a wider failure range. However, a new version of ConfigMap has also been read within the Pod that has not yet been updated, and as soon as a container restart or Pod rebuild occurs, problems occur. This obviously doesn't behave the same as updating mirrors or other fields. When updating other fields, the green pod still belongs to the old ReplicaSet/ControllerRevision, neither reboot nor rebuild will start with the new version of the configuration, and the fault range is manageable.

The root of the problem is that the contents of the ConfigMap are not within the spec of the Pod, and directly modifying the contents of the ConfigMap conflicts with the Pod's **immutable infrastructure** principles.

Therefore, MatrixOne-Operator designs all objects that will be referenced within the Pod to be immutable. In the case of ConfigMap, each time a component's configuration is updated via CRD, MatrixOne-Operator generates a new ConfigMap and rolls all copies of the component onto this new ConfigMap:

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/overview/architecture/mo-op-5.png?raw=true width=70% heigth=70%/>
</div>

Based on this principle, at any given moment we can clarify the information within all Pods via the current Pod Spec. The problem of rolling updates is also solved.

## Application State Management

In addition to lifecycle management of the app itself, MatrixOne-Operator has an important responsibility to manage the state of the app itself. However, distributed systems often manage their own application state based on heartbeats or similar mechanisms, so why do you have to do this more in Operator?

The reason is that Operator has knowledge of automated O&M within its code, for example Operator knows exactly which Pod is to be rebuilt/restarted next during the rolling update process. So it's possible to adjust in-app status ahead of time, such as migrating loads on the Pod to minimize the impact of rolling updates. There are two common implementations of such application state management logic:

- Synchronize app status within the Pod's own various lifecycle hooks, such as InitContainer, PostStart Hook, and PreStop Hook.

- Call the app interface within Operator's tuning loop to adjust the app state.

Mode 1 is simpler to implement, while Mode 2 is more self-contained and free to cope better with complex scenarios. For example, when shrinking a CNSet, migrate the session on the condensed CN Pod to another CN Pod before stopping the CN Pod. If this action is placed in Pod PreStop Hook, it cannot be undone. In the actual scenario, there is a set of CNs that are shrunk and then expanded before the shrunk is complete (especially after auto-scaling is turned on). At this point, the tuning loop within Operator can calculate that the CNs that are still offline can be directly multiplexed at this point, calling the management interface inside the MO to restore the CN to the service state, not migrating the session to the other CNs and accepting the new session back to the Proxy without having to expand a new CN.

## Summary

As a mainstream option to extend the orchestration capabilities of K8S, the Operator model has evolved to today have mature base libraries and tool chains, and there are plenty of mature open source projects in the community to reference. Developing an Operator on K8S is no longer a new topic. But the real complexity is always hidden in the details of the actual business, and solving these problems requires a thorough understanding that combines knowledge of K8S and its own business systems domain. As a cloud-native distributed database, MatrixOne shares many of its design concepts and domain knowledge with other cloud-native systems. Hopefully this short article will not only help you understand the design implementation of mo-operator, but also give you an empirical reference when designing your own Operator.

## Reference Documents

To learn about MatrixOne-Operator deployment operations, see Chapter [Operator Administration](../../Deploy/MatrixOne-Operator-mgmt.md)
