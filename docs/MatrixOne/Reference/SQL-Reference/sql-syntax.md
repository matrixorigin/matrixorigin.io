# **SQL Syntax**

MatrixOne SQL syntax conforms with MySQL SQL syntax. 

Reference: <https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html>

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

$ SELECT * FROM test;
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

## Data Manipulation Language

***

### SELECT

Retrieves data from a table.

#### Syntax

```
$ SELECT
    [ALL | DISTINCT]
    select_expr [[AS] alias], ...
    [INTO variable [, ...]]
    [ FROM table_references
    [WHERE expr]
    [GROUP BY {{col_name | expr | position}, ...
    | extended_grouping_expr}]
    [HAVING expr]
    [ORDER BY {col_name | expr} [ASC | DESC], ...]
    [LIMIT row_count]
    [OFFSET row_count]
    ]
```
#### Examples
```
$ SELECT number FROM numbers(3);
+--------+
| number |
+--------+
|      0 |
|      1 |
|      2 |
+--------+

$ SELECT * FROM t1 WHERE spID>2 AND userID <2 || userID >=2 OR userID < 2 LIMIT 3;

$ SELECT userID,MAX(score) max_score FROM t1 WHERE userID <2 || userID > 3 GROUP BY userID ORDER BY max_score;
```

### INSERT

Writing data.

#### Syntax

```
$ INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
```
#### Examples

```
$ CREATE TABLE test(a int, b varchar(10));

$ INSERT INTO test values(123, 'abc');

$ SELECT * FROM test;
+------+---------+
|   a  |    b    |
+------+---------+
|  123 |   abc   |
+------+---------+
```

### LOAD DATA

The LOAD DATA statement reads rows from a text file into a table at a very high speed.

#### Syntax

```
$ LOAD DATA
    [LOW_PRIORITY | CONCURRENT] [LOCAL]
    INFILE 'file_name'
    [REPLACE | IGNORE]
    INTO TABLE tbl_name
    [PARTITION (partition_name [, partition_name] ...)]
    [CHARACTER SET charset_name]
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']
    ]
    [LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
    ]
    [IGNORE number {LINES | ROWS}]
    [(col_name_or_user_var
        [, col_name_or_user_var] ...)]
    [SET col_name={expr | DEFAULT}
        [, col_name={expr | DEFAULT}] ...]
```
#### Examples

The SSB Test is an example of LOAD DATA syntax. [Complete a SSB Test with MatrixOne
](../../Get-Started/Tutorial/SSB-test-with-matrixone.md)
```
$ LOAD DATA INFILE '/ssb-dbgen-path/lineorder_flat.tbl ' INTO TABLE lineorder_flat;
```




### SHOW DATABASES

Shows the list of databases that exist on the instance.

#### Syntax
```
$ SHOW DATABASES [LIKE expr | WHERE expr]
```
#### Examples
```
$ SHOW DATABASES;
+----------+
| Database |
+----------+
| default  |
| for_test |
| local    |
| ss       |
| ss1      |
| ss2      |
| ss3      |
| system   |
| test     |
+----------+
9 rows in set (0.00 sec)
```

### SHOW TABLES

Shows the list of tables in the currently selected database.

#### Syntax
```
$ SHOW TABLES  [LIKE 'pattern' | WHERE expr | FROM 'pattern' | IN 'pattern']
```
#### Examples
```
$ SHOW TABLES;
+---------------+
| name          |
+---------------+
| clusters      |
| contributors  |
| databases     |
| functions     |
| numbers       |
| numbers_local |
| numbers_mt    |
| one           |
| processes     |
| settings      |
| tables        |
| tracing       |
+---------------+
```

### USE

The USE statement tells MatrixOne to use the named database as the default (current) database for subsequent statements. 

#### Syntax
```
$ USE db_name
```
#### Examples
```
$ USE db1;
$ SELECT COUNT(*) FROM mytable; 
```


## Aggregate Functions

***


### COUNT

Aggregate function.

The COUNT() function returns the number of records returned by a select query.

Note: NULL values are not counted.

#### Arguments
|  Arguments   | Description  |
|  ----  | ----  |
| expression  | Any expression.
This may be a column name, the result of another function, or a math operation.
* is also allowed, to indicate pure row counting. |

#### Return Type
An integer.

#### Examples

Note: numbers(N) – A table for test with the single number column (UInt64) that contains integers from 0 to N-1.

```
$ SELECT count(*) FROM numbers(3);
+----------+
| count(*) |
+----------+
|        3 |
+----------+

$ SELECT count(number) FROM numbers(3);
+---------------+
| count(number) |
+---------------+
|             3 |
+---------------+

$ SELECT count(number) AS c FROM numbers(3);
+------+
| c    |
+------+
|    3 |
+------+
```

#### Syntax

```
$ COUNT(expression)
```
***

### SUM


Aggregate function.

The SUM() function calculates the sum of a set of values.

Note: NULL values are not counted.

#### Syntax

```
$ SUM(expression)
```
#### Arguments
|  Arguments   | Description  |
|  ----  | ----  |
| expression  | Any expression |

#### Return Type
A double if the input type is double, otherwise integer.


#### Examples

Note: numbers(N) – A table for test with the single number column (UInt64) that contains integers from 0 to N-1.

```
$ SELECT SUM(*) FROM numbers(3);
+--------+
| sum(*) |
+--------+
|      3 |
+--------+

$ SELECT SUM(number) FROM numbers(3);
+-------------+
| sum(number) |
+-------------+
|           3 |
+-------------+

$ SELECT SUM(number) AS sum FROM numbers(3);
+------+
| sum  |
+------+
|    3 |
+------+

$ SELECT SUM(number+2) AS sum FROM numbers(3);
+------+
| sum  |
+------+
|    9 |
+------+
```

***

### AVG
Aggregate function.

The AVG() function returns the average value of an expression.

Note: NULL values are not counted.


#### Syntax

```
$ AVG(expression)
```
#### Arguments
|  Arguments   | Description  |
|  ----  | ----  |
| expression  | Any numerical expression |

#### Return Type
double

#### Examples

Note: numbers(N) – A table for test with the single number column (UInt64) that contains integers from 0 to N-1.

```
$ SELECT AVG(*) FROM numbers(3);
+--------+
| avg(*) |
+--------+
|      1 |
+--------+

$ SELECT AVG(number) FROM numbers(3);
+-------------+
| avg(number) |
+-------------+
|           1 |
+-------------+

$ SELECT AVG(number+1) FROM numbers(3);
+----------------------+
| avg(plus(number, 1)) |
+----------------------+
|                    2 |
+----------------------+

$ SELECT AVG(number+1) AS a FROM numbers(3);
+------+
| a    |
+------+
|    2 |
+------+
```
***

### MAX

Aggregate function.

The MAX() function returns the maximum value in a set of values.

#### Syntax

```
$ MAX(expression)
```
#### Arguments
|  Arguments   | Description  |
|  ----  | ----  |
| expression  | Any expression |

#### Return Type
The maximum value, in the type of the value.

#### Examples

Note: numbers(N) – A table for test with the single number column (UInt64) that contains integers from 0 to N-1.

```
$ SELECT MAX(*) FROM numbers(3);
+--------+
| max(*) |
+--------+
|      2 |
+--------+

$ SELECT MAX(number) FROM numbers(3);
+-------------+
| max(number) |
+-------------+
|           2 |
+-------------+

$ SELECT MAX(number) AS max FROM numbers(3);
+------+
| max  |
+------+
|    2 |
+------+
```


***
### MIN

Aggregate function.

The MIN() function returns the minimum value in a set of values.



#### Syntax

```
$ MIN(expression)
```
#### Arguments
|  Arguments   | Description  |
|  ----  | ----  |
| expression  | Any expression |

#### Return Type
The minimum value, in the type of the value.

#### Examples

Note: numbers(N) – A table for test with the single number column (UInt64) that contains integers from 0 to N-1.

```
$ SELECT MIN(*) FROM numbers(3);
+--------+
| min(*) |
+--------+
|      0 |
+--------+

$ SELECT MIN(number) FROM numbers(3);
+-------------+
| min(number) |
+-------------+
|           0 |
+-------------+

$ SELECT MIN(number) AS min FROM numbers(3);
+------+
| min  |
+------+
|    0 |
+------+
```