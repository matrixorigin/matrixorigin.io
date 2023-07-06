# **PURGE_LOG()**

## **Description**

`PURGE_LOG()` is used to delete the log.

!!! note
    Currently, only the sys user (the cluster administrator) has permission to execute the `PURGE_LOG()` function for log deletion operations.

## **Syntax**

```
> PURGE_LOG('sys_table_name', 'datetime')
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| 'sys_table_name' | Currently, there are only three system tables that can be deleted: metric, raw_log, and statement_info. <br>  __Note:__ 'sys_table_name' must be enclosed in single quotes.|
| 'datetime' | Select a date and delete logs generated before that date. <br>  __Note:__ 'datetime' must be enclosed in single quotes. |

## **Examples**

- Example 1:

```sql
-- 删除 2023-06-30 这一天之前的 statement_info 类型的日志
mysql> select purge_log('statement_info', '2023-06-30') a;
+------+
| a    |
+------+
|    0 |
+------+
1 row in set (0.01 sec)
```

- Example 2:

```sql
-- Delete the statement_info type logs before 2023-06-30
mysql> select purge_log('statement_info', '2023-06-30') a;
+------+
| a |
+------+
| 0 |
+------+
1 row in set (0.01 sec)
```

- Example 2:

```sql
-- Query the time and quantity of metric log collection
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collect time) | count(1) |
+-------------------+----------+
| 2023-07-04 | 74991 |
| 2023-07-03 | 38608 |
| 2023-07-05 | 378 |
+-------------------+----------+
3 rows in set (0.04 sec)

-- Delete rawlog, statement_info, and metric logs before 2023-07-04
mysql> select purge_log('rawlog, statement_info, metric', '2023-07-04');
+------------------------------------------------- ----+
| purge_log(rawlog, statement_info, metric, 2023-07-04) |
+------------------------------------------------- ----+
| 0 |
+------------------------------------------------- ----+
1 row in set (0.03 sec)

-- Query the number of metric logs for the three days of 2023-07-04, 2023-07-03 and 2023-07-05 again
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collecttime) | count(1) |
+-------------------+----------+
| 2023-07-05        |      598 |
+-------------------+----------+
1 rows in set (0.01 sec)
```
