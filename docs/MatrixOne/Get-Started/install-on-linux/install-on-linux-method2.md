# **Using binary package**

This document will guide you build standalone MatrixOne using binary package.

## Step 1: Install `wget` or `curl`

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

## Step 2: Download binary packages and decompress

**Download Method 1** and **Download Method 2** need to install the download tools `wget` or `curl` first.

=== "**Downloading method 1: Using `wget` to install binary packages**"

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v0.7.0/mo-v0.7.0-linux-amd64.zip
     unzip mo-v0.7.0-linux-amd64.zip
     ```

=== "**Downloading method 2: Using `curl` to install binary packages**"

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.7.0/mo-v0.7.0-linux-amd64.zip
     unzip mo-v0.7.0-linux-amd64.zip
     ```

=== "**Downloading method 3: Go to the page and download**"

     If you want a more intuitive way to download the page, go to the [version 0.7.0](https://github.com/matrixorigin/matrixone/releases/tag/v0.7.0), pull down to find the **Assets** column, and click the installation package *mo-v0.7.0-linux-amd64.zip* can be downloaded.

## Step 3: Launch MatrixOne server

=== "**Launch in the frontend**"

      This launch method will keep the `mo-service` process running in the frontend, the system log will be printed in real time. If you'd like to stop MatrixOne server, just make a CTRL+C or close your current terminal.

      ```
      # Start mo-service in the frontend
      ./mo-service -launch ./etc/quickstart/launch.toml
      ```

      When you finish launching MatrixOne in the frontend, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne.

=== "**Launch in the backend**"

      This launch method will put the `mo-service` process running in the backend, the system log will be redirected to the `test.log` file. If you'd like to stop MatrixOne server, you need to find out its `PID` by and kill it by the following commands. Below is a full example of the whole process.

      ```
      # Start mo-service in the backend
      ./mo-service --daemon --launch ./etc/quickstart/launch.toml &> test.log &

      # Find mo-service PID
      ps aux | grep mo-service

      [root@VM-0-10-centos ~]# ps aux | grep mo-service
      root       15277  2.8 16.6 8870276 5338016 ?     Sl   Nov25 156:59 ./mo-service -launch ./etc/quickstart/launch.toml
      root      836740  0.0  0.0  12136  1040 pts/0    S+   10:39   0:00 grep --color=auto mo-service

      # Kill the mo-service process
      kill -9 15277
      ```

      __Tips__: As shown in the above example, use the command `ps aux | grep mo-service` to find out that the process number running on MatrixOne is `15277`, and `kill -9 15277` means to stop MatrixOne with the process number `15277`.

      Next you can take the next step - Connect to standalone MatrixOne.

!!! info
    If you need to switch branches and launch it again after building on a specific branch, a panic will appear after running, and you will need to clean up the data file directory. See [Installation and Deployment Frequently Asked Questions](../../FAQs/deployment-faqs.md) for solutions.
    The MatrixOne version 0.8.0 is compatible with the storage format of older versions. If you use version 0.8.0 or a higher version, there is no need to clean the data file directory when switching to other branches and buildings.

## Step 4: Connect to standalone MatrixOne

### Install and configure MySQL Client

1. Click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

    __Note__: MySQL client version 8.0.30 or later is recommended.

2. Configure the MySQL client environment variables:

     1. Open a new terminal window and enter the following command:

         ```
         cd ~
         sudo vim /etc/profile
         ```

     2. After pressing **Enter** on the keyboard to execute the above command, you need to enter the root user password, which is the root password you set in the installation window when you installed the MySQL client. If no password has been set, press **Enter** to skip the password.

     3. After entering/skiping the root password, you will enter *profile*, click **i** on the keyboard to enter the insert state, and you can enter the following command at the bottom of the file:

        ```
        export PATH=/software/mysql/bin:$PATH
        ```

     4. After the input is completed, click **esc** on the keyboard to exit the insert state, and enter `:wq` at the bottom to save and exit.

     5. Enter the command `source  /etc/profile`, press **Enter** to execute, and run the environment variable.

     6. To test whether MySQL is available:

         - Method 1: Enter `mysql -u root -p`, press **Enter** to execute, the root user password is required, if `mysql>` is displayed, it means that the MySQL client is enabled.

         - Method 2: Run the command `mysql --version`, if MySQL client is installed successfully, the example code line is as follows: `mysql  Ver 8.0.31 for Linux on x86_64 (Source distribution)`

     7. If MySQL is available, close the current terminal and browse the next chapter **Connect to MatrixOne Server**.  

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means that some features might not work with the MariaDB client or Percona client.

### Connect to MatrixOne

- You can use the MySQL command-line client to connect to MatrixOne server. Open a new terminal window and enter the following command:

    ```
    mysql -h IP -P PORT -uUsername -p
    ```

    After you enter the preceding command, the terminal will prompt you to provide the username and password. You can use our built-in account:

    + user: dump
    + password: 111

- You can also use the following command line on the MySQL client to connect to the MatrixOne service:

       ```
       mysql -h 127.0.0.1 -P 6001 -udump -p
       Enter password:
       ```

Currently, MatrixOne only supports the TCP listener.
