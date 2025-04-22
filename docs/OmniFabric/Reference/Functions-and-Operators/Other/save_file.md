# **SAVE_FILE()**

## **Function description**

The `SAVE_FILE()` function is used to write content to the file pointed to by datalink, and the reference line returns the byte length of the written content.

## **Function syntax**

```
>SAVE_FILE(datalink_type_data,content);
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| datalink_type_data | datalink type data can be converted using the [cast()](../../../Reference/Operators/operators/cast-functions-and-operators/cast/) function |
| content | Need to write the content of the file pointed to by datalink |

## Example

```
drop stage if exists tab1;
create stage stage01 url='file:///Users/admin/case/';
mysql> select save_file(cast('stage://stage01/test.csv' as datalink), 'this is a test message');
+-------------------------------------------------------------------------------+
| save_file(cast(stage://stage01/test.csv as datalink), this is a test message) |
+-------------------------------------------------------------------------------+
|                                                                            22 |
+-------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select save_file(cast('file:///Users/admin/case/test1.csv' as datalink), 'this is another test message');
+-----------------------------------------------------------------------------------------------+
| save_file(cast(file:///Users/admin/case/test1.csv as datalink), this is another test message) |
+-----------------------------------------------------------------------------------------------+
|                                                                                            28 |
+-----------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

```

```bash
(base) admin@192 case % cat test.csv
this is a test message

(base) admin@192 case % cat test1.csv
this is another test message
```