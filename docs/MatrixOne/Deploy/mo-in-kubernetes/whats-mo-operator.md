# What is MatrixOne Operator

MatrixOne Operator is an automated operation and maintenance system for MatrixOne clusters on Kubernetes. It consists of Kubernetes custom resources (CustomResourceDefinitions, CRD), a group of Kubernetes controllers, and Webhook services.

- A CRD is an object in Kubernetes used to register a new custom resource type with Kubernetes APIServer. The CRDs contained in MatrixOne Operator register various custom resources, including MatrixOne Cluster resources used to describe MatrixOne clusters, CNSet, DNSet, LogSet resources used to describe components in the cluster, and so on. After the registration is complete, the client can read and write these resources on the Kubernetes API server.

- The controller is a long-running automation program responsible for monitoring the desired state of resources in Kubernetes, collecting the actual state of these resources, and automatically performing operation and maintenance operations to drive the actual state to the desired state. The controller in MatrixOne Operator monitors resources such as MatrixOneCluster, CNSet, DNSet, LogSet, etc., and is responsible for realizing the desired state declared by users through these resources.

- The webhook service is a long-running HTTP service. When the Kubernetes API Server receives a request from a user to read and write resources such as MatrixOneCluster, CNSet, DNSet, and LogSet, it will forward the request to the Webhook service, and the Webhook service will perform logic such as request verification and default value filling.

   The logic flow chart of the Webhook service is as follows:

![MatrixOne webhook](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/mo-operator.png?raw=true)

When MatrixOne Operator is installed through Helm chart, the required CRDs will be submitted to Kubernetes APIServer to complete the registration of custom resources, and a long-running MatrixOne Operator application will be deployed, in which the controller as mentioned above, and Webhook services are packaged.
