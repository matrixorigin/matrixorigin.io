# **Building from source code in macOS**

This document will guide you to deploy a standalone version of MatrixOne in a macOS environment using source code. You can use the [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) tool to help you deploy and manage MatrixOne.

MatrixOne supports x86 and ARM macOS systems. This article uses the Macbook M1 ARM version as an example to show the entire deployment process.

## Pre-dependency Reference

To install and use the stand-alone MatrixOne through source code, you need to depend on the following software packages.

| Dependent software | Version                             |
| ------------------ | ----------------------------------- |
| golang             | 1.22.3 or later                       |
| gcc/clang          | gcc8.5 or later, clang13.0 or later |
| git                | 2.20 or later                       |
| MySQL Client       | 8.0 or later                        |

## Step 1: Install Dependency

### 1. Install Go

1. Click <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> to enter its official documentation, and follow the installation steps to complete the **Go** installation.

2. To verify whether **Go** is installed, please execute the code `go version`. When **Go** is installed successfully, the example code line is as follows:

    ```
    > go version
    go version go1.22.5 darwin/arm64
    ```

### 2. Install GCC/Clang

1. macOS generally has its own Clang compiler, which plays the same role as GCC. To verify whether the GCC is installed:

    ```
    gcc -v
    bash: gcc: command not found
    ```

    As shown in the code, the version of GCC is not displayed, the **GCC/Clang** environment needs to be installed.

2. Click <a href="https://gcc.gnu.org/install/" target="_blank">GCC Download and install</a> to enter its official documentation, and follow the installation steps to complete the **GCC** installation. Or you can install Clang through Apple's official [Xcode](https://www.ics.uci.edu/~pattis/common/handouts/macclion/clang.html).

3. To verify whether **GCC/Clang** is installed, please execute the code `gcc -v`. When **GCC** is installed successfully, the example code line is as follows:

    ```
    Apple clang version 14.0.3 (clang-1403.0.22.14.1)
    Target: arm64-apple-darwin22.5.0
    Thread model: posix
    InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
    ```

### 3. Install Git

Install Git via the [Official Documentation](https://git-scm.com/download/mac).

Use the command `git version` to check whether the installation is successful. The code example of a successful installation is as follows:

```
> git version
git version 2.40.0
```

### 4. Install and configure MySQL Client

1. Click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System > macOS**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

2. Configure the MySQL client environment variables:

     1. Open a new terminal window and enter the following command:

         ```
         cd ~
         sudo vim .bash_profile
         ```

     2. After pressing **Enter** on the keyboard to execute the above command, you need to enter the root user password, which is the root password you set in the installation window when you installed the MySQL client. If no password has been set, press **Enter** to skip the password.

     3. After entering/skiping the root password, you will enter *.bash_profile*, click **i** on the keyboard to enter the insert state, and you can enter the following command at the bottom of the file:

        ```
        export PATH=${PATH}:/usr/local/mysql/bin
        ```

3. After the input is completed, click **esc** on the keyboard to exit the insert state, and enter `:wq` at the bottom to save and exit.

4. Enter the command `source .bash_profile`, press **Enter** to execute, and run the environment variable.

5. To test whether MySQL is available:

    Run the command `mysql --version`, if MySQL client is installed successfully, the example code line is as follows: `mysql  Ver 8.0.31 for macos12 on arm64 (MySQL Community Server - GPL)`

## Step 2: Install the mo_ctl tool

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) is a command-line tool for deploying, installing, and managing MatrixOne. It is very convenient to perform various operations on MatrixOne. See [mo_ctl Tool](../../Maintain/mo_ctl.md) for complete usage details.

1. First, install the `wget` download tool: Go to the <a href="https://brew.sh/" target="_blank">Homebrew</a> page and follow the steps to install **Homebrew** first, then install `wget`. To verify whether `wget` is installed successfully, you can use the following command line:

     ```
     wget -V
     ```

     The successful installation results (only part of the code is displayed) are as follows:

     ```
     GNU Wget 1.21.3 在 darwin21.3.0 上编译
     ...
     Copyright © 2015 Free Software Foundation, Inc.
     ...
     ```

2. The mo_ctl tool can be installed through the following command:

    ```
    wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo -u $(whoami) bash +x ./install.sh
    ```

3. After the installation is complete, verify whether the installation is successful through the `mo_ctl` command:

    ```
    > mo_ctl
    Usage             : mo_ctl [option_1] [option_2]

    [option_1]      : available: connect | ddl_connect | deploy | get_branch | get_cid | get_conf | help | pprof | precheck | restart | set_conf | sql | start | status | stop | uninstall | upgrade | watchdog
    1) connect      : connect to mo via mysql client using connection info configured
    2) ddl_convert  : convert ddl file to mo format from other types of database
    3) deploy       : deploy mo onto the path configured
    4) get_branch   : upgrade or downgrade mo from current version to a target commit id or stable version
    5) get_cid      : print mo git commit id from the path configured
    6) get_conf     : get configurations
    7) help         : print help information
    8) pprof        : collect pprof information
    9) precheck     : check pre-requisites for mo_ctl
    10) restart     : a combination operation of stop and start
    11) set_conf    : set configurations
    12) sql         : execute sql from string, or a file or a path containg multiple files
    13) start       : start mo-service from the path configured
    14) status      : check if there's any mo process running on this machine
    15) stop        : stop all mo-service processes found on this machine
    16) uninstall   : uninstall mo from path MO_PATH=/data/mo//matrixone
    17) upgrade     : upgrade or downgrade mo from current version to a target commit id or stable version
    18) watchdog    : setup a watchdog crontab task for mo-service to keep it alive
    e.g.            : mo_ctl status
    [option_2]      : Use " mo_ctl [option_1] help " to get more info
    e.g.            : mo_ctl deploy help
    ```

### Set mo_ctl parameters

Some parameters in the mo_ctl tool need to be set and you can view all current parameters through `mo_ctl get_conf`.

```
> mo_ctl get_conf
2023-07-07_15:31:24    [INFO]    Below are all configurations set in conf file /Users/username/mo_ctl/conf/env.sh
MO_PATH="/Users/username/mo/matrixone"
MO_LOG_PATH="${MO_PATH}/matrixone/logs"
MO_HOST="127.0.0.1"
MO_PORT="6001"
MO_USER="root"
MO_PW="111"
MO_DEPLOY_MODE="host"
MO_REPO="matrixorigin/matrixone"
MO_IMAGE_PREFIX="nightly"
MO_IMAGE_FULL=""
MO_CONTAINER_NAME="mo"
MO_CONTAINER_PORT="6001"
MO_CONTAINER_DEBUG_PORT="12345"
CHECK_LIST=("go" "gcc" "git" "mysql" "docker")
GCC_VERSION="8.5.0"
CLANG_VERSION="13.0"
GO_VERSION="1.22"
MO_GIT_URL="https://github.com/matrixorigin/matrixone.git"
MO_DEFAULT_VERSION="v2.1.0"
GOPROXY="https://goproxy.cn,direct"
STOP_INTERVAL="5"
START_INTERVAL="2"
MO_DEBUG_PORT="9876"
MO_CONF_FILE="${MO_PATH}/matrixone/etc/launch/launch.toml"
RESTART_INTERVAL="2"
PPROF_OUT_PATH="/tmp/pprof-test/"
PPROF_PROFILE_DURATION="30"
```

Generally, the parameters that need to be adjusted are as follows:

````
mo_ctl set_conf MO_PATH="yourpath" # Set custom MatrixOne download path
mo_ctl set_conf MO_GIT_URL="https://githubfast.com/matrixorigin/matrixone.git" # For the problem of slow downloading from the original GitHub address, set image download address
mo_ctl set_conf MO_DEFAULT_VERSION="v" # Set the version of MatrixOne downloaded
mo_ctl set_conf MO_DEPLOY_MODE=git  # Deployment Configuration
````

## Step 3: Get MatrixOne code

Depending on your needs, choose whether you want to keep your code up to date, or if you want to get the latest stable version of the code.

=== "Get the MatrixOne(Develop Version) code to build"

     The **main** branch is the default branch, the code on the main branch is always up-to-date but not stable enough.

     ```
     mo_ctl deploy main
     ```

=== "Get the MatrixOne(Stable Version) code to build"

     ```
     mo_ctl deploy v2.1.0
     ```

## Step 4: Launch MatrixOne server

Launch the MatrixOne service through the `mo_ctl start` command.

If the operation is regular, the following log will appear. The relevant operation logs of MatrixOne will be in `/yourpath/matrixone/logs/`.

```
> mo_ctl start
2023-07-07_15:33:45    [INFO]    No mo-service is running
2023-07-07_15:33:45    [INFO]    Starting mo-service: cd /Users/username/mo/matrixone/matrixone/ && /Users/username/mo/matrixone/matrixone/mo-service -daemon -debug-http :9876 -launch /Users/username/mo/matrixone/matrixone/etc/launch/launch.toml >/Users/username/mo/matrixone/matrixone/logs/stdout-20230707_153345.log 2>/Users/username/mo/matrixone/matrixone/logs/stderr-20230707_153345.log
2023-07-07_15:33:45    [INFO]    Wait for 2 seconds
2023-07-07_15:33:48    [INFO]    At least one mo-service is running. Process info:
2023-07-07_15:33:48    [INFO]      501 66932     1   0  3:33PM ??         0:00.27 /Users/username/mo/matrixone/matrixone/mo-service -daemon -debug-http :9876 -launch /Users/username/mo/matrixone/matrixone/etc/launch/launch.toml
2023-07-07_15:33:48    [INFO]    Pids:
2023-07-07_15:33:48    [INFO]    66932
2023-07-07_15:33:48    [INFO]    Start succeeded
```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

## Step 5: Connect to MatrixOne

One-click connection to MatrixOne service through `mo_ctl connect` command.

This command will invoke the MySQL Client tool to connect to the MatrixOne service automatically.

```
> mo_ctl connect
2023-07-07_10:30:20    [INFO]    Checking connectivity
2023-07-07_10:30:20    [INFO]    Ok, connecting for user ...
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 15
Server version: 8.0.30-MatrixOne-v2.1.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    The above connection and login account is the initial accounts `root` and the password `111`; please change the initial password after logging in to MatrixOne; see [MatrixOne Password Management](../../Security/password-mgmt.md). After changing the login username or password, you must set a new username and password through `mo_ctl set_conf`. For details, please refer to [mo_ctl Tool](../../Maintain/mo_ctl.md).
