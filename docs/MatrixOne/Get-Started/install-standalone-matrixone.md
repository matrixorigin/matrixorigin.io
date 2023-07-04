# **Deploy standalone MatrixOne**

The applicable scenario of the standalone version of MatrixOne is to use a single development machine to deploy MatrixOne and experience the essential functions of MatrixOne, which is the same as using MySQL for the standalone version.

**Recommended operating system**

MatrixOne supports **Linux** and **MacOS**. For quick start, we recommend the following hardware specifications:

| Operating System    | Operating System Version | CPU   |Memory|
| :------ | :----- | :-------------- |  :------|
|Debian| 11 and later | x86 / ARM CPU; 4 Cores | 16 GB |
|Ubuntu| 20.04 and later | x86 / ARM CPU; 4 Cores | 16 GB |
|macOS| Monterey 12.3 and later | x86 / ARM CPU; 4 Cores | 16 GB |

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

- For more information on distributed installation, see [MatrixOne Distributed Cluster Deployment](../Deploy/deploy-MatrixOne-cluster.md).
