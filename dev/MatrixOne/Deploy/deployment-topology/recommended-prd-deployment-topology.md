# Recommended Production Environment Deployment Plan

The recommended configuration of the MatrixOne distributed cluster described in this document is suitable for production environments and possesses robust performance and reliability. This configuration can support billions of data with thousands of concurrent OLTP operations or handle OLAP operations with tens of TB data volume.

This configuration provides a high degree of availability guarantee. Whether it is Kubernetes, Minio, or MatrixOne, the system can operate normally when a node goes offline. This means the system has strong fault tolerance and can maintain business continuity in node failure.

Below are the details for the recommended production environment deployment plan:

## Software and Hardware Configuration Requirements

| **Module** | Kubernetes master | Minio | LogService | TN (mixed proxy and load balancing) | CN (mixed proxy and load balancing) |
| :----------------------: | ----------------------- --- | ---------- | -------- | -------- | ----------------- --- |
| **Number of machines (both physical machines and virtual machines)** | 3 machines | 4 machines | 3 machines | 1 machine | y machines |
| **Node Role** | Kubernetes Management | Storage Service | MatrixOne Work Node | MatrixOne Work Node | MatrixOne Work Node |
| **CPU configuration** | 4 cores or above | 4 cores or above | 4 cores or above | 16 cores or above | 16 cores or above |
| **Memory configuration** | 8GB or more | 8GB or more | 8GB or more | 64GB or more | 32GB or more |
| **Network Card** | Dual 10 Gigabit Ethernet ports, 10 Gigabit Ethernet | Ditto | Ditto | Ditto | Ditto |
| **System disk configuration** | Each node PCIe NVME SSD 3.0 × 1 block 100GB, it is recommended to do Raid 1 | Same as above | Same as above | Same as above | Same as above |
| **Kubernetes disk configuration** | PCIe NVME SSD 3.0 × 1 piece of 100GB per node, Raid 1 is recommended | Same as above | Same as above | Same as above | Same as above |
| **Disk Configuration** | N/A | PCIe NVME SSD 3.0 × 4 x a G/block per node, no requirement for raid, physical partitioning is recommended, logical partitioning is recommended. | Each node NVME SSD 3.0/4.0 (read rate above 1G/s) × 1 block × b G/block. | NVME SSD 3.0/4.0 × 2 blocks × c G/block | NVME SSD 3.0/4.0 × 2 blocks × d G/block per node. |
| **Remarks** | | a is related to the volume of business data, a = volume of business data × 2/16. | b is related to the amount of business data; the closer, the better. | c is related to the amount of business data; the closer, the better. One of them is reserved for TN/CN failure recovery. | d is related to the amount of business data; the closer, the better. One of them is reserved for TN/CN failure recovery. y is related to the business load. |

## Other configuration

| Operating System | Supported CPU Architectures |
| :----------------------------------------- | :-------------- |
| Debian 11 or above (Kernel 5.0 or above) | X86_64 |

Since each privatized production environment's deployment scenarios are different, please contact MatrixOne's customer support team for specific deployment solutions and deployment details.
