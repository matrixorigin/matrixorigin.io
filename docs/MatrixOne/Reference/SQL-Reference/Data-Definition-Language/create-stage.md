# **CREATE STAGE**

## **Description**

The `CREATE STAGE` command is used in the MatrixOne database to create a named internal or external data stage for **data export**. By creating a data stage and exporting data to it, you can download data files to your local system or store them in cloud storage services.

- **Internal Stage**: Internal stages store data files within the MatrixOne system. Internal stages can be either permanent or temporary.

- **External Stage**: External stages reference data files stored outside the MatrixOne environment. Currently, the following cloud storage services are supported:

    - Amazon S3 buckets
    - Aliyun buckets

The storage location can be private/protected or public—however, data held in archival cloud storage classes that require restoration before retrieval cannot be accessed.

An internal or external stage can include a directory table. Directory tables maintain a catalog of staged file directories in cloud storage.

- Configure a specified path to control the write permissions for user `SELECT INTO` operations. After creation, users can only write to the set `STAGE` path.

- If no `STAGE` is created or all `STAGE` instances are `DISABLED`, users can write to any path permitted by the operating system or object storage permissions.

- If not using a `STAGE`, users must forcefully include `credential` information during `SELECT INTO` operations.

!!! note
    1. Cluster administrators (i.e., root users) and tenant administrators can create data stages.
    2. Once created, data tables can only be imported to the paths specified in the STAGE.

## **Syntax**

```
> CREATE STAGE [ IF NOT EXISTS ] { stage_name }
   { StageParams }
   [ directoryTableParams ]
   [ COMMENT = '<string_literal>' ]

StageParams (for Amazon S3) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>'}

StageParams (for Aliyun OSS) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>'}

StageParams (for File System) :
URL= 'filepath'

directoryTableParams :
ENABLE = { TRUE | FALSE }
```

### Explanations

- `IF NOT EXISTS`: An optional parameter used to check whether a stage with the same name already exists when creating a stage, avoiding duplicate creations.

- `stage_name`: The name of the stage to be created.

- `StageParams`: This parameter group is used to specify the stage's configuration parameters.

    - `endpoint`: The connection URL for the stage, indicating the location of the object storage service. This URL's content may vary for object storage services like Amazon S3, Aliyun OSS, or a file system. For example s3.us-west-2.amazonaws.com

    - `CREDENTIALS`: This JSON object contains the credentials required to connect to the object storage service, such as `access_key_id`, `secret_access_key`, etc.

- `directoryTableParams`: This parameter group is used to specify the configuration of a directory table associated with the stage.

    - `ENABLE`: Indicates whether the directory table is enabled, with values `TRUE` or `FALSE` values.

## **Examples**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- Create internal data stage
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- Export data from the table to data stage
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- You can see your exported table in your local directory

-- After setting the data stage, the data table can only be exported to the specified path, and an error will be reported when exporting to other paths
mysql> SELECT * FROM user INTO OUTFILE '~/tmp/csv2/user.txt';
ERROR 20101 (HY000): internal error: stage exists, please try to check and use a stage instead
```
