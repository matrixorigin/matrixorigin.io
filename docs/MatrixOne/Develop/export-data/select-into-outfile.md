# Export data by SELECT INTO

There are two methods to export data with MatrixOne:

- `SELECT INTO...OUTFILE`
- `modump`

This document will introduce about how to export data with `SELECT INTO...OUTFILE`.

`SELECT...INTO OUTFILE` statement exports a table data into a text file on the server host.

## Syntax

The syntax for this statement combines a regular **SELECT** command with **INTO OUTFILE filename** at the end. The default output format is the same as it is for the LOAD DATA command. So, the following statement exports the **test** table into **/root/test** as a tab-delimited, linefeed-terminated file.

```
mysql> SELECT * FROM TEST
    -> INTO OUTFILE '/root/test.csv';
```

You can change the output format using various options to indicate how to quote and delimit columns and records. Using the following code to export the *TEST* table in a CSV format with CRLF-terminated lines:

```
mysql> SELECT * FROM TEST INTO OUTFILE '/root/test.csv'
   -> FIELDS TERMINATED BY ',' ENCLOSED BY '"'
   -> LINES TERMINATED BY '\r\n';
```

The `SELECT ... INTO OUTFILE` has the following properties −

- The output file is created directly by the MatrixOne server, so the filename should indicate where you want the file to be written on the server host. MatrixOne doesn't support export the file to a client-side file system.
- You must have the privilege to execute the `SELECT ... INTO` statement.
- The output file must not already exist. This prevents MatrixOne from clobbering files that may be important.
- You should have a login account on the server host or some way to retrieve the file from that host. Otherwise, the `SELECT ... INTO OUTFILE` command will most likely be of no value to you.

## Example

### Before you start

Make sure you have already [Deployed standalone MatrixOne](../../Get-Started/install-standalone-matrixone.md).

!!! note
    If you install MatrixOne by `docker`, the directory is inside the docker image by default. To work with local directory, you need to bind a local directory to the container. In the following example, the local file system path `${local_data_path}/mo-data` is binded to the MatrixOne docker image, with a mapping to the `/mo-data` path. For more information, see [Docker Mount Volume tutorial](https://www.freecodecamp.org/news/docker-mount-volume-guide-how-to-mount-a-local-directory/).

```
sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:1.2.3
```

### Steps

1. Create tables in MatrixOne:

    ```sql
    create database aaa;
    use aaa;
    CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
    insert into user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');
    select * from user;
    +------+-----------+------+
    | id   | user_name | sex  |
    +------+-----------+------+
    |    1 | weder     | man  |
    |    2 | tom       | man  |
    |    3 | wederTom  | man  |
    +------+-----------+------+
    ```

2. For installation with source code or binary file, export the table to your local directory, for example, *~/tmp/export_demo/export_datatable.txt*.

    ```
    select * from user into outfile '~/tmp/export_demo/export_datatable.txt'
    ```

    For installation with docker, export the your mounted directory path of container as the following example. The directory `mo-data` refers to the local path of `~/tmp/docker_export_demo/mo-data`.

    ```
    select * from user into outfile 'mo-data/export_datatable.txt';
    ```

3. Check the table in your directory `export_datatable.txt`, the result is as below:

    ```
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    3,"wederTom","man"
    ```
