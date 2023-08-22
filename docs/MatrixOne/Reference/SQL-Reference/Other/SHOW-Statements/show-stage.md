# **SHOW STAGES**

## **Description**

Display the data stage of the current database creation as a list.

MatrixOne users use `SHOW STAGES` to view all the data stages of the current database and can choose a valid path to export the data to.

## **Syntax**

```
> SHOW STAGES [LIKE 'pattern']
```

## **Examples**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- Create internal data stage
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- Export data from table to the data stage
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- You can see your exported table in your local directory

-- Display the data stage of the current database creation as a list.
mysql> SHOW STAGES;
+------------+-----------------------------+---------+---------+
| STAGE_NAME | URL                         | STATUS  | COMMENT |
+------------+-----------------------------+---------+---------+
| stage1     | /tmp                        | ENABLED |         |
+------------+-----------------------------+---------+---------+
1 row in set (0.00 sec)
```
