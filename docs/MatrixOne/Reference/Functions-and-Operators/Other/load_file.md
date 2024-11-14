# **LOAD_FILE()**

## **Function description**

The `LOAD_FILE()` function is used to read the contents of the file pointed to by the datalink type.

!!! note
    When using load_file() to load a large file, if the file data volume is too large, the system memory limit may be exceeded, causing memory overflow. It is recommended to use it in combination with `offset` and `size` of [DATALINK](../../Data-Types/datalink-type.md).

## **Function syntax**

```
>LOAD_FILE(datalink_type_data);
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| datalink_type_data | datalink type data can be converted using the [cast()](../../../Reference/Operators/operators/cast-functions-and-operators/cast/) function |

## Example

There is a file `t1.csv` under `/Users/admin/case`

```bash
(base) admin@192 case % cat t1.csv 
this is a test message
```

```sql
create table t1 (col1 int, col2 datalink);
create stage stage1 url='file:///Users/admin/case/';
insert into t1 values (1, 'file:///Users/admin/case/t1.csv');
insert into t1 values (2, 'stage://stage1//t1.csv');

mysql> select * from t1;
+------+---------------------------------+
| col1 | col2                            |
+------+---------------------------------+
|    1 | file:///Users/admin/case/t1.csv |
|    2 | stage://stage1//t1.csv          |
+------+---------------------------------+
2 rows in set (0.00 sec)

mysql> select col1, load_file(col2) from t1;
+------+-------------------------+
| col1 | load_file(col2)         |
+------+-------------------------+
|    1 | this is a test message
 |
|    2 | this is a test message
 |
+------+-------------------------+
2 rows in set (0.01 sec)


mysql> select load_file(cast('file:///Users/admin/case/t1.csv' as datalink));
+--------------------------------------------------------------+
| load_file(cast(file:///Users/admin/case/t1.csv as datalink)) |
+--------------------------------------------------------------+
| this is a test message
                                      |
+--------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select load_file(cast('stage://stage1//t1.csv' as datalink));
+-----------------------------------------------------+
| load_file(cast(stage://stage1//t1.csv as datalink)) |
+-----------------------------------------------------+
| this is a test message
                             |
+-----------------------------------------------------+
1 row in set (0.00 sec)
```