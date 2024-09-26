# Migrating data from Doris to MatrixOne with Spark

In this chapter, we will cover the implementation of Doris bulk data writing to MatrixOne using the Spark calculation engine.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Finished [installing and starting MatrixOne](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [Doris](https://doris.apache.org/zh-CN/docs/dev/get-starting/quick-start/).
- Download and install [IntelliJ IDEA version 2022.2.1 and above](https://www.jetbrains.com/idea/download/).
- Download and install [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
- Download and install [MySQL Client 8.0.33](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar).

## Operational steps

### Step one: Prepare data in Doris

```sql
create database test;

use test;

CREATE TABLE IF NOT EXISTS example_tbl
(
    user_id BIGINT NOT NULL COMMENT "用户id",
    date DATE NOT NULL COMMENT "数据灌入日期时间",
    city VARCHAR(20) COMMENT "用户所在城市",
    age SMALLINT COMMENT "用户年龄",
    sex TINYINT COMMENT "用户性别"
)
DUPLICATE KEY(user_id, date)
DISTRIBUTED BY HASH(user_id) BUCKETS 1
PROPERTIES (
    "replication_num"="1"
);

insert into example_tbl values
(10000,'2017-10-01','北京',20,0),
(10000,'2017-10-01','北京',20,0),
(10001,'2017-10-01','北京',30,1),
(10002,'2017-10-02','上海',20,1),
(10003,'2017-10-02','广州',32,0),
(10004,'2017-10-01','深圳',35,0),
(10004,'2017-10-03','深圳',35,0);
```

### Step Two: Prepare Library Tables in MatrixOne

```sql
create database sparkdemo;
use sparkdemo;

CREATE TABLE IF NOT EXISTS example_tbl
(
    user_id BIGINT NOT NULL COMMENT "用户id",
    date DATE NOT NULL COMMENT "数据灌入日期时间",
    city VARCHAR(20) COMMENT "用户所在城市",
    age SMALLINT COMMENT "用户年龄",
    sex TINYINT COMMENT "用户性别"
);
```

### Step Three: Initialize the Project

Start IDEA and create a new Maven project, add the project dependencies, and the pom.xml file is as follows:

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
        <java.version>8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.doris</groupId>
            <artifactId>spark-doris-connector-3.1_2.12</artifactId>
            <version>1.2.0</version>
        </dependency>

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
            <version>8.0.30</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.0</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.scala-tools</groupId>
                <artifactId>maven-scala-plugin</artifactId>
                <configuration>
                    <scalaVersion>2.12.16</scalaVersion>
                </configuration>
                <version>2.15.1</version>
                <executions>
                    <execution>
                        <id>compile-scala</id>
                        <goals>
                            <goal>add-source</goal>
                            <goal>compile</goal>
                        </goals>
                        <configuration>
                            <args>
                                <!--<arg>-make:transitive</arg>-->
                                <arg>-dependencyfile</arg>
                                <arg>${project.build.directory}/.scala_dependencies</arg>
                            </args>
                        </configuration>
                    </execution>
                </executions>
            </plugin>

            <plugin>
                <artifactId>maven-assembly-plugin</artifactId>
                <configuration>
                    <descriptorRefs>
                        <descriptor>jar-with-dependencies</descriptor>
                    </descriptorRefs>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
```

### Step Four: Write Doris data to MatrixOne

1. Writing code

    Create a Doris2Mo.java class that reads Doris data through Spark and writes it to MatrixOne:

    ```java
    package org.example;

    import org.apache.spark.sql.Dataset; import org.apache.spark.sql.Row; import org.apache.spark.sql.SaveMode; import org.apache.spark.sql.SparkSession;

    import java.sql.SQLException;

    /\** * @auther MatrixOne * @desc \*/ public class Doris2Mo { public static void main(String\[] args) throws SQLException { SparkSession spark = SparkSession .builder() .appName("Spark Doris to MatixOne") .master("local") .getOrCreate();

            Dataset<Row> df = spark.read().format("doris").option("doris.table.identifier", "test.example_tbl")
                    .option("doris.fenodes", "192.168.110.11:8030")
                    .option("user", "root")
                    .option("password", "root")
                    .load();

            // JDBC properties for MySQL
            java.util.Properties mysqlProperties = new java.util.Properties();
            mysqlProperties.setProperty("user", "root");
            mysqlProperties.setProperty("password", "111");
            mysqlProperties.setProperty("driver", "com.mysql.cj.jdbc.Driver");

            // MySQL JDBC URL
            String mysqlUrl = "jdbc:mysql://xx.xx.xx.xx:6001/sparkdemo";

            // Write to MySQL
            df.write()
                    .mode(SaveMode.Append)
                    .jdbc(mysqlUrl, "example_tbl", mysqlProperties);
        }

    } 
    ```

2. View execution results

    Execute the following SQL query results in MatrixOne:

    ```sql
    mysql> select * from sparkdemo.example_tbl;
    +---------+------------+--------+------+------+
    | user_id | date       | city   | age  | sex  |
    +---------+------------+--------+------+------+
    |   10000 | 2017-10-01 | 北京   |   20 |    0 |
    |   10000 | 2017-10-01 | 北京   |   20 |    0 |
    |   10001 | 2017-10-01 | 北京   |   30 |    1 |
    |   10002 | 2017-10-02 | 上海   |   20 |    1 |
    |   10003 | 2017-10-02 | 广州   |   32 |    0 |
    |   10004 | 2017-10-01 | 深圳   |   35 |    0 |
    |   10004 | 2017-10-03 | 深圳   |   35 |    0 |
    +---------+------------+--------+------+------+
    7 rows in set (0.01 sec)
    ```

3. Execute in Spark

    - Add Dependencies

    Package the code written in step 2 through Maven: `mo-spark-demo-1.0-SNAPSHOT-jar-with-dependencies.jar`. Place the above Jar package under the Spark installation directory jars.

    - Start Spark

    Once the dependency is added, start Spark, where I start using Spark Standalone mode

    ```bash
    ./sbin/start-all.sh 
    ```

    When the startup is complete, use the jps command to query if the startup was successful, and the master and worker processes start successfully

    ```bash
    [root@node02 jars]# jps
    5990 Worker
    8093 Jps
    5870 Master
    ```

    - Executing procedures

    Go to the Spark installation directory and execute the following command

    ```bash
    [root@node02 spark-3.2.4-bin-hadoop3.2]# bin/spark-submit --class org.example.Doris2Mo --master spark://192.168.110.247:7077 ./jars/mo-spark-demo-1.0-SNAPSHOT-jar-with-dependencies.jar

    //class:Indicates the main class to be executed
    //master:Patterns of Spark Program Operation
    //mo-spark-demo-1.0-SNAPSHOT-jar-with-dependencies.jar:Running program jar package
    ```

    The output of the following results indicates a successful write:

    ```bash
    24/04/30 10:24:53 INFO Executor: Finished task 0.0 in stage 0.0 (TID 0). 1261 bytes result sent to driver
    24/04/30 10:24:53 INFO TaskSetManager: Finished task 0.0 in stage 0.0 (TID 0) in 1493 ms on node02 (executor driver) (1/1)
    24/04/30 10:24:53 INFO TaskSchedulerImpl: Removed TaskSet 0.0, whose tasks have all completed, from pool
    24/04/30 10:24:53 INFO DAGScheduler: ResultStage 0 (jdbc at Doris2Mo.java:40) finished in 1.748 s
    24/04/30 10:24:53 INFO DAGScheduler: Job 0 is finished. Cancelling potential speculative or zombie tasks for this job
    24/04/30 10:24:53 INFO TaskSchedulerImpl: Killing all running tasks in stage 0: Stage finished
    24/04/30 10:24:53 INFO DAGScheduler: Job 0 finished: jdbc at Doris2Mo.java:40, took 1.848481 s
    24/04/30 10:24:53 INFO SparkContext: Invoking stop() from shutdown hook
    24/04/30 10:24:53 INFO SparkUI: Stopped Spark web UI at http://node02:4040
    24/04/30 10:24:53 INFO MapOutputTrackerMasterEndpoint: MapOutputTrackerMasterEndpoint stopped!
    24/04/30 10:24:53 INFO MemoryStore: MemoryStore cleared
    24/04/30 10:24:53 INFO BlockManager: BlockManager stopped
    24/04/30 10:24:53 INFO BlockManagerMaster: BlockManagerMaster stopped
    24/04/30 10:24:53 INFO OutputCommitCoordinator$OutputCommitCoordinatorEndpoint: OutputCommitCoordinator stopped!
    24/04/30 10:24:53 INFO SparkContext: Successfully stopped SparkContext
    24/04/30 10:24:53 INFO ShutdownHookManager: Shutdown hook called
    ```