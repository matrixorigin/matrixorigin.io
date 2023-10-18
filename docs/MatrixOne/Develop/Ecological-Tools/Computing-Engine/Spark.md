# Writing Data to MatrixOne Using Spark

## Overview

Apache Spark is a distributed computing engine designed to process large-scale data efficiently. It employs distributed parallel computing to distribute tasks like data splitting, computation, and merging across multiple machines, thereby achieving efficient data processing and analysis.

### Scenarios

- Large-Scale Data Processing and Analysis

    Spark can handle massive volumes of data, improving processing efficiency through parallel computing tasks. It is widely used in data processing and analysis in various sectors like finance, telecommunications, healthcare, and more.

- Stream Data Processing

    Spark Streaming allows real-time data stream processing, transforming it into batch-processing data for analysis and storage. This is particularly valuable in real-time data analysis scenarios like online advertising and network security.

- Machine Learning

    Spark provides a machine learning library (MLlib) supporting various machine learning algorithms and model training for applications such as recommendation systems and image recognition.

- Graph Computing

    Spark's graph computing library (GraphX) supports various graph computing algorithms, making it suitable for graph analysis scenarios like social network analysis and recommendation systems.

This document introduces two examples of using the Spark computing engine to write bulk data into MatrixOne. One example covers migrating data from MySQL to MatrixOne, and the other involves writing Hive data into MatrixOne.

## Before you start

### Hardware Environment

The hardware requirements for this practice are as follows:

| Server Name | Server IP      | Installed Software       | Operating System  |
| ----------- | -------------- | ------------------------ | ----------------- |
| node1       | 192.168.146.10 | MatrixOne                | Debian11.1 x86    |
| node3       | 192.168.146.11 | IDEA, MYSQL, Hadoop, Hive | Windows 10        |

### Software Environment

This practice requires the installation and deployment of the following software environments:

- Install and start MatrixOne by following the steps in [Install standalone MatrixOne](../../../Get-Started/install-standalone-matrixone.md).
- Download and install [IntelliJ IDEA version 2022.2.1 or higher](https://www.jetbrains.com/idea/download/).
- Download and install [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- If you need to import data from Hive, you need to install [Hadoop](http://archive.apache.org/dist/hadoop/core/hadoop-3.1.4/) and [Hive](https://dlcdn.apache.org/hive/hive-3.1.3/).
- Download and install the [MySQL Client 8.0.33](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

## Example 1: Migrating Data from MySQL to MatrixOne

### Step 1: Initialize the Project

1. Start IDEA, click **File > New > Project**, select **Spring Initializer**, and fill in the following configuration parameters:

    - **Name**:mo-spark-demo
    - **Location**:~\Desktop
    - **Language**:Java
    - **Type**:Maven
    - **Group**:com.example
    - **Artiface**:matrixone-spark-demo
    - **Package name**:com.matrixone.demo
    - **JDK** 1.8

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/matrixone-spark-demo.png)

2. Add project dependencies and edit the content of `pom.xml` in the project root directory as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.mo</groupId>
    <artifactId>mo-spark-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <spark.version>3.2.1</spark.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-sql_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-hive_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-catalyst_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-core_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-core-asl</artifactId>
            <version>1.9.13</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-mapper-asl</artifactId>
            <version>1.9.13</version>
        </dependency>


        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.16</version>
        </dependency>

    </dependencies>

</project>
```

### Step 2: Read MatrixOne Data

After connecting to MatrixOne using the MySQL client, create the necessary database and data tables for the demonstration.

1. Create a database, tables and import data in MatrixOne:

    ```sql
    CREATE DATABASE test;
    USE test;
    CREATE TABLE `person` (`id` INT DEFAULT NULL, `name` VARCHAR(255) DEFAULT NULL, `birthday` DATE DEFAULT NULL);
    INSERT INTO test.person (id, name, birthday) VALUES(1, 'zhangsan', '2023-07-09'),(2, 'lisi', '2023-07-08'),(3, 'wangwu', '2023-07-12');
    ```

2. In IDEA, create the `MoRead.java` class to read MatrixOne data using Spark:

    ```java
    package com.matrixone.spark;

    import org.apache.spark.sql.Dataset;
    import org.apache.spark.sql.Row;
    import org.apache.spark.sql.SQLContext;
    import org.apache.spark.sql.SparkSession;

    import java.util.Properties;

    /**
     * @auther MatrixOne
     * @desc read the MatrixOne data
     */
    public class MoRead {

        // parameters
        private static String master = "local[2]";
        private static String appName = "mo_spark_demo";

        private static String srcHost = "192.168.146.10";
        private static Integer srcPort = 6001;
        private static String srcUserName = "root";
        private static String srcPassword = "111";
        private static String srcDataBase = "test";
        private static String srcTable = "person";

        public static void main(String[] args) {
            SparkSession sparkSession = SparkSession.builder().appName(appName).master(master).getOrCreate();
            SQLContext sqlContext = new SQLContext(sparkSession);
            Properties properties = new Properties();
            properties.put("user", srcUserName);
            properties.put("password", srcPassword);
            Dataset<Row> dataset = sqlContext.read()
                    .jdbc("jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase,srcTable, properties);
            dataset.show();
        }

    }
    ```

3. Run `MoRead.Main()` in IDEA, the result is as below:

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/moread.png)

### Step 3: Write MySQL Data to MatrixOne

Now, you can begin migrating MySQL data to MatrixOne using Spark.

1. Prepare MySQL data: On node3, use the MySQL client to connect to the local MySQL instance. Create the necessary database, tables, and insert data:

    ```sql
    mysql -h127.0.0.1 -P3306 -uroot -proot
    mysql> CREATE DATABASE test;
    mysql> USE test;
    mysql> CREATE TABLE `person` (`id` int DEFAULT NULL, `name` varchar(255) DEFAULT NULL, `birthday` date DEFAULT NULL);
    mysql> INSERT INTO test.person (id, name, birthday) VALUES(2, 'lisi', '2023-07-09'),(3, 'wangwu', '2023-07-13'),(4, 'zhaoliu', '2023-08-08');
    ```

2. Clear MatrixOne table data:

    On node3, use the MySQL client to connect to the local MatrixOne instance. Since this example continues to use the `test` database from the previous MatrixOne data reading example, you need to clear the data from the `person` table first.

    ```sql
    -- On node3, use the MySQL client to connect to the local MatrixOne
    mysql -h192.168.146.10 -P6001 -uroot -p111
    mysql> TRUNCATE TABLE test.person;
    ```

3. Write code in IDEA:

    Create the `Person.java` and `Mysql2Mo.java` classes to use Spark to read MySQL data. Refer to the following example for the `Mysql2Mo.java` class code:

```java
// Import necessary libraries
import org.apache.spark.api.java.function.MapFunction;
import org.apache.spark.sql.*;

public class Mysql2Mo {

    // Define parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String srcHost = "127.0.0.1";
    private static Integer srcPort = 3306;
    private static String srcUserName = "root";
    private static String srcPassword = "root";
    private static String srcDataBase = "motest";
    private static String srcTable = "person";

    private static String destHost = "192.168.146.10";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "person";

    public static void main(String[] args) throws SQLException {
        SparkSession sparkSession = SparkSession.builder().appName(appName).master(master).getOrCreate();
        SQLContext sqlContext = new SQLContext(sparkSession);
        Properties connectionProperties = new Properties();
        connectionProperties.put("user", srcUserName);
        connectionProperties.put("password", srcPassword);
        connectionProperties.put("driver", "com.mysql.cj.jdbc.Driver");

        // Define the JDBC URL
        String url = "jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase + "?characterEncoding=utf-8&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=Asia/Shanghai";

        // Read table contents using Spark JDBC
        System.out.println("Reading data from the 'person' table in the database");
        Dataset<Row> rowDataset = sqlContext.read().jdbc(url, srcTable, connectionProperties).select("*");

        // Apply transformations to the data (filter records where id > 2 and add 'spark_' prefix to 'name' field)
        Dataset<Row> dataset = rowDataset.filter("id > 2")
                .map((MapFunction<Row, Row>) row -> RowFactory.create(row.getInt(0), "spark_" + row.getString(1), row.getDate(2)), RowEncoder.apply(rowDataset.schema()));

        // Specify connection properties for writing the data
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);
        dataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase, destTable, properties);
    }
}
```

In the above code, a simple ETL operation is performed (filtering data where id > 2 and adding the prefix "spark_" to the 'name' field) and the processed data is written to the MatrixOne database.

### Step 4: View the Execution Results

Execute the following SQL in MatrixOne to view the execution results:

```sql
select * from test.person;
+------+---------------+------------+
| id   | name          | birthday   |
+------+---------------+------------+
|    3 | spark_wangwu  | 2023-07-12 |
|    4 | spark_zhaoliu | 2023-08-07 |
+------+---------------+------------+
2 rows in set (0.01 sec)
```

## Example 2: Importing Hive Data into MatrixOne

### Step 1: Initialize the Project

1. Launch IDEA and click **File > New > Project**. Select **Spring Initializer** and fill in the following configuration parameters:

    - **Name**: mo-spark-demo
    - **Location**: ~\Desktop
    - **Language**: Java
    - **Type**: Maven
    - **Group**: com.example
    - **Artifact**: matrixone-spark-demo
    - **Package name**: com.matrixone.demo
    - **JDK**: 1.8

    ![Project Initialization](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/matrixone-spark-demo.png)

2. Add project dependencies. Edit the contents of the `pom.xml` file in the project's root directory as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.mo</groupId>
    <artifactId>mo-spark-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <spark.version>3.2.1</spark.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-sql_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-hive_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-catalyst_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-core_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-core-asl</artifactId>
            <version>1.9.13</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-mapper-asl</artifactId>
            <version>1.9.13</version>
        </dependency>


        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.16</version>
        </dependency>

    </dependencies>

</project>
```

### Step 2: Prepare Hive Data

Execute the following commands in a terminal window to create a Hive database, data table, and insert data:

```sql
hive
hive> create database motest;
hive> CREATE TABLE `users`(
  `id` int,
  `name` varchar(255),
  `age` int);
hive> INSERT INTO motest.users (id, name, age) VALUES(1, 'zhangsan', 12),(2, 'lisi', 17),(3, 'wangwu', 19);
```

### Step 3: Create MatrixOne Data Table

Connect to the local MatrixOne using the MySQL client on node3. Continue using the previously created "test" database and create a new data table called "users."

```sql
CREATE TABLE `users` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`age` INT DEFAULT NULL
)
```

### Step 4: Copy Configuration Files

Copy the following three configuration files from the Hadoop root directory, "etc/hadoop/core-site.xml" and "hdfs-site.xml," and from the Hive root directory, "conf/hive-site.xml," to the "resource" directory of your project.

![Configuration Files](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/config-files.png)

### Step 5: Write Code

In IntelliJ IDEA, create a class named "Hive2Mo.java" to read data from Hive using Spark and write it to MatrixOne.

```java
package com.matrixone.spark;

import org.apache.spark.sql.*;

import java.sql.SQLException;
import java.util.Properties;

public class Hive2Mo {

    // Parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String destHost = "192.168.146.10";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "users";

    public static void main(String[] args) throws SQLException {
        SparkSession sparkSession = SparkSession.builder()
                .appName(appName)
                .master(master)
                .enableHiveSupport()
                .getOrCreate();

        System.out.println("Reading data from the Hive table");
        Dataset<Row> rowDataset = sparkSession.sql("select * from motest.users");
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);
        rowDataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase, destTable, properties);
    }
}
```

### Step 6: View the Execution Result

Execute the following SQL in MatrixOne to view the execution result.

```sql
mysql> select * from test.users;
+------+----------+------+
| id   | name     | age  |
+------+----------+------+
|    1 | zhangsan |   12 |
|    2 | lisi     |   17 |
|    3 | wangwu   |   19 |
+------+----------+------+
3 rows in set (0.00 sec)
```
