# git4data Branch Diff: Observable Guarantees

## Description

The `git4data` test family exercises `DATA BRANCH DIFF` under edge
conditions that the v3.0.10 release explicitly makes correct for
end users. This reference page consolidates the user-observable
guarantees those tests pin down. All behaviors below are produced
by the existing `DATA BRANCH DIFF` statement and its `COLUMNS`
projection — no new SQL syntax is introduced.

Related references: [DATA BRANCH DIFF](data-branch-diff-en.md),
[DATA BRANCH MERGE](data-branch-merge-en.md),
[DATA BRANCH DIFF/MERGE Full-Scan Fallback](data-branch-fullscan-en.md).

## Syntax

No new syntax. The guarantees below apply to the existing
`DATA BRANCH DIFF` statement, using standard options:

```
DATA BRANCH DIFF target_table [{ SNAPSHOT = 'snapshot_name' }]
    AGAINST base_table [{ SNAPSHOT = 'snapshot_name' }]
    [COLUMNS (col_name [, col_name ...])]
    [OUTPUT output_option];
```

See [DATA BRANCH DIFF](data-branch-diff-en.md) for the full
grammar and all `output_option` values (`COUNT`, `LIMIT`,
`SUMMARY`, `FILE`).

## Arguments

No new arguments. The guarantees listed below rely on the
arguments already defined for `DATA BRANCH DIFF`:

| Argument | Role in the git4data guarantees |
|----------|---------------------------------|
| `target_table`, `base_table` | The two tables being diffed. Composite and fake (no-PK) primary keys are supported. |
| `{ SNAPSHOT = 'snapshot_name' }` | Used after `DROP TABLE` to diff two snapshots when the live tables no longer exist. |
| `COLUMNS (col_name, ...)` | Projection clause added in this release; always yields the same set of differing rows as an unprojected diff, only the rendered columns change. |
| `OUTPUT COUNT` / `SUMMARY` | Unaffected by `COLUMNS`. |

## Usage Notes

The `git4data` regression family guarantees the following
user-observable behaviors for `DATA BRANCH DIFF` in v3.0.10:

- **Diff is stable across flush + checkpoint + GC.** Running
  `DATA BRANCH DIFF` immediately before and after a
  flush + checkpoint + GC cycle on both tables returns the same
  logical diff for PK, composite-PK, and no-PK tables. (This
  relies on the full-scan fallback described in
  [the fallback page](data-branch-fullscan-en.md).)
- **Diff via snapshots works after `DROP TABLE`.** When both
  sides have been snapshotted, you can still diff them via
  `{snapshot = '...'}` after dropping the live tables. This
  holds for UPDATE-only, INSERT+DELETE, mixed UPDATE/INSERT/
  DELETE, and no-PK tables.
- **`COLUMNS` changes the rendered columns, never the diff
  set.** Using `COLUMNS (...)` with the same pair of tables
  produces the same differing rows as an unprojected diff; only
  the rendered columns change. This is true for single PKs,
  composite PKs, tables with no PK, tables with NULL values,
  vector columns, JSON columns, and case-insensitive column
  names.
- **`COLUMNS` does not need to include PK columns.** The
  projection may list only value columns; `DATA BRANCH DIFF`
  still correctly identifies INSERT / DELETE / UPDATE rows.
- **`COLUMNS` de-duplicates names.** Repeated column names in
  the list (for example `COLUMNS (a, a, b)`) are treated as a
  single occurrence.
- **`COLUMNS` is case-insensitive.** `COLUMNS (NAME, score)`
  matches a table defined with columns `Name` and `Score`.
- **`COLUMNS` with `OUTPUT COUNT` or `OUTPUT SUMMARY` does not
  alter the count / summary.** Those outputs describe how many
  rows differ, not which columns are projected.
- **`COLUMNS` with `OUTPUT LIMIT`.** The row cap is applied to
  the projected result just as it is to the unprojected result.
- **Merged INSERTs stay classified as INSERT after GC.** After
  `DATA BRANCH MERGE` places rows from a branch into the base
  table, a follow-up `DATA BRANCH DIFF` — including one run
  after flush + checkpoint + GC — continues to classify those
  rows as INSERT on the target side (not as vanished rows).

## Examples

### Example 1: Diff stability across flush + checkpoint + GC

For a PK table the diff after a flush + checkpoint + GC cycle
matches the one produced before it:

```sql
CREATE DATABASE test_gc_diff;
USE test_gc_diff;

CREATE TABLE c_src (a INT PRIMARY KEY, b INT);
INSERT INTO c_src SELECT result, result FROM generate_series(1, 200000) g;

DATA BRANCH CREATE TABLE c_tar FROM c_src;
UPDATE c_tar SET b = b + 1 WHERE a mod 1119 = 0;

-- Before GC
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT SUMMARY;

SELECT mo_ctl('dn', 'flush', 'test_gc_diff.c_tar');
SELECT mo_ctl('dn', 'flush', 'test_gc_diff.c_src');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'globalcheckpoint', '');
SELECT mo_ctl('dn', 'diskcleaner', 'force_gc');

-- After GC the same summary is reported
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT SUMMARY;
DATA BRANCH DIFF c_tar AGAINST c_src OUTPUT COUNT;

DROP TABLE c_src;
DROP TABLE c_tar;
DROP DATABASE test_gc_diff;
```

### Example 2: Diff via snapshots after `DROP TABLE`

Once both tables have been snapshotted, the diff survives the
live tables being dropped:

```sql
CREATE DATABASE sp_diff_c1;
USE sp_diff_c1;

CREATE TABLE c1_base (a INT PRIMARY KEY, b INT);
INSERT INTO c1_base SELECT result, result FROM generate_series(1, 100) g;
SELECT mo_ctl('dn', 'flush', 'sp_diff_c1.c1_base');

CREATE SNAPSHOT sp_c1_base FOR ACCOUNT sys;

DATA BRANCH CREATE TABLE c1_tar FROM c1_base;
UPDATE c1_tar SET b = b + 1 WHERE a mod 7 = 0;
SELECT mo_ctl('dn', 'flush', 'sp_diff_c1.c1_tar');

CREATE SNAPSHOT sp_c1_tar FOR ACCOUNT sys;

-- Diff before drop
DATA BRANCH DIFF c1_tar AGAINST c1_base OUTPUT SUMMARY;

DROP TABLE c1_tar;
DROP TABLE c1_base;

-- Same diff via snapshots after the live tables are gone
DATA BRANCH DIFF
    c1_tar{snapshot = 'sp_c1_tar'}
    AGAINST
    c1_base{snapshot = 'sp_c1_base'}
    OUTPUT SUMMARY;

DROP SNAPSHOT sp_c1_tar;
DROP SNAPSHOT sp_c1_base;
DROP DATABASE sp_diff_c1;
```

### Example 3: COLUMNS projection produces the same diff rows as an unprojected diff

Project only the non-PK columns — the set of differing rows is
unchanged, but the rendered columns differ:

```sql
CREATE DATABASE test_diff_columns;
USE test_diff_columns;

CREATE TABLE c1(
    id INT PRIMARY KEY,
    name VARCHAR(30),
    balance DECIMAL(12,2),
    created_at TIMESTAMP,
    birthday DATE
);
INSERT INTO c1 VALUES
    (1, 'alice', 1000.50, '2024-01-01 10:00:00', '1990-03-15'),
    (2, 'bob',   2000.75, '2024-01-02 11:00:00', '1985-07-20'),
    (3, 'carol', 3000.00, '2024-01-03 12:00:00', '1992-11-08');

CREATE SNAPSHOT c1_sp0 FOR TABLE test_diff_columns c1;

DATA BRANCH CREATE TABLE c1_br FROM c1{snapshot = 'c1_sp0'};
UPDATE c1_br SET balance = 1500.50, name = 'alice_v2' WHERE id = 1;
DELETE FROM c1_br WHERE id = 2;
INSERT INTO c1_br VALUES (4, 'dave', 4000.00, '2024-02-01 09:00:00', '1988-12-25');

-- Full diff (all columns)
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'};

-- Project non-PK columns
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'} COLUMNS (name, balance);

-- Project PK + one value column
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'} COLUMNS (id, balance);

-- Duplicate column names are de-duplicated
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'} COLUMNS (name, name, balance);

-- Column names match case-insensitively
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'} COLUMNS (NAME, BALANCE);

-- COLUMNS + OUTPUT COUNT: count is unaffected by projection
DATA BRANCH DIFF c1_br AGAINST c1{snapshot = 'c1_sp0'} COLUMNS (name) OUTPUT COUNT;

DROP SNAPSHOT c1_sp0;
DROP TABLE c1;
DROP TABLE c1_br;
DROP DATABASE test_diff_columns;
```

## Notes

1. All guarantees on this page hold for tables with a PK,
   composite PK, or no PK (which uses an internal fake primary
   key).
2. Across these guarantees the diff semantics remain: INSERT on
   the side that has the PK, DELETE on the side that lost it,
   UPDATE for rows whose PK matches but values differ.
3. `COLUMNS` does not have to include the primary key. Leaving
   the PK out of the projection does not change which rows
   differ; it only changes which columns are rendered.
