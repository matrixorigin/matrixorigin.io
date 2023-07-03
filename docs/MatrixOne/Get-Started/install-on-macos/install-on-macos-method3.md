# **Using Docker**

This document will guide you build standalone MatrixOne using Docker.

## Step 1: Download and install Docker

1. Click <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>, enter into the Docker's official document page, depending on your operating system, download and install the corresponding Docker.

2. After the installation, you can verify the Docker version by using the following lines:

    ```
    docker --version
    ```

    The successful installation results are as follows:

    ```
    Docker version 20.10.17, build 100c701
    ```

3. Open your local Docker client and launch Docker.

## Step 2: Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

=== "Stable Version Image(0.8.0 version)"

      ```bash
      docker pull matrixorigin/matrixone:0.8.0
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.8.0
      ```
      
      If you are using the network in mainland China, you can pull the MatrixOne stable version image on Alibaba Cloud:

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:0.8.0
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:0.8.0
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

If you need to mount data directories or customize configure files, see [Mount the directory to Docker container](../../Maintain/mount-data-by-docker.md).

## Step 3: Connect to standalone MatrixOne

### Install and configure MySQL Client

1. Click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System > macOS**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

    __Note__: MySQL client version 8.0.30 or later is recommended.

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

     4. After the input is completed, click **esc** on the keyboard to exit the insert state, and enter `:wq` at the bottom to save and exit.

     5. Enter the command `source .bash_profile`, press **Enter** to execute, and run the environment variable.

     6. To test whether MySQL is available:

         - Method 1: Enter `mysql -u root -p`, press **Enter** to execute, the root user password is required, if `mysql>` is displayed, it means that the MySQL client is enabled.

         - Method 2: Run the command `mysql --version`, if MySQL client is installed successfully, the example code line is as follows: `mysql  Ver 8.0.31 for macos12 on arm64 (MySQL Community Server - GPL)`

     7. If MySQL is available, close the current terminal and browse the next chapter **Connect to MatrixOne Server**.

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means that some features might not work with the MariaDB client or Percona client.

### Connect to MatrixOne

- You can use the MySQL command-line client to connect to MatrixOne server. Open a new terminal window and enter the following command:

    ```
    mysql -h IP -P PORT -uUsername -p
    ```

    After you enter the preceding command, the terminal will prompt you to provide the username and password. You can use our built-in account:

    + user: root
    + password: 111

- You can also use the following command line on the MySQL client to connect to the MatrixOne service:

       ```
       mysql -h 127.0.0.1 -P 6001 -uroot -p
       Enter password:
       ```

Currently, MatrixOne only supports the TCP listener.

!!! info
    The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](../../Security/password-mgmt.md).
