# DATA BRANCH DIFF/MERGE Full-Scan Fallback

## Description

`DATA BRANCH DIFF` and `DATA BRANCH MERGE` normally compare the two
branch tables incrementally by walking a per-row commit-timestamp
change stream. When that stream is not available for the two tables,
the server transparently falls back to a **full-table scan** path
(the `data_branch_fullscan` code path): both tables are read from the
current transaction view into a hashmap keyed by primary key, and the
resulting INSERT / DELETE / UPDATE set is computed by probing one
hashmap against the other.

The fallback has the same INSERT / DELETE / UPDATE semantics as the
incremental path; it just trades incremental efficiency for a scan of
each side's current rows. No syntax change is involved: the same
`DATA BRANCH DIFF` / `DATA BRANCH MERGE` statements trigger it
automatically when needed.

This page documents the `data_branch_fullscan` feature and its
observable effects.

## Syntax

No new SQL syntax. The fallback is activated inside the existing
statements:

```
DATA BRANCH DIFF target_table [{ SNAPSHOT = 'snapshot_name' }]
    AGAINST base_table [{ SNAPSHOT = 'snapshot_name' }]
    [COLUMNS (col_name [, col_name ...])]
    [OUTPUT output_option];

DATA BRANCH MERGE source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO destination_table [{ SNAPSHOT = 'snapshot_name' }]
    [WHEN CONFLICT conflict_option];
```

See [DATA BRANCH DIFF](data-branch-diff-en.md) and
[DATA BRANCH MERGE](data-branch-merge-en.md) for full syntax.

## Arguments

No new arguments. The fallback uses the same target / base tables,
snapshot options, `COLUMNS` projection, conflict options, and
`OUTPUT` options as the incremental path.

The fallback path is decided entirely by the server based on the
error returned from the incremental pipeline:

| Trigger | Meaning |
|---------|---------|
| `ErrNoCommitTSColumn` | The underlying storage objects do not carry a per-row commit-timestamp column (for example, TN-merged objects produced on the 3.0-dev codebase). Row-level time filtering is impossible, so the fallback compares the live snapshots directly. |
| `ErrFileNotFound` | Object files referenced by the incremental change handle have been garbage-collected, but the two tables are still reachable through live objects in the current view. The fallback rereads the live rows. |

All other errors from the incremental path continue to propagate
unchanged.

## Usage Notes

- **No user action required.** If the server can use the incremental
  path, it does; if it cannot and the fallback applies, the same
  statement succeeds without the caller changing anything.
- **Same diff semantics.** For each PK the fallback produces the
  same INSERT / DELETE / UPDATE classification as the incremental
  path:
    - Target-only row → INSERT on the target side.
    - Base-only row → INSERT on the base side.
    - Same PK on both sides with different column values → UPDATE.
    - Same PK on both sides with identical values → no diff row.
- **Server logs identify the fallback.** Each fallback attempt is
  logged at info level as
  `DataBranch-DiffOnBase falling back to full-table-scan` or
  `DataBranch-HashDiff falling back to full-table-scan`, followed by
  `DataBranch-FullScanDiff-Start` and, at completion,
  `DataBranch-FullScanDiff-Done`. Use these log lines to confirm
  which path executed the statement.
- **Performance characteristics.** Because both tables are scanned
  end-to-end, fallback latency and memory use scale with the total
  number of live rows in each side, not with the incremental change
  set. Plan accordingly when running large diffs immediately after
  operations (checkpoint + GC, or dropping and recreating via
  snapshot) that strip the per-row commit-ts metadata.

## Examples

### Example 1: Diff after flush + checkpoint + GC

Produce diffs between two branches after the underlying objects have
been flushed, checkpointed, and garbage-collected. The incremental
change stream no longer has the per-row commit-ts metadata it needs,
so the server falls back to the full-table scan path and still
returns correct diff / merge results.

```sql
CREATE DATABASE test_gc_diff;
USE test_gc_diff;

CREATE TABLE c_src (a INT PRIMARY KEY, b INT);
INSERT INTO c_src SELECT result, result FROM generate_series(1, 200000) g;

DATA BRANCH CREATE TABLE c_tar FROM c_src;
UPDATE c_tar SET b = b + 1 WHERE a mod 1119 = 0;

-- Diff before GC: returns the updated rows.
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT SUMMARY;

-- Flush + checkpoint + GC.
SELECT mo_ctl('dn', 'flush', 'test_gc_diff.c_tar');
SELECT mo_ctl('dn', 'flush', 'test_gc_diff.c_src');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'diskcleaner', 'force_gc');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'diskcleaner', 'force_gc');

-- Diff after GC: the server falls back to the full-table-scan path
-- and still reports the same updated rows.
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT SUMMARY;
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT COUNT;

DROP TABLE c_src;
DROP TABLE c_tar;
DROP DATABASE test_gc_diff;
```

### Example 2: Merge then diff after GC preserves INSERT classification

After merging a branch's inserts back into the base, the fallback
path must continue to classify those rows as regular INSERTs on the
target side (not as "vanished" rows) even after GC rotates the
underlying object files.

```sql
CREATE TABLE t1 (a INT PRIMARY KEY, b INT);
INSERT INTO t1 VALUES (1,1), (2,2), (3,3);

DATA BRANCH CREATE TABLE t2 FROM t1;
INSERT INTO t2 VALUES (4,4), (5,5);

DATA BRANCH DIFF  t2 AGAINST t1;
DATA BRANCH MERGE t2 INTO    t1;
DATA BRANCH DIFF  t2 AGAINST t1;

UPDATE t1 SET b = b + 1 WHERE a = 4;
DATA BRANCH DIFF t2 AGAINST t1;

-- Flush + checkpoint + GC.
SELECT mo_ctl('dn', 'flush', 'test.t2');
SELECT mo_ctl('dn', 'flush', 'test.t1');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'diskcleaner', 'force_gc');

-- Same diff is still reported via the fallback path.
DATA BRANCH DIFF t2 AGAINST t1;

DROP TABLE t1;
DROP TABLE t2;
```

### Example 3: Diff via snapshots after the source tables are dropped

If both sides were snapshotted, DIFF via `{SNAPSHOT = '...'}` still
succeeds even after the live tables are dropped. The snapshot-driven
read path exercises the same
`data_branch_fullscan` infrastructure for object selection.

```sql
CREATE DATABASE sp_diff;
USE sp_diff;

CREATE TABLE c_base (a INT PRIMARY KEY, b INT);
INSERT INTO c_base SELECT result, result FROM generate_series(1, 100) g;
SELECT mo_ctl('dn', 'flush', 'sp_diff.c_base');
CREATE SNAPSHOT sp_c_base FOR ACCOUNT sys;

DATA BRANCH CREATE TABLE c_tar FROM c_base;
UPDATE c_tar SET b = b + 1 WHERE a mod 7 = 0;
SELECT mo_ctl('dn', 'flush', 'sp_diff.c_tar');
CREATE SNAPSHOT sp_c_tar FOR ACCOUNT sys;

-- Diff before drop.
DATA BRANCH DIFF c_tar AGAINST c_base OUTPUT SUMMARY;

DROP TABLE c_tar;
DROP TABLE c_base;

-- Diff via snapshots, after both live tables are gone.
DATA BRANCH DIFF
    c_tar{snapshot = 'sp_c_tar'}
    AGAINST
    c_base{snapshot = 'sp_c_base'}
    OUTPUT SUMMARY;

DROP SNAPSHOT sp_c_tar;
DROP SNAPSHOT sp_c_base;
DROP DATABASE sp_diff;
```

## Notes

1. The fallback is an implementation detail of `DATA BRANCH DIFF` /
   `DATA BRANCH MERGE`; it is not exposed as a separate SQL
   statement.
2. The decision is all-or-nothing per statement: once the server
   decides to fall back, the full diff is produced by the full-scan
   path. The incremental and fallback paths are never mixed for the
   same statement invocation.
3. When `COLUMNS (...)` is used on a fallback diff, the projection
   is applied to the scan output exactly as it is in the incremental
   path.
