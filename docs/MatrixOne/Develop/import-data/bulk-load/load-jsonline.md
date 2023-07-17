# Load jsonlines format data

This document will guide you on how to import JSONLines (that is *.jl* or *.jsonl* file) data to MatrixOne.

## About JSONLines format

JSON(JavaScript Object Notation) is a popular file format for about two decades, nowadays became de-facto of data exchange format standard, replacing XML, that was a huge buzzword in the early 2000's. If you are not familiar with JSON format, please help yourself to know about it with this [official documentation](https://www.json.org/json-en.html).

[JSONLines](https://jsonlines.org/) text format, also called newline-delimited JSON, is a convenient format for storing structured data that may be processed one record at a time. Basically, JSONL is a file format that allows one JSON object per line with lines delimited by a newline character `\n`.  Each line of the file is independent, so commas are not required at the beginning or ending of lines.  Nor does the entire contents of the file need to be enclosed in square or curly braces.

JSONLines is appealing format for data streaming. Since every new line means a separate entry makes the JSON Lines formatted file streamable. It doesn't require custom parsers. Just read a line, parse as JSON, read a line, parse as JSON… and so on.

The JSON Lines format has three requirements:

* UTF-8 Encoding: JSON allows encoding Unicode strings with only ASCII escape sequences, however those escapes will be hard to read when viewed in a text editor. The author of the JSON Lines file may choose to escape characters to work with plain ASCII files.

* Each Line is a Valid JSON Value: The most common values will be objects or arrays, but any JSON value is permitted.

* Line Separator is '\n': This means '\r\n' is also supported because surrounding white space is implicitly ignored when parsing JSON values.

## Valid JSONLines format for MatrixOne

JSONLines format only requires a valid JSON value for each line. But MatrixOne requires a more structured JSONLines format, only an JSON object or an JSON array with the same type of values and a plain structure are allowed in MatrixOne. If your JSONLines file has nested structures, MatrixOne doesn't support loading it for now.

A valid object JSONLines example:

```
{"id":1,"father":"Mark","mother":"Charlotte"}
{"id":2,"father":"John","mother":"Ann"}
{"id":3,"father":"Bob","mother":"Monika"}
```

Invalid object JSONLines example (with nested structure):

```
{"id":1,"father":"Mark","mother":"Charlotte","children":["Tom"]}
{"id":2,"father":"John","mother":"Ann","children":["Jessika","Antony","Jack"]}
{"id":3,"father":"Bob","mother":"Monika","children":["Jerry","Karol"]}
```

A valid array JSONLines example, it needs to look like a CSV format.

```
["Name", "Session", "Score", "Completed"]
["Gilbert", "2013", 24, true]
["Alexa", "2013", 29, true]
["May", "2012B", 14, false]
["Deloise", "2012A", 19, true]
```

Invalid array JSONLines example (Data type and column numbers don't match):
["Gilbert", "2013", 24, true, 100]
["Alexa", "2013", "twenty nine", true]
["May", "2012B", 14, "no"]
["Deloise", "2012A", 19, true, 40]

## Syntax

- Scenario 1: The data file is in the same machine with the MatrixOne server.

```
LOAD DATA INFILE
    {'filepath'='FILEPATH', 'compression'='COMPRESSION_FORMAT', 'format'='FILE_FORMAT', 'jsondata'='object'/'array'} INTO TABLE table_name [IGNORE x LINES/ROWS] [PARALLEL {'TRUE' | 'FALSE'}];
```

- Scenario 2: The data file is in separate machines with the MatrixOne server.

```
LOAD DATA LOCAL INFILE
    {'filepath'='FILEPATH', 'compression'='COMPRESSION_FORMAT', 'format'='FILE_FORMAT', 'jsondata'='object'/'array'} INTO TABLE table_name [IGNORE x LINES/ROWS] [PARALLEL {'TRUE' | 'FALSE'}];
```

**Parameter Description**

|Parameter|Value|Required/Optional | Description|
|:-:|:-:|:-:|:-:|
|filepath|String| Required| The file path.|
|compression|auto/none/bz2/gzip/lz4|Optional | Compression algorithm format. |
|format|csv/jsonline|Optional |the loading file format. default is csv.|
|jsondata|object/array|Optional| jsonline format. If `format` is *jsonline*, must specify *jsondata*.|
|table_name|String|Required|table name to load into|
|x|Number|Optional|lines to be ignored while loading|

**DDL guidelines for JSONLines format data**

Before load JSONLines data into MatrixOne, we need to firstly create a table. As JSON data type is not the same as MatrixOne data type, we need a guideline for DDL.

|JSON Type|MatrixOne Type|
|:-:|:-:|
|String| VARCHAR (with a certain length limit)|
|String| TEXT (without knowing the limit of this string)|
|String| DATETIME or TIMESTAMP (with format as "YYYY-MM-DD HH:MM:SS.XXXXXX")|
|String| DATE (with format as "YYYY-MM-DD")|
|String| TIME (with format as "HH-MM-SS.XXXXXX")|
|Number| INT (with interger numbers)|
|Number| FLOAT or DOUBLE (with floating numbers) |
|Boolean| BOOL(true/false)|
|Object|JSON type|
|Array| JSON type|
|Null| All types have been supported.|

For example, We can create a MatrixOne table with such a DDL for a JSONLines format file as below.

```
mysql> create table t1 (name varchar(100), session varchar(100), score int, completed bool);
```

```
["Name", "Session", "Score", "Completed"]
["Gilbert", "2013", 24, true]
["Alexa", "2013", 29, true]
["May", "2012B", 14, false]
["Deloise", "2012A", 19, true]
```

**Some examples**

These are some full SQL examples to load a JSONLines file to MatrixOne.

```
#Load a BZIP2 compressed jsonline object file
load data infile {'filepath'='data.bzip2', 'compression'='bz2','format'='jsonline','jsondata'='object'} into table db.a

#Load a plain jsonline array file
load data infile {'filepath'='data.jl', 'format'='jsonline','jsondata'='array'} into table db.a

#Load a gzip compressed jsonline array file and ignore the first line
load data infile {'filepath'='data.jl.gz', 'compression'='gzip','format'='jsonline','jsondata'='array'} into table db.a ignore 1 lines;
```

## Tutorial

In this tutorial, we will guide you through loading two jsonline files with object and array jsonformat.

1. Prepare the data files. You can also download and use the *.jl* file we prepared. The data directory needs to be with in the same machine as MatrixOne server. The following steps are illustrated with sample data.

    - Example data file 1:*[jsonline_object.jl](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/jsonline_object.jl)*
    - Example data file  2:*[jsonline_array.jl](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/jsonline_array.jl)*

2. Open your terminal, enter into the directory where the *.jl* file resides, and run the following command line to display the contents of the file:

    ```shell
    > cd /$filepath
    > head jsonline_object.jl
    {"col1":true,"col2":1,"col3":"var","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col6":"2020-09-07 00:00:00","col7":"18","col8":121.11}
    {"col1":"true","col2":"1","col3":"var","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col6":"2020-09-07 00:00:00","col7":"18","col8":"121.11"}
    {"col6":"2020-09-07 00:00:00","col7":"18","col8":"121.11","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col1":"true","col2":"1","col3":"var"}
    {"col2":1,"col3":"var","col1":true,"col6":"2020-09-07 00:00:00","col7":"18","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col8":121.11}
    > head jsonline_array.jl
    [true,1,"var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18",121.11]
    ["true","1","var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18","121.11"]
    ```

3. Install and Launch MatrixOne in the same machine, launch MySQL Client to connect to MatrixOne.

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p111
    ```

    __Note:__ If your data file is on a different machine from the MatrixOne server, that is, the data file is on the client machine you are using, then you need to use the command line to connect to the MatrixOne service host: `mysql -h <mo-host -ip> -P 6001 -uroot -p111 --local-infile`; and the imported command line needs to use `LOAD DATA LOCAL INFILE` syntax.

    !!! info
        The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](../../../Security/password-mgmt.md).

4. Create tables in MatrixOne:

    ```sql
    create database db1;
    use db1;
    drop table if exists t1;
    create table t1(col1 bool,col2 int,col3 varchar, col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float);
    drop table if exists t2;
    create table t2(col1 bool,col2 int,col3 varchar, col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float);
    ```

5. Execute `LOAD DATA` with the corresponding file path in MySQL client, import the *jsonline_object.jl*  and the file *jsonline_array.jl* into MatrixOne:

    ```sql
    load data infile {'filepath'='$filepath/jsonline_object.jl','format'='jsonline','jsondata'='object'} into table t1;
    load data infile {'filepath'='$filepath/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t2;
    ```

6. After the import is successful, you can run SQL statements to check the results of imported data:

    ```sql
    select * from t1;
    col1	col2	col3	col4	col5	col6	col7	col8
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    select * from t2;
    col1	col2	col3	col4	col5	col6	col7	col8
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    ```

!!! note
    If you use Docker to launch MatrixOne, when you try to import the jsonline file, please make sure that you have a data directory mounted to the container. You can check on the [load csv tutorial](load-csv.md) about the loading with docker installation.
