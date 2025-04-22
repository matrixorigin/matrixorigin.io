# **CREATE INDEX**

## **Description**

Create indexes on tables to query data more quickly and efficiently.

You can't see the index; the index can only be used to speed up the search/query.

Updating a table with an index takes longer than updating a table without an index because the index also needs to be updated. Therefore, the ideal approach is to create indexes only on frequently searched columns (and tables).

There are two common types of indexes, namely:

- Primary Key: The primary key index, that is, the index identified on the primary key column.
- Secondary Index: the secondary index, that is, the index identified on the non-primary key.

## **Syntax**

```
> CREATE [UNIQUE] INDEX index_name
ON tbl_name (key_part,...)
COMMENT 'string'
```

### Explanations

#### CREATE UNIQUE INDEX

Creates a unique index on a table. Duplicate values are not allowed.

## **Examples**

```sql
drop table if exists t1;
create table t1(id int PRIMARY KEY,name VARCHAR(255),age int);
insert into t1 values(1,"Abby", 24);
insert into t1 values(2,"Bob", 25);
insert into t1 values(3,"Carol", 23);
insert into t1 values(4,"Dora", 29);
create unique index idx on t1(name);
mysql> select * from t1;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Abby  |   24 |
|    2 | Bob   |   25 |
|    3 | Carol |   23 |
|    4 | Dora  |   29 |
+------+-------+------+
4 rows in set (0.00 sec)

mysql> show create table t1;
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                     |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`id` INT NOT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`age` INT DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `idx` (`name`)
) |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)


create table t2 (
col1 bigint primary key,
col2 varchar(25),
col3 float,
col4 varchar(50)
);
create unique index idx on t2(col2) comment 'create varchar index';
insert into t2 values(1,"Abby", 24,'zbcvdf');
insert into t2 values(2,"Bob", 25,'zbcvdf');
insert into t2 values(3,"Carol", 23,'zbcvdf');
insert into t2 values(4,"Dora", 29,'zbcvdf');
mysql> select * from t2;
+------+-------+------+--------+
| col1 | col2  | col3 | col4   |
+------+-------+------+--------+
|    1 | Abby  |   24 | zbcvdf |
|    2 | Bob   |   25 | zbcvdf |
|    3 | Carol |   23 | zbcvdf |
|    4 | Dora  |   29 | zbcvdf |
+------+-------+------+--------+
4 rows in set (0.00 sec)
mysql> show create table t2;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                              |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t2    | CREATE TABLE `t2` (
`col1` BIGINT NOT NULL,
`col2` VARCHAR(25) DEFAULT NULL,
`col3` FLOAT DEFAULT NULL,
`col4` VARCHAR(50) DEFAULT NULL,
PRIMARY KEY (`col1`),
UNIQUE KEY `idx` (`col2`) COMMENT `create varchar index`
) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```
