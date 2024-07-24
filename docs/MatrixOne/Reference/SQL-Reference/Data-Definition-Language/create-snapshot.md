# CREATE SNAPSHOT

## Syntax Description

The `CREATE SNAPSHOT` command is used to create a snapshot. System tenants can create snapshots for themselves or for regular tenants, but regular tenants can only create snapshots for themselves. Snapshots created by a tenant are visible only to this tenant.

## Syntax structure

```sql
> CREATE SNAPSHOT snapshot_name FOR ACCOUNT account_name
```

## Examples

```sql
--Execute under system tenant sys
create snapshot sp1 for account sys;
create snapshot sp2 for account acc1;

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp2           | 2024-05-10 09:49:08.925908 | account        | acc1         |               |            |
| sp1           | 2024-05-10 09:48:50.271707 | account        | sys          |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
2 rows in set (0.00 sec)

--Executed under tenant acc1
mysql> create snapshot sp3 for account acc2;--Regular tenants can only create snapshots for themselves
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant

create snapshot sp3 for account acc1;

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp3           | 2024-05-10 09:53:09.948762 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## Limitations

- Currently only tenant-level snapshots are supported, not cluster-level, database-level, and table-level snapshots.