# **STAGE_LIST()**

## **Function description**

The `STAGE_LIST()` function is used to view the directories and files in the stage.

## **Function syntax**

```
>STAGE_LIST(stage://<stage_name>/<path>/<file_name>) as f;
```

## **Parameter explanation**

| Parameters | Description |
| ----| ----|
| stage_name | Required. The name of the stage. |
| path | Optional. The directory name under stage. |
| file_name | Optional. The file name under stage can use wildcard character *|

## **Example**

There are the following files and directories under the directory `/Users/admin/case`:

```bash
(base) admin@192 case % ls
customer	student.csv	t1.csv		t2.txt		t3		user.txt
```

```sql
create stage stage_test url = 'file:///Users/admin/case';

mysql> select * from stage_list('stage://stage_test') as f;
+-------------------------------+
| file                          |
+-------------------------------+
| /Users/admin/case/customer    |
| /Users/admin/case/student.csv |
| /Users/admin/case/t1.csv      |
| /Users/admin/case/t2.txt      |
| /Users/admin/case/t3          |
| /Users/admin/case/user.txt    |
+-------------------------------+
6 rows in set (0.00 sec)

mysql> select * from stage_list('stage://stage_test/t*') as f;
+--------------------------+
| file                     |
+--------------------------+
| /Users/admin/case/t1.csv |
| /Users/admin/case/t2.txt |
+--------------------------+
2 rows in set (0.01 sec)

mysql> select * from stage_list('stage://stage_test/customer') as f;
Empty set (0.00 sec)
```
