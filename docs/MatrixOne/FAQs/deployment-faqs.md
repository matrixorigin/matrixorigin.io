# Deployment FAQs

## Operating system requirements

### **What are the required operating system versions for deploying MatrixOne?**

MatrixOne supports the following operating system:

| Linux OS                 | Version                   |
| :----------------------- | :------------------------ |
| Debian              | 11.0 or later            |
| Ubuntu LTS               | 20.04 or later            |
| Red Hat Enterprise Linux | 9.0 or later releases |
| Oracle Enterprise Linux  | 9.0 or later releases |

MatrixOne also supports macOS operating system, but it's only recommended to run as a test and development environment.

| macOS | Version                |
| :---- | :--------------------- |
| macOS | Monterey 12.3 or later |

## Hardware requirements

### **What are the required hardware for deploying MatrixOne?**

For standalone installation, MatrixOne can be running on the 64-bit generic hardware server platform in the Intel x86-64 and ARM architecture. The requirements and recommendations about server hardware configuration for development, testing and production environments are as follows:

* Development and testing environments

| CPU     | Memory | Local Storage   |
| :------ | :----- | :-------------- |
| 4 core+ | 16 GB+ | SSD/HDD 200 GB+ |

The Macbook M1/M2 with ARM architecture is also a good fit for a development environment.

* Production environment

| CPU      | Memory | Local Storage   |
| :------- | :----- | :-------------- |
| 16 core+ | 64 GB+ | SSD/HDD 500 GB+ |

For comprehensive details on deploying MatrixOne in a distributed setting, see [Distributed Deployment Topology Documentation](../Deploy/deployment-topology/experience-deployment-topology.md). This guide includes specific server hardware configuration requirements and recommendations tailored for development, testing, and production environments.

## Installation and deployment

### **What settings do I need to change for installation?**

Normally you don't need to change anything for installation. A default setting of `launch.toml` is enough to run MatrixOne directly. But if you want to customize your listening port, ip address, stored data files path, you may modify the corresponding records of [`cn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/cn.toml), [`tn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/tn.toml) or [`log.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/log.toml), for more details about parameter configuration in these files, see [Boot Parameters for standalone installation](../Reference/System-Parameters/system-parameter.md).

### **After the MySQL client is installed, I open the terminal and run `mysql`, I got an error of `command not found: mysql`.**

To solve the error, you need to set the environment variable. Open a new terminal window, run the following command:

=== "**Linux Environment**"

     ```
     cd ~
     sudo vim /etc/profile
     Password:
     ```

     After pressing **Enter** on the keyboard to execute the above command, you need to enter the root user password, which is the root password you set in the installation window when you installed the MySQL client. If no password has been set, press **Enter** to skip the password.

     After entering/skiping the root password, you will enter *profile*, click **i** on the keyboard to enter the insert state, and you can enter the following command at the bottom of the file:

     ```
     export PATH=/software/mysql/bin:$PATH
     ```

     Click *esc* on the keyboard to exit the insert status and type `:wq` at the bottom to save and exit. Continue typing `source  /etc/profile` and press **Enter** to run the environment variable.

=== "**MacOS Environment**"

     ```
     cd ~
     sudo vim .bash_profile
     Password:
     ```

     After pressing **Enter** on the keyboard to execute the above command, you need to enter the root user password, which is the root password you set in the installation window when you installed the MySQL client. If no password has been set, press **Enter** to skip the password.

     After entering/skiping the root password, you will enter *.bash_profile*, click **i** on the keyboard to enter the insert state, and you can enter the following command at the bottom of the file:

     ```
     export PATH=${PATH}:/usr/local/mysql/bin
     ```

     Click *esc* on the keyboard to exit the insert status and type `:wq` at the bottom to save and exit. Continue typing `source. bash_profile` and press **Enter** to run the environment variable.

### **When I install MatrixOne by building from source, I got an error of the following and the build failed, how can I proceed?**

Error: `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout`

As MatrixOne needs many go libraries as dependency, it downloads them at the time of building it. This is an error of downloading timeout, it's mostly a networking issue. If you are using a Chinese mainland network, you need to set your go environment to a Chinese image site to accelerate the go library downloading. If you check your go environment by `go env`, you may see  `GOPROXY="https://proxy.golang.org,direct"`, you need to set it by

```
go env -w GOPROXY=https://goproxy.cn,direct
```

Then the `make build` should be fast enough to finish.

### **When I want to save the MatrixOne data directory to my specified file directory, how should I do it?**

- When you use Docker to start MatrixOne, you can mount the data directory you specify to the Docker container, see [Mount directory to Docker container](../Maintain/mount-data-by-docker.md).

- When you use the source code or binary package to compile and start MatrixOne, you can modify the default data directory path in the configuration file: open the MatrixOne source file directory `matrixone/etc /launch-with-proxy`, modify the configuration parameter `data-dir = "./mo-data"` in the three files of `cn.toml`, `tn.toml` and `log.toml` is `data-dir = "your_local_path"`, save and restart MatrixOne It will take effect.

### **When I was testing MatrixOne with MO-tester, I got an error of `too many open files`?**

MO-tester will open and close many SQL files in a high speed to test MatrixOne, this kind of usage will easily reach the maximum open file limit of Linux and macOS, which is the reason for the `too many open files` error.

* For MacOS, you can just set the open file limit by a simple command:

```
ulimit -n 65536
```

* For Linux, please refer to this detailed [guide](https://www.linuxtechi.com/set-ulimit-file-descriptors-limit-linux-servers/) to set the ulimit to 100000.

After setting this value, there will be no more `too many open files` error.

### **Ssb-dbgen cannot be compiled on a PC with M1 chip**

To complete the following configuration, then compiling 'SSB-DBgen' for a PC with M1 chip:

1. Download and install [GCC11](https://gcc.gnu.org/install/).

2. To ensure the gcc-11 is successful installed, run the following command:

    ```
    gcc-11 -v
    ```

    The successful result is as below:

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

3. Modify the *bm_utils.c* file in the *ssb-dbgen* directory:

    - Change the `#include <malloc.h>` in line 41 to `#include <sys/malloc.h>`

    - Change the `open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT|O_LARGEFILE,0644);` in line 398 to ``open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT,0644);``

4. Modify the *varsub.c* file in the *ssb-dbgen* directory:

    - Change the `#include <malloc.h>` in line 5 to `#include <sys/malloc.h>`

5. Modify the *makefile* file in the *ssb-dbgen* directory:

    - Change the `CC      = gcc` in line 5 to `CC      = gcc-11`

6. Enter into *ssb-dbgen* directory again and compile:

    ```
    cd ssb-dbgen
    make
    ```

7. Check the *ssb-dbgen* directory, when the the *dbgen* file is generated, indicating that the compilation is successful.

### **I built MatrixOne in the main branch initially but encountered panic when switching to other versions for building**

The storage formats between MatrixOne version 0.8.0 and its earlier versions are not compatible with each other. This means that when executing `make build`, the system will automatically generate a data directory file named *mo-data* to store data.

In the future, if you need to switch to another branch and re-execute `make build` to build MatrixOne, it may cause a panic situation to occur. In this case, you need first to clean the *mo-data* data directory (that is, execute the `rm -rf mo-data` command), and then rebuild MatrixOne.

Reference code example:

```
[root ~]# cd matrixone  // Go to the matrixone directory
[root ~]# git branch // Check the current branch
* 0.8.0
[root ~]# make build // Build matrixone
...    // The build process code is omitted here. If you want to switch to another version, such as version 0.7.0,
[root ~]# git checkout 0.7.0 // Switch to version 0.7.0
[root ~]# rm -rf mo-data // Clean up the data directory
[root ~]# make build // Build matrixone again
...    // The build process code is omitted here
[root ~]# ./mo-service --daemon --launch ./etc/launch/launch.toml &> test.log &   // Start MatrixOne service in the terminal backend
```

!!! note
    The MatrixOne version 0.8.0 is compatible with the storage format of older versions. If you use version 0.8.0 or a higher version, there is no need to clean the data file directory when switching to other branches and buildings.

### **Password authentication error when connecting to the MatrixOne cluster via proxy with CN label**

- **Issue Reason**: Incorrect connection string formatting. Support for extending the username field is available when connecting to the MatrixOne cluster through the MySQL client. You can add a `?` after the username and follow it with CN group labels. CN group labels consist of key-value pairs separated by `=` and multiple key-value pairs are separated by commas `,`.

- **Solution**: Please refer to the following example.

Assuming the configuration for the CN group in your MatrixOne's `mo.yaml` configuration file is as shown below:

```yaml
## Displaying partial code only
...
- cacheVolume:
    size: 100Gi
  cnLabels:
  - key: workload
    values:
    - bk
...
```

When connecting to the MatrixOne cluster through the MySQL client, you can use the following command example: `mysql -u root?workload=bk -p111 -h 10.206.16.10 -P 31429`. In this command, `workload=bk` is the CN label, connected using `=`.

Similarly, when using the `mo-dump` tool to export data, refer to the following command example: `mo-dump -u "dump?workload=bk" -h 10.206.16.10 -P 31429 -db tpch_10g > /tmp/mo/tpch_10g.sql`.
