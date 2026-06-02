# Deployment Frequently Asked Questions

## Environmentally relevant

**What OS version is required to deploy MatrixOne?**

- MatrixOne currently supports the operating systems in the table.

| Linux OS | Version |
| :----------------------- | :------------------------ |
| Debian                   | 11.0 or later            |
| Ubuntu LTS               | 20.04 or later            |
| Red Hat Enterprise Linux | 9.0 or later releases |
| Oracle Enterprise Linux  | 9.0 or later releases |
| CentOS                   | 7.0 or later releases |

For Linux systems with lower kernels, it is recommended to deploy with a binary package built on musl libc if you are using a binary package installation deployment, as detailed in the **recommended installation environment** chapter in [the Standalone Deployment Matrixone overview](../Get-Started/install-standalone-matrixone.md).

- MatrixOne also supports the macOS operating system and is currently only recommended to run in test and development environments.

| macOS | 版本                |
| :---- | :--------------------- |
| macOS | Monterey 12.3 or later |

- As a domestic database, MatrixOne is currently compatible with and supported by the following domestic operating systems:

| OS | OS Version | CPU | Memory |
| :------ |:------ | :------ | :----- |
|OpenCloudOS| v8.0 / v9.0 | x86 CPU;4 Core | 16 GB |
|openEuler  | 20.03 | x86 / ARM CPU;4 Core | 16 GB |
|TencentOS Server | v2.4 / v3.1 | x86 CPU;4 Core | 16 GB |
|UOS  | V20 |  ARM CPU;4 Core | 16 GB |
|KylinOS | V10 |  ARM CPU;4 Core | 16 GB |
|KylinSEC | v3.4 | x86 / ARM CPU;4 Core | 16 GB |

**Can I use MatrixOne properly under Red Hat systems like CentOS 7?**

MatrixOne does not have strict operating system requirements and supports use under CentOS 7, but CentOS 7 was discontinued at the end of June 24 and a newer version of the operating system is recommended.

**Does MatrixOne support deployment in homegrown environments?**

For the domestic operating system and chip, the chip we have adapted to Pang Peng and Haiguang, the operating system has adapted to Galactic Kirin, Euler, Kirin Shinan.

**Where can I deploy MatrixOne?**

MatrixOne can be deployed on premise, in a public cloud, in a private cloud, or on kubernetes.

**Does MatrixOne support distributed deployment on Aliyun ecs servers?**

Currently K8S based on ECS or Aliyun ACK is required for distributed deployment.

Do **cluster deployments only support K8s? Can you physically distribute local deployment?**

If there is no k8s and minio environment ahead of time. Our installation tools come with k8s and minio and can also be deployed on a physical machine with one click.

* **Does the current non-k8s version support master-slave configuration?**

MatrixOne does not currently support a non-k8s version of the master-slave configuration and will do so later.

**Can a production environment only be deployed in k8s mode?**

Yes, for distributed stability and scalability, we recommend that production systems be deployed with k8s. If you don't have k8s out of the box, you can deploy with managed k8s to reduce complexity.

## Hardware related

**What are MatrixOne's configuration requirements for deploying hardware?**

In standalone installations, MatrixOne can currently run on 64-bit universal hardware server platforms with Intel x86-64 and ARM architectures.

Server hardware configuration requirements and recommendations for development, test, and production environments are as follows:

- Development and Test Environment Requirements

| CPU | Memory | Local Storage |
| :------ | :--------- | :------------- |
| 4 core+ | 16 GB+ | SSD/HDD 200 GB+ |

Macbook M1/M2 with ARM architecture is also suitable for development environments.

- Production environment requirements

| CPU | Memory | Local Storage |
| :-------- | :----- | :------------- |
| 16 core+ | 64 GB+ | SSD/HDD 500 GB+ |

In the case of distributed installations, MatrixOne can refer to the [Cluster Topology Planning Overview](../Deploy/deployment-topology/topology-overview.md) for server hardware configuration requirements and recommendations for development, test, and production environments.

## Configuration related

**Do you need to change any settings during installation?**

Normally, you don't need to change any settings when you install. The `launch.toml` default setting makes it entirely possible to run MatrixOne directly. But if you need to customize the listening port, IP address, path to store data files, you can modify the corresponding [`cn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/cn.toml), [`tn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/tn.toml), or [`log.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/log.toml). Details of parameter configuration within these files can be found in the [General Parameters Configuration](../Reference/System-Parameters/system-parameter.md)

**What should I do when I want to save MatrixOne's data directory to a file directory that I specify?**

When you start MatrixOne with Docker, you can mount the data directory you specified to the Docker container, see [Mounting directories to](../Maintain/mount-data-by-docker.md) the Docker container.

When you compile and launch MatrixOne using source or binary packages, you can do this by modifying the default data directory path in the configuration file: open the MatrixOne configuration file directory `matrixone/etc/launch-with-proxy`, modify the configuration parameter `data-dir = "`./mo-data" in the three files `cn.toml`, `tn.toml` and `log.toml` to `data-dir = "your_local_path"`, save it and restart MatrixOne.

## Tools related

**Can binary package installations be managed via mo\_ctl?**

By setting the path to the MO\_PATH configuration binary package, you can use mo\_ctl to manage it.

**Does the mo\_ctl tool support source deployment upgrades**

The upgrade command allows you to specify the corresponding version or commitid for fine-grained upgrades, setting the current version MO\_PATH with care, and the compilation environment.

**Does the mo\_ctl tool support deployment of matrixOne clusters**

Not currently supported, later consider joining cluster deployment and management.

**helm install operator, how about seeing if the installation worked?**

Use helm list -A to see.

**How do operators deployed in helm mode uninstall?**

Uninstall by specifying a name and namespace through the helm uninstall command.

**Is the version of operator required for deployment?**

operator is used to manage the matrixOne cluster, so the operator version is as consistent as possible with the version of the cluster. For example, if we have a cluster with version 1.0.0-rc2 installed, the operator version corresponding to the earlier installation should also be 1.0.0-rc2. If a consistent version of operator is not found, a similar version of operator is recommended.

## Error reporting related

**When I finish installing the MySQL client, opening a terminal and running `mysql` generates an error `command not found: mysql`, how do i fix this?**

This error report is the reason the environment variable is not set. Open a new terminal and execute the following command:

=== "**Linux Environment**"

    ```bash
    echo 'export PATH="/path/to/mysql/bin:$PATH"' >> ~/.bash_profile
    source ~/.bash_profile
    ```

    Replace `/path/to/mysql/bin' in the above code with the installation path for MySQL on your system. Typically it is '/usr/local/mysql/bin', if you are unsure of the MySQL installation path you can find it using the following command:

    ```bash
    whereis mysql
    ```

=== "**MacOS Environment**"

    After macOS 10, use 'zsh' as the default 'shell'. Use zsh here as an example, and if you use another 'shell' you can convert it yourself.

    ```zsh
    echo export PATH=/path/to/mysql/bin:$PATH >> ~/.zshrc
    source ~/.zshrc
    ```

    Replace `/path/to/mysql/bin' in the above code with the installation path for MySQL on your system. Typically it is '/usr/local/mysql/bin', if you are unsure of the MySQL installation path you can find it using the following command:

    ```bash
    whereis mysql
    ```

**When I install and choose to install build MatrixOne from source, I get the following error or build failure indication. How do I continue?**

Error: `Get "https://proxy.golang.org/...": dial tcp 142.251.43.17:443: i/o timeout`

Because MatrixOne requires many GO libraries as dependencies, it downloads the GO libraries at the same time as it builds. The error reported above is a download timeout error, mainly due to network issues.

- If you're using a mainland Chinese network, you need to set up your GO environment to a Chinese mirror site to speed up the download of the GO library.

- If you check your GO environment via `go env`, you may see `GOPROXY="https://proxy.golang.org,direct"`, then you need to set the following:

```
go env -w GOPROXY=https://goproxy.cn,direct 
```

Once setup is complete, `make build` should be completed soon.

**When I test MatrixOne via MO-Tester, how do I resolve the `too many open files` error I generate?**

To test MatrixOne, MO-Tester quickly opens and closes many SQL files, and soon reaches the maximum open file limit for Linux and MacOS systems, which is what causes the `too many open files` error.

* For MacOS systems, you can set limits on opening files with a simple command:

```
ulimit -n 65536 
```

* For Linux systems, refer to the detailed [guide](https://www.linuxtechi.com/set-ulimit-file-descriptors-limit-linux-servers/) to set the *ulimit* to 100,000.

Once setup is complete, there will be no `too many open files` error.

**My PC is an M1 chip and when I run an SSB test I find that I can't compile successfully ssb-dbgen**

PCs with hardware configured as M1 chips also need to be configured as follows before compiling `ssb-dbgen`:

1. Download and install [GCC11](https://gcc.gnu.org/install/).

2. Enter the command to confirm that gcc-11 succeeded:

    ``` gcc-11 -v ```

    The following results indicate success:

    ```
    Using built-in specs.
    COLLECT_GCC=gcc-11
    COLLECT_LTO_WRAPPER=/opt/homebrew/Cellar/gcc@11/11.3.0/bin/../libexec/gcc/aarch64-apple-darwin21/11/lto-wrapper
    Target: aarch64-apple-darwin21
    Configured with: ../configure --prefix=/opt/homebrew/opt/gcc@11 --libdir=/opt/homebrew/opt/gcc@11/lib/gcc/11 --disable-nls --enable-checking=release --with-gcc-major-version-only --enable-languages=c,c++,objc,obj-c++,fortran --program-suffix=-11 --with-gmp=/opt/homebrew/opt/gmp --with-mpfr=/opt/homebrew/opt/mpfr --with-mpc=/opt/homebrew/opt/libmpc --with-isl=/opt/homebrew/opt/isl --with-zstd=/opt/homebrew/opt/zstd --with-pkgversion='Homebrew GCC 11.3.0' --with-bugurl=https://github.com/Homebrew/homebrew-core/issues --build=aarch64-apple-darwin21 --with-system-zlib --with-sysroot=/Library/Developer/CommandLineTools/SDKs/MacOSX12.sdk
    Thread model: posix
    Supported LTO compression algorithms: zlib zstd
    gcc version 11.3.0 (Homebrew GCC 11.3.0)
    ```

3. Manually modify the *bm\_utils.c* configuration file in the *ssb-dbgen* directory:

    - Modify `#include <malloc.h>` on line 41 to `#include <sys/malloc.h>`

    - Change `open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT|O_LARGEFILE,0644);` in line 398 to `open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT,0644);` to `open(fullpath, ((*mode == 'r')? WRONLY)|O_CREAT,0644);`

4. Manually modify the *varsub.c* configuration file in the *ssb-dbgen* directory:

    - Modify `#include <malloc.h>` on line 5 to `#include <sys/malloc.h>`

5. Manually modify the *makefile* configuration file in the *ssb-dbgen* directory:

    - Modify `CC = gcc` on line 5 to `CC = gcc-11`

6. Go to the *ssb-dbgen* directory again and compile:

    ```
    cd ssb-dbgen make 
    ```

7. View the *ssb-dbgen* directory and generate *the dbgen* executable, indicating that the compilation was successful.

**I built MatrixOne in the main branch first, now switch to another version before building panic**

This problem can occur when MatrixOne version switching involves versions prior to 0.8.0 and the `make build` command is used. This is an incompatibility issue caused by the MatrixOne datastore format upgrade, but will continue to be compatible since version 0.8.0.

!!! note
    In this case, we strongly recommend that you reinstall the [latest stable version](../../MatrixOne/Get-Started/install-standalone-matrixone.md) of MatrixOne for subsequent data compatibility, and recommend using the mo\_ctl tool for quick build and startup.

Specifically, prior to MatrixOne version 0.8.0, after performing `make build`, a data directory file named *mo-data* was automatically generated to hold the data. If you switch to another branch and do `make build` again, the *mo-data* data directory is not automatically deleted, which may cause a panic situation due to incompatible data formats.

To fix this, you need to clean up the *mo-data* data directory (that is, execute the `rm -rf mo-data` command) before rebuilding MatrixOne.

The following reference code example uses an earlier build process:

``` bash
[root ~]# cd matrixone // Go to matrixone file directory 
[root ~]# git branch // View current branch * 0.8.0 
[root ~]# make build // Build matrixone 
... // Omit build process code here. If you want to switch to a different version at this point, for example version 0.7.0 
[root ~]# git checkout 0.7.0 // switch to version 0.7.0 
[root ~]# rm -rf mo-data // clean up the data directory 
[root ~]# make build // build matrixone ... // omit the build process code here 
```

**I connect proxy with CN tag and login to MatrixOne cluster with password validation error**

- **Cause of problem**: The connection string was incorrectly written. Connecting to a MatrixOne cluster via a MySQL client supports extending the user name field by adding `?`,`?` after the user name You can then follow the CN group label with `=` between the key and value of the CN group label and comma `,` between multiple key-values.

- **Workaround**: Refer to the following example.

Suppose in your MatrixOne `mo.yaml` configuration file, the configuration of the CN group looks like this:

```yaml
## Only part of the code is shown
...
- cacheVolume:
    size: 100Gi
  cnLabels:
  - key: workload
    values:
    - bk
...
```

Connecting to the MatrixOne cluster via a MySQL client, you can use the following command example: `mysql -u root?workload=bk -p111 -h 10.206.16.10 -P 31429`. where `workload=bk` is the CN tag, connected using `=`.

**There is a pod called job-bucket that keeps getting up when installing the latest operator. How should I troubleshoot it?**

Can see if there is no secret. It may be that the minio connection information is not configured to connect to the minio.

Similarly, the command to export data using the `mo-dump` tool, you can refer to the example using the following command: `mo-dump -u "dump?workload=bk" -h 10.206.16.10 -P 31429 -db tpch_10g > /tmp/mo/tpch_10g.sql`.
