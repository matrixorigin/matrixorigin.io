# **LOAD DATA**

## **Description**

The LOAD DATA statement reads rows from a text file into a table at a very high speed. The file can be read from the server host or a [S3 compatible object storage](../../../Develop/import-data/bulk-load/load-s3.md). `LOAD DATA` is the complement of [`SELECT ... INTO OUTFILE`](../../../Develop/export-data/select-into-outfile.md). To write data from a table to a file, use `SELECT ... INTO OUTFILE`. To read the file back into a table, use LOAD DATA. The syntax of the `FIELDS` and `LINES` clauses is the same for both statements.

## **Syntax**

```
> LOAD DATA [LOCAL]
    INFILE 'file_name'
    INTO TABLE tbl_name
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
    ]
    [LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
    ]
    [IGNORE number {LINES | ROWS}]
    [SET column_name_1=nullif(column_name_1, expr1), column_name_2=nullif(column_name_2, expr2)...]
    [PARALLEL {'TRUE' | 'FALSE'}]
```

### Input File Location

- `LOAD DATA INFILE 'file_name'`: Indicates that the data file to be loaded is on the same machine as the MatrixOne host server. `file_name` can be the relative path name of the storage location of the file, or it can be the absolute path name.

- `LOAD DATA LOCAL INFILE 'file_name'`: indicates that the data file to be loaded is not on the same machine as the MatrixOne host server; that is, the data file is on the client server. `file_name` can be the relative path name of the storage location of the file, or it can be the absolute path name.

### IGNORE LINES

The IGNORE number LINES clause can be used to ignore lines at the start of the file. For example, you can use `IGNORE 1 LINES` to skip an initial header line containing column names:

```
LOAD DATA INFILE '/tmp/test.txt' INTO TABLE table1 IGNORE 1 LINES;
```

### Field and Line Handling

For both the LOAD DATA and `SELECT ... INTO OUTFILE` statements, the syntax of the FIELDS and LINES clauses is the same. Both clauses are optional, but FIELDS must precede LINES if both are specified.

If you specify a `FIELDS` clause, each of its subclauses (`TERMINATED BY`, `[OPTIONALLY] ENCLOSED BY`) is also optional, except that you must specify at least one of them. Arguments to these clauses are permitted to contain only ASCII characters.

If you specify no `FIELDS` or `LINES` clause, the defaults are the same as if you had written this:

```
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
```

**FIELDS TERMINATED BY**

`FIELDS TERMINATED BY` specifies the delimiter for a field. The `FIELDS TERMINATED BY` values can be more than one character.

For example, to read the comma-delimited file, the correct statement is:

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',';
```

If instead you tried to read the file with the statement shown following, it would not work because it instructs `LOAD DATA` to look for tabs between fields:

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY '\t';
```

The likely result is that each input line would be interpreted as a single field. You may encounter an error of `"ERROR 20101 (HY000): internal error: the table column is larger than input data column"`.

**FIELDS ENCLOSED BY**

`FIELDS TERMINATED BY` option specifies the character enclose the input values. `ENCLOSED BY` value must be a single character. If the input values are not necessarily enclosed within quotation marks, use `OPTIONALLY` before the `ENCLOSED BY` option.

For example, if some input values are enclosed within quotation marks, some are not:

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"';
```

**LINES TERMINATED BY**

`LINES TERMINATED BY` specifies the delimiter for the a line. The `LINES TERMINATED BY` values can be more than one character.

For example, if the lines in a csv file are terminated by carriage return/newline pairs, you can load it with `LINES TERMINATED BY '\r\n'`:

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',' ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';
```

**LINE STARTING BY**

If all the input lines have a common prefix that you want to ignore, you can use `LINES STARTING BY` 'prefix_string' to skip the prefix and anything before it. If a line does not include the prefix, the entire line is skipped. Suppose that you issue the following statement:

```
LOAD DATA INFILE '/tmp/test.txt' INTO TABLE table1
  FIELDS TERMINATED BY ','  LINES STARTING BY 'xxx';
```

If the data file looks like this:

```
xxx"abc",1
something xxx"def",2
"ghi",3
```

The resulting rows are ("abc",1) and ("def",2). The third row in the file is skipped because it does not contain the prefix.

### SET

MatrixOne only supports `SET column_name=nullif(column_name,expr)`. That is, when `column_name = expr`, it returns `NULL`; otherwise, it returns the original value of `column_name`. For example, `SET a=nullif(a,1)`, if a=1, returns `NULL`; otherwise, it returns the original value of column a.

By setting the parameter, you can use `SET column_name=nullif(column_name,"null")` to return the `NULL` value in the column when loading the file.

**Example**

1. The details of the local file `test.txt` are as follows:

    ```
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    null,wederTom,"man"
    ```

2. Create a table named `user` in MatrixOne:

    ```sql
    create database aaa;
    use aaa;
    CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
    ```

3. Load `test.txt` into the table `user`:

    ```sql
    LOAD DATA INFILE '/tmp/test.txt' INTO TABLE user SET id=nullif(id,"null");
    ```

4. The result of the talbe is as below:

    ```sql
    select * from user;
    +------+-----------+------+
    | id   | user_name | sex  |
    +------+-----------+------+
    |    1 | weder     | man  |
    |    2 | tom       | man  |
    | null | wederTom  | man  |
    +------+-----------+------+
    ```

### PARALLEL

For a sizeable well-formed file, such as a *JSOLLines* file or a *CSV* file with no line breaks in a line of data, you can use `PARALLEL` to load the file in parallel to speed up the loading.

For example, for a large file of 2 G, use two threads to load; the second thread first splits and locates the 1G position, then reads and loads backward. In this way, two threads can read large files at the same time, and each thread can read 1G of data.

**Enable/Disable Parallel Loading Command Line Example**:

```sql
--  Enable Parallel Loading
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES PARALLEL 'TRUE';

--  Disable Parallel Loading
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES PARALLEL 'FALSE';

--  Parallel loading is disabled by default
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;
```

!!! note
    `[PARALLEL {'TRUE' | 'FALSE'}]` currently only support `TRUE` or `FALSE` and are not case-sensitive.

__Note:__ If the `PARALLEL` field is not added in the `LOAD` statement, for *CSV* files, parallel loading is disabled by default; for *JSOLLines* files, parallel loading is enabled by default. If there is a line terminator in the *CSV* file, such as '\n', otherwise it may cause data errors when the file is loaded. If the file is too large, manually splitting the file from the '\n' as the starting and ending point is recommended, then enabling parallel loading.

## Supported file formats

In MatrixOne's current release, `LOAD DATA` supports CSV(comma-separated values) format and JSONLines format file.
See full tutorials for loading [csv](../../../Develop/import-data/bulk-load/load-csv.md) and [jsonline](../../../Develop/import-data/bulk-load/load-jsonline.md).

### *CSV* format standard description

The *CSV* format loaded by MatrixOne conforms to the RFC4180 standard, and the *CSV* format is specified as follows:

1. Each record is on a separate line, separated by a newline character (CRLF):

    ```
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
    ```

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

2. The last record in the file can have a terminating newline or no terminating newline (CRLF):

    ```
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx
    ```

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

3. An optional header line appears as the first line of the file and has the same format as a standard record line. For example:

    ```
    field_name,field_name,field_name CRLF
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
    ```

    Imported into the table as follows:

    +------------+------------+------------+
    | field_name | field_name | field_name |
    +------------+------------+------------+
    | aaa        | bbb        | ccc        |
    | zzz        | yyy        | xxx        |
    +------------+------------+------------+

4. In the header and each record, there may be one or more fields separated by commas. Whitespace within a field is part of the field and should not be ignored. A comma cannot follow the last field in each record. For example:

    ```
    aaa,bbb,ccc
    ```

    Or:

    ```
    a aa, bbb,cc c
    ```

    Both examples are correct.

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | bbb     | ccc     |
    +---------+---------+---------+

    Or:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | a aa    |  bbb    | cc c    |
    +---------+---------+---------+

5. Each field can be enclosed in double quotes or not. Double quotes cannot appear inside a field if the field is not enclosed in double-quotes. For example:

    ```
    "aaa","bbb","ccc" CRLF
    zzz,yyy,xxx
    ```

    Or:

    ```
    "aaa","bbb",ccc CRLF
    zzz,yyy,xxx
    ```

    Both examples are correct.

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | bbb     | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

6. Fields containing line breaks (CRLF), double quotes, and commas should be enclosed in double-quotes. For example:

    ```
    "aaa","b CRLF
    bb","ccc" CRLF
    zzz,yyy,xxx
    ```

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

7. If double quotation marks are used to enclose the field, then multiple double quotation marks appearing in the field must also be enclosed in double quotation marks; otherwise, the first quotation mark of two double quotation marks in the field will be parsed as an escape character, thus keep a single, double quote. For example:

    ```
    "aaa","b","bb","ccc"
    ```

    The above *CSV* will parse `"b""bb"` into `b"bb`; if the correct field is `b""bb`, then it should be written as:

    ```
    "aaa","b""""bb","ccc"
    ```

    Or:

    ```
    "aaa",b""bb,"ccc"
    ```

    Imported into the table as follows:

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b""bb   | ccc     |
    +---------+---------+---------+

## **Examples**

The SSB Test is an example of LOAD DATA syntax. [Complete a SSB Test with MatrixOne](../../../Test/performance-testing/SSB-test-with-matrixone.md)

```
> LOAD DATA INFILE '/ssb-dbgen-path/lineorder_flat.tbl ' INTO TABLE lineorder_flat;
```

The above statement means: load the *lineorder_flat.tbl* data set under the directory path */ssb-dbgen-path/* into the MatrixOne data table *lineorder_flat*.

You can also refer to the following syntax examples to quickly understand `LOAD DATA`:

### Example 1: LOAD CSV

#### Simple example

The data in the file locally named *char_varchar.csv* is as follows:

```
a|b|c|d
"a"|"b"|"c"|"d"
'a'|'b'|'c'|'d'
"'a'"|"'b'"|"'c'"|"'d'"
"aa|aa"|"bb|bb"|"cc|cc"|"dd|dd"
"aa|"|"bb|"|"cc|"|"dd|"
"aa|||aa"|"bb|||bb"|"cc|||cc"|"dd|||dd"
"aa'|'||aa"|"bb'|'||bb"|"cc'|'||cc"|"dd'|'||dd"
aa"aa|bb"bb|cc"cc|dd"dd
"aa"aa"|"bb"bb"|"cc"cc"|"dd"dd"
"aa""aa"|"bb""bb"|"cc""cc"|"dd""dd"
"aa"""aa"|"bb"""bb"|"cc"""cc"|"dd"""dd"
"aa""""aa"|"bb""""bb"|"cc""""cc"|"dd""""dd"
"aa""|aa"|"bb""|bb"|"cc""|cc"|"dd""|dd"
"aa""""|aa"|"bb""""|bb"|"cc""""|cc"|"dd""""|dd"
|||
||||
""|""|""|
""""|""""|""""|""""
""""""|""""""|""""""|""""""
```

Create a table named t1 in MatrixOne:

```sql
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.01 sec)

mysql> create table t1(
    -> col1 char(225),
    -> col2 varchar(225),
    -> col3 text,
    -> col4 varchar(225)
    -> );
Query OK, 0 rows affected (0.02 sec)
```

Load the data file into table t1:

```sql
load data infile '<your-local-file-path>/char_varchar.csv' into table t1 fields terminated by'|';
```

The query result is as follows:

```
mysql> select * from t1;
+-----------+-----------+-----------+-----------+
| col1      | col2      | col3      | col4      |
+-----------+-----------+-----------+-----------+
| a         | b         | c         | d         |
| a         | b         | c         | d         |
| 'a'       | 'b'       | 'c'       | 'd'       |
| 'a'       | 'b'       | 'c'       | 'd'       |
| aa|aa     | bb|bb     | cc|cc     | dd|dd     |
| aa|       | bb|       | cc|       | dd|       |
| aa|||aa   | bb|||bb   | cc|||cc   | dd|||dd   |
| aa'|'||aa | bb'|'||bb | cc'|'||cc | dd'|'||dd |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa""aa    | bb""bb    | cc""cc    | dd""dd    |
| aa""aa    | bb""bb    | cc""cc    | dd""dd    |
| aa"|aa    | bb"|bb    | cc"|cc    | dd"|dd    |
| aa""|aa   | bb""|bb   | cc""|cc   | dd""|dd   |
|           |           |           |           |
|           |           |           |           |
|           |           |           |           |
| "         | "         | "         | "         |
| ""        | ""        | ""        | ""        |
+-----------+-----------+-----------+-----------+
20 rows in set (0.00 sec)
```

### Add conditional Example

Following the example above, you can modify the `LOAD DATA` statement and add `LINES STARTING BY 'aa' ignore 10 lines;` at the end of the statement to experience the difference:

```sql
delete from t1;
load data infile '<your-local-file-path>/char_varchar.csv' into table t1 fields terminated by'|' LINES STARTING BY 'aa' ignore 10 lines;
```

The query result is as follows:

```sql
mysql> select * from t1;
+---------+---------+---------+---------+
| col1    | col2    | col3    | col4    |
+---------+---------+---------+---------+
| aa"aa   | bb"bb   | cc"cc   | dd"dd   |
| aa""aa  | bb""bb  | cc""cc  | dd""dd  |
| aa""aa  | bb""bb  | cc""cc  | dd""dd  |
| aa"|aa  | bb"|bb  | cc"|cc  | dd"|dd  |
| aa""|aa | bb""|bb | cc""|cc | dd""|dd |
|         |         |         |         |
|         |         |         |         |
|         |         |         |         |
| "       | "       | "       | "       |
| ""      | ""      | ""      | ""      |
+---------+---------+---------+---------+
10 rows in set (0.00 sec)
```

As you can see, the query result ignores the first line and
and ignores the common prefix aa.

For more information on loding *csv*, see [Import the *.csv* data](../../../Develop/import-data/bulk-load/load-csv.md).

### Example 2: LOAD JSONLines

#### Simple example

The data in the file locally named *jsonline_array.jl* is as follows:

```
[true,1,"var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18",121.11,["1",2,null,false,true,{"q":1}],"1qaz",null,null]
["true","1","var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18","121.11",{"c":1,"b":["a","b",{"q":4}]},"1aza",null,null]
```

Create a table named t1 in MatrixOne:

```sql
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.01 sec)

mysql> create table t1(col1 bool,col2 int,col3 varchar(100), col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float,col9 json,col10 text,col11 json,col12 bool);
Query OK, 0 rows affected (0.03 sec)
```

Load the data file into table t1:

```
load data infile {'filepath'='<your-local-file-path>/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t1;
```

The query result is as follows:

```sql
mysql> select * from t1;
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
| col1 | col2 | col3 | col4       | col5                | col6                | col7 | col8   | col9                                  | col10 | col11 | col12 |
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | ["1", 2, null, false, true, {"q": 1}] | 1qaz  | NULL  | NULL  |
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | {"b": ["a", "b", {"q": 4}], "c": 1}   | 1aza  | NULL  | NULL  |
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
2 rows in set (0.00 sec)
```

#### Add conditional Example

Following the example above, you can modify the `LOAD DATA` statement and add `ignore 1 lines` at the end of the statement to experience the difference:

```
delete from t1;
load data infile {'filepath'='<your-local-file-path>/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t1 ignore 1 lines;
```

The query result is as follows:

```sql
mysql> select * from t1;
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
| col1 | col2 | col3 | col4       | col5                | col6                | col7 | col8   | col9                                | col10 | col11 | col12 |
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | {"b": ["a", "b", {"q": 4}], "c": 1} | 1aza  | NULL  | NULL  |
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
1 row in set (0.00 sec)
```

As you can see, the query result ignores the first line.

For more information on loding *JSONLines*, see [Import the JSONLines data](../../../Develop/import-data/bulk-load/load-jsonline.md).

## **Constraints**

1. The `REPLACE` and `IGNORE` modifiers control handling of new (input) rows that duplicate existing table rows on unique key values (`PRIMARY KEY` or `UNIQUE index` values) are not supported in MatrixOne yet.
2. Input pre-pressing with `SET` is supported very limitedly. Only `SET columns_name=nullif(expr1,expr2)` is supported.
3. When enabling the parallel loading, it must be ensured that each row of data in the file does not contain the specified line terminator, such as '\n'; otherwise, it will cause data errors during file loading.
4. The parallel loading of files requires that the files be in uncompressed format, and parallel loading of files in compressed form is not currently supported.
5. When you use `load data local`, you need to use the command line to connect to the MatrixOne service host: `mysql -h <mo-host -ip> -P 6001 -udump -p111 --local-infile`.
6. MatrixOne does not support `ESCAPED BY` currently. Writing or reading special characters differs from MySQL to some extent.
