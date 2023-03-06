# **SHOW CREATE TABLE**

## **Description**

This statement shows the `CREATE TABLE` statement that creates the named table.

## **Syntax**

```
> SHOW CREATE TABLE tbl_name
```

## **Examples**

```sql
drop table if exists t1;
create table t1(
col1 int comment 'First column',
col2 float comment '"%$^&*()_+@!',
col3 varchar comment 'ZD5lTndyuEzw49gxR',
col4 bool comment ''
);
mysql> show create table t1;
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                     |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`col1` INT DEFAULT NULL COMMENT 'First column',
`col2` FLOAT DEFAULT NULL COMMENT '"%$^&*()_+@!',
`col3` VARCHAR(65535) DEFAULT NULL COMMENT 'ZD5lTndyuEzw49gxR',
`col4` BOOL DEFAULT NULL
) |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```
