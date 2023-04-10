# save_query_result Support

After enabling `save_query_result`, MatrixOne will save the query results.

Three parameters affect the saving of query results:

- `save_query_result`: enables/disables the saving of query results.
- `query_result_timeout`: sets the time for saving query results.
- `query_result_maxsize`: sets the maximum size of a single query result.

## Enable `save_query_result`

Enable saving query results for the current session only:

```sql
-- The default is off
set global save_query_result = on  
```

- If you need to enable it globally, you can modify the configuration file `cn.toml` before starting MatrixOne, insert the following code, and save it:

```
[cn.frontend]
saveQueryResult = "on"  // The default is off
```

## Set the saving time

Set the save time unit to hours.

- Enable `query_result_timeout` only for the current session:

```sql
-- The default is 24
set global query_result_timeout = 48
```

- If you need to enable it globally, you can modify the configuration file `cn.toml` before starting MatrixOne, insert the following code, and save it:

```
[cn.frontend]
queryResultTimeout = 48  //The default is 24
```

__Note:__ If the save time is set to a shorter value than the previous one, it will not affect the previous save results.

## Set the maximum value of a single query result

Set the maximum unit of a single query result to MB.

- Set the maximum value of query results for the current session only:

```sql
-- The default is 100
set global query_result_maxsize = 200
```

- If you need to enable it globally, you can modify the configuration file `cn.toml` before starting MatrixOne, insert the following code, and save it:

```
[cn.frontend]
queryResultMaxsize = 200 // The default is 100
```

__Note:__ If the maximum value of a single query result is set smaller than the previous setting, it will not affect the size of the last saved results.

### Query metadata information

You can use the following SQL statement to query metadata information:

```sql
select * from meta_scan(query_id) as u;
当前 account_id
select query_id from meta_scan(query_id) as u;
```

The metadata information is as follows:

| Column Name | Type | Remarks |
| ------------ | --------- | -------------------------- ------------------------------------- |
| query_id | uuid | query result ID |
| statement | text | SQL statement executed |
| account_id | uint32 | account ID |
| role_id | uint32 | role ID |
| result_path | text | The path to save the query results, the default is the `mo-data/s3` path of the matrixone folder, if you want to modify the default path, you need to modify `data-dir = "mo-data/s3"` in the configuration file . For a description of configuration file parameters, see [Common Parameter Configuration](../../System-Parameters/configuration-settings.md) |
| created_time | timestamp | creation time |
| result_size | float | Result size in MB. |
| tables | text | tables used by SQL |
| user_id | uint32 | user ID |
| expired_time | timestamp | timeout of query result|
| column_map | text | If the query has a column result name with the same name, the result scan will remap the column name |

## Save query results

You can store query results locally or in S3.

### Syntax

```sql
MODUMP QUERY_RESULT query_id INTO s3_path
     [FIELDS TERMINATED BY 'char']
     [ENCLOSED BY 'char']
     [LINES TERMINATED BY 'string']
     [header 'bool']
     [MAX_FILE_SIZE unsigned_number]
```

- query_id: A string of UUID.

- s3_path: the path where the query result file is saved. The default is the mo-data/s3 path in the matrixone folder. If you need to modify the default path, you must modify `data-dir = "mo-data/s3"` in the configuration file. For more information about configuration file parameters, see [Common Parameter Configuration](../../System-Parameters/configuration-settings.md)

   ```
   root@rootMacBook-Pro 02matrixone % cd matrixone/mo-data
   root@rootMacBook-Pro mo-data % ls
   dn-data         etl             local           logservice-data s3
   ```

   __Note:__ If you need to export the `csv` file. The path needs to start with `etl:`.

- [FIELDS TERMINATED BY 'char']: optional parameter. Field delimiter, the default is single quote `'`.

- [ENCLOSED BY 'char']: optional parameter. Fields include symbols, which default to double quotes `"`.

- [LINES TERMINATED BY 'string']: optional parameter. The end of line symbol, the default is the newline symbol `\n`.

The first row of the `csv` file is a header row for each column name.- [header 'bool']: optional parameter. The bool type can choose `true` or `false`.

- [MAX_FILE_SIZE unsigned_number]: optional parameter. The maximum file size of the file is in KB. The default is 0.

## Example

```sql
-- Enable save_query_result
mysql> set global save_query_result = on;
-- Set the saving time to 24 hours
mysql> set global query_result_timeout = 24;
-- Set the maximum value of a single query result to 100M
mysql> set global query_result_maxsize = 200;
-- Create a table and insert datas
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
-- You can check the table structure to confirm that the inserted data is correct
mysql> select a from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.16 sec)
-- Query the most recently executed query ID in the current session
mysql> select last_query_id();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| c187873e-c25d-11ed-aa5a-acde48001122 |
+--------------------------------------+
1 row in set (0.12 sec)
-- Get the query results for this query ID
mysql> select * from result_scan('c187873e-c25d-11ed-aa5a-acde48001122') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
-- Check the metadata for this query ID
mysql> select * from meta_scan('c187873e-c25d-11ed-aa5a-acde48001122') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| c187873e-c25d-11ed-aa5a-acde48001122 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_c187873e-c25d-11ed-aa5a-acde48001122_1.blk | 2023-03-14 19:45:45 | 0.000003814697265625 | t1     |       1 | 2023-03-15 19:45:45 | t1.a -> a |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.00 sec)

-- Save query results locally
MODUMP QUERY_RESULT c187873e-c25d-11ed-aa5a-acde48001122 INTO 'etl:your_local_path';
```

## Constraints

MatrixOne only supports on saving the query results of `SELECT` and `SHOW`.
