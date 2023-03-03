# **SHOW COLUMNS**

## **Description**

`SHOW COLUMNS` displays information about the columns in a given table.

## **Syntax**

```
> SHOW [FULL] {COLUMNS}
    {FROM | IN} tbl_name
    [{FROM | IN} db_name]
    [LIKE 'pattern' | WHERE expr]
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
mysql> show columns from t1;
+-------+----------------+------+------+---------+-------+-------------------+
| Field | Type           | Null | Key  | Default | Extra | Comment           |
+-------+----------------+------+------+---------+-------+-------------------+
| col1  | INT            | YES  |      | NULL    |       | First column      |
| col2  | FLOAT          | YES  |      | NULL    |       | "%$^&*()_+@!      |
| col3  | VARCHAR(65535) | YES  |      | NULL    |       | ZD5lTndyuEzw49gxR |
| col4  | BOOL           | YES  |      | NULL    |       |                   |
+-------+----------------+------+------+---------+-------+-------------------+
4 rows in set (0.02 sec)
```
