---
title: "Branch Protect Snapshots"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.12
last_updated: 2026-05-19
llms_summary: "Internal snapshots automatically created by DATA BRANCH CREATE to protect parent data from garbage collection, hidden from SHOW SNAPSHOTS and reclaimed on DAG subtree deletion."
---

# Branch Protect Snapshots

> When `DATA BRANCH CREATE TABLE` or `DATA BRANCH CREATE DATABASE` creates a branch, MatrixOne automatically inserts an internal snapshot row into `mo_catalog.mo_snapshots` with `kind='branch'`. This protects the parent table's data from garbage collection while any descendant branch remains alive. Branch snapshots are invisible to `SHOW SNAPSHOTS`, rejected by `DROP SNAPSHOT`, and reclaimed automatically when the entire DAG subtree is deleted.

## Syntax

No dedicated SQL syntax — branch protect snapshots are created automatically by `DATA BRANCH CREATE TABLE` and `DATA BRANCH CREATE DATABASE`. They are internal catalog rows in `mo_catalog.mo_snapshots` and cannot be created, listed, or dropped directly with snapshot commands (`CREATE SNAPSHOT`, `SHOW SNAPSHOTS`, `DROP SNAPSHOT`).

## Arguments

Branch protect snapshots are identified by the following internal naming and classification conventions:

| Attribute | Value | Description |
|---|---|---|
| `sname` | `__mo_branch_<child_table_id>` | Snapshot name; `child_table_id` is the cluster-unique table identifier of the child branch table, formatted as a decimal string |
| `kind` | `branch` | Distinguishes branch protect snapshots from user-created (`kind='user'`) snapshots |
| `level` | `table` | All branch protect snapshots are table-level |
| `obj_id` | parent `table_id` | References the parent table whose data is pinned by this snapshot |
| `account_name` | parent account name | The account that owns the parent table |

## What They Are

A branch protect snapshot is an internal row in `mo_catalog.mo_snapshots` that pins the parent table's data at the branch creation timestamp. It is not a user snapshot — it has `kind='branch'` and is managed entirely by the data branch subsystem.

Key properties:

| Property | Value |
|---|---|
| `sname` | `__mo_branch_<child_table_id>` (decimal) |
| `kind` | `branch` |
| `level` | `table` |
| Created by | `DATA BRANCH CREATE TABLE` / `DATA BRANCH CREATE DATABASE` |
| Visibility | Hidden from `SHOW SNAPSHOTS` |
| Droppable by user | No — `DROP SNAPSHOT` rejects it |
| Reclaimed by | `DATA BRANCH DELETE TABLE` / `DATA BRANCH DELETE DATABASE` / `DROP TABLE` |

## Lifecycle

### Creation

When a `DATA BRANCH CREATE TABLE` or `DATA BRANCH CREATE DATABASE` statement succeeds, MatrixOne inserts two rows atomically within the same transaction:

1. A row in `mo_catalog.mo_branch_metadata` tracking the parent-child relationship.
2. A row in `mo_catalog.mo_snapshots` with `kind='branch'` pinning the parent's `clone_ts`.

The snapshot name follows the convention `__mo_branch_<child_table_id>` where `child_table_id` is a cluster-unique table identifier.

### Visibility

Branch protect snapshots are excluded from all user-facing snapshot operations:

- `SHOW SNAPSHOTS` filters out rows where `kind='branch'`.
- Snapshot quota counts ignore `kind='branch'` rows.
- `DROP SNAPSHOT` returns an error when the target is a branch snapshot.

### Reclamation

Branch snapshots are reclaimed automatically through a DAG-aware cascade:

1. When a branch child table is dropped (via `DATA BRANCH DELETE TABLE`, `DATA BRANCH DELETE DATABASE`, or `DROP TABLE`), the corresponding metadata row has `table_deleted` set to `true`.
2. The reclaim algorithm walks the DAG upward from dropped tables, checking every ancestor's subtree for full deletion.
3. When an entire subtree is confirmed deleted (all descendants have `table_deleted=true`), the ancestor's branch snapshot is removed from `mo_snapshots`.
4. The reclaim is cycle-safe — a corrupted `mo_branch_metadata` cycle logs a warning and terminates without deadlock.

## Examples

### Verifying branch snapshot creation and DROP SNAPSHOT rejection

```sql
DROP DATABASE IF EXISTS protect_db1;
CREATE DATABASE protect_db1;
USE protect_db1;

CREATE TABLE t1(a INT PRIMARY KEY, b VARCHAR(10));
INSERT INTO t1 VALUES (1, 'a'), (2, 'b');

DATA BRANCH CREATE TABLE t2 FROM t1;

-- The branch protect snapshot exists with kind='branch'
SET @t2_tid = (
  SELECT rel_id FROM mo_catalog.mo_tables
  WHERE reldatabase = 'protect_db1' AND relname = 't2'
);
SET @t1_tid = (
  SELECT rel_id FROM mo_catalog.mo_tables
  WHERE reldatabase = 'protect_db1' AND relname = 't1'
);
SET @t2_sname = CONCAT('__mo_branch_', CAST(@t2_tid AS CHAR));

SELECT COUNT(*) AS branch_rows_total
  FROM mo_catalog.mo_snapshots WHERE kind = 'branch';
SELECT level, database_name, table_name,
       obj_id = @t1_tid AS obj_id_matches_parent
  FROM mo_catalog.mo_snapshots
  WHERE sname = @t2_sname AND kind = 'branch';

-- SHOW SNAPSHOTS hides branch-kind rows
SELECT COUNT(*) AS branch_rows_in_show
  FROM mo_catalog.mo_snapshots
  WHERE sname NOT LIKE 'ccpr_%' AND kind != 'branch'
    AND sname LIKE '__mo_branch_%';

-- DROP SNAPSHOT on a branch protect snapshot is rejected
SET @drop_snap_sql = CONCAT('DROP SNAPSHOT ', @t2_sname);
-- Expected-Success: false
PREPARE drop_snap_stmt FROM @drop_snap_sql;
-- ERROR: internal error: DROP SNAPSHOT is rejected for branch protect snapshots
-- Expected-Success: false
EXECUTE drop_snap_stmt;
-- Expected-Success: false
DEALLOCATE PREPARE drop_snap_stmt;

DROP TABLE t2;
DROP TABLE t1;
DROP DATABASE protect_db1;
```

## Notes

- Branch protect snapshots are an internal mechanism. You do not create, list, or drop them directly. Use `SHOW SNAPSHOTS` only for user snapshots.
- If you need to free storage, drop the branch child tables with `DATA BRANCH DELETE TABLE` or `DATA BRANCH DELETE DATABASE`. The associated snapshots are cleaned up automatically.
- The `kind='branch'` column in `mo_catalog.mo_snapshots` is the single source of truth for distinguishing internal from user snapshots. Do not modify it directly.
