# Connecting MatrixOne with DolphinScheduler

## Overview

Apache DolphinScheduler is a distributed, highly scalable open-source system for visual DAG (Directed Acyclic Graph) workflow task scheduling. It provides a solution for visually orchestrating tasks, workflows, and the entire data processing lifecycle.

The main goal of Apache DolphinScheduler is to address complex dependencies in large-scale data tasks. It assembles tasks streamingly using DAGs, allowing real-time monitoring of task execution status and supporting operations such as task retries, specifying node recovery for failures, and pausing, resuming, and terminating tasks.

MatrixOne supports integration with DolphinScheduler, a visual DAG workflow task scheduling system. This document will guide you on connecting MatrixOne to DolphinScheduler and creating task workflows.

## Before you start

- Completed [MatrixOne installation and setup](../../../Get-Started/install-standalone-matrixone.md).

- Installed [DolphinScheduler installation](https://dolphinscheduler.apache.org/docs/3.1.8/en/installation/standalone).

## Operating Steps

### Step 1: Configure the MySQL Driver

1. Download the MySQL driver and copy it to the libs directory:

    After installation, you need to manually download the [mysql-connector-java driver](https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.16/mysql-connector-java-8.0.16.jar) (version 8.0.16). Then, copy it to four directories in the DolphinScheduler installation directory: `api-server/libs`, `alert-server/libs`, `master-server/libs`, and `worker-server/libs`.

    !!! Note
        It is recommended to use `mysql-connector-java-8.0.16.jar` as the MySQL driver package.

2. Restart DolphinScheduler:

    After copying the driver package, you need to restart the DolphinScheduler service. First, go to the DolphinScheduler installation directory and then execute the following command to restart the DolphinScheduler service:

    ```shell
    # Stop the Standalone Server service
    bash ./bin/dolphinscheduler-daemon.sh stop standalone-server
    # Start the Standalone Server service
    bash ./bin/dolphinscheduler-daemon.sh start standalone-server
    ```

3. Log in to DolphinScheduler:

    Use the default username `admin` and password `dolphinscheduler123`. Access the DolphinScheduler web user interface by visiting `http://ip:12345/dolphinscheduler/ui`, as shown below:

    ![image-20230809145317885](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809145317885.png?raw=true)

4. Create a Data Source:

    Click on **Data Source Center > Create Data Source** and enter the MatrixOne data connection information. Afterward, click on **Test Connection**; if the connection is successful, click **OK** to save it:

    ![image-20230809145935857](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809145935857.png?raw=true)

### Step 2: Create a Project Workflow

1. Create a Tenant:

    In the **Security Center**, click on **Create Tenant** and enter the tenant name, as shown below:

    ![image-20230809160632965](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809160632965.png?raw=true)

    !!! Note
        In a production environment, it is not recommended to use `root` as the tenant.

2. Create a Project:

    In **Project Management**, click on **Create Project** and enter the project name, as shown below:

    ![image-20230809150528364](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809150528364.png?raw=true)

3. Create a Workflow and Add Nodes:

    Click on the **Project Name** created in the previous step and then click on **Create Workflow**. Drag the **SQL** node from the left to the canvas on the right. Fill in the **Node Name**, **Data Source Information**, **SQL Type**, and **SQL Statement**, then click **OK**. As shown below:

    The node created in this step is for creating a table, and the SQL statement is used to create a table.

    ![image-20230809151554568](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809151554568.png?raw=true)

    Next, create **Insert Data** and **Query Data** nodes in a similar way. The dependency relationship between these three nodes is shown below, and you can manually connect them:

    ![image-20230809153149428](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809153149428.png?raw=true)

    The SQL statements for these three nodes are as follows:

    ```sql
    #create_table

    CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)

    #insert_data

    INSERT INTO test_table (name) VALUES ('John Doe')

    #select_data

    SELECT * FROM test_table
    ```

    Connect these three nodes based on their dependency relationship, then click **Save**. Enter the **Workflow Name**, select the previously created **Tenant**, choose **Parallel** as the execution policy, and click **OK**.

    ![image-20230809161503945](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809161503945.png?raw=true)

    Once the workflow is created, you can see it in the **Workflow Relations** page with the status "Workflow Offline":

    ![image-20230809161909925](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809161909925.png?raw=true)

    Similarly, you can also see the defined workflow in the **Workflow Definitions** page with the status "Offline":

    ![image-20230809162411368](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809162411368.png?raw=true)

4. Publish and Run the Workflow:

    A workflow must be published before it can be run. Click the **Publish** button to publish the workflow created earlier:

    ![image-20230809162245088](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809162245088.png?raw=true)

    After publishing, the workflow status will appear as follows:

    ![image-20230809163722777](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809163722777.png?raw=true)

    Next, click the **Run** button, set the configuration parameters before starting, and then click **OK**:

    ![image-20230809162828049](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809162828049.png?raw=true)

    Finally, return to the **Project Overview** to check whether the workflow and the three tasks below it have run successfully, as shown below:

    ![image-20230809163533339](https://github.com/matrixorigin/artwork/blob/main/docs/develop/Scheduling-tool/image-20230809163533339.png?raw=true)
