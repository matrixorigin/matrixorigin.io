# CREATE PITR

## Syntax Description

The `CREATE PITR` command is used to create Point-in-Time Recovery (PITR) restore points. Cluster administrators can create cluster-level or tenant-level PITRs, while tenant administrators can create PITRs for their current tenant at the tenant/database/table level. Each PITR's information is only visible to the tenant that created it, ensuring data isolation and security.

## Syntax Structure

```sql
CREATE PITR <pitr_name> FOR 
    [CLUSTER]|[ACCOUNT <account_name>]|[DATABASE <database_name>]|[TABLE <database_name> <table_name>]
    RANGE <value><unit>
```

### Syntax Explanation

**RANGE**:  

- `value`: Integer, time range value (1-100).  
- `unit`: String, time range unit. Options:  
    - `h` (hours)  
    - `d` (days, default)  
    - `mo` (months)  
    - `y` (years)  

## Examples

**Example 1: Cluster admin creates a cluster-level PITR**

```sql
CREATE PITR cluster_pitr1 FOR CLUSTER RANGE 1 "d";
mysql> SHOW PITR;
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME     | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| cluster_pitr1 | 2024-10-18 14:07:10 | 2024-10-18 14:07:10 | cluster    | *            | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**Example 2: Cluster admin creates a tenant-level PITR**

```sql
CREATE ACCOUNT acc1 ADMIN_NAME 'root' IDENTIFIED BY '111';
CREATE ACCOUNT acc2 ADMIN_NAME 'root' IDENTIFIED BY '111';
mysql> CREATE PITR account_pitr1 FOR ACCOUNT acc1 RANGE 1 "d";
mysql> SHOW PITR WHERE pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:11:57 | 2024-10-18 14:11:57 | account    | acc1         | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**Example 3: Tenant admin creates a tenant-level PITR**

```sql
CREATE PITR account_pitr1 FOR ACCOUNT RANGE 2 "h";

mysql> SHOW PITR WHERE pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:23:12 | 2024-10-18 14:23:12 | account    | acc1         | *             | *          |           2 | h         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**Example 4: Tenant admin creates a database-level PITR**

```sql
mysql> CREATE PITR db_pitr1 FOR DATABASE db1 RANGE 1 'y';
Query OK, 0 rows affected (0.01 sec)

mysql> SHOW PITR WHERE pitr_name='db_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| db_pitr1  | 2024-10-18 14:26:02 | 2024-10-18 14:26:02 | database   | acc1         | db1           | *          |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**Example 5: Tenant admin creates a table-level PITR**

```sql
mysql> CREATE PITR tab_pitr1 FOR TABLE db1 TABLE t1 RANGE 1 'y';
Query OK, 0 rows affected (0.02 sec)

mysql> SHOW PITR WHERE pitr_name='tab_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr1 | 2024-10-18 14:28:53 | 2024-10-18 14:28:53 | table      | acc1         | db1           | t1         |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

## Limitations

- Cluster administrators can only create tenant-level PITRs for other tenants.
