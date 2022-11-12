# Unit 2. Install standalone MatrixOne

Congratulations!  Now that you've finished installing the dependency tools. Let's learn how to install the standalone MatrixOne.  

To facilitate developers or technology enthusiasts with different operating habits to install the MatrixOne standalone version most conveniently and quickly, we provide the following three installation methods. You can choose the most suitable installation method for you according to your needs:

- <p><a href="#code_source">Method 1: Building from source code</a>.</p> If you always need to get the latest version code, you can choose to install and deploy MatrixOne by **Building from source code**.
- <p><a href="#binary_packages">Method 2: Using binary package</a>.</p> If you like installing the package directly, you can choose to install and deploy MatrixOne by **Using binary package**.
- <p><a href="#use_docker">Method 3: Using Docker</a>.</p> If you usually use Docker, you can also install and deploy MatrixOne by **Using Docker**.

## <h2><a name="code_source">Method 1: Building from source code</a></h2>

### 1. Get the MatrixOne code to build MatrixOne

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

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Unit 3: Connect to MatrixOne server](connect-to-matrixone-server.md).

If you are interested in learning about other installation methods, please continue reading the following sections.

## <h2><a name="binary_packages">Method 2: Using binary packages</a></h2>

From 0.3.0 release, you can download binary packages.

### 1. Download binary packages and decompress

=== "**Linux Environment**"

      **Download Method 1** and **Download Method 2** need to install the download tools `wget` and `curl` first. If you have not installed it, you can see [Unit 1. Install Dependency Tools](install-dependency-tool.md) to install the download tools.

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

      **Download Method 1** and **Download Method 2** need to install the download tools `wget` and `curl` first. If you have not installed it, you can see [Unit 1. Install Dependency Tools](install-dependency-tool.md) to install the download tools.

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

### 2.Launch MatrixOne server

```
./mo-server system_vars_config.toml
```

### 3. Connect to MatrixOne Server

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Unit 3: Connect to MatrixOne server](connect-to-matrixone-server.md).

If you are interested in learning about other installation methods, please continue reading the following sections.

## <h2><a name="use_docker">Method 3: Using docker</a></h2>

You need to install **Docker** first if you want to **Use Docker** to install MatrixOne. If you have not installed Docker, you can see [Unit 1. Install Dependency Tools](install-dependency-tool.md) to install the download Docker.

### 1. Create and run the container of MatrixOne

It will pull the image from Docker Hub if not exists. You can choose to pull the stable version image or the develop version image.

=== "Stable Version Image(0.5.1 version)"

     ```bash
     docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.5.1
     ```

=== "Develop Version Image(Pre0.6 version)"

      If you want to pull the develop version image, see [Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags), get the image tag. An example as below:

      ```bash
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      !!! info
          The *nightly* version is updated once a day.

For the information on the user name and password, see step 3- Connect to MatrixOne Server.

### 2. Mount the data directory(Optional)

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

### 3. Connect to MatrixOne Server

When you finish installing and starting MatrixOne, many logs are generated in startup mode. Then you can start a new terminal and connect to MatrixOne, for more information on connecting to MatrixOne, see [Unit 3: Connect to MatrixOne server](connect-to-matrixone-server.md).

## Next Unit

[Unit 3. Connect to MatrixOne Server](connect-to-matrixone-server.md)

## Reference

- For more information on update, see [Upgrade Standalone MatrixOne](../Maintain/upgrade-standalone-matrixone.md).
- For more information on deployment，see [Deployment FAQs](../FAQs/deployment-faqs.md).
