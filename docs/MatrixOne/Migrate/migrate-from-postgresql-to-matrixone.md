# Migrate data from PostgreSQL to MatrixOne

This document will guide you in migrating data from PostgreSQL to MatrixOne.

PostgreSQL is currently one of the world's most advanced open-source relational databases, with an extensive range of data types, object types, SQL models, and other features. It holds a significant position in various fields, such as enterprise, education, and research. Depending on the size of your PostgreSQL data, this document recommends utilizing online and offline migration methods.

## Data type difference

There are several differences in data types between MatrixOne and the ones provided by PostgreSQL. Some differences can be replaced using alternative types, while others might not be supported temporarily. Additionally, PostgreSQL supports a three-tier logical structure: Database - Schema - Table. This means you can create multiple schemas within a single database containing multiple tables. This hierarchical structure allows for better organization and data management. On the other hand, MatrixOne follows a two-tier logical structure: Database - Table. In MatrixOne, tables are directly created within the database, resulting in some differences during the migration process.

The specific list is as follows:

|PostgreSQL |	MatrixOne |
|---|---|
|serial |replaced by auto-incrementing columns|
|money |replace with decimal|
|bytea |replace with binary or varbinary|
|geometric |Not supported yet|
|network adress |replace with char or varchar|
|bit string	|Not supported yet|
|text search	|Not supported yet|
|xml	|Not supported yet|
|array	|Not supported yet|
|composite	|Not supported yet|
|range	|Not supported yet|
|domain	|Not supported yet|
|object identifier	|Not supported yet|
|pg_lsn	|Not supported yet|
|pseudo	|Not supported yet|

## Online Migration

This chapter will guide you to use third-party tools - DBeaver to migrate data from PostgreSQL to MatrixOne.

Through DBeaver, the source data is obtained in batches, and then the data is inserted into the target database as `INSERT`. If an error is reported during the migration process that the heap space is insufficient, please try to adjust the size of each batch of fetched and inserted data.

- Applicable scenarios: scenarios where the amount of data is small (recommended less than 1GB), and the migration speed is not sensitive.

- The recommended configuration of the springboard machine where DBeaver is installed: RAM 16GB or more.

### Preparation

- Springboard machine with a graphical interface: it can connect to the source of Oracle and the target of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) on the springboard machine.
- DDL translation tool: download [pg2mysql](https://github.com/dolthub/pg2mysql) on the springboard machine, and note that the springboard machine needs to have a Python environment.

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from PostgreSQL to MatrixOne.

1. Open DBeaver, select the table to be migrated from Oracle, right-click and select **Generate SQL > DDL** Click **Copy**, first copy this SQL to a text editor for text editing Name the filer as *pg_ddl.sql* and save it locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-1.png?raw=true)

2. Use `pg2mysql` translation tool to convert *pg_ddl.sql* file to MySQL format DDL:**

    a. First, run the following command to replace `bpchar` in the *pg_ddl.sql* file with `char`:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/bpchar/char/g' pg_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/bpchar/char/g' pg_ddl.sql
        ```

    b. Next, use the `pg2mysql` translation tool to convert the *pg_ddl.sql* file to MySQL format and save the output to the *mysql_ddl.sql* file:

        ```
        # The commands executed by both Linux and MacOS systems are as follows:
        ./pg2mysql.pl < pg_ddl.sql > mysql_ddl.sql
        ```

    c. The converted DDL retains the original Postgresql schema name. If necessary, you can execute the following command, replacing the schema name with the database name in MySQL:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/{schema_name}/{database_name}/g' mysql_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/{schema_name}/{database_name}/g' mysql_ddl.sql
        ```

    d. Finally, you may need to uniformly replace `numeric` in the *mysql_ddl.sql* file with `decimal`, which can be achieved by the following command:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/numeric/decimal/g' mysql_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/numeric/decimal/g' mysql_ddl.sql
        ```

3. Connect to MatrixOne and create a new database and table in MatrixOne:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/mysql_ddl.sql'
    ```

### Step 2: Migrate data

1. Open DBeaver, select the table to be migrated from PostgreSQL, right-click and select **Export Data**:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-2.png?raw=true)

2. In the **Conversion Target > Export Target** window, select **Database**, click **Next**; in the **Table Mapping** window, select **Target Container**, and select the MatrixOne database for the target container *tpch*:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-3.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-4.png?raw=true)

3. In the **Extraction Settings** and **Data Loading Settings** windows, set the number of selected extractions and inserts. To trigger MatrixOne's direct write S3 strategy, it is recommended to fill in 5000:

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-5.png?raw=true)

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-6.png?raw=true)

4. After completing the settings, DBeaver starts to migrate the data, and after completion, DBeaver will prompt that the migration is successful.

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the [Complete TPCH testing](../Test/performance-testing/TPCH-test-with-matrixone.md) query example to compare the results.

## Offline Migration

This chapter will guide you through importing to MatrixOne through offline files.

- Applicable scenarios: scenarios with a large amount of data (more significant than 1GB) and sensitive to migration speed.

### Preparation

- Springboard machine with a graphical interface: it can be connected to the source end of PostgreSQL and the target end of MatrixOne.
- Data Migration Tool: [Download DBeaver](https://dbeaver.io/download/) to the springboard machine.

- Install `pgdump` in PostgreSQL server. If you are not familiar with how to use `pgdump`, see [pgdump tutorial](https://www.postgresql.org/docs/current/app-pgdump.html)

### Step 1: Migrate table structure

Here we take the TPCH dataset as an example and migrate the 8 tables of the TPCH dataset from MySQL to MatrixOne.

1. Open DBeaver, select the table to be migrated from PostgreSQL, right-click and select **Generate SQL > DDL > Copy**, first copy this SQL to a text editor, and name the text editor *pg_ddl.sql*, saved locally on the springboard machine.

    ![](https://github.com/matrixorigin/artwork/blob/main/docs/migrate/PostgreSQL-1.png?raw=true)

2. Use `pg2mysql` translation tool to convert *pg_ddl.sql* file to MySQL format DDL:**

    a. First, run the following command to replace `bpchar` in the *pg_ddl.sql* file with `char`:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/bpchar/char/g' pg_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/bpchar/char/g' pg_ddl.sql
        ```

    b. Next, use the `pg2mysql` translation tool to convert the *pg_ddl.sql* file to MySQL format and save the output to the *mysql_ddl.sql* file:

        ```
        # The commands executed by both Linux and MacOS systems are as follows:
        ./pg2mysql.pl < pg_ddl.sql > mysql_ddl.sql
        ```

    c. The converted DDL retains the original Postgresql schema name. If necessary, you can execute the following command, replacing the schema name with the database name in MySQL:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/{schema_name}/{database_name}/g' mysql_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/{schema_name}/{database_name}/g' mysql_ddl.sql
        ```

    d. Finally, you may need to uniformly replace `numeric` in the *mysql_ddl.sql* file with `decimal`, which can be achieved by the following command:

        ```
        # The commands executed by the Linux system are as follows:
        sed -i 's/numeric/decimal/g' mysql_ddl.sql

        # For MacOS systems, the commands used are as follows:
        sed -i '' 's/numeric/decimal/g' mysql_ddl.sql
        ```

3. Connect to MatrixOne and create a new database and table in MatrixOne:

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/mysql_ddl.sql'
    ```

### Step 2: Migrate data

MatrixOne has two data migration methods to choose from: `INSERT` and `LOAD DATA`. When the amount of data is greater than 1GB, it is recommended to use `LOAD DATA` first, followed by `INSERT`.

#### LOAD DATA

1. Export the PostgreSQL data table to CSV format in the PostgreSQL database command line environment:

    ```sql
    postgres=# \c tpch;
    postgres=# COPY tpch.nation TO '/{filepath}/nation.tbl' DELIMITER '|';
    postgres=# COPY tpch.region TO '/{filepath}/region.tbl' DELIMITER '|';
    postgres=# COPY tpch.customer TO '/{filepath}/customer.tbl' DELIMITER '|';
    postgres=# COPY tpch.part TO '/{filepath}/part.tbl' DELIMITER '|';
    postgres=# COPY tpch.supplier TO '/{filepath}/supplier.tbl' DELIMITER '|';
    postgres=# COPY tpch.partsupp TO '/{filepath}/partsupp.tbl' DELIMITER '|';
    postgres=# COPY tpch.lineitem TO '/{filepath}/lineitem.tbl' DELIMITER '|';
    postgres=# COPY tpch.orders TO '/{filepath}/orders.tbl' DELIMITER '|';
    ```

2. Connect to MatrixOne and import the exported CSV data into MatrixOne:

    ```sql
    mysql> load data infile '/{filepath}/lineitem.tbl' INTO TABLE lineitem FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/nation.tbl' INTO TABLE nation FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/part.tbl' INTO TABLE part FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/customer.tbl' INTO TABLE customer FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/orders.tbl' INTO TABLE orders FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/supplier.tbl' INTO TABLE supplier FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/region.tbl' INTO TABLE region FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/partsupp.tbl' INTO TABLE partsupp FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    ```

For more operation examples of `LOAD DATA`, see [Bulk Load Overview](../Develop/import-data/bulk-load/bulk-load-overview.md).

#### INSERT

The `INSERT` statement needs to use `pgdump` to export the logical statement first and then import it into MatrixOne:

1. Use `pgdump` to export data. To ensure that MatrixOne directly writes to S3 when inserting, inserting as large a batch as possible is recommended. The `net_buffer_length` parameter should start at 10MB:

    ```sql
    $ pg_dump -U postgres --no-acl --no-owner --inserts --rows-per-insert 5000  --format p --data-only --schema=tpch tpch -f pg_data.sql
    ```

2. On the MatrixOne side, execute the SQL file, there will be an error message during the process, but it will not affect the data insertion:

    ```
    source '/YOUR_PATH/pg_data.sql'
    ```

For more examples of `INSERT` operations, see [Insert Data](../Develop/import-data/insert-data.md).

### Step 3: Check the data

After the migration is complete, the data can be inspected as follows:

- Use `select count(*) from <table_name>` to confirm whether the data volume of the source database and target databases' data volume is consistent.

- Compare the results through related queries; you can also refer to the [Complete a TPCH Test with MatrixOne](../Test/performance-testing/TPCH-test-with-matrixone.md) query example to compare the results.

#### Reference example

If you are a novice and want to migrate a small amount of data, see [Import data by using the `source` command](../Develop/import-data/bulk-load/using-source.md).
