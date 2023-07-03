# Load data from S3

## Overview

S3 (Simple Storage Service) object storage refers to Amazon's Simple Storage Service. You can also store almost any type and size of data with S3-compatible object storage, including data lakes, cloud-native applications, and mobile apps. If you are unfamiliar with S3 object service, you may look up some basic introductions in [AWS](https://docs.aws.amazon.com/s3/index.html).

AWS S3 has been remarkably successful for over a decade, so it became the de facto standard for object storage. Thus almost every mainstream public cloud vendors provide an S3-compatible object storage service.

MatrixOne supports loading files from S3-compatible object storage services into databases. MatrixOne supports AWS and mainstream cloud vendors in China (Alibaba Cloud, Tencent Cloud).

In MatrixOne, there are two methods to import the data from S3-compatible object storage:

* Use `Load data` with an s3option to load the file into MatrixOne. This method will load the data into MatrixOne, and all next queries will happen inside MatrixOne.
* Create an `external table` with an s3option mapping to an S3 file, and query this external table directly. This method allows data access through an S3-compatible object storage service; each query's networking latency will be counted.

## Method 1: LOAD DATA

### Syntax

```sql
LOAD DATA
    | URL s3options {"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>', "compression"='<string>'}
    INTO TABLE tbl_name
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
    ]
    [IGNORE number {LINES | ROWS}]
    [PARALLEL {'TRUE' | 'FALSE'}]
```

**Parameter Description**

|Parameter|Description|
|:-:|:-:|
|endpoint|A endpoint is a URL that can conncect to object storage service. For example: s3.us-west-2.amazonaws.com|
|access_key_id| Access key ID |
|secret_access_key| Secret access key |
|bucket| S3 Bucket to access |
|filepath| relative file path. regex expression is supported as /files/*.csv. |
|region| object storage service region|
|compression| Compressed format of S3 files. If empty or "none", it indicates uncompressed files. Supported fields or Compressed format are "auto", "none", "gzip", "bz2", and "lz4".|

The other paramaters are identical to a ordinary LOAD DATA, see [LOAD DATA](../../../Reference/SQL-Reference/Data-Manipulation-Language/load-data.md) for more details.

**Statement Examples**:

```sql
# LOAD a csv file from AWS S3 us-east-1 region, test-load-mo bucket, without compression
LOAD DATA URL s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-load-mo', "filepath"='test.csv', "region"='us-east-1', "compression"='none'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

# LOAD all csv files from Alibaba Cloud OSS Shanghai region, test-load-data bucket, without compression
LOAD DATA URL s3option{"endpoint"='oss-cn-shanghai.aliyuncs.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-load-data', "filepath"='/test/*.csv', "region"='oss-cn-shanghai', "compression"='none'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

# LOAD a csv file from Tencent Cloud COS Shanghai region, test-1252279971 bucket, without bz2 compression
LOAD DATA URL s3option{"endpoint"='cos.ap-shanghai.myqcloud.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-1252279971', "filepath"='test.csv.bz2', "region"='ap-shanghai', "compression"='bz2'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';
```

!!! note
    MatrixOne provides security assurance for S3 authentication information, such as `access_key_id` and `secret_access_key` sensitive information will be hidden in the system table (statement_info) records to ensure your account security.

### Tutorial: Load a file from AWS S3

In this tutorial, we will walk you through the process of loading a **.csv** file from AWS S3; we assume that you already have an AWS account and already have your data file ready in your S3 service. If you do not already have that, please sign up and upload your data file first; you may check on the AWS S3 [official tutorial](https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html). The process for Alibaba Cloud OSS and Tencent Cloud COS is similar to AWS S3.

!!! note
    This code example does not show account information such as access_key_id and secret_access_key because of account privacy.
    You can read this document to understand the main steps; specific data and account information will not be shown.

1. Download the [data file](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/char_varchar_1.csv). Enter into **AWS S3 > buckets**, create a bucket **test-loading** with a public access and upload the file *char_varchar_1.csv*.

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket.png?raw=true"  style="zoom: 60%;" />

    ![public block](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket_public_block.png?raw=true)

2. Get or create your AWS api key. Enter into **Your Account Name > Security Credentials**, get your existing Access Key or create a new one.

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/security_credential.png?raw=true"  style="zoom: 60%;" />

    ![Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/access_key.png?raw=true)

    You can get the access key id and secret access key from the downloaded credentials or this webpage.

    ![Retrieve Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/retrieve_access_key.png?raw=true)

3. Launch the MySQL Client, create tables in MatrixOne, for example:

    ```sql
    create database db;
    use db;
    drop table if exists t1;
    create table t1(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225));
    ```

4. Import the file into MatrixOne:

    ```
    LOAD DATA URL s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='char_varchar_1.csv', "region"='us-east-1', "compression"='none'} INTO TABLE t1;
    ```

5. After the import is successful, you can run SQL statements to check the result of imported data:

    ```sql
    mysql> select * from t1;
    +-----------+-----------+-----------+-----------+
    | col1      | col2      | col3      | col4      |
    +-----------+-----------+-----------+-----------+
    | a         | b         | c         | d         |
    | a         | b         | c         | d         |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | aa,aa     | bb,bb     | cc,cc     | dd,dd     |
    | aa,       | bb,       | cc,       | dd,       |
    | aa,,,aa   | bb,,,bb   | cc,,,cc   | dd,,,dd   |
    | aa',',,aa | bb',',,bb | cc',',,cc | dd',',,dd |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa",aa    | bb",bb    | cc",cc    | dd",dd    |
    | aa"",aa   | bb"",bb   | cc"",cc   | dd"",dd   |
    |           |           |           |           |
    |           |           |           |           |
    | NULL      | NULL      | NULL      | NULL      |
    |           |           |           |           |
    | "         | "         | "         | "         |
    | ""        | ""        | ""        | ""        |
    +-----------+-----------+-----------+-----------+
    21 rows in set (0.03 sec)
    ```

## Method 2: Specify S3 file to an external table

### Syntax

```sql
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>', "compression"='<string>'}     
[{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
]
[IGNORE number {LINES | ROWS}];
```

!!! note
    MatrixOne only supports `select` on external tables. `Delete`, `insert`, and `update` are not supported.

**Parameter Description**

|Parameter|Description|
|:-:|:-:|
|endpoint|A endpoint is a URL that can conncect to object storage service. For example: s3.us-west-2.amazonaws.com|
|access_key_id| Access key ID |
|secret_access_key| Secret access key |
|bucket| S3 Bucket to access |
|filepath| relative file path. regex expression is supported as /files/*.csv. |
|region| object storage service region|
|compression| Compressed format of S3 files. If empty or "none", it indicates uncompressed files. Supported fields or Compressed format are "auto", "none", "gzip", "bz2", and "lz4".|

The other paramaters are identical to a ordinary LOAD DATA, see [LOAD DATA](../../../Reference/SQL-Reference/Data-Manipulation-Language/load-data.md) for more details.

For more information about External Table, see [CREATE EXTERNAL TABLE](../../../Reference/SQL-Reference/Data-Definition-Language/create-external-table.md).

**Statement Examples**:

```sql
## Create a external table for a .csv file from AWS S3
create external table t1(col1 char(225)) url s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='test.csv', "region"='us-east-1', "compression"='none'} fields terminated by ',' enclosed by '\"' lines terminated by '\n';

## Create a external table for a .csv file compressed with BZIP2 from Tencent Cloud
create external table t1(col1 char(225)) url s3option{"endpoint"='cos.ap-shanghai.myqcloud.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-1252279971', "filepath"='test.csv.bz2', "region"='ap-shanghai', "compression"='bz2'} fields terminated by ',' enclosed by '\"' lines terminated by '\n' ignore 1 lines;
```

### Tutorial: Create an external table with S3 file

This tutorial will walk you through the whole process of creating an external table with a **.csv** file from AWS S3.

!!! note
    This code example does not show account information such as access_key_id and secret_access_key because of account privacy.
    You can read this document to understand the main steps; specific data and account information will not be shown.

1. Download the [data file](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/char_varchar_1.csv). Enter into **AWS S3 > buckets**, create a bucket **test-loading** with a public access and upload the file *char_varchar_1.csv*.

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket.png?raw=true"  style="zoom: 60%;" />

    ![public block](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket_public_block.png?raw=true)

2. Get or create your AWS api key. Enter into **Your Account Name > Security Credentials**, get your existing Access Key or create a new one.

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/security_credential.png?raw=true"  style="zoom: 60%;" />

    ![Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/access_key.png?raw=true)

    You can get the access key id and secret access key from the downloaded credentials or this webpage.

    ![Retrieve Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/retrieve_access_key.png?raw=true)

3. Launch the MySQL Client, and specify the S3 file to an external table:

    ```sql
    create database db;
    use db;
    drop table if exists t1;
    create external table t1(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225)) url s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='char_varchar_1.csv', "region"='us-east-1', "compression"='none'} fields terminated by ',' enclosed by '\"' lines terminated by '\n';
    ```

4. After the import is successful, you can run SQL statements to check the result of the imported data. You can see that the query speed is significantly slower than querying from a local table.

    ```sql
    select * from t1;
    +-----------+-----------+-----------+-----------+
    | col1      | col2      | col3      | col4      |
    +-----------+-----------+-----------+-----------+
    | a         | b         | c         | d         |
    | a         | b         | c         | d         |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | aa,aa     | bb,bb     | cc,cc     | dd,dd     |
    | aa,       | bb,       | cc,       | dd,       |
    | aa,,,aa   | bb,,,bb   | cc,,,cc   | dd,,,dd   |
    | aa',',,aa | bb',',,bb | cc',',,cc | dd',',,dd |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa",aa    | bb",bb    | cc",cc    | dd",dd    |
    | aa"",aa   | bb"",bb   | cc"",cc   | dd"",dd   |
    |           |           |           |           |
    |           |           |           |           |
    | NULL      | NULL      | NULL      | NULL      |
    |           |           |           |           |
    | "         | "         | "         | "         |
    | ""        | ""        | ""        | ""        |
    +-----------+-----------+-----------+-----------+
    21 rows in set (1.32 sec)
    ```

5. (Optional)If you need to import external table data into a data table in MatrixOne, you can use the following SQL statement:

    Create a new table t2 in MatrixOne:

    ```sql
    create table t2(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225));
    ```

    Import the external table *t1* to *t2*:

    ```sql
    insert into t2 select * from t1;
    ```
