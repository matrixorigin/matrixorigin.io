# **SQL Syntax**

## Data Definition Language

***

### CREATE DATABASE

Create a database.

#### Syntax

```
$ CREATE DATABASE <database_name>
```

#### Examples
```
$ CREATE DATABASE test01;
```

### DROP DATABASE

Drop a database.

#### Syntax

```
$ DROP DATABASE [IF EXISTS] <database_name>
```

#### Examples
```
$ DROP DATABASE test01;
```

### CREATE TABLE

Create a new table.

#### Syntax

```
$ CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 type1,
    name2 type2,
    ...
)
```

#### Examples
```
$ CREATE TABLE test(a int, b varchar(10));

$ INSERT INTO test values(123, 'abc');

mysql> SELECT * FROM test;
+------+---------+
|   a  |    b    |
+------+---------+
|  123 |   abc   |
+------+---------+
```
### DROP TABLE

Deletes the table.

#### Syntax

```
$ DROP TABLE [IF EXISTS] [db.]name
```
#### Examples
```
$ CREATE TABLE table01(a int);
$ DROP TABLE table01;
```