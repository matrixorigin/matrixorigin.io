# **ALTER STAGE**

## **Description**

`ALTER STAGE` is used to modify the attributes of an existing named internal or external stage.

!!! note
    Cluster administrators (i.e., root users) and account administrators can modify the data stage.

## **Syntax**

```
> ALTER STAGE [ IF EXISTS ] { stage_name }
   { StageParams }
   [ directoryTableParams ]
   [ COMMENT = '<string_literal>' ]

StageParams (for Amazon S3) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>'}

StageParams (for Aliyun OSS) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>'}

StageParams (for File System) :
URL= 'filepath'

directoryTableParams :
ENABLE = { TRUE | FALSE }
```

### Explanations

- `IF NOT EXISTS`: An optional parameter used to check whether a stage with the same name already exists when modifying a stage, avoiding duplicate creations.

- `stage_name`: The name of the stage to be modified.

- `StageParams`: This parameter group is used to specify the stage's configuration parameters.

    - `endpoint`: The connection URL for the stage, indicating the location of the object storage service. This URL's content may vary for object storage services like Amazon S3, Aliyun OSS, or a file system. For example s3.us-west-2.amazonaws.com

    - `CREDENTIALS`: This JSON object contains the credentials required to connect to the object storage service, such as `access_key_id`, `secret_access_key`, `bucket`, etc.

    - `role_arn`, `external_id`: These two parameters are typically related to cross-account access permissions and are used for authorization. __Note:__ MatrixOne does not support these two parameters.

    - `filepath`: Specifies the file's path to loading or unloading. It can support regular expressions, for example, `/files/*.csv`.

    - `region`: The region of the object storage service.

    - `compression`: The compression format of the S3 files, with options like `"auto"`, `"none"`, `"gzip"`, `"bz2"`, `and "lz4"`.

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

mysql> SHOW STAGES;
+------------+-----------------------------+---------+---------+
| STAGE_NAME | URL                         | STATUS  | COMMENT |
+------------+-----------------------------+---------+---------+
| stage1     | /Users/Prinz/03testrepo/csv | ENABLED |         |
+------------+-----------------------------+---------+---------+
1 row in set (0.01 sec)

-- modify the stage1
mysql> ALTER STAGE stage1 SET COMMENT 'user stage';

mysql> SHOW STAGES;
+------------+-----------------------------+---------+------------+
| STAGE_NAME | URL                         | STATUS  | COMMENT    |
+------------+-----------------------------+---------+------------+
| stage1     | /Users/Prinz/03testrepo/csv | ENABLED | user stage |
+------------+-----------------------------+---------+------------+
1 row in set (0.00 sec)

-- disable the data stage named 'stage1'
mysql> ALTER STAGE stage1 SET ENABLE = FALSE;
Query OK, 0 rows affected (0.00 sec)

-- Try to export the data of the user table to the data stage named 'stage1:/user.csv', but stage1 has been disabled, so it is no longer available, and an error is reported
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
ERROR 20101 (HY000): internal error: stage 'stage1' is invalid, please check
```
