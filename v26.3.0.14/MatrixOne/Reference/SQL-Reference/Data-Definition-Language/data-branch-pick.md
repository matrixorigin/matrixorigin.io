---
title: "DATA BRANCH PICK"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
  - "DATA BRANCH PICK (cherry-pick specific rows between branch tables, Git-for-Data feature)"
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "Cherry-pick specific rows from a source table into a target table by primary key or snapshot range inside a MatrixOne data branch, with configurable conflict handling."
---

# DATA BRANCH PICK

> Cherry-pick rows from a source table into a target table inside a MatrixOne data branch without merging the whole diff. Rows are selected by a literal `KEYS` list, a subquery, or a `BETWEEN SNAPSHOT` time range; conflicts on the same primary key can fail, be skipped, or accepted from the source.

## Description

`DATA BRANCH PICK` copies a subset of rows between two tables that participate in the data-branch lineage (with or without a common ancestor). It reuses the diff machinery behind `DATA BRANCH DIFF` / `DATA BRANCH MERGE`, but narrows the scope to the keys or snapshot window you supply and writes INSERT/DELETE changes to the destination table.

The statement is useful for selective synchronization — for example, promoting a single new row, back-porting one fix to another branch, or propagating only the changes that happened between two snapshots.

## Syntax

```
DATA BRANCH PICK source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO destination_table
    [BETWEEN SNAPSHOT snapshot_from AND snapshot_to]
    [KEYS ( key_list | subquery )]
    [WHEN CONFLICT conflict_option]
```

At least one of `KEYS (...)` or `BETWEEN SNAPSHOT ... AND ...` is required.

### KEYS clause

```
key_list   ::= expr [, expr ...]
             | ( col1_val, col2_val [, ...] ) [, ( ... ) ...]
subquery   ::= SELECT ... FROM ...
```

### Conflict options

```
conflict_option:
    FAIL                            -- Default. Fail on conflict.
  | SKIP                            -- Keep destination row, drop the picked change.
  | ACCEPT                          -- Overwrite destination with source row.
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `source_table` | Table the rows are picked from. May carry a `{SNAPSHOT = 'snap'}` source-time option. |
| `destination_table` | Table that receives the picked rows. Must exist and must share the same schema as the source. A snapshot option on the destination is rejected. |
| `KEYS (expr, ...)` | Literal list of primary-key values to pick. For a single-column primary key, each entry is a scalar; for a composite primary key, each entry must be a tuple `(c1, c2, ...)` with one element per PK column. |
| `KEYS (SELECT ...)` | Subquery whose result columns define the primary-key values. For a composite primary key, the subquery must project the PK columns in order. `NULL` values are rejected. |
| `BETWEEN SNAPSHOT a AND b` | Restrict picked rows to changes that occurred on the source between snapshots `a` and `b`. Snapshot names may be bare identifiers or string literals. Cannot be combined with a source-table `SNAPSHOT` option. |
| `WHEN CONFLICT FAIL` | Return an error when a picked key already exists in the destination with a different value. This is the default when the clause is omitted. |
| `WHEN CONFLICT SKIP` | Keep the destination row unchanged; drop both the DELETE and INSERT for the conflicting key. |
| `WHEN CONFLICT ACCEPT` | Apply the source row over the destination row (delete old, insert source value). |

## Usage Notes

- **Primary key required for single-row semantics.** The statement uses the source and destination primary key to match rows. Tables without an explicit primary key fall back to the internal fake primary key and are supported, but key matching is then row-level only.
- **Destination snapshot is not supported.** Specifying `{SNAPSHOT = ...}` on `destination_table` raises `destination snapshot option is not supported for DATA BRANCH PICK`.
- **Explicit transactions are rejected.** Running `DATA BRANCH PICK` inside a `BEGIN ... COMMIT` block raises `DATA BRANCH PICK is not supported in explicit transactions`.
- **Mutual exclusion of source snapshot and `BETWEEN`.** Using `source_table{SNAPSHOT = ...}` together with `BETWEEN SNAPSHOT a AND b` raises `BETWEEN SNAPSHOT and source table snapshot option cannot be used together`.
- **At least one scope clause is required.** Omitting both `KEYS` and `BETWEEN SNAPSHOT` raises `DATA BRANCH PICK requires a KEYS or BETWEEN SNAPSHOT clause`.
- **Conflict default is FAIL.** Without `WHEN CONFLICT`, the first conflicting key aborts the statement and leaves the destination unchanged for the remaining picked keys.
- **Non-existent keys are no-ops.** If a listed key is not present in the source (or not in the source change set in `BETWEEN SNAPSHOT` mode), the row is silently skipped.
- **KEYS subquery rules.** The subquery must return the same number of columns as the primary key (one for single-column PK, N for N-column composite PK). Each row is coerced into the PK type; unsupported types raise `KEYS subquery column type X is not supported for primary-key coercion`, and `NULL` values raise `KEYS subquery returned NULL, but DATA BRANCH PICK primary keys cannot be NULL`.
- **Composite primary key.** For a composite PK, literal keys must be tuples with exactly as many elements as PK columns; a mismatch raises `KEYS tuple has N elements but composite primary key has M columns`.
- **Privileges.** The caller needs SELECT-style privilege on the source table and modify privilege on the destination table; otherwise the statement raises `do not have privilege to execute the statement`.

## Examples

```sql
DROP DATABASE IF EXISTS data_branch_pick_demo;
CREATE DATABASE data_branch_pick_demo;
USE data_branch_pick_demo;

-- Example 1: Pick specific rows from an independent source table.
CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1),(3,3),(5,5);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(4,4);

-- Pick only pk=2 from t2 into t1.
DATA BRANCH PICK t2 INTO t1 KEYS(2);
SELECT * FROM t1 ORDER BY a ASC;

-- Pick another key; absent keys are silently ignored.
DATA BRANCH PICK t2 INTO t1 KEYS(4);
DATA BRANCH PICK t2 INTO t1 KEYS(99);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t1;
DROP TABLE t2;

-- Example 2: Conflict handling with WHEN CONFLICT SKIP / ACCEPT.
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2);

DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (3,30);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (3,40);

-- Both branches inserted pk=3 with different values; the default FAIL mode
-- aborts the statement.
-- Expected-Success: false
DATA BRANCH PICK t2 INTO t1 KEYS(3);

-- SKIP keeps t1's (3,30).
DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT SKIP;
SELECT * FROM t1 ORDER BY a ASC;

-- ACCEPT overwrites with t2's (3,40).
DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT ACCEPT;
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;

-- Example 3: Cherry-pick with a KEYS subquery.
CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(3,3),(4,4),(5,5);

-- Pick only the even-keyed rows from t2 into t1.
DATA BRANCH PICK t2 INTO t1 KEYS(SELECT a FROM t2 WHERE a % 2 = 0);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t1;
DROP TABLE t2;

-- Example 4: Composite primary key with tuple keys.
CREATE TABLE t0 (id INT, name VARCHAR(20), val INT, PRIMARY KEY(id, name));
INSERT INTO t0 VALUES (1,'alice',10),(2,'bob',20);

DATA BRANCH CREATE TABLE t1 FROM t0;
DATA BRANCH CREATE TABLE t2 FROM t0;

INSERT INTO t2 VALUES (4,'dave',40),(5,'eve',50),(6,'frank',60);

-- Pick two composite keys out of three new rows.
DATA BRANCH PICK t2 INTO t1 KEYS((4,'dave'),(6,'frank'));
SELECT * FROM t1 ORDER BY id, name;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;

-- Example 5: Pick changes that happened between two snapshots.
DROP SNAPSHOT IF EXISTS sp1;
DROP SNAPSHOT IF EXISTS sp2;

CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp1 FOR ACCOUNT sys;

INSERT INTO t1 VALUES (4,4),(5,5);

CREATE SNAPSHOT sp2 FOR ACCOUNT sys;

INSERT INTO t1 VALUES (6,6),(7,7);

-- Only rows changed between sp1 and sp2 are picked (pk=4,5).
-- Rows inserted after sp2 (pk=6,7) are not.
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT sp1 AND sp2;
SELECT * FROM t0 ORDER BY a ASC;

-- BETWEEN can be combined with KEYS for an intersection of time and key set.
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT sp1 AND sp2 KEYS(5);
SELECT * FROM t0 ORDER BY a ASC;

DROP SNAPSHOT sp1;
DROP SNAPSHOT sp2;
DROP TABLE t0;
DROP TABLE t1;

DROP DATABASE data_branch_pick_demo;
```

## Notes

1. `DATA BRANCH PICK` writes INSERT / DELETE statements to the destination; the statement is not an atomic snapshot copy — partial conflict handling is enforced per row.
2. When both `BETWEEN SNAPSHOT` and `KEYS` are supplied, the picked set is the intersection of the snapshot-range change set and the key set.
3. Picking a key that exists in the destination but not in the source is a no-op. Picking a key that was deleted on the source with the destination unchanged propagates the DELETE to the destination.
4. For `WHEN CONFLICT FAIL`, the reported error message has the form `conflict: <dst_table> INSERT and <src_table> INSERT on pk(<pk>) with different values`.
