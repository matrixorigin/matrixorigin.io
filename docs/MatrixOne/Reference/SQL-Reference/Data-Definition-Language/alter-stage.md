# **ALTER STAGE**

## **Syntax description**

`ALTER STAGE` is used to modify the properties of an existing stage.

!!! note
    `ALTER STAGE` can only modify one parameter at a time. Therefore, if you need to update multiple parameters at the same time, such as `URL` and `COMMENT`, you need to execute multiple `ALTER STAGE` statements separately, modifying one parameter each time.

## **Grammar structure**

```
> ALTER STAGE [ IF EXISTS ] { stage_name } SET
   { StageParams }
   [ COMMENT = '<string_literal>' ]
   
StageParams (for Amazon S3) :
URL =  "s3://<bucket>[/<path>/]" CREDENTIALS = {"AWS_KEY_ID"='<string>', "AWS_SECRET_KEY"='<string>', "AWS_ROLE"='<string>', "AWS_TOKEN"='<string>', "AWS_REGION"='<string>', "COMPRESSION"='<string>', 'PROVIDER'='<string>', 'ENDPOINT'='<string>'}
                                                    
StageParams (for File System) :
URL= 'file://[/path/]'

StageParams (for sub-stage):
URL= "stage://<stagename>[/path/]"
```

## **Grammar explanation**

- `IF NOT EXISTS`: optional parameter, used to check whether a Stage with the same name already exists when creating a Stage to avoid repeated creation.

- `stage_name`: The name of the Stage to be created.

- `StageParams (for MinIO/Amazon S3)`: Configuration parameters used to specify the stage where the object is stored as MinIO or S3.

    - `URL`: Specify a file path or directory in S3 storage
    - `CREDENTIALS`: This is a JSON object containing the credential information required to connect to the object storage service.

        + `access_key_id`: Access key ID used for authentication.
        + `secret_access_key`: The secret associated with the access key ID.
        + `aws_role`: optional, used to specify the role name if an IAM role is used. Roles can be configured on AWS to assign different permissions.
        + `aws_token`: Optional, security token used for temporary access to AWS services.

+ `aws_region`: Specifies the AWS region where Amazon S3 storage is located.
         + `compression`: optional, specifies the compression type of the file.
         + `provider`: Specify the cloud storage provider.
         + `endpint`: Specifies to connect to a custom or third-party S3 API-compatible service.

- `StageParams (for File System)`: used to specify the configuration parameters of the stage stored in the file system.

    - `URL`: Specifies the file path or directory in the file storage.

- `StageParams (for sub-stage)`: Configuration parameters for sub-stage.
  
    - URL`: Specifies the file path or directory in the file storage.

- `COMMENT`: Comment.

## **Example**

```sql
create stage stage_fs url = 'file:///Users/admin/test' comment='this is a stage';

mysql> select * from mo_catalog.mo_stages where stage_name='stage_fs';
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
| stage_id | stage_name | url                      | stage_credentials | stage_status | created_time        | comment         |
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
|        1 | stage_fs   | file:///Users/admin/test |                   | disabled     | 2024-10-09 03:46:00 | this is a stage |
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
1 row in set (0.00 sec)

alter stage stage_fs set url = 'file:///Users/admin/test1';
alter stage stage_fs set comment='stage_fs has been changed';

mysql> select * from mo_catalog.mo_stages where stage_name='stage_fs';
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
| stage_id | stage_name | url                       | stage_credentials | stage_status | created_time        | comment                   |
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
|        1 | stage_fs   | file:///Users/admin/test1 |                   | disabled     | 2024-10-09 03:46:00 | stage_fs has been changed |
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
1 row in set (0.00 sec)
```
