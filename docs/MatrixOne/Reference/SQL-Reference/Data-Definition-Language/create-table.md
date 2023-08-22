# **CREATE TABLE**

## **Description**

Create a new table.

## **Syntax**

```
> CREATE [TEMPORARY] TABLE [IF NOT EXISTS] tbl_name
    (create_definition,...)
    [table_options]
    [partition_options]

create_definition: {
    col_name column_definition
  | [CONSTRAINT [symbol]] PRIMARY KEY
      [index_type] (key_part,...)
      [index_option] ...
  | [CONSTRAINT [symbol]] FOREIGN KEY
      [index_name] (col_name,...)
      reference_definition
}

column_definition: {
    data_type [NOT NULL | NULL] [DEFAULT {literal | (expr)} ]
      [AUTO_INCREMENT] [UNIQUE [KEY]] [[PRIMARY] KEY]
      [COMMENT 'string']
      [reference_definition]
  | data_type
      [[PRIMARY] KEY]
      [COMMENT 'string']
      [reference_definition]
}

reference_definition:
    REFERENCES tbl_name (key_part,...)
      [ON DELETE reference_option]
      [ON UPDATE reference_option]

reference_option:
    RESTRICT | CASCADE | SET NULL | NO ACTION

table_options:
    table_option [[,] table_option] ...

table_option: {
  | AUTO_INCREMENT [=] value
  | COMMENT [=] 'string'
  | START TRANSACTION
}

partition_options:
    PARTITION BY
        { [LINEAR] HASH(expr)
        | [LINEAR] KEY [ALGORITHM={1 | 2}] (column_list)}
    [PARTITIONS num]
    [(partition_definition [, partition_definition] ...)]

partition_definition:
 PARTITION partition_name
     [VALUES
         {LESS THAN {(expr | value_list) | MAXVALUE}
         |
         IN (value_list)}]
     [COMMENT [=] 'string' ]
```

### Explanations

Various parameters and options that can be used when creating a table, including table creation, column definition, constraints, options, and partitioning, are explained below:

- `CREATE [TEMPORARY] TABLE [IF NOT EXISTS] tbl_name`: This is the primary table syntax. The `TEMPORARY` keyword indicates creating a temporary table, `IF NOT EXISTS` ensures creation only if the table doesn't exist, and `tbl_name` is the name of the table to be created.

- `(create_definition,...)`: This is the section for column definitions, used to define the table's columns and their attributes.

- `[table_options]`: This is for table-level options where you can set parameters like storage engine, character set, etc.

- `[partition_options]`: This is used for partitioned tables and defining partitioning methods and keys.

The `create_definition` section is used to define attributes for each column, and it can contain the following:

- `col_name column_definition`: This defines the column name and its attributes, including data type, whether it can be null, default value, etc.

- `[CONSTRAINT [symbol]] PRIMARY KEY`: This defines a primary key constraint and can set a constraint name and the columns that make up the primary key.

- `[CONSTRAINT [symbol]] FOREIGN KEY`: This defines a foreign key constraint and can set a constraint name, columns for the foreign key, and the referenced table.

The `column_definition` section is used to define attributes for specific columns and can include the following:

- `data_type [NOT NULL | NULL] [DEFAULT {literal | (expr)} ]`: This defines the data type of the column, whether it can be null, and its default value.

- `[AUTO_INCREMENT] [UNIQUE [KEY]] [[PRIMARY] KEY]`: This sets options like auto-increment, uniqueness, and primary key constraint.

- `[COMMENT 'string']`: This sets a comment for the column.

- `[reference_definition]`: This is an optional reference definition used to define foreign key constraints.

The `reference_definition` section is used to define references for foreign keys and includes the following:

- `REFERENCES tbl_name (key_part,...)`: This specifies the referenced table and columns for the foreign key.

- `[ON DELETE reference_option]`: This sets the action to be taken when a referenced row is deleted.

- `[ON UPDATE reference_option]`: This sets the action to be taken when a referenced row is updated.

`reference_option` represents the options for foreign key actions, including `RESTRICT`, `CASCADE`, `SET NULL`, and `NO ACTION`.

The `table_options` section sets table-level options, including initial auto-increment value, table comments, etc.

The `partition_options` section defines options for partitioned tables, including partitioning methods, partition keys, and the number of partitions.

For more detailed syntax explanations, see the following content.

#### Temporary Tables

You can use the `TEMPORARY` keyword when creating a table. A `TEMPORARY` table is visible only within the current session, and is dropped automatically when the session is closed. This means that two different sessions can use the same temporary table name without conflicting with each other or with an existing non-TEMPORARY table of the same name. (The existing table is hidden until the temporary table is dropped.)

Dropping a database does automatically drop any `TEMPORARY` tables created within that database.

The creating session can perform any operation on the table, such as `DROP TABLE`, `INSERT`, `UPDATE`, or `SELECT`.

#### COMMENT

A comment for a column or a table can be specified with the `COMMENT` option.

- Up to 1024 characters long. The comment is displayed by the `SHOW CREATE TABLE` and `SHOW FULL COLUMNS` statements. It is also shown in the `COLUMN_COMMENT` column of the `INFORMATION_SCHEMA.COLUMNS` table.

#### AUTO_INCREMENT

The initial `AUTO_INCREMENT` value for the table.

An integer column can have the additional attribute `AUTO_INCREMENT`. When you insert a value of NULL (recommended) or 0 into an indexed AUTO_INCREMENT column, the column is set to the next sequence value. Typically this is value+1, where the value is the largest value for the column currently in the table. `AUTO_INCREMENT` sequences begin with 1 default.

There can be only one `AUTO_INCREMENT` column per table, which must be indexed and cannot have a DEFAULT value. An `AUTO_INCREMENT` column works properly only if it contains only positive values. Inserting a negative number is regarded as inserting a very large positive number. This is done to avoid precision problems when numbers "wrap" over from positive to negative and also to ensure that you do not accidentally get an `AUTO_INCREMENT` column that contains 0.

You can use the `AUTO_INCREMENT` attribute to define the starting value of an auto-increment column. If you want to set the starting value of the auto-increment column to 10, you can use the `AUTO_INCREMENT` keyword when creating the table and specify the starting value later.

For example, to create a table and define an auto-increment column with a starting value of 10, you can use the following SQL statement:

```sql
-- set up
create table t1(a int auto_increment primary key) auto_increment = 10;
```

In this example, the `id` column is an auto-incrementing column with a starting value 10. When a new record is inserted into the table, the value of the `id` column will start from 10 and increment by 1 each time. If the starting value of `AUTO_INCREMENT` is not specified, the default starting value is 1, which is automatically incremented by 1 each time.

!!! note
    1. MatrixOne currently only supports the default increment step size of 1; regardless of the initial value of the auto-increment column, each auto-increment is 1. Temporarily does not support setting the incremental step size.
    2. MatrixOne only syntax supports using the system variable `set @@auto_increment_offset=n` to set the initial value of the auto-increment column, but it does not take effect.

#### PRIMARY KEY

The PRIMARY KEY constraint uniquely identifies each record in a table.

Primary keys must contain UNIQUE values, and cannot contain NULL values.

A table can have only ONE primary key; and in the table, this primary key can consist of single column (field).

- **SQL PRIMARY KEY on CREATE TABLE**

The following SQL creates a PRIMARY KEY on the "ID" column when the "Persons" table is created:

```
> CREATE TABLE Persons (
    ID int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Age int,
    PRIMARY KEY (ID)
);
```

#### FOREIGN KEY

The FOREIGN KEY constraint is used to prevent actions that would destroy links between tables.

A FOREIGN KEY is a field (or collection of fields) in one table, that refers to the PRIMARY KEY in another table.

The table with the foreign key is called the child table, and the table with the primary key is called the referenced or parent table.

The FOREIGN KEY constraint prevents invalid data from being inserted into the foreign key column, because it has to be one of the values contained in the parent table.

When defining FOREIGN KEY, the following rules need to be followed:

- The parent table must already exist in the database or be a table currently being created. In the latter case, the parent table and the slave table are the same table, such a table is called a self-referential table, and this structure is called self-referential integrity.

- A primary key must be defined for the parent table.

- Specify the column name or combination of column names after the table name of the parent table. This column or combination of columns must be the primary or candidate key of the primary table.

- The number of columns in the foreign key must be the same as the number of columns in the primary key of the parent table.

- The data type of the column in the foreign key must be the same as the data type of the corresponding column in the primary key of the parent table.

The following is an example to illustrate the association of parent and child tables through FOREIGN KEY and PRIMARY KEY:

First, create a parent table with field a as the primary key:

```sql
create table t1(a int primary key,b varchar(5));
insert into t1 values(101,'abc'),(102,'def');
mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|  101 | abc  |
|  102 | def  |
+------+------+
2 rows in set (0.00 sec)
```

Then create a child table with field c as the foreign key, associated with parent table field a:

```sql
create table t2(a int ,b varchar(5),c int, foreign key(c) references t1(a));
insert into t2 values(1,'zs1',101),(2,'zs2',102);
insert into t2 values(3,'xyz',null);
mysql> select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 | zs1  |  101 |
|    2 | zs2  |  102 |
|    3 | xyz  | NULL |
+------+------+------+
3 rows in set (0.00 sec)
```

In addition, `[ON DELETE reference_option]` and `[ON UPDATE reference_option]` are used when defining a foreign key relationship to specify actions to be taken when records in the parent table are deleted or updated. These two parameters are primarily used to maintain data integrity and consistency:

- `ON DELETE reference_option`: This parameter specifies how to handle associated foreign key data when data in the referenced table is deleted. Common options include:

    + `RESTRICT`: If related foreign key data exists in the referenced table, deletion of data in the table is not allowed. This prevents accidental deletion of related data, ensuring data consistency.

    + `CASCADE`: When data in the referenced table is deleted, associated foreign key data is also deleted. This is used for cascading deletion of related data to maintain data integrity.

    + `SET NULL`: When data in the referenced table is deleted, the value of the foreign key column is set to NULL. This is used to retain foreign key data while disconnecting it from the referenced data upon deletion.

    + `NO ACTION`: Indicates no action is taken; it only checks for the existence of associated data. This is similar to `RESTRICT` but may have minor differences in some databases.

- `ON UPDATE reference_option`: This parameter specifies how to handle associated foreign key data when data in the referenced table is updated. Common options are similar to those of `ON DELETE reference_option`, and their usage is identical, but they apply to data update operations.

See the example below:

Suppose there are two tables, `Orders` and `Customers`, where the `Orders` table has a foreign key column `customer_id` referencing the `id` column in the `Customers` table. If, when a customer is deleted from the `Customers` table, you also want to delete the associated order data, you can use `ON DELETE CASCADE`.

```sql
CREATE TABLE Customers (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Orders (
    id INT PRIMARY KEY,
    order_number VARCHAR(10),
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);
```

In the above example, when a customer is deleted from the `Customers` table, the associated order data will also be deleted through cascading, maintaining data integrity. Similarly, the `ON UPDATE` parameter can handle update operations.

For more information on data integrity constraints, see [Data Integrity Constraints Overview](../../../Develop/schema-design/data-integrity/overview-of-integrity-constraint-types.md).

#### Cluster by

`Cluster by` is a command used to optimize the physical arrangement of a table. When creating a table, the `Cluster by` command can physically sort the table based on a specified column for tables without a primary key. It will rearrange the data rows to match the order of values in that column. Using `Cluster by` improves query performance.

- The syntax for a single column is: `create table() cluster by col;`
- The syntax for multiple columns is: `create table() cluster by (col1, col2);`

__Note:__ `Cluster by` cannot coexist with a primary key, or a syntax error will occur. `Cluster by` can only be specified when creating a table and does not support dynamic creation.

For more information on using `Cluster by` for performing tuning, see [Using `Cluster by` for performance tuning](../../../Performance-Tuning/optimization-concepts/through-cluster-by.md).

#### Table PARTITION and PARTITIONS

```
partition_options:
 PARTITION BY
     { [LINEAR] HASH(expr)
     | [LINEAR] KEY [ALGORITHM={1 | 2}] (column_list)
 [PARTITIONS num]
 [(partition_definition [, partition_definition] ...)]

partition_definition:
 PARTITION partition_name
     [VALUES
         {LESS THAN {(expr | value_list) | MAXVALUE}
         |
         IN (value_list)}]
     [COMMENT [=] 'string' ]
```

Partitions can be modified, merged, added to tables, and dropped from tables.

- **PARTITION BY**

If used, a partition_options clause begins with PARTITION BY. This clause contains the function that is used to determine the partition; the function returns an integer value ranging from 1 to num, where num is the number of partitions.

- **HASH(expr)**

Hashes one or more columns to create a key for placing and locating rows. expr is an expression using one or more table columns. For example, these are both valid CREATE TABLE statements using PARTITION BY HASH:

```
CREATE TABLE t1 (col1 INT, col2 CHAR(5))
    PARTITION BY HASH(col1);

CREATE TABLE t1 (col1 INT, col2 CHAR(5), col3 DATETIME)
    PARTITION BY HASH ( YEAR(col3) );
```

- **KEY(column_list)**

This is similar to `HASH`. The column_list argument is simply a list of 1 or more table columns (maximum: 16). This example shows a simple table partitioned by key, with 4 partitions:

```
CREATE TABLE tk (col1 INT, col2 CHAR(5), col3 DATE)
    PARTITION BY KEY(col3)
    PARTITIONS 4;
```

For tables that are partitioned by key, you can employ linear partitioning by using the `LINEAR` keyword. This has the same effect as with tables that are partitioned by `HASH`. This example uses linear partitioning by `key` to distribute data between 5 partitions:

```
CREATE TABLE tk (col1 INT, col2 CHAR(5), col3 DATE)
    PARTITION BY LINEAR KEY(col3)
    PARTITIONS 5;
```

- **RANGE(expr)**

In this case, expr shows a range of values using a set of `VALUES LESS THAN` operators. When using range partitioning, you must define at least one partition using `VALUES LESS THAN`. You cannot use `VALUES IN` with range partitioning.

`PARTITION ... VALUES LESS THAN ...` statements work in a consecutive fashion. `VALUES LESS THAN MAXVALUE` works to specify "leftover" values that are greater than the maximum value otherwise specified.

The clauses must be arranged in such a way that the upper limit specified in each successive `VALUES LESS THAN` is greater than that of the previous one, with the one referencing `MAXVALUE` coming last of all in the list.

- **PARTITIONS num**

The number of partitions may optionally be specified with a PARTITIONS num clause, where num is the number of partitions. If both this clause and any PARTITION clauses are used, num must be equal to the total number of any partitions that are declared using PARTITION clauses.

## **Examples**

- Example 1: Create a common table

```sql
CREATE TABLE test(a int, b varchar(10));
INSERT INTO test values(123, 'abc');

mysql> SELECT * FROM test;
+------+---------+
|   a  |    b    |
+------+---------+
|  123 |   abc   |
+------+---------+
```

- Example 2: Add comments when creating a table

```sql
create table t2 (a int, b int) comment = "fact table";

mysql> show create table t2;
+-------+---------------------------------------------------------------------------------------+
| Table | Create Table                                                                          |
+-------+---------------------------------------------------------------------------------------+
| t2    | CREATE TABLE `t2` (
`a` INT DEFAULT NULL,
`b` INT DEFAULT NULL
) COMMENT='fact table',    |
+-------+---------------------------------------------------------------------------------------+
```

- Example 3: Add comments to columns when creating tables

```sql
create table t3 (a int comment 'Column comment', b int) comment = "table";

mysql> SHOW CREATE TABLE t3;
+-------+----------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------+
| t3    | CREATE TABLE `t3` (
`a` INT DEFAULT NULL COMMENT 'Column comment',
`b` INT DEFAULT NULL
) COMMENT='table',     |
+-------+----------------------------------------------------------------------------------------------------------+
```

- Example 4: Create a common partitioned table

```sql
CREATE TABLE tp1 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY KEY(col3) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp1;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp1   | CREATE TABLE `tp1` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col3) partitions 4 |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- do not specify the number of partitions
CREATE TABLE tp2 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY KEY(col3);

mysql> SHOW CREATE TABLE tp2;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| tp2   | CREATE TABLE `tp2` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col3) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Specify partition algorithm
CREATE TABLE tp3
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY KEY ALGORITHM = 1 (col3);


mysql> show create table tp3;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| tp3   | CREATE TABLE `tp3` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 1 (col3) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Specify partition algorithm and the number of partitions
CREATE TABLE tp4 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY LINEAR KEY ALGORITHM = 1 (col3) PARTITIONS 5;

mysql> SHOW CREATE TABLE tp4;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                    |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp4   | CREATE TABLE `tp4` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by linear key algorithm = 1 (col3) partitions 5 |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- Multi-column partition
CREATE TABLE tp5
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY KEY(col1, col2) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp5;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                   |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp5   | CREATE TABLE `tp5` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col1, col2) partitions 4 |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- Create a primary key column partition
CREATE TABLE tp6
(
    col1 INT  NOT NULL PRIMARY KEY,
    col2 DATE NOT NULL,
    col3 INT  NOT NULL,
    col4 INT  NOT NULL
) PARTITION BY KEY(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp6;
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                        |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp6   | CREATE TABLE `tp6` (
`col1` INT NOT NULL,
`col2` DATE NOT NULL,
`col3` INT NOT NULL,
`col4` INT NOT NULL,
PRIMARY KEY (`col1`)
) partition by key algorithm = 2 (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- Create HASH partition
CREATE TABLE tp7
(
    col1 INT,
    col2 CHAR(5)
) PARTITION BY HASH(col1);

mysql> SHOW CREATE TABLE tp7;
+-------+------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                         |
+-------+------------------------------------------------------------------------------------------------------+
| tp7   | CREATE TABLE `tp7` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL
) partition by hash (col1) |
+-------+------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- Specifies the number of HASH partitions when creating hash partition
CREATE TABLE tp8
(
    col1 INT,
    col2 CHAR(5)
) PARTITION BY HASH(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp8;
+-------+-------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                      |
+-------+-------------------------------------------------------------------------------------------------------------------+
| tp8   | CREATE TABLE `tp8` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL
) partition by hash (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- specify the partition granularity when creating a partition
CREATE TABLE tp9
(
    col1 INT,
    col2 CHAR(5),
    col3 DATETIME
) PARTITION BY HASH (YEAR(col3));

mysql> SHOW CREATE TABLE tp9;
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                             |
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
| tp9   | CREATE TABLE `tp9` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATETIME DEFAULT NULL
) partition by hash (year(col3)) |
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- specify the partition granularity and number of partitions when creating a partition
CREATE TABLE tp10
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY LINEAR HASH( YEAR(col3)) PARTITIONS 6;

mysql> SHOW CREATE TABLE tp10;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                              |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp10  | CREATE TABLE `tp10` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by linear hash (year(col3)) partitions 6 |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Use the primary key column as the HASH partition when creating a partition
CREATE TABLE tp12 (col1 INT NOT NULL PRIMARY KEY, col2 DATE NOT NULL, col3 INT NOT NULL, col4 INT NOT NULL) PARTITION BY HASH(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp12;
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                            |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp12  | CREATE TABLE `tp12` (
`col1` INT NOT NULL,
`col2` DATE NOT NULL,
`col3` INT NOT NULL,
`col4` INT NOT NULL,
PRIMARY KEY (`col1`)
) partition by hash (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

- Example 5: Primary key auto increment

```sql
drop table if exists t1;
create table t1(a bigint primary key auto_increment,
    b varchar(10));
insert into t1(b) values ('bbb');
insert into t1 values (3, 'ccc');
insert into t1(b) values ('bbb1111');

mysql> select * from t1 order by a;
+------+---------+
| a    | b       |
+------+---------+
|    1 | bbb     |
|    3 | ccc     |
|    4 | bbb1111 |
+------+---------+
3 rows in set (0.01 sec)

insert into t1 values (2, 'aaaa1111');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
+------+----------+
4 rows in set (0.00 sec)

insert into t1(b) values ('aaaa1111');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
|    5 | aaaa1111 |
+------+----------+
5 rows in set (0.01 sec)

insert into t1 values (100, 'xxxx');
insert into t1(b) values ('xxxx');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
|    5 | aaaa1111 |
|  100 | xxxx     |
|  101 | xxxx     |
+------+----------+
7 rows in set (0.00 sec)
```

## **Constraints**

1. Currently, it is not supported to use the `ALTER TABLE table_name DROP PRIMARY KEY` statement to drop the primary key from a table.
2. The `ALTER TABLE table_name AUTO_INCREMENT = n;` statement is not supported to modify the initial value of the auto-increment column.
3. In MatrixOne, only syntax supports using the system variable `set @@auto_increment_increment=n` to set the incremental step size, and only syntax supports using the system variable `set @@auto_increment_offset=n` to set the default auto-increment column initial value, but it does not take effect; currently supports setting the initial value `AUTO_INCREMENT=n` of the auto-increment column, but the step size is still 1 by default.
