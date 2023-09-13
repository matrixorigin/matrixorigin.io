# **Using binary package in Linux**

This document will guide you to deploy a stand-alone version of MatrixOne in a Linux environment using binary packages. This installation solution does not need to install pre-dependencies and compile source packages. You can use the [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) tool to help you deploy and manage MatrixOne.

MatrixOne supports x86 and ARM Linux systems. This article uses the Debian11.1 x86 architecture as an example to to show the entire deployment process. If you use the Ubuntu system, it should be noted that there is no root authority by default. It is recommended to add `sudo` to all the commands in the process.

## Pre-dependency Reference

Only the MySQL Client tool must be installed to deploy and install MatrixOne through the binary package.

| Dependent software | Version |
| ------------ | ----------------------------- |
| MySQL Client | 8.0 or later |

## Step 1: Install Dependency

### 1. Install `wget` or `curl`

We'll provide a method of **Using binary package** to install MatrixOne. If you prefer to use the command line, you can pre-install `wget` or `curl`.

__Tips__: It is recommended that you download and install one of these two tools to facilitate future operations.

=== "Install `wget`"

     The `wget` tool is used to download files from the specified URL. `wget` is a unique file download tool; it is very stable and has a download speed.

     Execute the following commands in sequence to install `wget`:

     ```
     ## Update the software source list cache
     sudo apt udpate
     ## install wget
     sudo apt install wget
     ```

     After the installation is complete, please enter the following command to verify:

     ```
     wget -V
     ```

     The result of a successful installation (only a part of the code is displayed) is as follows:

     ```
     GNU Wget 1.21.3 built on linux-gnu.
     ...
     Copyright (C) 2015 Free Software Foundation, Inc.
     ...
     ```

=== "Install `curl`"

     `curl` is a file transfer tool that works from the command line using URL rules. `curl` is a comprehensive transfer tool that supports file upload and download.

     Go to the <a href="https://curl.se/download.html" target="_blank">Curl</a> website according to the official installation guide to install `curl`.  To verify that `curl` is installed successfully, use the following command line:

     ```
     curl --version
     ```

     The successful installation results (only part of the code is displayed) are as follows:

     ```
     curl 7.84.0 (x86_64-pc-linux-gnu) libcurl/7.84.0 OpenSSL/1.1.1k-fips zlib/1.2.11
     Release-Date: 2022-06-27
     ...
     ```

### 2. Install MySQL Client

The Debian11.1 version does not have MySQL Client installed by default, so it needs to be downloaded and installed manually.

1. Execute the following commands in sequence to install MySQL Client:

    ```
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
    sudo dpkg -i ./mysql-apt-config_0.8.22-1_all.deb
    sudo apt update
    sudo apt install mysql-client
    ```

2. Execute the command `mysql --version` to test whether MySQL is available. The result of the successful installation is as follows:

    ```
    mysql --version
    mysql  Ver 8.0.33 for Linux on x86_64 (MySQL Community Server - GPL)
    ```

## Step 2: Download binary packages and decompress

**Download Method 1** and **Download Method 2** need to install the download tools `wget` or `curl` first.

=== "**Downloading method 1: Using `wget` to install binary packages**"

     Binary for x86 architecture system:

     ```bash
     mkdir -p /root/matrixone & cd /root/
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.0.0-rc1/mo-v1.0.0-rc1-linux-x86_64.zip
     unzip -d matrixone/ mo-v1.0.0-rc1-linux-x86_64.zip
     ```

     Binary for ARM architecture system:

     ```bash
     mkdir -p /root/matrixone & cd /root/
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.0.0-rc1/mo-v1.0.0-rc1-linux-arm64.zip
     unzip -d matrixone/ mo-v1.0.0-rc1-linux-arm64.zip
     ```

=== "**Downloading method 2: Using `curl` to install binary packages**"

     Binary for x86 architecture system:

     ```bash
     mkdir -p /root/matrixone & cd /root/
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.0.0-rc1/mo-v1.0.0-rc1-linux-x86_64.zip
     unzip -d matrixone/ mo-v1.0.0-rc1-linux-x86_64.zip
     ```

     Binary for ARM architecture system:

     ```bash
     mkdir -p /root/matrixone & cd /root/
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.0.0-rc1/mo-v1.0.0-rc1-linux-arm64.zip
     unzip -d matrixone/ mo-v1.0.0-rc1-linux-arm64.zip
     ```

=== "**Downloading method 3: Go to the page and download**"

     If you want a more intuitive way to download the page, go to the [version 1.0.0-rc1](https://github.com/matrixorigin/matrixone/releases/tag/v1.0.0-rc1), pull down to find the **Assets** column, and click the installation package *mo-v1.0.0-rc1-linux-x86_64.zip* or *mo-v1.0.0-rc1-linux-arm64.zip* can be downloaded.

## Step 3: Install the mo_ctl tool

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) is a command-line tool for deploying, installing, and managing MatrixOne. It is very convenient to perform various operations on MatrixOne. See [mo_ctl Tool](../../Maintain/mo_ctl.md) for complete usage details.

### 1. Install the mo_ctl tool

The mo_ctl tool can be installed through the following command:

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && bash +x ./install.sh
```

### 2. Set mo_ctl parameters

Using the following command sets the MatrixOne binary decompression file directory to the `MO_PATH` parameter of mo_ctl. mo_ctl will automatically look for the `matrixone` folder in `MO_PATH`.

```
mo_ctl set_conf MO_PATH="/root"
```

## Step 4: Launch MatrixOne server

Launch the MatrixOne service through the `mo_ctl start` command.

If the operation is regular, the following log will appear. The relevant operation logs of MatrixOne will be in `/data/mo/logs/`.

```
root@VM-16-2-debian:~# mo_ctl start
2023-07-07_09:55:01    [INFO]    No mo-service is running
2023-07-07_09:55:01    [INFO]    Starting mo-service: cd /data/mo//matrixone/ && /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch/launch.toml >/data/mo//logs/stdout-20230707_095501.log 2>/data/mo//logs/stderr-20230707_095501.log
2023-07-07_09:55:01    [INFO]    Wait for 2 seconds
2023-07-07_09:55:03    [INFO]    At least one mo-service is running. Process info:
2023-07-07_09:55:03    [INFO]    root      748128       1  2 09:55 ?        00:00:00 /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch/launch.toml
2023-07-07_09:55:03    [INFO]    Pids:
2023-07-07_09:55:03    [INFO]    748128
2023-07-07_09:55:03    [INFO]    Start succeeded
```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

## Step 5: Connect to MatrixOne

One-click connection to MatrixOne service through `mo_ctl connect` command.

This command will invoke the MySQL Client tool to connect to the MatrixOne service automatically.

```
root@VM-16-2-debian:~# mo_ctl connect
2023-07-07_10:30:20    [INFO]    Checking connectivity
2023-07-07_10:30:20    [INFO]    Ok, connecting for user ...
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 15
Server version: 8.0.30-MatrixOne-v1.0.0-rc1 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    The above connection and login account is the initial accounts `root` and the password `111`; please change the initial password after logging in to MatrixOne; see [MatrixOne Password Management](../../Security/password-mgmt.md). After changing the login username or password, you must set a new username and password through `mo_ctl set_conf`. For details, please refer to [mo_ctl Tool](../../Maintain/mo_ctl.md).
