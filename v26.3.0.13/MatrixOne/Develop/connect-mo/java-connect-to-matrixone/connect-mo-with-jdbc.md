# Connect MatrixOne with JDBC

In Java, we can connect to MatrixOne with JDBC(Java Database Connectivity) through the Java code. JDBC is one of the standard APIs for database connectivity, using it we can easily run our query, statement, and also fetch data from the database.

## Before you start

Prerequisite to understand Java Database Connectivity with MatrixOne, make sure you have installed these items as below:

1. Make sure you have already [installed and launched MatrixOne](../../../Get-Started/install-standalone-matrixone.md).
2. Make sure you have already installed [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html).
3. Make sure you have already installed MySQL client.
4. Make sure you have already installed JAVA IDE, this document uses [IntelliJ IDEA](https://www.jetbrains.com/idea/) as an example, you can also download other IDE.

## Steps

1. Connect to MatrixOne by MySQL client. Create a new database named *test* or other names you want in MatrixOne and create a new table named *t1*:

    ```sql
    create database test;
    use test;
    create table t1
    (
        code int primary key,
        title char(35)
    );
    ```

2. Create a new Java project **testJDBC** in IDEA and select **Maven** as build system, then click on **Create**.

    ![JDBC create project](https://github.com/matrixorigin/artwork/blob/main/docs/develop/JDBC_connect/JDBC-create-project.png?raw=true)

3. Click on the **File > Project Structure**, enter into ****Project Setting**, select and click **Library**, then click **+** button, add new project library **From Maven**.

    ![JDBC project structure](https://github.com/matrixorigin/artwork/blob/main/docs/develop/JDBC_connect/JDBC-project-structure.png?raw=true)

    ![JDBC add library](
<https://github.com/matrixorigin/artwork/blob/main/docs/develop/JDBC_connect/JDBC-from-maven.png?raw=true>)

4. Search library with **mysql-connector-java**,  select **mysql:mysql-connector-java:8.0.30**, apply it to this project.

    ![JDBC add driver](https://github.com/matrixorigin/artwork/blob/main/docs/develop/JDBC_connect/JDBC-add-driver.png?raw=true)

5. Modify the default Java source code at **src/main/java/org/example/Main.java**. In general, the code below create a connection with the connection address and credentials, after connecting to MatrixOne, you can operate on MatrixOne database and tables by Java language.

    For a full example about how to develop a CRUD(Create, Read, Update, Delete) application in MatrixOne with JDBC, please refer to this [JDBC CRUD tutorial](../../../Tutorial/develop-java-crud-demo.md).

    ```
    package org.example;

    import java.sql.Connection;
    import java.sql.DriverManager;
    import java.sql.SQLException;



    public class Main {


        private static String jdbcURL = "jdbc:mysql://127.0.0.1:6001/test";
        private static String jdbcUsername = "root";
        private static String jdbcPassword = "111";

        public static void main(String[] args) {


            try {
                Connection connection = DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
                // Do something with the Connection

            } catch (SQLException ex) {
                // handle any errors
                System.out.println("SQLException: " + ex.getMessage());
                System.out.println("SQLState: " + ex.getSQLState());
                System.out.println("VendorError: " + ex.getErrorCode());
            }
        }
    }

    ```

## Reference

For a full list about MatrixOne's support for JDBC features, see [JDBC supported features list in MatrixOne](../../../Reference/Limitations/mo-jdbc-feature-list.md).
