# Software and Hardware Recommendations

As an open-source hyper-converged heterogeneous cloud-native distributed database, MatrixOne can be deployed and run on Intel-based server environments, ARM-based servers, mainstream virtualization environments, and most mainstream hardware networks. MatrixOne cluster deployment currently supports mainstream **Linux**.

## Operation system and platform requirements

 MatrixOne cluster support for the operating systems and CPU architectures is as below.

| Linux OS                 | Version                      | Supported CPU architectures |
| :----------------------- | :------------------------ | :------------ |
| Red Hat Enterprise Linux | 7.4 or later 7.x releases | X86_64 |
| Oracle Enterprise Linux  | 7.4 or later 7.x releases | X86_64 |
| CentOS                   | 7.4 or later 7.x releases | X86_64|
| Ubuntu LTS               | 22.04 or later            | X86_64 |

## Recommended Server

MatrixOne supports the deployment and operation of general-purpose hardware server platforms based on Intel x86_64 architecture. Deployment in the test environment is currently supported temporarily. The following is the recommended configuration for deployment in the **Test environment**:

### Hardware requirements in testing environment

| Hardware      | Minimum configuration             |Recommended configuration|
| :------------ | :---------------- |:--------------- |
|CPU| 16 core | At least 32 core|
|Memory|32GB |At least 64GB|
|space |20GB|At least 50GB |

### Network requirements in testing environment

| Network      | Minimum bandwidth configuration              |Recommended bandwidth configuration|
| :------------ | :---------------- |:--------------- |
|Server Intranet Environment|1GB|At least 10GB|

### Web browser requirements in testing environment

| Web browser                | Version                      |
| :----------------------- | :------------------------ |
|Google Chrome|Version 105.0.5195 and later|
|Mozilla Firefox|Version 108.0  and later|
|Microsoft Edge|Version 107.0.1418.42  and later|
