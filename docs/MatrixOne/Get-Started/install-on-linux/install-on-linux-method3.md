# **Using Docker**

This document will guide you build standalone MatrixOne using Docker.

## Step 1: Download and install Docker

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

## Step 2: Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

=== "Stable Version Image(1.0.0-rc1 version)"

      ```bash
      docker pull matrixorigin/matrixone:1.0.0-rc1
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:1.0.0-rc1
      ```

      If you are using the network in mainland China, you can pull the MatrixOne stable version image on Alibaba Cloud:

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.0.0-rc1
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.0.0-rc1
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

!!! note
    If your Docker version is lower than 20.10.18 or the Docker client and server versions are inconsistent, upgrading both to the latest stable version before attempting is recommended. If you choose to proceed with the current versions, you need to add the parameter `--privileged=true` to the `docker run` command, as shown below:
    
    ```bash
    docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:1.0.0-rc1
    ```

!!! note
    The initial startup of MatrixOne approximately takes 20 to 30 seconds. After a brief wait, you can connect to MatrixOne using the MySQL client.

If you need to mount data directories or customize configure files, see [Mount the directory to Docker container](../../Maintain/mount-data-by-docker.md).

## Step 3: Connect to standalone MatrixOne

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

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means some features might not work with the MariaDB or Percona clients.

### Connect to MatrixOne

You can use the MySQL command-line client to connect to MatrixOne server. Open a new terminal window and enter the following command:

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p
    Enter password:  # The default initial password is 111
    ```

Currently, MatrixOne only supports the TCP listener.

!!! info
    The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](../../Security/password-mgmt.md).
