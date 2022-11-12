# Unit 1. Install Dependency Tools

Before you can start installing MatrixOne, you first need to install the Go language and MySQL client as necessary dependancy.

In addition, in *Unit 2*, we also have an introduction to other ways of installing MatrixOne. If you are interested in another method of installing MatrixOne, we recommend installing `wget`, `curl`, and **Docker**.

## 1. Install Go as necessary dependency

!!! note
    Go version 1.19 is required.

Click <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> to enter its official documentation, and follow the installation steps to complete the **Go** installation.

To verify whether **Go** is installed, please execute the code `go version`. When **Go** is installed successfully, the example code line is as follows:  

```
go version go1.19 darwin/arm64
```

## 2. Install MySQL Client

!!! note
    MySQL client version 8.0.30 or later is recommended.

If the **MySQL client** has not been installed, you can find different installation methods of operation system in <a href="https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html" target="_blank">MySQL Shell Official Documentation</a>. You can follow the *MySQL Shell Official Documentation* to install it.

Or you can click <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a> to enter into the MySQL client download and installation page. According to your operating system and hardware environment, drop down to select **Select Operating System**, then drop down to select **Select OS Version**, and select the download installation package to install as needed.

After the installation is complete, open the terminal and enter `mysqlsh`. When **MySQL Client** is installed successfully, the example code line is as follows:  

```
MySQL Shell 8.0.30

Copyright (c) 2016, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
MySQL  JS >
```

__Tips__: Currently, MatrixOne is only compatible with the Oracle MySQL client. This means that some features might not work with the MariaDB client or Percona client.

Then, you can close the MySQL client and move on to the next unit, or continue reading the following **Optional** section of this document if you are interested.

## 3.（Optional）Install `wget` or `curl`

In [Unit 2](install-standalone-matrixone.md), we'll provide a method of **Using binary package** to install MatrixOne. If you prefer to use the command line, you can pre-install `wget` or `curl`.

__Tips__: It is recommended that you download and install these two tools to facilitate future operations.

### Install `wget`

The `wget` tool is used to download files from the specified URL. `wget` is a unique file download tool; it is very stable and has a download speed.

Go to the <a href="https://brew.sh/" target="_blank">Homebrew</a> page and follow the instructions to install **Homebrew** first and then install `wget`.  To verify that `wget` is installed successfully, use the following command line:

```
wget -V
```

The successful installation results (only part of the code is displayed) are as follows:

```
GNU Wget 1.21.3 is compiled on darwin21.3.0.
...
Copyright © 2015 Free Software Foundation, Inc.
...
```

### Install `curl`

`curl` is a file transfer tool that works from the command line using URL rules. `curl` is a comprehensive transfer tool that supports file upload and download.  

Go to the <a href="https://curl.se/download.html" target="_blank">Curl</a> website according to the official installation guide to install `curl`.  To verify that `curl` is installed successfully, use the following command line:

```
curl --version
```

The successful installation results (only part of the code is displayed) are as follows:

```
curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.47.0
Release-Date: 2022-06-27
...
```

## 4.（Optional）Install Docker

In [Unit 2](install-standalone-matrixone.md), we'll provide a method of **Using Docker** to install MatrixOne. It has a visual interface, easy to use.

__Tips__: It is recommended that you download and install Docker to facilitate future operations.

### 1. Download and install Docker

Click <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>, enter into the Docker's official document page, depending on your operating system, download and install the corresponding Docker.  

After the installation, click to open Docker and go to the next step to verify whether the installation is successful.

### 2. Verify that the Docker installation is successful  

You can verify the Docker version by using the following lines:

```
docker --version
```

The successful installation results are as follows:

```
Docker version 20.10.17, build 100c701
```

## Next Unit

[Unit 2. Install standalone MatrixOne](install-standalone-matrixone.md)
