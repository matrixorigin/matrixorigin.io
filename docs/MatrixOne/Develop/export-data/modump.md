# The mo-dump tool writes out

MatrixOne supports two ways to export data:

- `SELECT INTO...OUTFILE`
- `mo-dump`

This document focuses on how to export data using `mo-dump`.

## What is a mo-dump

`mo-dump` is a client-side utility for MatrixOne that, like `mysqldump`, can be used to back up a MatrixOne database by exporting a file of type `.sql` containing SQL statements executable to recreate the original database.

With the `mo-dump` tool, you must have access to the server running the MatrixOne instance. You must also have user rights to the exported database.

## mo-dump syntax structure

```bash
./mo-dump -u ${user} -p ${password} \
    -h ${host} -P ${port} -db ${database}\
    [--local-infile=true] [-csv]\
    [-no-data] [-tbl ${table}...]\
    -net-buffer-length ${net-buffer-length} > {importStatement.sql}
```

**Parameter interpretation**

- **-u \[user]**: Username to connect to the MatrixOne server. Only users with database and table read access can use the `mo-dump` utility, which defaults to `dump`.

- **-p \[password]**: Valid password for the MatrixOne user. Default value: `111`.

- **-h \[host]**: Host IP address of the MatrixOne server. Default value: `127.0.0.1`.

- **-P \[port]**: Port of the MatrixOne server. Default value: `6001`.

- **-db \[databaseName]**: Required parameter. The name of the database to back up. Multiple databases can be specified, separated by `,` database names.

- **-net-buffer-length \[packet size]**: Packet size, the total size of SQL statement characters. Packets are the basic unit of SQL exported data. If parameters are not set, the default is 1048576 Byte(1M) and the maximum is 16777216 Byte(16M). If the parameter here is set to 16777216 Byte(16M), then when data larger than 16M is to be exported, the data is split into multiple 16M packets, all but the last of which are 16M in size.

- **-csv**: The default is false. When set to true means that the exported data is in csv format, the generated database and table structure and imported SQL statements are saved in the generated sql file, and the data is exported to the generated `${databaseName}_${tableName}.csv` file in the current directory.

- **--local-infile**: The default is true and takes effect only when the parameter -csv is set to true. LOAD DATA LOCAL INFILE in the sql file script output by mo-dump when the parameter is true. LOAD DATA INFILE in the sql file script output by mo-dump when the argument is false.

- **-tbl \[tableName]**: Optional argument. If the argument is empty, the entire database is exported. If you want to back up the specified table, you can add the parameters `-tbl` and `tableName` to the command. If multiple tables are specified, the table names are separated by `,` .

- **-no-data**: The default is false. When set to true means no data is exported, only the table structure.

- **> {importStatement.sql}**: Stores the output SQL statement in the file *importStatement.sql*, otherwise outputs it on the screen.

## Install the mo-dump tool

Download mode one and download mode two require the download tool wget or curl to be installed first. If you do not have it installed, install the download tool yourself first.

- Install under macOS

=== "**Download Method One: `The wget` tool downloads binary packages**"

     x86 Architecture System Installation Package:

     ```
     wget https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-x86_64.zip
     unzip mo-dump-1.0.0-darwin-x86_64.zip
     ```

     ARM Architecture System Installation Package:

     ```
     wget https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-arm64.zip
     unzip mo-dump-1.0.0-darwin-arm64.zip
     ```

    If the original github address downloads too slowly, you can try downloading the mirror package from:

    ```
    wget  https://githubfast.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-xxx.zip
    ```
=== "**Download mode two: `curl` tool downloads binary packages**"

     x86 Architecture System Installation Package:

     ```
     curl -OL https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-x86_64.zip
     unzip mo-dump-1.0.0-darwin-x86_64.zip
     ```

     ARM Architecture System Installation Package:

     ```
     curl -OL https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-arm64.zip
     unzip mo-dump-1.0.0-darwin-arm64.zip
     ```

    If the original github address downloads too slowly, you can try downloading the mirror package from:

    ```
    curl -OL https://githubfast.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-darwin-xxx.zip
    ```

- Install under Linux

=== "**Download Method One: `The wget` tool downloads binary packages**"

     x86 Architecture System Installation Package:

     ```
     wget https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-x86_64.zip
     unzip mo-dump-1.0.0-linux-x86_64.zip
     ```

     ARM Architecture System Installation Package:

     ```
     wget https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-arm64.zip
     unzip mo-dump-1.0.0-linux-arm64.zip
     ```

    If the original github address downloads too slowly, you can try downloading the mirror package from:

    ```
    wget  https://githubfast.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-xxx.zip
    ```
=== "**Download mode two: `curl` tool downloads binary packages**"

     x86 Architecture System Installation Package:

     ```
     curl -OL https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-x86_64.zip
     unzip mo-dump-1.0.0-linux-x86_64.zip
     ```

     ARM Architecture System Installation Package:

     ```
     curl -OL https://github.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-arm64.zip
     unzip mo-dump-1.0.0-linux-arm64.zip
     ```

    If the original github address downloads too slowly, you can try downloading the mirror package from:

    ```
    curl -OL https://githubfast.com/matrixorigin/mo_dump/releases/download/1.0.0/mo-dump-1.0.0-linux-xxx.zip
    ```
!!! note Due to limitations of the linux kernel, mo-dump may not function properly on OS with lower kernels (less than 5.0), at which point you need to upgrade your kernel version.

## How to export a MatrixOne database using `mo-dump`

`mo-dump` is very easy to use from the command line. Open a terminal window on your local computer, go to the unzipped mo\_dump folder directory, locate the `mo-dump` executable: *mo-dump*, enter the following command, connect to MatrixOne, and export the database:

``` bash
./mo-dump -u username -p password -h host_ip_address -P port -db database > importStatement.sql 
```

## Examples

**Example 1**

If you start the terminal in the same server as the MatrixOne instance and you want to generate a single or multiple database and a backup of all the tables in it, run the following command. This command will generate a backup **of the mydb1** and **mydb2** databases and the structure and data of the tables in the *importMydb.sql* file. The *importMydb.sql* file is saved in the current directory:

```bash
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db mydb1,mydb2 > importMydb.sql 
```

**Example 2**

If you want to export data from tables within database *mydb* to *CSV* format, the data from all tables in database *mydb* will be exported in the current directory in the format `${databaseName}_${tableName}.csv` and the generated database and table structure and imported SQL statements will be saved in the *mydb.sql* file:

```bash
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db mydb -csv > mydb.sql 
```

**Example 3**

If you want to specify in the database to generate a backup of a table or tables, you can run the following command. This command will generate a structural and data backup of the *t1* and *t2* tables in database *db1*, saved in the *tab2.sql* file.

```bash
 ./mo-dump -u root -p 111 -db db1 -tbl t1,t2 > tab2.sql 
```

**Example 4**

If you want a structural backup of a table or tables in the database, you can run the following command. This command will generate the structure of the *t1* and *t2* tables in database *db1*, saved in the *tab\_nodata.sql* file.

``` bash
./mo-dump -u root -p 111 -db db1 -no-data -tbl t1,t2 > tab_nodata.sql 
```

## Limitations

* `mo-dump` does not yet support exporting data only. If you want to generate a backup of your data without a database and table structure, then you need to manually split the `.sql` file.
