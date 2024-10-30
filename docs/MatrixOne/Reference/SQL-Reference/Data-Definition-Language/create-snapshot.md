# CREATE SNAPSHOT

## Syntax description

The `CREATE SNAPSHOT` command is used to create a snapshot of the database. Cluster administrators can create cluster-level or tenant-level snapshots, while ordinary tenant administrators can create tenant-level snapshots for the current tenant. Each snapshot is only visible to the tenant that created it, ensuring data isolation and security.

## Grammar structure

```sql
create snapshot <snapshot_name> for [cluster]|[account <account_name>]
```

## Example

**Example 1: Cluster administrator creates a cluster snapshot for the cluster**

```sql
create snapshot cluster_sp for cluster;
mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| cluster_sp    | 2024-10-10 10:40:14.487655 | cluster        |              |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**Example 2: Cluster administrator creates tenant snapshot for tenant**

```sql
mysql> create snapshot account_sp1 for account acc1;
mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp1   | 2024-10-10 10:58:53.946829 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**Example 3: A normal tenant administrator creates a tenant snapshot for the tenant**

```sql
create snapshot account_sp2 for account acc1;

mysql> create snapshot account_sp2 for account acc2;
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant--Tenant administrators can only create snapshots for this tenant

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp2   | 2024-10-10 11:19:12.699093 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## limit

- Currently, only cluster-level and tenant-level snapshots are supported. Database-level and table-level snapshots are not supported.