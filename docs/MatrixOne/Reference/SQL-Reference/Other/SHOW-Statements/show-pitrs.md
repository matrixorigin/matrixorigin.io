# SHOW PITR

## Syntax description

`SHOW PITR` returns information about PITR created under the current tenant.

## Grammar structure

```
> SHOW PITR[WHERE expr]
```

## Example

```sql
create pitr account_pitr1 range 2 "h";
create pitr db_pitr1 for database db1 range 1 'y';
create pitr tab_pitr1 for database  db1 table t1 range 1 'y';

mysql> show pitr;
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME     | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr1     | 2024-10-18 14:28:53 | 2024-10-18 14:28:53 | table      | acc1         | db1           | t1         |           1 | y         |
| db_pitr1      | 2024-10-18 14:26:02 | 2024-10-18 14:26:02 | database   | acc1         | db1           | *          |           1 | y         |
| account_pitr1 | 2024-10-18 14:23:12 | 2024-10-18 14:23:12 | account    | acc1         | *             | *          |           2 | h         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
3 rows in set (0.01 sec)

mysql> show pitr where pitr_name='tab_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr1 | 2024-10-18 14:28:53 | 2024-10-18 14:28:53 | table      | acc1         | db1           | t1         |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```
