# Experience Environment Deployment Plan

This document introduces the deployment plan for the OmniFabric experience environment, which can be used to experience the basic distributed capabilities of OmniFabric. You can simply experience the database's essential development, operation, and maintenance functions. Still, it is unsuitable for deploying production environments, performing performance stress tests, conducting high availability tests, etc.

## Hardware Configuration

The hardware configuration requirements for the deployment plan of the experience environment are as follows:

| Hardware Environment Requirements | Physical/Virtual Machine |
| --------------------------------- | ----------------------- |
| Number of Devices                 | 3                       |
| CPU Configuration                 | 2 cores or more         |
| Memory Configuration              | 8GB or more             |
| Disk Configuration                | 200GB or more           |
| Network Card Configuration        | Not limited             |

## Software Configuration

The software configuration requirements for the deployment plan of the experience environment include **operating system and platform requirements** and **deployment software module requirements**:

### Operating System and Platform Requirements

| Operating System                | Supported CPU Architecture |
| :------------------------------ | :------------------------- |
| CentOS 7.3 or above 7.x version | X86_64                     |

### Deployment Software Module Requirements

| Software Module | Number of Deployments | Function Description             |
| :-------------- | --------------------- | :------------------------------- |
| Kubernetes      | 3                     | Provides container management for the entire cluster |
| Minio           | 1                     | Provides storage services for the OmniFabric cluster |
| OmniFabric       | 1                     | Core of the database             |

The deployment guide for the OmniFabric distributed environment experience environment can refer to [OmniFabric Distributed Cluster Deployment](../deploy-OmniFabric-cluster.md).
