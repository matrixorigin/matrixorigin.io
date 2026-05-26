# Minimum Production Environment Deployment Plan

The MatrixOne distributed cluster's minimum production configuration introduced in this article can be used for production environments. It can support tens of millions of data and hundreds of concurrent OLTP or OLAP businesses with tens of GB of data volume. At the same time, it provides a certain level of high availability guarantee. Even if one of the 3 nodes goes offline, it works normally.

## Hardware Configuration

The hardware configuration requirements for the minimum production environment deployment plan are as follows:

| Hardware Environment Requirements | Both Physical and Virtual Machines are acceptable |
| --------------------------------- | ------------------------------------------------- |
| Number of Devices                 | 3                                                 |
| CPU Configuration                 | 8 cores or more                                   |
| Memory Configuration              | 32GB or more                                      |
| Disk Configuration                | Each node has 1 system disk of 100G and 4-7 data disks of 100G, all requiring PCIe NVME SSD 3.0 |
| Network Card Configuration        | Dual 10GbE ports, 10GbE network card and switch   |

## Software Configuration

The software configuration requirements for the minimum production environment deployment plan include **operating system and platform requirements** and **deployment software module requirements**:

### Operating System and Platform Requirements

| Operating System                             | Supported CPU Architecture |
| :------------------------------------------- | :------------------------- |
| Debian 11 or higher version (Kernel required 5.0 or higher) | X86_64                     |

### Deployment Software Module Requirements

| Node Name | Resource | Node Role  | Deployment Modules                                                | Disk Deployment                                                    |
| --------- | -------- | ---------- | :--------------------------------------------------------------- | ------------------------------------------------------------------ |
| node0     | 8c32g    | Control/Storage/Compute | Deployment and O&M tool mo-ctl, Kubernetes master/node, Minio, MatrixOne Proxy, Logservice, TN, Load Balancer | Kubernetes requires 1 data disk, Minio requires 1 to 4 data disks (physical partitioning recommended, logical partitioning is also possible), Logservice requires 1 data disk, TN requires 1 data disk |
| node1     | 8c32g    | Control/Storage/Compute | Deployment and O&M tool mo-ctl, Kubernetes master/node, Minio, MatrixOne Proxy, Logservice, CN, Load Balancer | Kubernetes requires 1 data disk, Minio requires 1 to 4 data disks (physical partitioning recommended, logical partitioning is also possible), Logservice requires 1 data disk, CN requires 1 data disk |
| node2     | 8c32g    | Control/Storage/Compute | Deployment and O&M tool mo-ctl, Kubernetes master/node, Minio, MatrixOne Proxy, Logservice, CN, Load Balancer | Kubernetes requires 1 data disk, Minio requires 1 to 4 data disks (physical partitioning recommended, logical partitioning is also possible), Logservice requires 1 data disk, CN requires 1 data disk |
