# **SHOW ACCOUNTS**

## **Function description**

Lists meta-information and statistics for tenant users created under your account.

## **Function syntax**

```
> SHOW ACCOUNTS;
```

### Tenant user information details

| Column Name | Information | Type | Data Source |
| --------------| -------------------| ---------------| -----------------------------------------------|
| ACCOUNT_NAME | tenant name | varchar | mo_account |
| ADMIN_NAME | Default super administrator name when created | varchar | In the mo_user table under each tenant |
| CREATED_TIME | Creation time | timestamp | mo_account |
| STATUS | Current status, OPEN or SUSPENDED | varchar | mo_account |
| SUSPENDED_TIME | Suspension time | timestamp | mo_account |
| DB_COUNT | Number of databases | bigint unsigned | mo_tables |
| TBL_COUNT | Number of tables | bigint unsigned | mo_tables |
| SIZE | Total space used (MB) | decimal(29,3) | sum(mo_table_size(mt.reldatabase,mt.relname) |
| SNAPSHOT_SIZE | Backup data storage size (MB) | --| --|
| COMMENTS | COMMENT information when created | varchar | mo_account |

## **Example**

```sql
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
| account_name | admin_name | created_time        | status | suspended_time | db_count | tbl_count | size     | snapshot_size | comments       |
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
| sys          | root       | 2024-12-06 03:37:02 | open   | NULL           |        7 |       108 | 3.188068 |             0 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
1 row in set (0.01 sec)
```