# **Using binary package in macOS**

This document will guide you to deploy a stand-alone version of MatrixOne in a macOS environment using binary packages. This installation solution does not need to install pre-dependencies and compile source packages. You can use the [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) tool to help you deploy and manage MatrixOne.

MatrixOne supports x86 and ARM macOS systems. This article uses the Macbook M1 ARM version as an example to show the entire deployment process.

## Pre-dependency Reference

Only the MySQL Client tool must be installed to deploy and install MatrixOne through the binary package.

| Dependent software | Version      |
| ------------------ | ------------ |
| MySQL Client       | 8.0 or later |

## Step 1: Install Dependency

### Install and configure MySQL Client

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

## Step 2: Download binary packages and decompress

### 1. Install `wget` or `curl`

We'll provide a method of **Using binary package** to install MatrixOne. If you prefer to use the command line, you can pre-install `wget` or `curl`.

__Tips__: It is recommended that you download and install one of these two tools to facilitate future operations.

=== "Install `wget`"

     The `wget` tool is used to download files from the specified URL. `wget` is a unique file download tool; it is very stable and has a download speed.

     Go to the <a href="https://brew.sh/" target="_blank">Homebrew</a> page and follow the instructions to install **Homebrew** first and then install `wget`.  To verify that `wget` is installed successfully, use the following command line:

     ```
     wget -V
     ```

     The successful installation results (only part of the code is displayed) are as follows:

     ```
     GNU Wget 1.21.3 在 darwin21.3.0 上编译.
     ...
     Copyright © 2015 Free Software Foundation, Inc.
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
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.21 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

### 2. Download binary packages and decompress

**Download Method 1** and **Download Method 2** need to install the download tools `wget` or `curl` first.

=== "**Downloading method 1: Using `wget` to install binary packages**"

     Binary for x86 architecture system:

     ```bash
     mkdir -p /User/username/mo/matrixone & cd /User/username/mo
     wget https://github.com/matrixorigin/matrixone/releases/download/v2.2.2/mo-v2.2.2-darwin-x86_64.zip
     unzip -d matrixone/ mo-v2.2.2-darwin-x86_64.zip
     ```

     Binary for ARM architecture system:

     ```bash
     mkdir -p /User/username/mo/matrixone & cd /User/username/mo
     wget https://github.com/matrixorigin/matrixone/releases/download/v2.2.2/mo-v2.2.2-darwin-arm64.zip
     unzip -d matrixone/ mo-v2.2.2-darwin-arm64.zip
     ```

=== "**Downloading method 2: Using `curl` to install binary packages**"

     Binary for x86 architecture system:

     ```bash
     mkdir -p /User/username/mo/matrixone & cd /User/username/mo
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v2.2.2/mo-v2.2.2-darwin-x86_64.zip
     unzip -d matrixone/ mo-v2.2.2-darwin-x86_64.zip
     ```

     Binary for ARM architecture system:

     ```bash
     mkdir -p /User/username/mo/matrixone & cd /User/username/mo
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v2.2.2/mo-v2.2.2-darwin-arm64.zip
     unzip -d matrixone/ mo-v-darwin-arm64.zip
     ```

=== "**Downloading method 3: Go to the page and download**"

     If you want a more intuitive way to download the page, go to the [version 2.2.2](https://github.com/matrixorigin/matrixone/releases/tag/v2.2.2), pull down to find the **Assets** column, and click the installation package *mo-v2.2.2-darwin-x86_64.zip* or *mo-v2.2.2-darwin-arm64.zip* can be downloaded.

## Step 3: Install the mo_ctl tool

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) is a command-line tool for deploying, installing, and managing MatrixOne. It is very convenient to perform various operations on MatrixOne. See [mo_ctl Tool](../../Maintain/mo_ctl.md) for complete usage details.

### 1. Install the mo_ctl tool

The mo_ctl tool can be installed through the following command:

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo -u $(whoami) bash +x ./install.sh
```

### 2. Set mo_ctl parameters

The parameters that need to be adjusted are as follows:

````
mo_ctl set_conf MO_PATH="/yourpath/mo-v2.2.2-xx-xx" # Set the MO_PATH to the directory where the binary files are extracted
mo_ctl set_conf MO_CONF_FILE="/yourpath/mo-v2.2.2-xx-xx/etc/launch/launch.toml" # Set the MO_CONF_FILE path
mo_ctl set_conf MO_DEPLOY_MODE=binary  #Deployment Configuration
````

## Step 4: Launch MatrixOne server

Launch the MatrixOne service through the `mo_ctl start` command.

If the operation is regular, the following log will appear. The relevant operation logs of MatrixOne will be in `/yourpath/mo-v2.2.2-xx-xx/matrixone/logs/ .

```
> mo_ctl start
2024-03-07 14:34:04.942 UTC+0800    [INFO]    No mo-service is running
2024-03-07 14:34:04.998 UTC+0800    [INFO]    Get conf succeeded: MO_DEPLOY_MODE="binary"
2024-03-07 14:34:05.024 UTC+0800    [INFO]    GO memory limit(Mi): 14745
2024-03-07 14:34:05.072 UTC+0800    [INFO]    Starting mo-service: cd /Users/admin/mo-v2.2.2-darwin-arm64/ && GOMEMLIMIT=14745MiB /Users/admin/mo-v2.2.2-darwin-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v2.2.2-darwin-arm64/etc/launch/launch.toml >/Users/admin/mo-v2.2.2-darwin-arm64/matrixone/logs/stdout-20240307_143405.log 2>/Users/admin/mo-v2.2.2-darwin-arm64/matrixone/logs/stderr-20240307_143405.log
2024-03-07 14:34:05.137 UTC+0800    [INFO]    Wait for 2 seconds
2024-03-07 14:34:07.261 UTC+0800    [INFO]    At least one mo-service is running. Process info: 
  501 27145     1   0  2:34下午 ??         0:00.18 /Users/admin/mo-v2.2.2-darwin-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v2.2.2-darwin-arm64/etc/launch/launch.toml
2024-03-07 14:34:07.284 UTC+0800    [INFO]    List of pid(s): 
27145
2024-03-07 14:34:07.308 UTC+0800    [INFO]    Start succeeded

```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

## Step 5: Connect to MatrixOne

One-click connection to MatrixOne service through `mo_ctl connect` command.

This command will invoke the MySQL Client tool to connect to the MatrixOne service automatically.

```
> mo_ctl connect
2024-03-07 14:34:59.902 UTC+0800    [INFO]    Checking connectivity
2024-03-07 14:34:59.942 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 426
Server version: 8.0.30-MatrixOne-v2.2.2 MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    The above connection and login account is the initial accounts `root` and the password `111`; please change the initial password after logging in to MatrixOne; see [MatrixOne Password Management](../../Security/password-mgmt.md). After changing the login username or password, you must set a new username and password through `mo_ctl set_conf`. For details, please refer to [mo_ctl Tool](../../Maintain/mo_ctl.md).
