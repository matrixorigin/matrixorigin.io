# **Using Docker**

This document will guide you build standalone MatrixOne using Docker.

## Step 1: Pre-dependency Reference

### Download and install Docker

1. Click <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>, enter into the Docker's official document page, depending on your operating system, download and install the corresponding Docker.  It is recommended to choose Docker version 20.10.18 or later and strive to maintain consistency between the Docker client and Docker server versions.

2. After the installation, you can verify the Docker version by using the following lines:

    ```
    docker --version
    ```

    The successful installation results are as follows:

    ```
    Docker version 20.10.17, build 100c701
    ```

3. Open your local Docker client and launch Docker.

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

## Step 2: Deploying  MatrixOne

### Docker Deployment

Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

=== "Stable Version Image(2.1.0 version)"

      ```bash
      docker pull matrixorigin/matrixone:2.1.0
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:2.1.0
      ```

      If you are using the network in mainland China, you can pull the MatrixOne stable version image on Alibaba Cloud:

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:2.1.0
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:2.1.0
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
docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:2.1.0
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
mo_ctl set_conf MO_CONTAINER_IMAGE="matrixorigin/matrixone:2.1.0" # Set image
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
     mo_ctl deploy v2.1.0
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
