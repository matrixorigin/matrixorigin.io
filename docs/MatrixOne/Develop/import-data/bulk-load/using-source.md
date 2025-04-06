# Load data by using the `source`

This document will guide you to use the `source` command to import data into MatrixOne in batches.

## Syntax

```
SOURCE /path/to/your/sql_script.sql;
```

`/path/to/your/sql_script.sql` is the absolute path to the SQL script file. When executing this command, the client will read the specified SQL script file and execute all its SQL statements.

## Tutorial

This tutorial will guide you on migrating data from MySQL to MatrixOne using the `source` command.

### Before you start

Make sure you have already [Deployed and Launched standalone MatrixOne](../../../Get-Started/install-standalone-matrixone.md).

### Steps

#### 1. Dump MySQL data

We suppose you have full access to your MySQL instances.

Firstly, we use `mysqldump` to dump MySQL table structures and data to a single file with the following command. You can take a look at this wonderful [tutorial](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/) if you are not familiar with `mysqldump`. The syntax is as below:

```
mysqldump -h IP_ADDRESS -uUSERNAME -pPASSWORD -d DB_NAME1 DB_NAME2 ... OUTPUT_FILE_NAME.SQL
```

For example, this following command dumps all table structures and data of the database `test` to a single file named `a.sql`.

```
mysqldump -h 127.0.0.1 -uroot -proot -d test > a.sql
```

#### 2. Import into MatrixOne

Import the whole table structures and data into MatrixOne.

1. Open a MySQL terminal and connect to MatrixOne.
2. Import the SQL file into MatrixOne by the `source` command.

```
mysql> source '/YOUR_PATH/a.sql'
```

If your SQL file is big, you can use the following command to run the import task in the background. For example:

```
nohup mysql -h 127.0.0.1 -P 6001 -uroot -p111 -e 'source /YOUR_PATH/a.sql' &
```

!!! info
    The login account in the above code snippet is the initial account; please change the initial password after logging in to MatrixOne; see [Password Management](../../../Security/password-mgmt.md).

#### 3. Check data

After the import is successful, you can run the following SQL statement to check the import results:

```sql
select * from tool;
```

## Constraints

MatrixOne v25.2.1.0 version already supports MySQL table creation statements, so you can smoothly migrate MySQL tables to MatrixOne. However, it should be noted that during the migration process, some keywords incompatible with MySQL, such as `engine=`, will be automatically ignored in MatrixOne and will not affect the migration of the table structure.

However, it should be noted that although MatrixOne supports MySQL table creation statements, manual modification is still required if the migrated table contains incompatible data types, triggers, functions, or stored procedures. For more detailed compatibility information, see [MySQL Compatibility](../../../Overview/feature/mysql-compatibility.md).
