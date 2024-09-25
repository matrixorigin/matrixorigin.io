# Migrating data from MySQL to MatrixOne using Spark

In this chapter, we will cover the implementation of MySQL bulk data writing to MatrixOne using the Spark compute engine.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Finished [installing and starting](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [IntelliJ IDEA version 2022.2.1 and above](https://www.jetbrains.com/idea/download/).
- Download and install [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

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

### Step Two: Read MatrixOne Data

After connecting to MatrixOne using a MySQL client, create the database you need for the demo, as well as the data tables.

1. Create databases, data tables, and import data in MatrixOne:

    ```sql
    CREATE DATABASE test;
    USE test;
    CREATE TABLE `person` (`id` INT DEFAULT NULL, `name` VARCHAR(255) DEFAULT NULL, `birthday` DATE DEFAULT NULL);
    INSERT INTO test.person (id, name, birthday) VALUES(1, 'zhangsan', '2023-07-09'),(2, 'lisi', '2023-07-08'),(3, 'wangwu', '2023-07-12');
    ```

2. Create a `MoRead.java` class in IDEA to read MatrixOne data using Spark:

    ```java
    package com.matrixone.spark;

    import org.apache.spark.sql.Dataset;
    import org.apache.spark.sql.Row;
    import org.apache.spark.sql.SQLContext;
    import org.apache.spark.sql.SparkSession;

    import java.util.Properties;

    /**
     * @auther MatrixOne
     * @desc 读取 MatrixOne 数据
     */
    public class MoRead {

        // parameters
        private static String master = "local[2]";
        private static String appName = "mo_spark_demo";

        private static String srcHost = "xx.xx.xx.xx";
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

3. Run `MoRead.Main()` in IDEA with the following result:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/develop/spark/moread.png?raw=true)

### Step Three: Write MySQL Data to MatrixOne

You can now start migrating MySQL data to MatrixOne using Spark.

1. Prepare MySQL data: On node3, connect to your local Mysql using the Mysql client, create the required database, data table, and insert the data:

    ```sql
    mysql -h127.0.0.1 -P3306 -uroot -proot
    mysql> CREATE DATABASE motest;
    mysql> USE motest;
    mysql> CREATE TABLE `person` (`id` int DEFAULT NULL, `name` varchar(255) DEFAULT NULL, `birthday` date DEFAULT NULL);
    mysql> INSERT INTO motest.person (id, name, birthday) VALUES(2, 'lisi', '2023-07-09'),(3, 'wangwu', '2023-07-13'),(4, 'zhaoliu', '2023-08-08');
    ```

2. Empty MatrixOne table data:

    On node3, connect to the local MatrixOne using a MySQL client. Since this example continues to use the `test` database from the example that read the MatrixOne data earlier, we need to first empty the data from the `person` table.

    ```sql
    -- On node3, connect to MatrixOne on node1 using the Mysql client
    mysql -hxx.xx.xx.xx -P6001 -uroot -p111
    mysql> TRUNCATE TABLE test.person;
    ```

3. Write code in IDEA:

    Create `Person.java` and `Mysql2Mo.java` classes to read MySQL data using Spark. The `Mysql2Mo.java` class code can be referenced in the following example:

```java
package com.matrixone.spark;

import org.apache.spark.api.java.function.MapFunction;
import org.apache.spark.sql.*;

import java.sql.SQLException;
import java.util.Properties;

/**
 * @auther MatrixOne
 * @desc
 */
public class Mysql2Mo {

    // parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String srcHost = "127.0.0.1";
    private static Integer srcPort = 3306;
    private static String srcUserName = "root";
    private static String srcPassword = "root";
    private static String srcDataBase = "motest";
    private static String srcTable = "person";

    private static String destHost = "xx.xx.xx.xx";
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
        connectionProperties.put("driver","com.mysql.cj.jdbc.Driver");

        //jdbc.url=jdbc:mysql://127.0.0.1:3306/database
        String url = "jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase + "?characterEncoding=utf-8&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=Asia/Shanghai";

        //SparkJdbc to read table contents
        System.out.println("Read table contents of person in database");
        // Read all data in the table
        Dataset<Row> rowDataset = sqlContext.read().jdbc(url,srcTable,connectionProperties).select("*");
        // Show data
        //rowDataset.show();
       // Filter data with id > 2 and add spark_ prefix to name field
        Dataset<Row> dataset = rowDataset.filter("id > 2")
                .map((MapFunction<Row, Row>) row -> RowFactory.create(row.getInt(0), "spark_" + row.getString(1), row.getDate(2)), RowEncoder.apply(rowDataset.schema()));
        // Show data
        //dataset.show();
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);;
        dataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase,destTable, properties);
    }

} 
```

In the above code, a simple ETL operation (filtering data with id > 2 and adding the prefix "spark\_" to the name field) is performed and the processed data is written to the MatrixOne database.

### Step Four: View Implementation Results

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
