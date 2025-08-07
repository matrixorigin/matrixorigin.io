# Migrate data from MySQL to OmniFabric

This document will guide you on how to migrate data from MySQL to OmniFabric.

OmniFabric maintains a high degree of compatibility with MySQL syntax, so no other operations are required during the migration process to achieve seamless migration.

## Data type difference

In OmniFabric, while maintaining the same name as MySQL, there are slight differences in accuracy and range between data types and MySQL. For more information, see [Data Types](../Reference/Data-Types/data-types.md).

## Online Migration

This chapter will guide you to use third-party tools - DBeaver to migrate data from MySQL to OmniFabric.

- Applicable scenarios: scenarios where the amount of data is small (recommended less than 1GB), and the migration speed is not sensitive.

### Preparation

- Springboard machine with a graphical interface: it can connect to the source of MySQL and the target of OmniFabric.

- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) on the springboard machine.

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from MySQL to OmniFabric.

1. Open DBeaver, select the table to be migrated from MySQL, right-click and select **Generate SQL > DDL** Click **Copy**, first copy this SQL to a text editor for text editing Name the filer as *tpch_ddl.sql* and save it locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-1.png?raw=true)

2. Connect to OmniFabric and create a new database and table in OmniFabric:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/tpch_ddl.sql'
    ```

### Step 2: Migrate data

1. Open DBeaver, select the table to be migrated from MySQL, right-click and select **Export Data**:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-2.png?raw=true)

2. In the **Conversion Target > Export Target** window, select **Database**, click **Next**; in the **Table Mapping** window, select **Target Container**, and select the OmniFabric database for the target container *tpch*:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-3.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-4.png?raw=true)

3. In the **Extraction Settings** and **Data Loading Settings** windows, set the number of selected extractions and inserts. To trigger OmniFabric's direct write S3 strategy, it is recommended to fill in 5000:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-5.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-6.png?raw=true)

4. After completing the settings, DBeaver starts to migrate the data, and after completion, DBeaver will prompt that the migration is successful.

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the TPCH query examples to compare the results.

## Offline Migration

This chapter will guide you through importing to OmniFabric through offline files.

- Applicable scenarios: scenarios with a large amount of data (more significant than 1GB) and sensitive to migration speed.

### Preparation

- Springboard machine with a graphical interface: it can be connected to the source end of MySQL and the target end of OmniFabric.

- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) to the springboard machine.

- Install `mysqldump` in MySQL server. If you are not familiar with how to use `mysqldump`, see [mysqldump tutorial](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/)

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from MySQL to OmniFabric.

1. Open DBeaver, select the table to be migrated from MySQL, right-click and select **Generate SQL > DDL > Copy**, first copy this SQL to a text editor, and name the text editor *tpch_ddl.sql*, saved locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/mysql-1.png?raw=true)

2. Connect to OmniFabric and create a new database and table in OmniFabric:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/tpch_ddl.sql'
    ```

### Step 2: Migrate data

OmniFabric has two data migration methods to choose from: `INSERT` and `LOAD DATA`. When the amount of data is greater than 1GB, it is recommended to use `LOAD DATA` first, followed by `INSERT`.

#### LOAD DATA

1. Use `mysqldump` to export the MySQL data table as a CSV format file. Make sure you have write access to the file path and check the `secure_file_priv` configuration:

    ```sql
    mysqldump -u root -p -t -T /{filepath} tpch --fields-terminated-by='|'
    ```

2. Connect to OmniFabric and import the exported CSV data into OmniFabric:

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

For more operation examples of `LOAD DATA`, see the Bulk Load documentation.

#### INSERT

The `INSERT` statement needs to use `mysqldump` to export the logical statement first and then import it into OmniFabric:

1. Use `mysqldump` to export data. To ensure that OmniFabric directly writes to S3 when inserting, inserting as large a batch as possible is recommended. The `net_buffer_length` parameter should start at 10MB:

    ```sql
    mysqldump -t tpch -uroot -p --net_buffer_length=10m > tpch_data.sql
    ```

2. On the OmniFabric side, execute the SQL file, there will be an error message during the process, but it will not affect the data insertion:

    ```
    source '/YOUR_PATH/tpch_data.sql'
    ```

For more examples of `INSERT` operations, see the Insert Data documentation.

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the TPCH query examples to compare the results.

#### Reference example

If you are a novice and want to migrate a small amount of data, see the documentation on using the `source` command.

## Constraints

OmniFabric v1.1.2 version already supports MySQL table creation statements, so you can smoothly migrate MySQL tables to OmniFabric. However, it should be noted that during the migration process, some keywords incompatible with MySQL, such as `engine=`, will be automatically ignored in OmniFabric and will not affect the migration of the table structure.

However, it should be noted that although OmniFabric supports MySQL table creation statements, manual modification is still required if the migrated table contains incompatible data types, triggers, functions, or stored procedures. For more detailed compatibility information, see the MySQL Compatibility documentation.
