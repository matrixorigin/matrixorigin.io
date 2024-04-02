# **Using Docker**

This document will guide you build standalone MatrixOne using Docker.

## Step 1: Pre-dependency Reference

### Download and install Docker

1. Click <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>, enter into the Docker's official document page, depending on your operating system, download and install the corresponding Docker. It is recommended to choose Docker version 20.10.18 or later and strive to maintain consistency between the Docker client and Docker server versions.

2. After the installation, you can verify the Docker version by using the following lines:

    ```
    docker --version
    ```

    The successful installation results are as follows:

    ```
    Docker version 20.10.18, build 100c701
    ```

3. Execute the following command in your terminal, start Docker and check whether the running status is successfully:

    ```
    systemctl start docker
    systemctl status docker
    ```

    The following code example indicates that Docker is running. `Active: active (running)` shows that Docker is running.

    ```
    docker.service - Docker Application Container Engine
       Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
       Active: active (running) since Sat 2022-11-26 17:48:32 CST; 6s ago
         Docs: https://docs.docker.com
     Main PID: 234496 (dockerd)
        Tasks: 8
       Memory: 23.6M
    ```

### Install and configure MySQL Client

The Debian11.1 version does not have MySQL Client installed by default, so it needs to be downloaded and installed manually.

1. Execute the following commands in sequence:

    ```
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
    sudo dpkg -i ./mysql-apt-config_0.8.22-1_all.deb
    sudo apt update
    sudo apt install mysql-client
    ```

2. Execute the command `mysql --version` to test whether MySQL is available. The result of the successful installation is as follows:

    ```
    mysql --version
    mysql Ver 8.0.33 for Linux on x86_64 (MySQL Community Server - GPL)
    ```

## Step 2: Deploying  MatrixOne

### Docker Deployment

Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

=== "Stable Version Image(1.1.2 version)"

      ```bash
      docker pull matrixorigin/matrixone:1.1.2
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:1.1.2
      ```

      If you are using the network in mainland China, you can pull the MatrixOne stable version image on Alibaba Cloud:

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.1.2
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.1.2
      ```

=== "Develop Version Image"

      If you want to pull the develop version image, see [Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags), get the image tag. An example as below:

      ```bash
      docker pull matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      If you are using the network in mainland China, you can pull the MatrixOne develop version image on Alibaba Cloud:

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:nightly-commitnumber
      ```

      __Note__: The *nightly* version is updated once a day.

If your Docker version is lower than 20.10.18 or the Docker client and server versions are inconsistent, upgrading to the latest stable version before attempting is recommended. If you choose to proceed with the current versions, you need to add the parameter `--privileged=true` to the `docker run` command, as shown below:

```bash
docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:1.1.2
```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

If you need to mount data directories or customize configure files, see [Mount the directory to Docker container](../../Maintain/mount-data-by-docker.md).

### Mo_ctl Deployment

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) is a command-line tool for deploying, installing, and managing MatrixOne. It is very convenient to perform various operations on MatrixOne. See [mo_ctl Tool](../../Maintain/mo_ctl.md) for complete usage details.

- Install the mo_ctl tool

The mo_ctl tool can be installed through the following command:

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && bash +x ./install.sh
```

- Set mo_ctl parameters

The parameters that need to be adjusted are as follows:

```
mo_ctl set_conf MO_CONTAINER_DATA_HOST_PATH="/yourpath/mo/" # Set the data directory for host
mo_ctl set_conf MO_CONTAINER_IMAGE="matrixorigin/matrixone:1.1.2" # Set image
mo_ctl set_conf MO_DEPLOY_MODE=docker # Deployment Configuration
```

```
MO_CONTAINER_NAME="mo" # mo container name
MO_CONTAINER_PORT="6001" # mo port
MO_CONTAINER_DEBUG_PORT="12345" #container debug port
MO_CONTAINER_CONF_HOST_PATH="" # configuration file path
MO_CONTAINER_CONF_CON_FILE="/etc/quickstart/launch.toml" # configuration file
MO_CONTAINER_LIMIT_MEMORY="" # Memory limitations,Unit:m
MO_CONTAINER_MEMORY_RATIO=90 # Memory default percentage
MO_CONTAINER_AUTO_RESTART="yes" # Set container automatic restart or not
MO_CONTAINER_LIMIT_CPU="" # cpu limitations,Unit: Number of cores
MO_CONTAINER_EXTRA_MOUNT_OPTION="" # additional mounting parameters,such as -v xx:xx:xx
```

- Install Matrixone

Depending on your needs, choose whether you want to keep your code up to date, or if you want to get the latest stable version of the code.

=== "Get the MatrixOne(Develop Version) code to build"

     The **main** branch is the default branch, the code on the main branch is always up-to-date but not stable enough.

     ```
     mo_ctl deploy main
     ```

=== "Get the MatrixOne(Stable Version) code to build"

     ```
     mo_ctl deploy v1.1.2
     ```

- Launch MatrixOne server

```
mo_ctl start
```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

## Step 3: Connect to MatrixOne

In addition to using the MySQL client to connect to MatrixOne, you can also use the mo_ctl tool to connect when the mo_ctl tool is deployed. This section introduces the specific operations of two connection methods.

- MySQL client

You can use the MySQL command-line client to connect to MatrixOne server. Open a new terminal window and enter the following command:

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p
    Enter password:  # The default initial password is 111
    ```

- mo_ctl tool

One-click connection to MatrixOne service through `mo_ctl connect` command.

This command will invoke the MySQL Client tool to connect to the MatrixOne service automatically.

```
root@VM-16-2-debian:~# mo_ctl connect
2023-07-07_10:30:20    [INFO]    Checking connectivity
2023-07-07_10:30:20    [INFO]    Ok, connecting for user ...
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 15
Server version: 8.0.30-MatrixOne-v1.1.2 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>

```

!!! note
    The above connection and login account is the initial accounts `root` and the password `111`; please change the initial password after logging in to MatrixOne; see [MatrixOne Password Management](../../Security/password-mgmt.md). After changing the login username or password, you must set a new username and password through `mo_ctl set_conf`. For details, please refer to [mo_ctl Tool](../../Maintain/mo_ctl.md).
