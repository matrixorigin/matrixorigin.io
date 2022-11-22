# **Connect to standalone MatrixOne Server**

## **Before you start**

Make sure you have already [installed MatrixOne](install-standalone-matrixone.md).

## **1. Install MySQL Client**

!!! note
    MySQL client version 8.0.30 or later is recommended.

If the **MySQL client** has not been installed, you can find different installation methods of operation system in <a href="https://dev.mysql.com/doc/refman/8.0/en/installing.html" target="_blank">Installing and Upgrading MySQL</a>. You can follow the *Installing and Upgrading MySQL* to install it.

Or you can click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

After the installation is completed, configure the MySQL client environment variables:

1. Open a new terminal window and enter the following command:

    ```
    cd ~
    sudo vim .bash_profile
    ```

2. After pressing **Enter** on the keyboard to execute the above command, you need to enter the root user password, which is the root password you set in the installation window when you installed the MySQL client.

3. After entering the root password, you will enter *.bash_profile*, click **i** on the keyboard to enter the insert state, and you can enter the following command at the bottom of the file:

    ```
    export PATH=${PATH}:/usr/local/mysql/bin
    ```

4. After the input is completed, click **esc** on the keyboard to exit the insert state, and enter `:wq` at the bottom to save and exit.

5. Enter the command `source .bash_profile`, press **Enter** to execute, and run the environment variable.

6. To test whether MySQL is available, enter `mysql -u root -p`, press **Enter** to execute, the root user password is required, if `mysql>` is displayed, it means that the MySQL client is enabled.

7. Then, you can enter `exit` to exit, and continue to browse the next chapter **Connect to MatrixOne Server**.

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means that some features might not work with the MariaDB client or Percona client.

## **2. Connect to MatrixOne server**

You can use the MySQL command-line client to connect to MatrixOne server. Open a new terminal window and enter the following command:

```
mysql -h IP -P PORT -uUsername -p
```

After you enter the preceding command, the terminal will prompt you to provide the username and password. You can use our built-in account:

- user: dump
- password: 111

You can also use the following command line on the MySQL client to connect to the MatrixOne service:

```
mysql -h 127.0.0.1 -P 6001 -udump -p
Enter password:
```

Currently, MatrixOne only supports the TCP listener.

## Reference

For more information on connecting to MatriOne, see
[Using client connect to the MatrixOne server](../Develop/connect-mo/client-connect-to-matrixone.md),[Connecting to MatrixOne with JDBC](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md), and [Connecting to MatrixOne with Python](../Develop/connect-mo/python-connect-to-matrixone.md).
