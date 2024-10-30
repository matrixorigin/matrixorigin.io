# CREATEPITR

## Syntax description

The `CREATE PITR` command is used to create a recovery point for Point-in-Time Recovery (PITR). Cluster administrators can create cluster-level or tenant-level pitrs, while tenant administrators can create tenant/database/table-level pitrs for the current tenant. The information of each pitr is only visible to the tenant that created the pitr, ensuring data isolation and security.

## Grammar structure

```sql
create pitr <pitr_name> for
    [cluster]|[account <account_name>]|[database <database_name>]|[table <database_name> <table_name>]
    range <value><unit>
```

### Grammar explanation

**range**: int, time range value, 1-100.
**unit**: string time range unit, optional range h (hour), d (day, default), mo (month), y (year)

## Example

**Example 1: Cluster administrator creates pitr for cluster**

```sql
create pitr cluster_pitr1 for cluster range 1 "d";
mysql> show pitr;
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME     | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| cluster_pitr1 | 2024-10-18 14:07:10 | 2024-10-18 14:07:10 | cluster    | *            | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**Example 2: Cluster administrator creates pitr for tenant**

```sql
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
mysql> create pitr account_pitr1 for account acc1 range 1 "d";
mysql> show pitr where pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:11:57 | 2024-10-18 14:11:57 | account    | acc1         | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**Example 3: Tenant administrator creates pitr for tenant**

```sql
create pitr account_pitr1 range 2 "h";

mysql> show pitr where pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:23:12 | 2024-10-18 14:23:12 | account    | acc1         | *             | *          |           2 | h         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**Example 4: Tenant administrator creates pitr for database**

```sql
mysql> create pitr db_pitr1 for database db1 range 1 'y';
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='db_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| db_pitr1  | 2024-10-18 14:26:02 | 2024-10-18 14:26:02 | database   | acc1         | db1           | *          |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**Example 5: Tenant administrator creates pitr for table**

```sql
mysql> create pitr tab_pitr1 for database  db1 table t1 range 1 'y';
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr where pitr_name='tab_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr1 | 2024-10-18 14:28:53 | 2024-10-18 14:28:53 | table      | acc1         | db1           | t1         |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

## limit

- Cluster administrators can only create tenant-level pitrs when creating pitrs for other tenants.