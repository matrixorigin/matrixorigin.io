# **PURGE_LOG()**

## **Description**

`PURGE_LOG()` deletes logs recorded in MatrixOne database system tables. Returning 0 means the deletion is successful; if the deletion fails, an error message will be returned.

!!! note
    Only the root user (cluster administrator with `MOADMIN` privilege) can execute the `PURGE_LOG()` function for log deletion.

## **Syntax**

```
> PURGE_LOG('sys_table_name', 'date')
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| 'sys_table_name' | Currently, there are only three system tables that can be deleted: metric, rawlog, and statement_info. <br>  __Note:__ 'sys_table_name' must be enclosed in quotes.|
| 'date' | Select a date and delete logs generated before that date. <br>  __Note:__ 'date' must be enclosed in single quotes. |

!!! note
    MatrixOne has only three system log tables: metric, rawlog, and statement_info. For more information about these three tables, please refer to [MatrixOne System Database and Tables](../../System-tables.md).

## **Examples**

- Example 1:

```sql
-- Delete the statement_info type logs before 2023-06-30
mysql> select purge_log('statement_info', '2023-06-30') a;
+------+
| a    |
+------+
| 0    |
+------+
1 row in set (0.01 sec)
```

- Example 2:

```sql
-- Query the time and quantity of metric log collection
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collecttime) | count(1) |
+-------------------+----------+
| 2023-07-07        |    20067 |
| 2023-07-06        |    30246 |
| 2023-07-05        |    27759 |
+-------------------+----------+
3 rows in set (0.00 sec)

-- Delete rawlog, statement_info, and metric logs before 2023-07-06
mysql> select purge_log('rawlog, statement_info, metric', '2023-07-06');
+-------------------------------------------------------+
| purge_log(rawlog, statement_info, metric, 2023-07-06) |
+-------------------------------------------------------+
|                                                     0 |
+-------------------------------------------------------+
1 row in set (0.33 sec)

-- Query the number of metric logs for the three days of 2023-07-05, 2023-07-06 and 2023-07-07 again
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collecttime) | count(1) |
+-------------------+----------+
| 2023-07-06        |    30246 |
| 2023-07-07        |    20121 |
+-------------------+----------+
2 rows in set (0.01 sec)
```
