# CREATE SNAPSHOT

## Syntax Description

The `CREATE SNAPSHOT` command is used to create database snapshots. Cluster administrators can create cluster-level or tenant-level snapshots, while regular tenant administrators can create snapshots at the tenant, database, or table level for their current tenant. Each snapshot is only visible to the tenant that created it, ensuring data isolation and security.

## Syntax Structure

```sql
CREATE SNAPSHOT <snapshot_name> FOR [CLUSTER]|[ACCOUNT [<account_name>]]|[DATABASE <database_name>]|[TABLE <database_name> <tables_name>]
```

## Examples

**Example 1: Cluster admin creates a cluster-level snapshot**

```sql
CREATE SNAPSHOT cluster_sp FOR CLUSTER;
mysql> SHOW SNAPSHOTS;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| cluster_sp    | 2024-10-10 10:40:14.487655 | cluster        |              |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**Example 2: Cluster admin creates a tenant-level snapshot**

```sql
mysql> CREATE SNAPSHOT account_sp1 FOR ACCOUNT acc1;
mysql> SHOW SNAPSHOTS;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp1   | 2024-10-10 10:58:53.946829 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**Example 3: Tenant admin creates tenant-level snapshots**

```sql
CREATE SNAPSHOT account_sp2 FOR ACCOUNT acc1;
CREATE SNAPSHOT account_sp3 FOR ACCOUNT;

mysql> CREATE SNAPSHOT account_sp2 FOR ACCOUNT acc2;
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant--Tenant admins can only create snapshots for their own tenant

mysql> SHOW SNAPSHOTS;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp3   | 2025-01-22 08:25:49.810746 | account        | acc1         |               |            |
| account_sp2   | 2025-01-22 08:25:49.349699 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
2 rows in set (0.01 sec)
```

**Example 4: Tenant admin creates database-level snapshot**

```sql
mysql> CREATE SNAPSHOT db_sp1 FOR DATABASE db1;
Query OK, 0 rows affected (0.01 sec)

mysql> SHOW SNAPSHOTS;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| db_sp1        | 2025-01-22 08:31:41.020599 | database       | acc1         | db1           |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.01 sec)
```

**Example 5: Tenant admin creates table-level snapshot**

```sql
mysql> CREATE SNAPSHOT tab_sp1 FOR TABLE db1 t1;
Query OK, 0 rows affected (0.01 sec)

mysql> SHOW SNAPSHOTS;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| tab_sp1       | 2025-01-22 08:32:44.532474 | table          | acc1         | db1           | t1         |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## Limitations

- Cluster administrators can only create tenant-level snapshots for other tenants.