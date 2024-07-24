# save_query_result Save query result support

When `save_query_result` is turned on, MatrixOne saves the query results.

There are three parameters that have an impact on saving query results:

- `save_query_result`: Turn on/off saving query results.

- `query_result_timeout`: Set how long to save query results.

- `query_result_maxsize`: Sets the maximum value of a single query result.

## Limitations

- Only statements with returned results, such as `SELECT`, `SHOW`, `DESC`, `EXECUTE` statements, are supported for saving
- For `SELECT` statements, only the results of `SELECT` statements that start fixedly with `/*cloud_user */` and `/*save_result */` are saved.

## Turn on the Save Query Results setting

- Turn on save query results for current session only:

```sql
 -- defaults to off 
 set save_query_result = on 
 ```

- To turn on saving query results globally:

```sql
-- defaults to off 
set global save_query_result = on 
```

## Set save time

Set the save time in hours.

- Open query results save time only for current session:

```sql
-- Defaults to 24 
set query_result_timeout = 48 
```

- To open query results globally save time:

```sql
-- defaults to 24 
set global query_result_timeout = 48 
```

__Note:__ Save timeIf the value set is shorter than the last setting, it does not affect the previous save result.

## Sets the maximum value of a single query result

Sets the maximum value in MB for a single query result.

- Set a maximum value for query results only for the current session:

```sql
-- defaults to 100 
set query_result_maxsize = 200 
```

- Set the maximum value of query results for the global:

```sql
-- defaults to 100 
set global query_result_maxsize = 200 
```

__Note:__ The maximum value of a single query result does not affect the previously saved result size if the value set is smaller than the previous setting.

### Query metadata information

You can query metadata information using the following SQL statement:

```sql
select * from meta_scan(query_id) as u;
current account_id
select query_id from meta_scan(query_id) as u;
```

The metadata information is as follows:

| column         | type      | comments                                                         |
| ------------ | --------- | ------------------------------------------------------------ |
| query_id     | uuid      | Result ID                          |
| statement    | text      | SQL statement executed                        |
| account_id   | uint32    | Account ID                                                      |
| role_id      | uint32    | Character ID                                                       |
| result_path  | text      | The default path to save the query result is matrixone folder mo-data/s3, if you want to change the default path, you need to change `data-dir = "mo-data/s3"` in the configuration file. If you need to change the default path, you need to change `data-dir = "mo-data/s3"` in the configuration file. For a description of the configuration file parameters, see [General Parameter Configuration](... /... /System-Parameters/system-parameter.md) |
| created_time | timestamp | Creation time                                                     |
| result_size  | float     | Result size in MB. |
| tables       | text      | Tables used in SQL                       |
| user_id      | uint32    | User ID                                                       |
| expired_time | timestamp | Timeout for query results|
| column_map   | text      | If a query has columns with the same name, result scan remaps the columns.       |

## Save query results

You can save the query results on your local disk or S3.

### Syntax structure

```sql
MODUMP QUERY_RESULT query_id INTO s3_path
     [FIELDS TERMINATED BY 'char']
     [ENCLOSED BY 'char']
     [LINES TERMINATED BY 'string']
     [header 'bool']
     [MAX_FILE_SIZE unsigned_number]
```

- query_id: is a string of UUIDs.

- s3_path: is the path where the query result file is saved. The default save path is the matrixone folder mo-data/s3. To modify the default save path, modify `data-dir = "mo-data/s3"` in the configuration file. For a description of the profile parameters, see [General Parameters Configuration](../../System-Parameters/system-parameter.md)

   ```
   root@rootMacBook-Pro 02matrixone % cd matrixone/mo-data
   root@rootMacBook-Pro mo-data % ls
   tn-data         etl             local           logservice-data s3
   ```

   __Note:__ If you need to export a `csv` file. The path needs to start with `etl:` The beginning.

- [FIELDS TERMINATED BY 'char']: Optional parameter. Field split symbol, defaults to single quotes`'`.

- [ENCLOSED BY 'char']: Optional parameter. Fields include symbols, defaulting to the quotient double sign `'`.

- [LINES TERMINATED BY 'string']: Optional parameter. End of line symbol, defaults to line break symbol `\n`.

- [header 'bool']: optional argument. The bool type can be selected as `true` or `false`. The header row for each column name in the first line `of the csv` file.

- [MAX_FILE_SIZE unsigned_number]: Optional parameter. Maximum file size of the file in KB. The default is 0.

## Examples

- Example 1

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> /* cloud_user */select a from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.16 sec)
-- Queries the ID of the most recently executed query in the current session
mysql> select last_query_id();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| f005ebc6-a3dc-11ee-bb76-26dd28356ef3 |
+--------------------------------------+
1 row in set (0.12 sec)
-- Get results for this query ID
mysql> select * from result_scan('f005ebc6-a3dc-11ee-bb76-26dd28356ef3') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
-- View metadata for this query ID
mysql> select * from meta_scan('f005ebc6-a3dc-11ee-bb76-26dd28356ef3') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| f005ebc6-a3dc-11ee-bb76-26dd28356ef3 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_f005ebc6-a3dc-11ee-bb76-26dd28356ef3_1.blk | 2023-12-26 18:53:01 | 0.000003814697265625 | t1     |       0 | 2023-12-27 18:53:01 | a -> a    |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.01 sec)

-- Save query results locally
MODUMP QUERY_RESULT 'f005ebc6-a3dc-11ee-bb76-26dd28356ef3' INTO 'etl:your_local_path';
```

- Example 2

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> /* save_result */select a from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.02 sec)

mysql> select last_query_id();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| afc82394-a45e-11ee-bb9a-26dd28356ef3 |
+--------------------------------------+
1 row in set (0.00 sec)

mysql> select * from result_scan('afc82394-a45e-11ee-bb9a-26dd28356ef3') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

mysql> select * from meta_scan('afc82394-a45e-11ee-bb9a-26dd28356ef3') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| afc82394-a45e-11ee-bb9a-26dd28356ef3 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_afc82394-a45e-11ee-bb9a-26dd28356ef3_1.blk | 2023-12-27 10:21:47 | 0.000003814697265625 | t1     |       0 | 2023-12-28 10:21:47 | a -> a    |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.00 sec)
```

- Example 3

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> show create table t1;
+-------+--------------------------------------------+
| Table | Create Table                               |
+-------+--------------------------------------------+
| t1    | CREATE TABLE `t1` (
`a` INT DEFAULT NULL
) |
+-------+--------------------------------------------+
1 row in set (0.02 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
| query_id                             | statement            | account_id | role_id | result_path                                                         | create_time         | result_size           | tables | user_id | expired_time        | ColumnMap                                    |
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
| 617647f4-a45c-11ee-bb97-26dd28356ef3 | show create table t1 |          0 |       0 | SHARED:/query_result/sys_617647f4-a45c-11ee-bb97-26dd28356ef3_1.blk | 2023-12-27 10:05:17 | 0.0000858306884765625 |        |       0 | 2023-12-28 10:05:17 | Table -> Table, Create Table -> Create Table |
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
1 row in set (0.00 sec)
```

- Example 4

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> desc t1;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
1 row in set (0.03 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
| query_id                             | statement | account_id | role_id | result_path                                                         | create_time         | result_size         | tables     | user_id | expired_time        | ColumnMap                                                                                                      |
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
| 143a54b6-a45d-11ee-bb97-26dd28356ef3 | desc t1   |          0 |       0 | SHARED:/query_result/sys_143a54b6-a45d-11ee-bb97-26dd28356ef3_1.blk | 2023-12-27 10:10:17 | 0.00016021728515625 | mo_columns |       0 | 2023-12-28 10:10:17 | Field -> Field, Type -> Type, Null -> Null, Key -> Key, Default -> Default, Extra -> Extra, Comment -> Comment |
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

- Example 5

```sql
mysql> CREATE TABLE numbers(pk INTEGER PRIMARY KEY, ui BIGINT UNSIGNED, si BIGINT);
Query OK, 0 rows affected (0.02 sec)

mysql> INSERT INTO numbers VALUES (0, 0, -9223372036854775808), (1, 18446744073709551615, 9223372036854775807);
Query OK, 2 rows affected (0.01 sec)

mysql> SET @si_min = -9223372036854775808;
Query OK, 0 rows affected (0.00 sec)

mysql> PREPARE s2 FROM 'SELECT * FROM numbers WHERE si=?';
Query OK, 0 rows affected (0.01 sec)

mysql> EXECUTE s2 USING @si_min;
+------+------+----------------------+
| pk   | ui   | si                   |
+------+------+----------------------+
|    0 |    0 | -9223372036854775808 |
+------+------+----------------------+
1 row in set (0.02 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
| query_id                             | statement                                                                                         | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap                    |
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
| e83b8df2-a45d-11ee-bb98-26dd28356ef3 | EXECUTE s2 USING @si_min // SELECT * FROM numbers WHERE si=? ; SET @si_min = -9223372036854775808 |          0 |       0 | SHARED:/query_result/sys_e83b8df2-a45d-11ee-bb98-26dd28356ef3_1.blk | 2023-12-27 10:16:13 | 0.000019073486328125 |        |       0 | 2023-12-28 10:16:13 | pk -> pk, ui -> ui, si -> si |
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
1 row in set (0.00 sec)
```

- Example 6

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

mysql> select * from meta_scan(last_query_id()) as t;
ERROR 20405 (HY000): file query_result_meta/sys_c16859e4-a462-11ee-bba0-26dd28356ef3.blk is not found
```