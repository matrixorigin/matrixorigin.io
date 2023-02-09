# **Deploy standalone MatrixOne**

The applicable scenario of the standalone MatrixOne is to use a single server, experience the smallest MatrixOne with the complete topology, and simulate the production deployment steps.

**Recommended operating system**

MatrixOne supports **Linux** and **MacOS**. For quick start, we recommend the following hardware specifications:

| Operating System    | Operating System Version | CPU   |Memory|
| :------ | :----- | :-------------- |  :------|
|CentOS| 7.3 and later| x86 CPU; 4 Cores | 32 GB |
|macOS| Monterey 12.3 and later | - x86 CPU;4 Cores<br>- ARM;4 Cores | 32 GB |

For more information on the required operating system versions for deploying MatrixOne, see [Hardware and Operating system requirements](../FAQs/deployment-faqs.md).

## **Deploy on macOS**

You can install and connect to MatrixOne on macOS in one of three ways that work best for you: 

- [Building from source code](install-on-macos/install-on-macos-method1.md)
- [Using binary package](install-on-macos/install-on-macos-method2.md)
- [Using Docker](install-on-macos/install-on-macos-method3.md)

## **Deploy on Linux**

You can install and connect to MatrixOne on Linux in one of three ways that work best for you:

- [Building from source code](install-on-linux/install-on-linux-method1.md)
- [Using binary package](install-on-linux/install-on-linux-method2.md)
- [Using Docker](install-on-linux/install-on-linux-method3.md)

## Reference

- For more information on the method of connecting to MatrixOne, see:

    + [Connecting to MatrixOne with Database Client Tool](../Develop/connect-mo/database-client-tools.md)
    + [Connecting to MatrixOne with JDBC](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md)
    + [Connecting to MatrixOne with Python](../Develop/connect-mo/python-connect-to-matrixone.md).

- For more information on the questions of deployment,see [Deployment FAQs](../FAQs/deployment-faqs.md).

- For more information on distributed installation, see [Deploy MatrixOne Cluster on Kubernetes Overview](../Deploy/install-and-launch-in-k8s.md).
