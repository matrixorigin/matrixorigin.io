# DATALINK type

The `DATALINK` type is a special data type used to store links to documents (such as satges) or files. Its main purpose is to store the link address of the document in the database, rather than storing the document itself. This type can be applied in various scenarios, especially when dealing with large-scale document management, providing quick access to documents without actually storing the documents in a database.

Use the `DATALINK` data type to:

- Saves storage space: the document is actually stored in external storage (such as an object storage system), while the database only saves the link.
- Convenient document access: By storing links, the system can quickly access documents without additional storage and processing.
- Improve data operation efficiency: Avoid processing large files directly in the database, improving the speed and efficiency of data operations.

## Insert DATALINK type data

**GRAMMAR STRUCTURE**

```
INSERT INTO TABLE_NAME VALUES ('<file://<path>/<filename>>|<stage://<stage_name>/<path>/<file_name>>?<offset=xx>&<size=xxx>' )
```

**Parameter explanation**

| Parameters | Description |
| ----| ----|
| file | Points to the local file system file location. |
| stage | points to stage pointing to file location. |
| offset | Optional. Offset, indicating the starting point of the read content. |
| size | Optional. Specifies the size of the read content, in subsections. |

## Read DATALINK type data

If you want to read the data pointed by `DATALINK` to a file link, you can use the [load_file](../../Reference/Functions-and-Operators/Other/load_file.md) function.

!!! note
    The `load_file()` function reads files in binary mode. For non-text files (such as images, audio, video and other binary format files), the read content will be returned in the form of a raw byte stream without character encoding. Convert. In addition, because in UTF-8 encoding, Chinese characters usually occupy 3 bytes, while English characters only occupy 1 byte. Therefore, when specifying the offset (offset) and read size (size) of the file, if the byte alignment of the characters is not considered, Chinese characters may be truncated or cannot be read correctly, resulting in garbled characters. In order to avoid this situation, the values ​​of offset and size need to be correctly converted according to the character encoding to ensure that the number of bytes of the read content is aligned with the character boundary.

## Example

There is a file `t1.csv` under `/Users/admin/case`

```bash
(base) admin@192 case % cat t1.csv 
this is a test message
```

```sql
drop table test01;
create table test01 (col1 int, col2 datalink);
create stage stage01 url='file:///Users/admin/case/';
insert into test01 values (1, 'file:///Users/admin/case/t1.csv');
insert into test01 values (2, 'file:///Users/admin/case/t1.csv?size=2');
insert into test01 values (3, 'file:///Users/admin/case/t1.csv?offset=4');
insert into test01 values (4, 'file:///Users/admin/case/t1.csv?offset=4&size=2');
insert into test01 values (5, 'stage://stage01/t1.csv');
insert into test01 values (6, 'stage://stage01/t1.csv?size=2');
insert into test01 values (7, 'stage://stage01/t1.csv?offset=4');
insert into test01 values (8, 'stage://stage01/t1.csv?offset=4&size=2');

mysql> select * from test01;
+------+-------------------------------------------------+
| col1 | col2                                            |
+------+-------------------------------------------------+
|    1 | file:///Users/admin/case/t1.csv                 |
|    2 | file:///Users/admin/case/t1.csv?size=2          |
|    3 | file:///Users/admin/case/t1.csv?offset=4        |
|    4 | file:///Users/admin/case/t1.csv?offset=4&size=2 |
|    5 | stage://stage01/t1.csv                          |
|    6 | stage://stage01/t1.csv?size=2                   |
|    7 | stage://stage01/t1.csv?offset=4                 |
|    8 | stage://stage01/t1.csv?offset=4&size=2          |
+------+-------------------------------------------------+
8 rows in set (0.01 sec)

mysql> select col1, load_file(col2) from test01;
+------+-------------------------+
| col1 | load_file(col2)         |
+------+-------------------------+
|    1 | this is a test message
 |
|    2 | th                      |
|    3 |  is a test message
     |
|    4 |  i                      |
|    5 | this is a test message
 |
|    6 | th                      |
|    7 |  is a test message
     |
|    8 |  i                      |
+------+-------------------------+
8 rows in set (0.01 sec)
```