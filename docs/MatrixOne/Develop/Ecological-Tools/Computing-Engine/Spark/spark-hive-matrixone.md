# Import Hive data into MatrixOne using Spark

In this chapter, we will cover the implementation of Hive bulk data writing to MatrixOne using the Spark calculation engine.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Finished [installing and starting MatrixOne](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [IntelliJ IDEA version 2022.2.1 and above](https://www.jetbrains.com/idea/download/).
- Download and install [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Importing data from Hive requires installing [Hadoop](http://archive.apache.org/dist/hadoop/core/hadoop-3.1.4/) and [Hive](https://dlcdn.apache.org/hive/hive-3.1.3/).
- Download and install [MySQL Client 8.0.33](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

## Operational steps

### Step one: Initialize the project

1. Launch IDEA, click **File > New > Project**, select **Spring Initializer**, and fill in the following configuration parameters:

    - **Name**:mo-spark-demo
    - **Location**:~\Desktop
    - **Language**:Java
    - **Type**:Maven
    - **Group**:com.example
    - **Artiface**:matrixone-spark-demo
    - **Package name**:com.matrixone.demo
    - **JDK** 1.8

    <div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/spark/matrixone-spark-demo.png?raw=true width=50% heigth=50%/>
    </div>

2. Add a project dependency and edit the contents of `pom.xml` in the project root as follows:

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

### Step Two: Prepare Hive Data

Create a Hive database, data table, and insert data by executing the following command in a terminal window:

```sql
hive
hive> create database motest;
hive> CREATE TABLE `users`(
  `id` int,
  `name` varchar(255),
  `age` int);
hive> INSERT INTO motest.users (id, name, age) VALUES(1, 'zhangsan', 12),(2, 'lisi', 17),(3, 'wangwu', 19);
```

### Step Three: Create a MatrixOne data table

On node3, connect to node1's MatrixOne using a MySQL client. Then continue with the "test" database you created earlier and create a new data table "users".

```sql
CREATE TABLE `users` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`age` INT DEFAULT NULL
)
```

### Step four: Copy the configuration file

Copy the three configuration files "etc/hadoop/core-site.xml" and "hdfs-site.xml" in the Hadoop root and "conf/hive-site.xml" in the Hive root to the "resource" directory of your project.

<div align="center">
<img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/spark/config-files.png?raw=true width=40% heigth=40%/>
</div>

### Step five: Write the code

Create a class called "Hive2Mo.java" in IntelliJ IDEA to use Spark to read data from Hive and write data to MatrixOne.

```java
package com.matrixone.spark;

import org.apache.spark.sql.*;

import java.sql.SQLException;
import java.util.Properties;

/**
 * @auther MatrixOne
 * @date 2022/2/9 10:02
 * @desc
 *
 * 1.在 hive 和 matrixone 中分别创建相应的表
 * 2.将 core-site.xml hdfs-site.xml 和 hive-site.xml 拷贝到 resources 目录下
 * 3.需要设置域名映射
 */
public class Hive2Mo {

    // parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String destHost = "xx.xx.xx.xx";
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

        //SparkJdbc to read table contents
        System.out.println("Read table contents of person in hive");
        // Read all data in the table
        Dataset<Row> rowDataset = sparkSession.sql("select * from motest.users");
        // Show data
        //rowDataset.show();
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);;
        rowDataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase,destTable, properties);
    }

} 
```

### Step Six: View Implementation Results

Execute the following SQL in MatrixOne to view the execution results:

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
