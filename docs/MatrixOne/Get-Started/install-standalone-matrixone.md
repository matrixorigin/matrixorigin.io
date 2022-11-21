# **Install standalone MatrixOne**

To facilitate developers or technology enthusiasts with different operating habits to install the MatrixOne standalone version most conveniently and quickly, we provide the following three installation methods. You can choose the most suitable installation method for you according to your needs:

- <p><a href="#code_source">Method 1: Building from source code</a>.</p> If you always need to get the latest version code, you can choose to install and deploy MatrixOne by **Building from source code**.
- <p><a href="#binary_packages">Method 2: Using binary package</a>.</p> If you like installing the package directly, you can choose to install and deploy MatrixOne by **Using binary package**.
- <p><a href="#use_docker">Method 3: Using Docker</a>.</p> If you usually use Docker, you can also install and deploy MatrixOne by **Using Docker**.

## Before you start

### Recommended operating system

MatrixOne supports **Linux** and **MacOS**. For quick start, we recommend the following hardware specifications:

| CPU     | Memory | Operating system   |
| :------ | :----- | :-------------- |
| x86 CPU; 4 Cores | 32 GB memory | CentOS 7+ |

For more information on the required operating system versions for deploying MatrixOne, see [Hardware and Operating system requirements](../FAQs/deployment-faqs.md).

## <h2><a name="code_source">Method 1: Building from source code</a></h2>

### 1. Install Go as necessary dependency

!!! note
    Go version 1.19 is required.

Click <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> to enter its official documentation, and follow the installation steps to complete the **Go** installation.

To verify whether **Go** is installed, please execute the code `go version`. When **Go** is installed successfully, the example code line is as follows:  

```
go version go1.19 darwin/arm64
```

### 2. Build MatrixOne by using MatrixOne code

Depending on your needs, choose whether you want to keep your code up to date, or if you want to get the latest stable version of the code.

=== "Get the MatrixOne(Develop Version) code to build"

     The **main** branch is the default branch, the code on the main branch is always up-to-date but not stable enough.

     1. Get the MatrixOne(Develop Version, also called Pre0.6 version) code:

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone
         ```

     2. Run `make build` to compile the MatrixOne file:

         ```
         make build
         ```

         __Tips__: You can also run `make debug`, `make clean`, or anything else our `Makefile` offers, `make debug` can be used to debug the build process, and `make clean` can be used to clean up the build process.

     3. Launch MatrixOne server：

         __Notes__: The startup-config file of MatrixOne(Develop Version) is different from the startup-config file of MatrixOne(Stable Version). The startup-config file code of MatrixOne(Develop Version) is as below:

         ```
         ./mo-service -cfg ./etc/cn-standalone-test.toml
         ```

=== "Get the MatrixOne(Stable Version) code to build"

     1. If you want to get the latest stable version code released by MatrixOne, please switch to the branch of version **0.5.1** first.

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         git checkout 0.5.1
         cd matrixone
         ```

     2. Run `make config` and `make build` to compile the MatrixOne file:

         ```
         make config
         make build
         ```

         __Tips__: You can also run `make debug`, `make clean`, or anything else our `Makefile` offers, `make debug` can be used to debug the build process, and `make clean` can be used to clean up the build process.

     3. Launch MatrixOne server：

         __Notes__: The startup-config file of MatrixOne(Stable Version) is different from the startup-config file of MatrixOne(Develop Version). The startup-config file code of MatrixOne(Stable Version) is as below:

         ```
         ./mo-server system_vars_config.toml
         ```

### 2. Connect to MatrixOne Server

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Connect to MatrixOne server](connect-to-matrixone-server.md).

## <h2><a name="binary_packages">Method 2: Downloading binary packages</a></h2>

From 0.3.0 release, you can download binary packages.

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
     GNU Wget 1.21.3 is compiled on darwin21.3.0.
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
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

### 2. Download binary packages and decompress

=== "**Linux Environment**"

      **Download Method 1** and **Download Method 2** need to install the download tools `wget` or `curl` first.

     + **Downloading method 1: Using `wget` to install binary packages**

        ```bash
        wget https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-linux-amd64.zip
        unzip mo-server-v0.5.1-linux-amd64.zip
        ```

     + **Downloading method 2: Using `curl` to install binary packages**

        ```bash
        curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-linux-amd64.zip
        unzip mo-server-v0.5.1-linux-amd64.zip
        ```

     + **Downloading method 3: If you want a more intuitive way to download the page, you can go to the following page link and download**

        Go to the [version 0.5.1](https://github.com/matrixorigin/matrixone/releases/tag/v0.5.1), pull down to find the **Assets** column, and click the installation package *mo-server-v0. 5.1-linux-amd64.zip* can be downloaded.

=== "**MacOS Environment**"

      **Download Method 1** and **Download Method 2** need to install the download tools `wget` or `curl` first.

     + **Downloading method 1: Using `wget` to install binary packages**

        ```bash
        wget https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-darwin-x86_64.zip
        unzip mo-server-v0.5.1-darwin-x86_64.zip
        ```

     + **Downloading method 2: Using `curl` to install binary packages**

        ```bash
        curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-darwin-x86_64.zip
        unzip mo-server-v0.5.1-darwin-x86_64.zip
        ```

     + **Downloading method 3: If you want a more intuitive way to download the page, you can go to the following page link and download**

        Go to the [version 0.5.1](https://github.com/matrixorigin/matrixone/releases/tag/v0.5.1), pull down to find the **Assets** column, and click the installation package *mo-server-v0.5.1-darwin-x86_64.zip* can be downloaded.

!!! info
    MatrixOne only supports installation on ARM chipset with source code build; if you are using MacOS M1 and above, for more information on using source code build to install MatrixOne, see <a href="#code_source">Method 1: Building from source code</a>. Using release binary files from X86 chipset will lead to unknown problems.

### 3. Launch MatrixOne server

```
./mo-server system_vars_config.toml
```

### 4. Connect to MatrixOne Server

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Connect to MatrixOne server](connect-to-matrixone-server.md).

## <h2><a name="use_docker">Method 3: Using docker</a></h2>

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

### 3. Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

- Stable Version Image(0.5.1 version)

```bash
docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.5.1
```

- If you want to pull the develop version image, see [Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags), get the image tag. An example as below:

    Develop Version Image(Pre0.6 version)

    ```bash
    docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
    ```

    !!! info
         The *nightly* version is updated once a day.

For the information on the user name and password, see the next step - Connect to MatrixOne Server.

### 4. Mount the data directory(Optional)

To customize the configuration file, you can mount the custom configuration file stored on the local disk.

```
docker run -d -p 6001:6001 -v ${path_name}/system_vars_config.toml:/system_vars_config.toml:ro -v ${path_name}/store:/store:rw --name matrixone matrixorigin/matrixone:0.5.1
```

|Parameter|Description|
|---|---|
|${path_name}/system_vars_config.toml|The local disk directory to which the configuration file *system_vars_config.toml* is mounted|
|/system_vars_config.toml| */system_vars_config.toml* in the container|
|${path_name}/store|*/store* path of the backup local disk directory|
|/store|*/store* directory in the container|

For more information on the description of *Docker run*, run the commands `docker run --help`.

### 5. Connect to MatrixOne Server

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Connect to MatrixOne server](connect-to-matrixone-server.md).

## Reference

- For more information on update, see [Upgrade Standalone MatrixOne](../Maintain/upgrade-standalone-matrixone.md).
- For more information on deployment，see [Deployment FAQs](../FAQs/deployment-faqs.md).
