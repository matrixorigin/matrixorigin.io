# Writing MySQL data to MatrixOne using Flink

This chapter describes how to write MySQL data to MatrixOne using Flink.

## Pre-preparation

This practice requires the installation and deployment of the following software environments:

- Complete [standalone MatrixOne deployment](../../../../Get-Started/install-standalone-matrixone.md).
- Download and install [lntelliJ IDEA (2022.2.1 or later version)](https://www.jetbrains.com/idea/download/).
- Select the [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) version to download and install depending on your system environment.
- Download and install [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz) with a minimum supported version of 1.11.
- Download and install [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar), the recommended version is 8.0.33.

## Operational steps

### Step one: Initialize the project

1. Open IDEA, click **File > New > Project**, select **Spring Initializer**, and fill in the following configuration parameters:

    - **Name**:matrixone-flink-demo
    - **Location**:~\Desktop
    - **Language**:Java
    - **Type**:Maven
    - **Group**:com.example
    - **Artifact**:matrixone-flink-demo
    - **Package name**:com.matrixone.flink.demo
    - **JDK** 1.8

    An example configuration is shown in the following figure:

    <div align="center">
    <img src=https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/matrixone-flink-demo.png?raw=true width=50% heigth=50%/>
    </div>

2. Add project dependencies, edit the `pom.xml` file in the root of your project, and add the following to the file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.matrixone.flink</groupId>
    <artifactId>matrixone-flink-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <scala.binary.version>2.12</scala.binary.version>
        <java.version>1.8</java.version>
        <flink.version>1.17.0</flink.version>
        <scope.mode>compile</scope.mode>
    </properties>

    <dependencies>

        <!-- Flink Dependency -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-connector-hive_2.12</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-java</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-streaming-java</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-clients</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-table-api-java-bridge</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-table-planner_2.12</artifactId>
            <version>${flink.version}</version>
        </dependency>

        <!-- JDBC相关依赖包 -->
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-connector-jdbc</artifactId>
            <version>1.15.4</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- Kafka相关依赖 -->
        <dependency>
            <groupId>org.apache.kafka</groupId>
            <artifactId>kafka_2.13</artifactId>
            <version>3.5.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.flink</groupId>
            <artifactId>flink-connector-kafka</artifactId>
            <version>3.0.0-1.17</version>
        </dependency>

        <!-- JSON -->
        <dependency>
            <groupId>com.alibaba.fastjson2</groupId>
            <artifactId>fastjson2</artifactId>
            <version>2.0.34</version>
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
                <artifactId>maven-assembly-plugin</artifactId>
                <version>2.6</version>
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

### Step Two: Read MatrixOne Data

After connecting to MatrixOne using a MySQL client, create the database you need for the demo, as well as the data tables.

1. Create databases, data tables, and import data in MatrixOne:

    ```SQL
    CREATE DATABASE test;
    USE test;
    CREATE TABLE `person` (`id` INT DEFAULT NULL, `name` VARCHAR(255) DEFAULT NULL, `birthday` DATE DEFAULT NULL);
    INSERT INTO test.person (id, name, birthday) VALUES(1, 'zhangsan', '2023-07-09'),(2, 'lisi', '2023-07-08'),(3, 'wangwu', '2023-07-12');
    ```

2. Create a `MoRead.java` class in IDEA to read MatrixOne data using Flink:

    ```java
    package com.matrixone.flink.demo;

    import org.apache.flink.api.common.functions.MapFunction;
    import org.apache.flink.api.common.typeinfo.BasicTypeInfo;
    import org.apache.flink.api.java.ExecutionEnvironment;
    import org.apache.flink.api.java.operators.DataSource;
    import org.apache.flink.api.java.operators.MapOperator;
    import org.apache.flink.api.java.typeutils.RowTypeInfo;
    import org.apache.flink.connector.jdbc.JdbcInputFormat;
    import org.apache.flink.types.Row;

    import java.text.SimpleDateFormat;

    /**
     * @author MatrixOne
     * @description
     */
    public class MoRead {
        private static String srcHost = "xx.xx.xx.xx";
        private static Integer srcPort = 6001;
        private static String srcUserName = "root";
        private static String srcPassword = "111";
        private static String srcDataBase = "test";

        public static void main(String[] args) throws Exception {

            ExecutionEnvironment environment = ExecutionEnvironment.getExecutionEnvironment();
            // Set parallelism
            environment.setParallelism(1);
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

            // Set the field type of the query
            RowTypeInfo rowTypeInfo = new RowTypeInfo(
                    new BasicTypeInfo[]{
                            BasicTypeInfo.INT_TYPE_INFO,
                            BasicTypeInfo.STRING_TYPE_INFO,
                            BasicTypeInfo.DATE_TYPE_INFO
                    },
                    new String[]{
                            "id",
                            "name",
                            "birthday"
                    }
            );

            DataSource<Row> dataSource = environment.createInput(JdbcInputFormat.buildJdbcInputFormat()
                    .setDrivername("com.mysql.cj.jdbc.Driver")
                    .setDBUrl("jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase)
                    .setUsername(srcUserName)
                    .setPassword(srcPassword)
                    .setQuery("select * from person")
                    .setRowTypeInfo(rowTypeInfo)
                    .finish());

            // Convert Wed Jul 12 00:00:00 CST 2023 date format to 2023-07-12
            MapOperator<Row, Row> mapOperator = dataSource.map((MapFunction<Row, Row>) row -> {
                row.setField("birthday", sdf.format(row.getField("birthday")));
                return row;
            });

            mapOperator.print();
        }
    } 
    ```

3. Run `MoRead.Main()` in IDEA with the following result:

    ![MoRead execution results](https://github.com/matrixorigin/artwork/blob/main/docs/develop/flink/moread.png?raw=true)

### Step Three: Write MySQL Data to MatrixOne

You can now start migrating MySQL data to MatrixOne using Flink.

1. Prepare MySQL data: On node3, connect to your local Mysql using the Mysql client, create the required database, data table, and insert the data:

    ```sql
    mysql -h127.0.0.1 -P3306 -uroot -proot
    mysql> CREATE DATABASE motest;
    mysql> USE motest;
    mysql> CREATE TABLE `person` (`id` int DEFAULT NULL, `name` varchar(255) DEFAULT NULL, `birthday` date DEFAULT NULL);
    mysql> INSERT INTO motest.person (id, name, birthday) VALUES(2, 'lisi', '2023-07-09'),(3, 'wangwu', '2023-07-13'),(4, 'zhaoliu', '2023-08-08');
    ```

2. Empty MatrixOne table data:

    On node3, connect node1's MatrixOne using a MySQL client. Since this example continues to use the `test` database from the example that read the MatrixOne data earlier, we need to first empty the data from the `person` table.

    ```sql
    -- on node3, connect node1's MatrixOne 
    mysql -hxx.xx.xx.xx -P6001 -uroot -p111 
    mysql> TRUNCATE TABLE test.person using the Mysql client;
    ```

3. Write code in IDEA:

    Create `Person.java` and `Mysql2Mo.java` classes, use Flink to read MySQL data, perform simple ETL operations (convert Row to Person object), and finally write the data to MatrixOne.

```java
package com.matrixone.flink.demo.entity;


import java.util.Date;

public class Person {

    private int id;
    private String name;
    private Date birthday;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }
} 
```

```java
package com.matrixone.flink.demo;

import com.matrixone.flink.demo.entity.Person;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.typeinfo.BasicTypeInfo;
import org.apache.flink.api.java.typeutils.RowTypeInfo;
import org.apache.flink.connector.jdbc.*;
import org.apache.flink.streaming.api.datastream.DataStreamSink;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.types.Row;

import java.sql.Date;

/**
 * @author MatrixOne
 * @description
 */
public class Mysql2Mo {

    private static String srcHost = "127.0.0.1";
    private static Integer srcPort = 3306;
    private static String srcUserName = "root";
    private static String srcPassword = "root";
    private static String srcDataBase = "motest";

    private static String destHost = "xx.xx.xx.xx";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "person";


    public static void main(String[] args) throws Exception {

        StreamExecutionEnvironment environment = StreamExecutionEnvironment.getExecutionEnvironment();
        // Set parallelism
        environment.setParallelism(1);
        // Set the field type of the query
        RowTypeInfo rowTypeInfo = new RowTypeInfo(
                new BasicTypeInfo[]{
                        BasicTypeInfo.INT_TYPE_INFO,
                        BasicTypeInfo.STRING_TYPE_INFO,
                        BasicTypeInfo.DATE_TYPE_INFO
                },
                new String[]{
                        "id",
                        "name",
                        "birthday"
                }
        );

        // Add srouce
        DataStreamSource<Row> dataSource = environment.createInput(JdbcInputFormat.buildJdbcInputFormat()
                .setDrivername("com.mysql.cj.jdbc.Driver")
                .setDBUrl("jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase)
                .setUsername(srcUserName)
                .setPassword(srcPassword)
                .setQuery("select * from person")
                .setRowTypeInfo(rowTypeInfo)
                .finish());

        // Conduct ETL
        SingleOutputStreamOperator<Person> mapOperator = dataSource.map((MapFunction<Row, Person>) row -> {
            Person person = new Person();
            person.setId((Integer) row.getField("id"));
            person.setName((String) row.getField("name"));
            person.setBirthday((java.util.Date)row.getField("birthday"));
            return person;
        });

        // Set matrixone sink information
        mapOperator.addSink(
                JdbcSink.sink(
                        "insert into " + destTable + " values(?,?,?)",
                        (ps, t) -> {
                            ps.setInt(1, t.getId());
                            ps.setString(2, t.getName());
                            ps.setDate(3, new Date(t.getBirthday().getTime()));
                        },
                        new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
                                .withDriverName("com.mysql.cj.jdbc.Driver")
                                .withUrl("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase)
                                .withUsername(destUserName)
                                .withPassword(destPassword)
                                .build()
                )
        );

        environment.execute();
    }

} 
```

### Step Four: View Implementation Results

Execute the following SQL query results in MatrixOne:

```sql
mysql> select * from test.person;
+------+---------+------------+
| id   | name    | birthday   |
+------+---------+------------+
|    2 | lisi    | 2023-07-09 |
|    3 | wangwu  | 2023-07-13 |
|    4 | zhaoliu | 2023-08-08 |
+------+---------+------------+
3 rows in set (0.01 sec)
```
