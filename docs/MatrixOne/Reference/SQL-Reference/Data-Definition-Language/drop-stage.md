# **DROP STAGE**

## **Description**

`DROP STAGE` drops a named internal or external data stage from the database. The data stage is a temporary storage area that loads data from a file into a database table or exports data from a database table to a file. Use the `DROP STAGE` command to remove stages of data that are no longer needed from the database, freeing storage space and avoiding additional storage charges.

!!! note
    The cluster administrator (i.e., the root user) and account administrators can delete data stages.

## **Syntax**

```
-- Delete internal stage
> DROP STAGE [IF EXISTS] {internal_stage_name};

-- Delete external stage
> DROP STAGE  [IF EXISTS] {external_stage_name};
```

## **Examples**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- Create internal data stage
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- Export data from the table to data stage
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- You can see your exported table in your local directory

-- delete stage1
mysql> drop stage stage1;
Query OK, 0 rows affected (0.01 sec)

-- stage1 has been deleted; the data stage is not available
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
ERROR 20101 (HY000): internal error: stage 'stage1' is not exists, please check
```
