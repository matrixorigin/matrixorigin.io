# Recommended Production Environment Deployment Plan

The recommended production configuration of the MatrixOne distributed cluster described in this document is suitable for production environments and possesses robust performance and reliability. This configuration can support billions of data with thousands of concurrent OLTP operations or handle OLAP operations with tens of TB data volume.

This configuration provides a high degree of availability guarantee. Whether it is Kubernetes, Minio, or MatrixOne, the system can operate normally when a node goes offline. This means the system has strong fault tolerance and can maintain business continuity in node failure.

Below are the details for the recommended production environment deployment plan:

## Software and Hardware Configuration Requirements

| Module                      | Number of Units (Physical and Virtual Machines are acceptable) | Node Role   | CPU Configuration | Memory Configuration | Network Card         | System Disk Configuration                                   | Kubernetes Disk Configuration                              | Data Disk Configuration                                    |
| --------------------------- | ------------------------------------------------------------- | ----------- | ----------------- | ------------------- | -------------------- | -------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| Kubernetes master           | 3                                                             | Kubernetes Control | 4 cores or more   | 8GB or more         | Dual 10GbE ports, 10GbE network card | Each node PCIe NVME SSD 3.0 * 1 piece 100GB, Raid 1 recommended | Each node PCIe NVME SSD 3.0 * 1 piece 100GB, Raid 1 recommended | N/A                                                       |
| Minio                       | 4                                                             | Storage Service  | 4 cores or more   | 8GB or more         | Dual 10GbE ports, 10GbE network card | As above                                               | As above                                               | Each node PCIe NVME SSD 3.0 *4 pieces* x GB/piece, no raid requirement, physical partitioning recommended, logical partitioning also possible.<br/><br/>Note: x is related to the business data volume, x = business data volume*2/16 |
| LogService                  | 3                                                             | MatrixOne Work Node | 4 cores or more   | 8GB or more         | Dual 10GbE ports, 10GbE network card | As above                                               | As above                                               | Each node NVME SSD 3.0/4.0 (1G/s or more read rate) *1 piece* x GB/piece.<br/><br/>Note: x is related to the business data volume, the closer, the better. |
| DN (Mixed Deployment Proxy and Load Balancer) | 1                                                             | MatrixOne Work Node | 16 cores or more  | 64GB or more        | Dual 10GbE ports, 10GbE network card | As above                                               | As above                                               | NVME SSD 3.0/4.0 *2 pieces* x GB/piece<br/><br/>Note: x is related to the business data volume, the closer, the better. One of them is for DN/CN fault recovery backup. |
| CN (Mixed Deployment Proxy and Load Balancer) | y                                                             | MatrixOne Work Node | 16 cores or more  | 32GB or more        | Dual 10GbE ports, 10GbE network card | As above                                               | As above                                               | Each node NVME SSD 3.0/4.0 *2 pieces* x GB/piece.<br/><br/>Note: x is related to the business data volume, the closer the better. One of them is for DN/CN fault recovery backup. y is related to business load. |

## Other configuration

| Operating System | Supported CPU Architectures |
| :----------------------------------------- | :-------------- |
| Debian 11 or above (Kernel 5.0 or above) | X86_64 |

Since each privatized production environment's deployment scenarios are different, please contact MatrixOne's customer support team for specific deployment solutions and deployment details.
