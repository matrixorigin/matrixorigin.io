# **CREATE STAGE**

## **Syntax description**

`CREATE STAGE` is used to provide an efficient and secure way to interact with data from external storage (such as Amazon S3, file systems). By creating an external stage, MatrixOne can read files from external storage and quickly load them into MatrixOne database tables. For example, load a CSV file on Amazon S3 into a table.

The following external storages are currently supported:

- Amazon S3
- MinIO
- File System

## **Grammar structure**

```
> CREATE STAGE [ IF NOT EXISTS ] { stage_name }
   { StageParams }
   [ COMMENT = '<string_literal>' 

StageParams (for MinIO/Amazon S3) :
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
  
    - `URL`: Specifies the file path or directory in the file storage.

- `COMMENT`: Comment.
  
## **Example**

```sql
#file system
mysql> create stage stage_fs url = 'file:///Users/admin/test';

#substage
mysql> create stage sub_stage url = 'stage://fs_stage/test1/';

#s3
mysql>create stage stage01 url = 's3://bucket1/test' credentials = {"aws_key_id"='AKIAYOFAMAB7FM7Axxxx',"aws_secret_key"='UjuSDmekK6uXK6CrUs9YhZzY27VOk9W3qMwYxxxx',"AWS_REGION"='us-west-2','PROVIDER'='Amazon', 'ENDPOINT'='s3.us-west-2.amazonaws.com'};
```
