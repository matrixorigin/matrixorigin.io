# **Building from source code**

This document will guide you build standalone MatrixOne using source code.

## Step 1: Install Go as necessary dependency

1. Click <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> to enter its official documentation, and follow the installation steps to complete the **Go** installation.

    __Note__: Go version 1.20 is required.

2. To verify whether **Go** is installed, please execute the code `go version`. When **Go** is installed successfully, the example code line is as follows:  

    ```
    go version go1.20.4 linux/amd64
    ```

## Step 2: Install GCC as necessary dependency

1. To verify whether the GCC is installed:

    ```
    gcc -v
    bash: gcc: command not found
    ```

    As shown in the code, the version of GCC is not displayed, the **GCC** environment needs to be installed.

2. Click <a href="https://gcc.gnu.org/install/" target="_blank">GCC Download and install</a> to enter its official documentation, and follow the installation steps to complete the **GCC** installation.

    __Note__: GCC version 8.5 is required.

3. To verify whether **GCC** is installed, please execute the code `gcc -v`. When **GCC** is installed successfully, the example code line is as follows (only part of the code is displayed):

    ```
    Using built-in specs.
    COLLECT_GCC=gcc
    ...
    Thread model: posix
    gcc version 9.3.1 20200408 (Red Hat 9.3.1-2) (GCC)
    ```

## Step 3: Get MatrixOne code

Depending on your needs, choose whether you want to keep your code up to date, or if you want to get the latest stable version of the code.

=== "Get the MatrixOne(Develop Version) code to build"

     The **main** branch is the default branch, the code on the main branch is always up-to-date but not stable enough.

     1. Get the MatrixOne(Develop Version) code:

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone
         ```

     2. Run `make build` to compile the MatrixOne file:

         ```
         make build
         ```

         __Tips__: You can also run `make debug`, `make clean`, or anything else our `Makefile` offers, `make debug` can be used to debug the build process, and `make clean` can be used to clean up the build process. If you get an error like `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout` while running `make build`, see [Deployment FAQs](../../FAQs/deployment-faqs.md).

=== "Get the MatrixOne(Stable Version) code to build"

     1. If you want to get the latest stable version code released by MatrixOne, please switch to the branch of version **0.7.0** first.

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone         
         git checkout 0.7.0
         ```

     2. Run `make config` and `make build` to compile the MatrixOne file:

         ```
         make config
         make build
         ```

## Step 4: Launch MatrixOne server

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

## Step 5: Connect to standalone MatrixOne

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
