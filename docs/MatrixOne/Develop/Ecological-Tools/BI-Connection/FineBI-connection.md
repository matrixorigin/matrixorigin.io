# Visualizing MatrixOne Data with FineBI

## Overview

FineBI is a next-generation big data analytics tool that empowers business professionals to gain deep insights and leverage their data. In FineBI, users can easily create diverse visualizations, analyze data freely, and explore their datasets. FineBI boasts various data connectivity features and can be used to build complex reports constructing data-driven decision analysis systems. It finds wide application in corporate management, production control, financial intelligence, and sales operations.

MatrixOne supports integration with the data visualization tool FineBI. This article will guide you on connecting to the standalone version of MatrixOne using FineBI and creating various visual data reports, assembling them into dashboards for data analysis and exploration.

## Before you start

- Completed the [installation and startup of MatrixOne](../../../Get-Started/install-standalone-matrixone.md).

- Installed [FineBI](https://help.fanruan.com/finebi/doc-view-260.html?source=5) and performed [FineBI initial setup](https://help.fanruan.com/finebi/doc-view-262.html).

!!! note
    The FineBI version used in the operations shown in this document is FineBI Linux 6.0. You can choose to install the Linux_unix_FineBI6_0-CN.sh package.

## Connecting to MatrixOne Service via FineBI

1. After logging into FineBI, select **Management System > Data Connection > Data Connection Management > New Data Connection** as shown below, then choose **MySQL**:

    ![image-20230808174909411](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/select-mysql.png?raw=true)

2. Fill in the MatrixOne connection configuration, including the database name, host, port, username, and password. Other parameters can be left at their default settings. You can click the **Test Connection** button to verify if the connection is functional and then click **Save** :

    ![image-20230808182330603](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/testing.png?raw=true)

## Creating Visual Reports Using MatrixOne Data

1. Create Demo Data:

    First, log in to the MatrixOne database and execute the following SQL statements to create the necessary data tables and views for the demo:

    ```sql
    create database orders;
    use orders;
    CREATE TABLE `category` (`product_category_name` VARCHAR(255) DEFAULT NULL,
    `product_category_name_english` VARCHAR(255) DEFAULT NULL );
    CREATE TABLE `item` (`order_id` VARCHAR(255) NOT NULL, `order_item_id` INT DEFAULT null,
    `product_id` VARCHAR(255) DEFAULT null,
    `seller_id` VARCHAR(255) DEFAULT null, `shipping_limit_date` DATETIME DEFAULT null,
    `price` DECIMAL(10,2) DEFAULT null,
    `freight_value` DECIMAL(10,2) DEFAULT null
    );
    CREATE TABLE `review` (
    `review_id` VARCHAR(255) NOT NULL,
    `order_id` VARCHAR(255) DEFAULT null,
    `review_score` TINYINT DEFAULT null,
    `review_comment_title` VARCHAR(255) DEFAULT null,
    `review_comment_message` TEXT DEFAULT null,
    `review_creation_date` DATETIME DEFAULT null,
    `review_answer_timestamp` DATETIME DEFAULT null,
    PRIMARY KEY (`review_id`)
    );
    CREATE TABLE `order_time` (
    `order_id` VARCHAR(255) NOT NULL,
    `customer_id` VARCHAR(255) DEFAULT null,
    `y` INT DEFAULT null,
    `q` INT DEFAULT null,
    `m` INT DEFAULT null,
    `d` DATE DEFAULT null,
    `h` INT DEFAULT null,
    `order_purchase_timestamp` DATETIME DEFAULT null
    );
    CREATE TABLE `orders` (
    `order_id` VARCHAR(255) NOT NULL,
    `customer_id` VARCHAR(255) DEFAULT null,
    `order_status` VARCHAR(255) DEFAULT null,
    `order_purchase_timestamp` DATETIME DEFAULT null,
    `order_approved_at` DATETIME DEFAULT null,
    `order_delivered_carrier_date` DATETIME DEFAULT null,
    `order_delivered_customer_date` DATETIME DEFAULT null,
    `order_estimated_delivery_date` DATETIME DEFAULT null,
    PRIMARY KEY (`order_id`)
    );
    CREATE TABLE `product` (
    `product_id` VARCHAR(255) NOT NULL,
    `product_category_name` VARCHAR(255) DEFAULT null,
    `product_name_lenght` INT DEFAULT null,
    `product_description_lenght` INT DEFAULT null,
    `product_photos_qty` INT DEFAULT null,
    `product_weight_g` INT DEFAULT null,
    `product_length_cm` INT DEFAULT null,
    `product_height_cm` INT DEFAULT null,
    `product_width_cm` INT DEFAULT null,
    PRIMARY KEY (`product_id`)
    );
    CREATE TABLE `rfm` (
    `customer_id` VARCHAR(255) DEFAULT null,
    `user_type` VARCHAR(255) DEFAULT null,
    `shijian` DATE DEFAULT null
    );

    CREATE view total_order_value as select  t.order_id,product_id,seller_id,(price*total)+(freight_value*total) as order_value  from (select order_id,count(*) as total  from item group by order_id) t join item on t.order_id=item.order_id;

    CREATE view order_detail as select a.order_id,product_id,seller_id, customer_id,round(order_value,2) as order_value, y,q,m,d,h,order_purchase_timestamp from total_order_value a inner join order_time b on a.order_id=b.order_id;
    ```

    Next, use the following SQL import statements to import the prepared demo data into the respective tables of the MatrixOne database.

    !!! note
        Please note that the path `/root/data/table_name.csv` is the path to the data files for each table. You can generate your data following a similar process.

    ```sql
    use orders;
    load data local infile '/root/data/category.csv' into table category FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/review.csv' into table review FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/product.csv' into table product FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/item.csv' into table item FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/order_time.csv' into table order_time FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/orders.csv' into table orders FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    load data local infile '/root/data/rfm.csv' into table rfm FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY "\r\n";
    ```

2. Add Data Sets:

    In FineBI, click **Public Data**, then click **New Folder** to create and select a folder. After that, click **New Data Set**, choose **SQL Data Set**, and add the SQL query to the selected folder. Enter the dataset name and input the SQL query as shown below:

    ```sql
    select d,
    count(order_id) as order_num,
    count(DISTINCT customer_id)
    from orders.order_detail
    group by d
    order by d
    ```

    You can click the **Preview** button to view the results of the SQL query and then click **OK** to save it:

    ![image-20230809091306270](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/preview.png?raw=true)

    Below are examples of all the query SQL used in this demo:

    ```sql
    -- Daily active users and order count
    select d,
    count(order_id) as order_num,
    count(DISTINCT customer_id)
    from orders.order_detail
    group by d
    order by d

    -- Monthly active users and order count
    select count(DISTINCT customer_id),
    count(order_id),
    concat(y, '-', m)
    from orders.order_detail
    group by y,m
    order by y,m

    -- Active users and order count in different periods
    select h,
    count(DISTINCT customer_id),
    count(order_id) order_num
    from orders.order_detail
    group by h
    order by h

    -- User count by type
    SELECT count(*),
    user_type
    from orders.rfm
    GROUP BY user_type

    -- Monthly GMV
    select y,m,
    sum(order_value),
    concat(y, "-", m) month
    from orders.order_detail
    group by y,m
    order by y,m

    -- Quarterly GMV
    select y,q,
    sum(order_value) gmv,
    concat(y, "季度", q) as quator
    from orders.order_detail
    group by y,q
    order by concat(y, "季度", q) asc

    -- Quarterly ARPU
    select y,q,
    round((sum(order_value)/count(DISTINCT customer_id)),2) arpu,
    concat(y, "季度", q) as quator
    from orders.order_detail
    group by y,q
    order by y,q

    -- Monthly ARPU
    select y,m,
    round((sum(order_value)/count(DISTINCT customer_id)),2) arpu,
    concat(y, "-", m) as month
    from orders.order_detail
    group by y,m
    order by y,m

    -- Important retained users' popularity index
    SELECT e.product_category_name_english good_type,
    SUM(a.order_value) ordder_total_value,
    ROUND(AVG(c.review_score), 2) good_review_score,
    (0.7*SUM(a.order_value)+0.3*10000*ROUND(AVG(c.review_score), 7))
    top_rank_rate
    FROM orders.order_detail a
    INNER JOIN
    (SELECT customer_id
    from orders.rfm
    WHERE user_type='重要挽留用户' ) as b ON a.customer_id=b.customer_id
    LEFT JOIN orders.review c ON a.order_id=c.order_id
    LEFT JOIN orders.product d ON a.product_id=d.product_id
    LEFT JOIN orders.category e ON d.product_category_name=e.product_category_name
    where e.product_category_name_english is not NULL
    GROUP BY e.product_category_name_english limit 50

    -- General retained users' popularity index
    SELECT e.product_category_name_english good_type,
    SUM(a.order_value) ordder_total_value,
     ROUND(AVG(c.review_score), 2) good_review_score,
    (0.7*SUM(a.order_value)+0.3*10000*ROUND(AVG(c.review_score), 7))
    top_rank_rate
    FROM orders.order_detail a
    INNER JOIN
    (SELECT customer_id from orders.rfm
    WHERE user_type='一般挽留用户' ) as b ON a.customer_id=b.customer_id
    LEFT JOIN orders.review c ON a.order_id=c.order_id
    LEFT JOIN orders.product d ON a.product_id=d.product_id
    LEFT JOIN orders.category e ON d.product_category_name=e.product_category_name
    where e.product_category_name_english is not NULL
    GROUP BY e.product_category_name_english limit 50
    ```

3. Update Data:

    After saving the dataset, you need to click the **Update Data** button and wait for the data update to complete before proceeding with the analysis:

    ![image-20230809091814920](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/update-data.png?raw=true)

4. Create Analytic Themes:

    The analytic theme in this example is used to visually present data for general retained users, important retained users, monthly ARPU, quarterly ARPU, active users in different periods, daily active users, monthly active users, and order counts. It assists in decision-making and improving business operations. Here are the specific steps to create an analytic theme:

    - Click **My Analysis**, then click **New Folder** to create and select a folder.
    - Click **New Analytic Theme**, select the dataset created in the previous step, and then click **OK**.

    ![image-20230809092959252](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/create-analytic.png?raw=true)

    __Note:__ You can use the **Batch Selection** feature to select multiple datasets for theme analysis.

    ![image-20230809092959252](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/batch-select.png?raw=true)

    Click the **Add Component** button, choose the chart type, drag the fields from the left to the right as needed, double-click to modify the field visualization name, and change the component name below to describe the content of the report analyzed by the component:

    ![image-20230809092959252](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/add-compon-1.png?raw=true)

    ![image-20230809092959252](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/add-compon-2.png?raw=true)

5. Assemble Dashboards:

    Click **Add Dashboard** to add the components you just created to the dashboard. You can freely drag and resize the components and change the component names below to describe the report's content analyzed by the component.

    ![image-20230810123913230](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/add-dashboard.png?raw=true)

6. Publish Dashboards:

    After assembling the dashboard, click **Publish**, set the publication name, publication node, and display platform. Then click **Confirm**, and your dashboard will be successfully published.

    ![image-20230810123913230](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/publish.png?raw=true)

    Now, see the newly published dashboard under **Navigation** and see how it looks.

    ![image-20230810131752645](https://github.com/matrixorigin/artwork/blob/main/docs/develop/bi-connection/finebi/published.png?raw=true)
