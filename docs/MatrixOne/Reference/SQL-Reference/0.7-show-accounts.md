# **SHOW ACCOUNTS**

## **Description**

Lists the meta information and statistics for the accounts created.

## **Syntax**

```
> SHOW ACCOUNTS;
```

### Meta information of account

| Column Name            | Details                 | Type             | Date Source                                         |
| -------------- | ------------------- | --------------- | -------------------------------------------- |
| ACCOUNT_NAME   | Account name                | varchar         | mo_account                                   |
| ADMIN_NAME     | The default administrator name is created       | varchar         | In the mo_user table under each account                               |
| CREATED        | Created time                | timestamp       | mo_account                                   |
| STATUS         | Status, OPEN or SUSPENDED | varchar         | mo_account                                   |
| SUSPENDED_TIME | Suspended time                | timestamp       | mo_account                                   |
| DB_COUNT       | the number of databases             | bigint unsigned | mo_tables                                    |
| TABLE_COUNT    | the number of tables                | bigint unsigned | mo_tables                                    |
| ROW_COUNT      | Total line number                 | bigint unsigned | sum(mo_table_rows())                         |
| SIZE           | Total space used (MB)          | decimal(29,3)   | sum(mo_table_size(mt.reldatabase,mt.relname) |
| COMMENT        | COMMENT information at creation time       | varchar         | mo_account                                   |

## **Examples**

```sql
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status | suspended_time | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| sys          | root       | 2023-02-14 06:58:15 | open   | NULL           |        8 |          57 |      2681 | 0.351 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
1 row in set (0.14 sec)
```
