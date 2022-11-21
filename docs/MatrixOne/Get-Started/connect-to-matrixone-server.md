# **Connect to MatrixOne Server**

## **Before you start**

Make sure you have already [installed MatrixOne](install-standalone-matrixone.md).

## **1. Install MySQL Client**

!!! note
    MySQL client version 8.0.30 or later is recommended.

If the **MySQL client** has not been installed, you can find different installation methods of operation system in <a href="https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html" target="_blank">MySQL Shell Official Documentation</a>. You can follow the *MySQL Shell Official Documentation* to install it.

Or you can click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

After the installation is completed, open the terminal and enter `mysqlsh`. When **MySQL Client** is installed successfully, the example code line is as follows:  

```
MySQL Shell 8.0.30

Copyright (c) 2016, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
MySQL  JS >
```

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means that some features might not work with the MariaDB client or Percona client.

You can close the MySQL client, open a new terminal window, then move on to the next step.

## **2. Connect to MatrixOne server**

You can use the MySQL command-line client to connect to MatrixOne server:

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
