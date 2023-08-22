# Migrate data from SQL Server to MatrixOne

This document will guide you on how to migrate data from SQL Server to MatrixOne.

SQLServer is widely used in various industries as a mature commercial database, and its functions and performance are outstanding. As a relational database, MatrixOne also supports multiple database migration modes from SQLServer.

## Data type difference

There are many differences between MatrixOne and SQL Server's built-in data types. Other types can replace some differences, and some cannot be supported temporarily. The specific list is as follows:

|SQLServer|MatrixOne|
|---|---|
|real |replace with double|
|money, smallmoney |replace with decimal|
|datetimeoffset |use timestampmap with timezone substitution|
|nchar/nvarchar/ntext |replace with char/varchar/text|
|image |replace with blob|
|uniqueidentifier |replace with uuid|
|bit |Not supported yet|
|rowversion |Not supported yet|
|hierarchyid |Not supported yet|
|sql_variant |Not supported yet|
|xml |Not supported yet|
|geometry |Not supported yet|
|geography| Not supported yet|

## Online Migration

This chapter will guide you to use third-party tools - DBeaver to migrate data from SQL Server to MatrixOne.

Through DBeaver, the source data is obtained in batches, and then the data is inserted into the target database as `INSERT`. If an error is reported during the migration process that the heap space is insufficient, please try to adjust the size of each batch of fetched and inserted data.

- Applicable scenarios: scenarios where the amount of data is small (recommended less than 1GB), and the migration speed is not sensitive.

- The recommended configuration of the springboard machine where DBeaver is installed: RAM 16GB or more.

### Preparation

- Springboard machine with a graphical interface: it can connect to the source of SQL Server and the target of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) on the springboard machine.

### Step 1: Migrate table structure and data

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from SQL Server to MatrixOne.

1. Open DBeaver, select the table to be migrated from SQL Server, right-click and select **Export Data**:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-2.png?raw=true)

2. In the **Conversion Target > Export Target** window, select **Database**, click **Next**; in the **Table Mapping** window, select **Target Container**, and select the MatrixOne database for the target container *tpch*:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-3.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-4.png?raw=true)

3. In the **Extraction Settings** and **Data Loading Settings** windows, set the number of selected extractions and inserts. To trigger MatrixOne's direct write S3 strategy, it is recommended to fill in 5000:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-5.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-6.png?raw=true)

4. After completing the settings, DBeaver starts to migrate the data, and after completion, DBeaver will prompt that the migration is successful.

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the [Complete TPCH testing](../Test/performance-testing/TPCH-test-with-matrixone.md) query example to compare the results.

## Offline Migration

This chapter will guide you through importing to MatrixOne through offline files.

- Applicable scenarios: scenarios with a large amount of data (more significant than 1GB) and sensitive to migration speed.

### Preparation

- Springboard machine with a graphical interface: it can be connected to the source end of SQL Server and the target end of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) to the springboard machine.

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from SQL Server to MatrixOne.

1. Open DBeaver, select the table to be migrated from SQL Server, right-click and select **Generate SQL > DDL > Copy**, first copy this SQL to a text editor, and name the text editor *sqlserver_ddl.sql*, saved locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-1.png?raw=true)

2. Connect to MatrixOne and create a new database and table in MatrixOne:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/sqlserver_ddl.sql'
    ```

### Step 2: Migrate data

MatrixOne has two data migration methods to choose from: `INSERT` and `LOAD DATA`. When the amount of data is greater than 1GB, it is recommended to use `LOAD DATA` first, followed by `INSERT`.

#### LOAD DATA

Use DBeaver to export the SQL Server data table to CSV format first, and use MatrixOne's parallel loading function to migrate the data to MatrixOne:

1. Open DBeaver, select the table to be migrated, right-click and select **Export Data** to export the SQL Server data table as a CSV format file:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-2.png?raw=true)

2. In the **Conversion Goals > Export Goals** window, select **CSV** and click **Next**:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-7.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-8.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-9.png?raw=true)

2. Connect to MatrixOne and import the exported CSV data into MatrixOne:

    ```sql
    mysql> load data infile '/{filepath}/lineitem.txt' INTO TABLE lineitem FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/nation.txt' INTO TABLE nation FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/part.txt' INTO TABLE part FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/customer.txt' INTO TABLE customer FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/orders.txt' INTO TABLE orders FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/supplier.txt' INTO TABLE supplier FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/region.txt' INTO TABLE region FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/partsupp.txt' INTO TABLE partsupp FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    ```

For more operation examples of `LOAD DATA`, see [Bulk Load Overview](../Develop/import-data/bulk-load/bulk-load-overview.md).

#### INSERT

The `INSERT` statement needs to use DBeaver to export the logical statement first and then import it into MatrixOne:

1. Use DBeaver to export data: Open DBeaver, select the table to be migrated from SQL Server, right-click, and select **Export Data > SQL**. To ensure that MatrixOne directly writes to S3 when inserting, it is recommended to insert parameters in batches **The number of data rows** per statement is set to 5000:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-10.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-11.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-12.png?raw=true)

2. Use the following command to replace keywords that MatrixOne does not support in the *sqlserver_ddl.sql* file:

    ```
    # The commands executed by the Linux system are as follows:
    sed -i 's/,N/,/g' mssql_data.sql

    # The commands executed by the MacOS system are as follows:
    sed -i '' 's/,N/,/g' mssql_data.sql
    ```

3. On the MatrixOne side, execute the SQL file:

    ```
    ues tpch;
    source '/YOUR_PATH/sqlserver_ddl.sql'
    ```

For more examples of `INSERT` operations, see [Insert Data](../Develop/import-data/insert-data.md).

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the [Complete a TPCH Test with MatrixOne](../Test/performance-testing/TPCH-test-with-matrixone.md) query example to compare the results.
