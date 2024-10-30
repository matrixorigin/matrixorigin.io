# **DROP STAGE**

## **Syntax description**

`DROP STAGE` is used to delete the specified stage in MatrixOne. It should be noted that after deleting a stage, the files in the external storage location associated with the stage will not be removed, only the mapping relationship with the stage will be deleted.

## **Grammar structure**

```
> DROP STAGE [IF EXISTS] {stage_name};
```

## **Example**

```sql
mysql> create stage stage_fs url = 'file:///Users/admin/test';

mysql>drop stage stage_fs;
```
