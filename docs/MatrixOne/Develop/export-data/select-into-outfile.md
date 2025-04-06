# SELECT INTO write out

MatrixOne supports the following two ways to export data:

- `SELECT INTO...OUTFILE`
- `mo-dump`

This document mainly introduces how to use `SELECT INTO...OUTFILE` to export data.

Table data can be exported to a text file or stage on the host using the `SELECT...INTO OUTFILE` syntax.

## Grammar structure

The `SELECT...INTO OUTFILE` syntax is a combination of the `SELECT` syntax and `INTO OUTFILE filename`. The default output format is the same as the `LOAD DATA` command.

```
mysql> SELECT *FROM <table_name>
    -> INTO OUTFILE '<filepath>|<stage://stage_name>';
```

You can change the output format using a variety of forms and options to represent how columns and records are referenced and separated.

Use the following code to export the *TEST*table in *.csv*format. The following lines of code are displayed with carriage returns and line feeds:

```
mysql> SELECT * FROM TEST INTO OUTFILE '/root/test.csv'
   -> FIELDS TERMINATED BY ',' ENCLOSED BY '"'
   -> LINES TERMINATED BY '\r\n';
```

**`SELECT ... INTO OUTFILE` features are as follows**:

- The exported file is created directly by the MatrixOne service, so the `filename` in the command line should point to the location of the server host where you need the file to be stored. MatrixOne does not currently support exporting files to the client file system.

- `SELECT ... INTO OUTFILE` is used to export the retrieved data to a file in a format, that is, the file to be exported is directly created by the MatrixOne service, and the exported file can only be located on the server host where MatrixOne is located, so You must have a username and password to log in to the server host where MatrixOne is located, and you must have permission to retrieve files from MatrixOne.

- You must have permission to execute `SELECT`.

- Check that there are no files with the same name in the directory where the files need to be exported, otherwise they will be overwritten by the newly exported files.

## Example

### Preparation before starting

[Stand-alone deployment of MatrixOne](../../Get-Started/install-standalone-matrixone.md) has been completed.

!!! note
    If you installed MatrixOne via `docker`, the export directory is located in the docker image by default. If you need to mount a local directory, see the following code example: the local file system path *${local_data_path}/mo-data*is mounted into the MatrixOne Docker image and mapped to the */mo-data*path. For more information, see the [Docker Mount Volume tutorial](https://www.freecodecamp.org/news/docker-mount-volume-guide-how-to-mount-a-local-directory/).

```
sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:2.1.0
```

### Steps

1. Create a new data table in MatrixOne:

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

2.Data export

- Export to local
  
   For installing and building MatrixOne using source code or binary files, export the table to a local directory, such as *~/tmp/export_demo/export_datatable.txt*. The command example is as follows:

    ```
    select * from user into outfile '~/tmp/export_demo/export_datatable.txt'
    ```

    Use Docker to install and start MatrixOne, and export to the directory path of your mounted container, as shown in the example below. The directory *mo-data*refers to the local path *~/tmp/docker_export_demo/mo-data*.

    ```
    select * from user into outfile 'mo-data/export_datatable.txt';
    ```

    - export to satge

    ```sql
    create stage stage_fs url = 'file:///Users/admin/test';
    select * from user into outfile 'stage://stage_fs/user.csv';
    ```
  
3. Check the export status:

    - Export to local
  
    ```
    (base) admin@192 test % cat export_datatable.txt 
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    3,"wederTom","man"
    ```

    - Export to stage
  
    ```bash
    (base) admin@192 test % cat user.csv 
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    3,"wederTom","man"
    ```
