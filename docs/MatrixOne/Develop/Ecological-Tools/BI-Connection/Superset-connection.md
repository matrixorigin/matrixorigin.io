# Visual Monitoring of MatrixOne with Superset

## Overview

Superset is an open-source, modern, and lightweight BI analysis tool that can connect to multiple data sources, provide rich visualizations, and support custom dashboards, making it easy for users to explore and present data.

MatrixOne version 1.0 now supports integration with the data visualization tool Superset. This guide will walk you through the quick deployment of MatrixOne and Superset environments. Combining MatrixOne with Superset's visualization capabilities allows you to create a simple monitoring dashboard to track the 'system_metric' data within the MatrixOne database.

If you wish to extend the functionality further, you can explore other configuration options to monitor various aspects of the entire MatrixOne database.

## Before you start

### Recommended Hardware Requirements

This practice does not require high hardware specifications. A small virtual machine with 2 cores and 4GB of RAM is sufficient for experiencing the functionality of this process.

- Recommended hardware resources: 8 cores and 32GB of RAM for a virtual machine.

### Recommended Software Environment

Before proceeding with this practice, you need to install and configure the following software environment:

- Docker, with a version of 23.0.1 or higher.
- MatrixOne
- Superset, recommended version 2.1.0.

You can follow the steps in the following sections to install and configure them step by step.

#### Installing Docker

All software environments in this practice are based on Docker installation. You can refer to the [official Docker documentation](https://docs.docker.com/get-docker/) for installing and starting Docker.

#### Installing MatrixOne

You can install and deploy MatrixOne based on your operating system environment by following these links:

- Deploying MatrixOne using Docker in macOS environment: [Installation Guide](../../../Get-Started/install-on-macos/install-on-macos-method3.md)
- Deploying MatrixOne using Docker in Linux environment: [Installation Guide](../../../Get-Started/install-on-linux/install-on-linux-method3.md)

#### Installing Superset

Here are the steps for deploying a single-node Superset using Docker:

1. After installing and starting Docker, use the following command to pull the Superset image from Docker Hub:

    ```
    docker pull amancevice/superset
    ```

2. Start the Superset image with the following command:

    ```
    docker run -e "SUPERSET_SECRET_KEY=your_secret_key_here" --name superset -u 0 -d -p 8088:8088 amancevice/superset
    ```

    !!! note
        You can generate a secure secret key using `openssl rand -base64 42`. Alternatively, you can set it using the `SUPERSET_SECRET_KEY` environment variable.

3. Initialize the Superset database with the following command:

    ```
    docker exec -it superset superset db upgrade
    ```

4. Create a Superset admin user by running the following command and providing the requested registration information:

    ```
    docker exec -it superset superset fab create-admin
    ```

5. Create default roles and permissions using the following command:

    ```
    docker exec -it superset superset init
    ```

6. Start the Superset service with threads, auto-reloading, and debugging using the following command:

    ```
    docker exec -it superset superset run --with-threads --reload --debugger
    ```

## Connecting MatrixOne with Superset

1. Access the Superset login page, typically at `http://ip:8080`. Then, enter your username and password to log in to Superset.

    ![Superset Login Page](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-login.png?raw=true)

    __Note:__ The port for Superset may be either 8080 or 8088, depending on your configuration. The username and password are the ones you set during the Superset deployment.

    After logging in, you will see the main interface of Superset.

    ![Superset Main Interface](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-dashboard.png?raw=true)

2. Create a database connection:

    In Superset, you first need to create a database connection to MatrixOne. Click on **Settings** in the top right corner and select **Database Connections**.

    Click the **+ DATABASE** button on the Database Connections page and choose **MySQL** as the database type.

    Fill in the connection information for the MatrixOne database, including the host, port, username, and password.

    ![Create Database Connection](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-create-db-connection.png?raw=true)

    After filling in the details, click the **CONNECT** button and then click **FINISH**.

    ![Create Query](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-create-query.png?raw=true)

## Creating Visual Monitoring Dashboards

Now, you can use the MatrixOne database to create a monitoring dashboard.

1. Click on **SQL > SQL Lab** on the page, select the MatrixOne database connection you created earlier, and write SQL queries to select the tables you want to monitor.

    ![image-20230807201143069](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/sql-lab.png?raw=true)

    You can write multiple queries to monitor different metrics. Here are example SQL statements for some queries:

    - CPU Usage:

     ```sql
     SELECT metric_name, collecttime, value
     FROM metric
     WHERE metric_name = 'sys_cpu_combined_percent' OR metric_name = 'sys_cpu_seconds_total'
     ORDER BY collecttime DESC;
     ```

    - Storage Usage:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'server_storage_usage'
     ORDER BY collecttime DESC;
     ```

    - Number of Connections:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'server_connections'
     ORDER BY collecttime DESC;
     ```

    - Disk Read and Write:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_disk_read_bytes' OR metric_name = 'sys_disk_write_bytes'
     ORDER BY collecttime DESC;
     ```

    - Network Receive and Send:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_net_sent_bytes' OR metric_name = 'sys_net_recv_bytes'
     ORDER BY collecttime DESC;
     ```

    - Memory Usage:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_memory_available' OR metric_name = 'sys_memory_used'
     ORDER BY collecttime DESC;
     ```

   - Transaction Errors:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sql_transaction_errors' OR metric_name = 'sql_transaction_total'
     ORDER BY collecttime DESC;
     ```

   - SQL Errors:

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sql_statement_errors' OR metric_name = 'sql_statement_total'
     ORDER BY collecttime DESC;
     ```

2. Click **SAVE > Save dataset > SAVE & EXPLORE** to save each of the queries above and use them as data sources for subsequent charts.

3. Edit the charts:

    Here, we'll use one of the queries as an example to demonstrate how to edit a visual chart. First, select the 'disk_read_write' query as the data source for the chart. In the SQL Lab, click **CREATE CHART** below the corresponding query, or if you've saved the query in the previous step, the page will redirect to the Chart editing page:

    ![Create Dashboard](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-create-dashboard.png?raw=true)

4. In the chart editing page, choose chart type, time field, metric columns from the query, grouping columns, and other options. Once configured, select **RUN**:

    ![View Dashboard](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-view-dashboard.png?raw=true)

5. Click **UPDATE CHART > SAVE** to save the edited chart.

## Organizing Dashboards

1. After creating multiple charts, you can assemble them in Superset to create a monitoring dashboard:

    Click on **Dashboards**, then click **+ DASHBOARD** to create a new dashboard or edit an existing one.

    ![image-20230808101636134](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-add-dashboard.png?raw=true)

2. In the dashboard editing page, you can drag the charts you've created from the CHARTS list on the right onto the dashboard for assembly. You can also freely adjust the position of charts, add titles, and more.

    ![image-20230808102033250](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/superset/superset-edit-dashboard.png?raw=true)

You have successfully connected the MatrixOne database with Superset and created a simple monitoring dashboard to visualize key metrics of the MatrixOne database.
