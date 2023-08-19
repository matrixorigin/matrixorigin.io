# Migrate data from SQL Server to MatrixOne

This document will guide you on how to migrate data from Oracle to MatrixOne.

Oracle is currently the most widely used commercial database in the world. Its usage scenarios and popularity rank first in DBEngine all year round. MatrixOne can also support the scenario of migrating data from Oracle. According to the size of Oracle data, this article still recommends using online and offline modes for migration.

## Data type difference

There are many differences between MatrixOne and Oracle's built-in data types. Other types can replace some differences, and some cannot be supported temporarily. The specific list is as follows:

|Oracle|MatrixOne|
|---|---|
|varchar2 |replace with text|
|nchar/nvarcahr |replace with char/varchar|
|NUMBER(3,0), NUMBER(5,0) |replace with smallint|
|NUMBER(10,0) |replace with int|
|NUMBER(38,0) |replace with bitint|
|NUMBER(n,p) (p>0) |replace with decimal(n,p)|
|binary_float/binary_double| replace with float/double|
|long |replace with text|
|long raw |replace with blob|
|raw |replace with varbinary|
|clob/nclob |replace with text|
|bfile |Not supported yet|
|rowid/urowid |Not Supported|
|user-defined types |Not supported yet|
|any |Not supported yet|
|xml |Not supported yet|
|spatial |Not supported yet|

## Online Migration

This chapter will guide you to use third-party tools - DBeaver to migrate data from Oracle to MatrixOne.

Through DBeaver, the source data is obtained in batches, and then the data is inserted into the target database as `INSERT`. If an error is reported during the migration process that the heap space is insufficient, please try to adjust the size of each batch of fetched and inserted data.

- Applicable scenarios: scenarios where the amount of data is small (recommended less than 1GB), and the migration speed is not sensitive.

- The recommended configuration of the springboard machine where DBeaver is installed: RAM 16GB or more.

### Preparation

- Springboard machine with a graphical interface: it can connect to the source of Oracle and the target of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) on the springboard machine.

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from Oracle to MatrixOne.

1. Open DBeaver, select the table to be migrated from Oracle, right-click and select **Generate SQL > DDL** Click **Copy**, first copy this SQL to a text editor for text editing Name the filer as *oracle_ddl.sql* and save it locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-1.png?raw=true)

2. Use the following command to replace keywords not supported by MatrixOne in the *oracle_ddl.sql* file:

    ```
    # The commands executed by the Linux system are as follows:
    sed -i '/CHECK (/d' /YOUR_PATH/oracle_ddl.sql
    sed -i '/CREATE UNIQUE INDEX/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(3,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(5,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(10,0)/int/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(38,0)/bigint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER/decimal/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/VARCHAR2/varchar/g' /YOUR_PATH/oracle_ddl.sql

    # The commands executed by the MacOS system are as follows:
    sed -i '' '/CHECK (/d' /YOUR_PATH/oracle_ddl.sql
    sed -i '' '/CREATE UNIQUE INDEX/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(3,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(5,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(10,0)/int/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(38,0)/bigint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER/decimal/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/VARCHAR2/varchar/g' /YOUR_PATH/oracle_ddl.sql
    ```

3. Connect to MatrixOne and create a new database and table in MatrixOne:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/oracle_ddl.sql'
    ```

### Step 2: Migrate data

1. Open DBeaver, select the table to be migrated from Oracle, right-click and select **Export Data**:

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

- Springboard machine with a graphical interface: it can be connected to the source end of Oracle and the target end of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) to the springboard machine.

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from Oracle to MatrixOne.

1. Open DBeaver, select the table to be migrated from Oracle, right-click and select **Generate SQL > DDL > Copy**, first copy this SQL to a text editor, and name the text editor *oracle_ddl.sql*, saved locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-1.png?raw=true)

2. Use the following command to replace keywords that MatrixOne does not support in the *oracle_ddl.sql* file:

    ```
    # The commands executed by the Linux system are as follows:
    sed -i '/CHECK (/d' /YOUR_PATH/oracle_ddl.sql
    sed -i '/CREATE UNIQUE INDEX/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(3,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(5,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(10,0)/int/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER(38,0)/bigint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/NUMBER/decimal/g' /YOUR_PATH/oracle_ddl.sql
    sed -i 's/VARCHAR2/varchar/g' /YOUR_PATH/oracle_ddl.sql

    # The commands executed by the MacOS system are as follows:
    sed -i '' '/CHECK (/d' /YOUR_PATH/oracle_ddl.sql
    sed -i '' '/CREATE UNIQUE INDEX/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(3,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(5,0)/smallint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(10,0)/int/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER(38,0)/bigint/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/NUMBER/decimal/g' /YOUR_PATH/oracle_ddl.sql
    sed -i '' 's/VARCHAR2/varchar/g' /YOUR_PATH/oracle_ddl.sql
    ```

3. Connect to MatrixOne and create a new database and table in MatrixOne:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/oracle_ddl.sql'
    ```

### Step 2: Migrate data

MatrixOne has two data migration methods to choose from: `INSERT` and `LOAD DATA`. When the amount of data is greater than 1GB, it is recommended to use `LOAD DATA` first, followed by `INSERT`.

#### LOAD DATA

Use DBeaver to export the Oracle data table to CSV format first, and use MatrixOne's parallel loading function to migrate the data to MatrixOne:

1. Open DBeaver, select the table to be migrated, right-click and select **Export Data** to export the Oracle data table as a CSV format file:

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

1. Use DBeaver to export data: Open DBeaver, select the table to be migrated from Oracle, right-click, and select **Export Data > SQL**. To ensure that MatrixOne directly writes to S3 when inserting, it is recommended to insert parameters in batches **The number of data rows** per statement is set to 5000:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-10.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-11.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-12.png?raw=true)

2. On the MatrixOne side, execute the SQL file:

    ```
    source '/YOUR_PATH/oracle_data.sql'
    ```

For more examples of `INSERT` operations, see [Insert Data](../Develop/import-data/insert-data.md).

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the [Complete a TPCH Test with MatrixOne](../Test/performance-testing/TPCH-test-with-matrixone.md) query example to compare the results.
