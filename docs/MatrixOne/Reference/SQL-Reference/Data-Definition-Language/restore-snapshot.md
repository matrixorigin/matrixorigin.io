# RESTORE ... SNAPSHOT

## Syntax Description

`RESTORE ... SNAPSHOT` is used to restore data at the cluster/tenant/database/table level from previously created snapshots of the corresponding levels.

## Syntax Structure

```sql
RESTORE CLUSTER {SNAPSHOT = <snapshot_name>};

RESTORE ACCOUNT <account_name> {SNAPSHOT = <snapshot_name>} [TO ACCOUNT <target_account_name>];

RESTORE DATABASE [<account_name>.]<database_name> {SNAPSHOT = <snapshot_name>} [TO ACCOUNT <target_account_name>];

RESTORE TABLE [<account_name>.]<database_name>.<table_name> {SNAPSHOT = <snapshot_name>} [TO ACCOUNT <target_account_name>];
```

- `RESTORE DATABASE` and `RESTORE TABLE` default to the current account when `<account_name>.` is omitted. Use the dotted form when restoring objects owned by another account.
- The snapshot clause also accepts the legacy form `FROM SNAPSHOT <snapshot_name>` or `{SNAPSHOT = "<snapshot_name>"}`.

## Examples

### Example 1: Restore Cluster
  
```sql
-- Execute in tenants acc1, acc2
CREATE DATABASE db1;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

-- Execute in system tenant sys
CREATE SNAPSHOT cluster_sp1 FOR CLUSTER; -- Create cluster snapshot

-- Execute in tenants acc1, acc2
DROP DATABASE db1; -- Drop database db1

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

-- Execute in system tenant sys
RESTORE CLUSTER {SNAPSHOT = "cluster_sp1"}; -- Restore cluster from snapshot

-- Execute in tenants acc1, acc2
mysql> SHOW DATABASES; -- Restoration successful
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

### Example 2: Restore Tenant

```sql
-- Execute in tenant acc1
CREATE DATABASE db1;
CREATE DATABASE db2;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)

CREATE SNAPSHOT acc1_snap1 FOR ACCOUNT acc1; -- Create snapshot
DROP DATABASE db1; -- Drop databases db1, db2
DROP DATABASE db2;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

RESTORE ACCOUNT acc1 {SNAPSHOT = acc1_snap1}; -- Restore tenant snapshot

mysql> SHOW DATABASES; -- Restoration successful
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.01 sec)
```

### Example 3: Restore Database

```sql
-- Execute in tenant acc1
CREATE DATABASE db1;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.00 sec)

CREATE SNAPSHOT acc1_db_snap1 FOR ACCOUNT acc1; -- Create snapshot
DROP DATABASE db1; -- Drop database db1

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

-- Execute in system tenant sys
RESTORE DATABASE acc1.db1 {SNAPSHOT = acc1_db_snap1}; -- Restore database snapshot

mysql> SHOW DATABASES; -- Restoration successful
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.00 sec)
```

### Example 4: Restore Table

```sql
-- Execute in tenant acc1
CREATE TABLE t1(n1 INT);
INSERT INTO t1 VALUES(1);

mysql> SELECT * FROM t1;
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

CREATE SNAPSHOT acc1_tab_snap1 FOR ACCOUNT acc1; -- Create snapshot
TRUNCATE TABLE t1; -- Clear table t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

-- Execute in system tenant sys
RESTORE TABLE acc1.db1.t1 {SNAPSHOT = acc1_tab_snap1}; -- Restore table snapshot

mysql> SELECT * FROM t1; -- Restoration successful
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

### Example 5: System Tenant Restores Regular Tenant to Itself

```sql
-- Execute in tenant acc1
CREATE DATABASE db1;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

-- Execute in system tenant sys
CREATE SNAPSHOT acc1_snap1 FOR ACCOUNT acc1; -- Create snapshot for acc1

-- Execute in tenant acc1
DROP DATABASE db1; -- Drop database db1

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

-- Execute in system tenant sys
RESTORE ACCOUNT acc1 {SNAPSHOT = acc1_snap1} TO ACCOUNT acc1; -- Restore snapshot to acc1

-- Execute in tenant acc1
mysql> SHOW DATABASES; -- Restoration successful
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

### Example 6: System Tenant Restores Regular Tenant to New Tenant

```sql
-- Execute in tenant acc1
CREATE DATABASE db1;

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

-- Execute in system tenant sys
CREATE SNAPSHOT acc1_snap1 FOR ACCOUNT acc1; -- Create snapshot for acc1

-- Execute in tenant acc1
DROP DATABASE db1; -- Drop database db1

mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

-- Execute in system tenant sys
CREATE ACCOUNT acc2 ADMIN_NAME admin IDENTIFIED BY '111'; -- Create target tenant first
RESTORE ACCOUNT acc1 {SNAPSHOT = acc1_snap1} TO ACCOUNT acc2; -- Restore acc1 snapshot to acc2

-- Execute in tenant acc1
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.00 sec)

-- Execute in tenant acc2
mysql> SHOW DATABASES; -- Restored to acc2
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

## Limitations

- System tenant can only perform tenant-level restoration when restoring to a new tenant.

- Only system tenant can perform restoration to a new tenant, and only tenant-level restoration is allowed. The new tenant must be created in advance. To avoid object conflicts, it's recommended to use a newly created tenant.
