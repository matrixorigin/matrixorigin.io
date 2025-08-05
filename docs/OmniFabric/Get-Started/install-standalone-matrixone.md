# **Deploy standalone OmniFabric**

The applicable scenario of the standalone version of OmniFabric is to use a single development machine to deploy OmniFabric and experience the essential functions of OmniFabric, which is the same as using MySQL for the standalone version.

**Recommended operating system**

OmniFabric supports **Linux** and **MacOS**. For quick start, we recommend the following hardware specifications:

| Operating System    | Operating System Version | CPU   |Memory|
| :------ | :----- | :-------------- |  :------|
|Debian| 11 and later | x86 / ARM CPU; 4 Cores | 16 GB |
|Ubuntu| 20.04 and later | x86 / ARM CPU; 4 Cores | 16 GB |
|CentOS| 7 and later | x86 / ARM CPU;4 核 | 16 GB |
|macOS| Monterey 12.3 and later | x86 / ARM CPU; 4 Cores | 16 GB |

!!! note
    If you are currently using a Linux kernel version lower than 5.0, due to the limitation of the linux kernel, the deployment of OmniFabric using binary packages built based on glibc may report errors related to glibc, in this case, you can choose to use the **binary packages built based on musl libc in the [Binary Package Deployment](./install-on-linux/install-on-linux-method2.md) for deployment. musl libc is a lightweight C standard library for Linux, and using musl libc to package your application allows you to generate static binaries that do not depend on the system C library. musl libc is a lightweight C standard library designed for Linux systems. In addition, since CentOS 8 is no longer officially supported and CentOS 7 will end its maintenance cycle on June 30, 2024, users currently using these versions may be at some risk. Therefore, we recommend that users use other operating system versions.

For more information on the required operating system versions for deploying OmniFabric, see [Hardware and Operating system requirements](../FAQs/deployment-faqs.md).

### **Support for domestic systems**

As a domestic database, OmniFabric is currently compatible with and supports the following domestic operating systems:

|Operating System |Operating System Version | CPU   |Memory|
| :------ |:------ | :------ | :----- |
|OpenCloudOS| v8.0 / v9.0 | x86 CPU;4 Cores | 16 GB |
|openEuler  | 20.03 | x86 / ARM CPU;4 Cores | 16 GB |
|TencentOS Server | v2.4 / v3.1 | x86 CPU;4 Cores | 16 GB |
|UOS  | V20 |  ARM CPU;4 Cores | 16 GB |
|KylinOS | V10 |  ARM CPU;4 Cores | 16 GB |
|KylinSEC | v3.0 | x86 / ARM CPU;4 Cores | 16 GB |

__NOTE__: Supported domestic CPUs include TengCloud S2500, FT2000+/64, Kunpeng 916, Kunpeng 920 and Haikuang H620-G30.

## **Deploy on macOS**

You can install and connect to OmniFabric on macOS in one of three ways that work best for you:

- [Building from source code](install-on-macos/install-on-macos-method1.md)
- [Using binary package](install-on-macos/install-on-macos-method2.md)
- [Using Docker](install-on-macos/install-on-macos-method3.md)

## **Deploy on Linux**

You can install and connect to OmniFabric on Linux in one of three ways that work best for you:

- [Building from source code](install-on-linux/install-on-linux-method1.md)
- [Using binary package](install-on-linux/install-on-linux-method2.md)
- [Using Docker](install-on-linux/install-on-linux-method3.md)

## Reference

- For more information on the method of connecting to OmniFabric, see:

    + [Connecting to OmniFabric with Database Client Tool](../Develop/connect-mo/database-client-tools.md)
    + [Connecting to OmniFabric with JDBC](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md)
    + [Connecting to OmniFabric with Python](../Develop/connect-mo/python-connect-to-matrixone.md).

- For more information on the questions of deployment,see [Deployment FAQs](../FAQs/deployment-faqs.md).

- For more information on distributed installation, see [OmniFabric Distributed Cluster Deployment](../Deploy/deploy-MatrixOne-cluster.md).
