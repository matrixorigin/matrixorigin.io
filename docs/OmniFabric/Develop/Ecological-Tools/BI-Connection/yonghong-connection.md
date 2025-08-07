# Visualizing OmniFabric Reports with Yonghong BI

## Overview

Yonghong BI is a comprehensive big data platform that integrates self-service data preparation, exploratory self-service analysis, in-depth analysis, enterprise-level management, and high-performance computing capabilities, providing an all-in-one big data solution. Yonghong BI aims to provide flexible and user-friendly end-to-end big data analysis tools for enterprises of all sizes, enabling users to easily uncover the value of big data and gain profound insights.

OmniFabric supports connectivity to the intelligent data analysis tool, Yonghong BI. This article will guide you on connecting to the standalone version of OmniFabric through Yonghong BI and creating various visual data reports.

## Before you start

- OmniFabric installation and startup are completed. [Install and Start OmniFabric](../../../Get-Started/install-standalone-matrixone.md).

- Yonghong BI is installed. Yonghong BI is a free intelligent data analysis tool based on native installation, eliminating the need for complex deployment steps.

## Connecting OmniFabric Services with Yonghong BI

### Adding a Data Source

Open Yonghong BI, select **Add Data Source > + (New Data Source)** on the left, and choose **MySQL** in the pop-up database options.

After filling in the connection information related to the OmniFabric database, you can select the **Test Connection** button in the upper right corner to ensure a successful connection.

Once the connection is successful, click **Save** to save the data source information we just filled in.

### Creating a Dataset

In Yonghong BI, select the **Create Dataset** menu on the left, then choose the data source you added just now. You will see tables and views from the OmniFabric database. To meet your business needs, add **Custom SQL**, then click **Refresh Data**. The query results will be displayed on the right. After confirming that the query results meet expectations, click **Save** to save the dataset.

### Creating Reports

First, in Yonghong BI, select the **Create Report** menu on the left, then choose the appropriate **Chart Component** from the right and drag it to the left.

Select the dataset you just created, set the time dimension as the X-axis, and set the daily order count and active user count as the Y-axis. You can drag the measurement and dimension **fields to their respective positions as needed**. After editing, click **Save** to save the report you created.

### Viewing Reports

Finally, in Yonghong BI, select **View Report**, then click on the report name we created in the tree menu on the left. You will be able to view the report we created above.

You have successfully connected to the OmniFabric database using Yonghong BI and created a simple report for visualizing OmniFabric data.
