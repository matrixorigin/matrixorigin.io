# DATA BRANCH PICK

## Description

The `DATA BRANCH PICK` statement cherry-picks a targeted subset of rows from a source table into a destination table, identified either by primary-key values (via `KEYS`) or by a snapshot time window (via `BETWEEN SNAPSHOT`). It is similar in spirit to Git's `cherry-pick`: instead of merging every difference between two branches, only the rows you explicitly select are applied to the destination.

For each picked key, `DATA BRANCH PICK` computes the difference between source and destination (using the same lowest-common-ancestor logic as `DATA BRANCH DIFF`), filters it to the picked keys, and applies the surviving insert/update/delete operations to the destination table.

## Syntax

```
DATA BRANCH PICK source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO destination_table
    [ BETWEEN SNAPSHOT from_snapshot AND to_snapshot ]
    [ KEYS ( value_list | subquery ) ]
    [ WHEN CONFLICT conflict_option ]
```

At least one of `BETWEEN SNAPSHOT ... AND ...` or `KEYS (...)` must be specified.

### KEYS clause

```
KEYS ( value_list )        -- explicit primary-key values
KEYS ( subquery )          -- any SELECT returning primary-key columns
```

- For a single-column primary key, `value_list` is a comma-separated list of literal values, e.g. `KEYS (1, 2, 3)`.
- For a composite primary key, `value_list` contains tuples whose column order matches the primary-key definition, e.g. `KEYS ((100, 'A100'), (101, 'B200'))`.
- A subquery must project exactly the primary-key columns, in the same order. Rows whose keys contain `NULL` are rejected.

### Conflict options

```
conflict_option:
    FAIL       -- abort the statement on any conflict (default)
  | SKIP       -- keep the destination row unchanged on conflict
  | ACCEPT     -- overwrite the destination row with the source value
```

A conflict occurs when the picked primary key exists in both tables with different non-key values (an UPDATE conflict), or when both sides independently inserted a row with the same primary key but different values (an INSERT conflict).

## Arguments

| Parameter | Description |
|-----------|-------------|
| `source_table` | The branch/table to pick rows from. |
| `destination_table` | The branch/table that receives the picked rows. |
| `{ SNAPSHOT = 'snapshot_name' }` on `source_table` | Optional: pick rows as they existed in the source at that snapshot. |
| `BETWEEN SNAPSHOT from_snapshot AND to_snapshot` | Optional: restrict the pick to rows that changed in `source_table` between two of its snapshots. Can be combined with `KEYS`. |
| `KEYS (...)` | Primary keys of the rows to pick — either explicit values/tuples or a `SELECT` subquery. |
| `WHEN CONFLICT FAIL \| SKIP \| ACCEPT` | Behavior when a picked key conflicts with an existing row in `destination_table`. Defaults to `FAIL`. |

## Usage Notes

### Requirements and restrictions

- **Primary key required**: `destination_table` must have a primary key. A table without a primary key cannot be the target of `DATA BRANCH PICK`.
- **Not allowed in explicit transactions**: `DATA BRANCH PICK` cannot run inside a `BEGIN ... COMMIT` block.
- **Destination snapshot not allowed**: specifying `{ SNAPSHOT = ... }` on `destination_table` is rejected.
- **`BETWEEN SNAPSHOT` excludes source snapshot**: `BETWEEN SNAPSHOT ... AND ...` cannot be combined with `{ SNAPSHOT = ... }` on `source_table`.
- **KEYS subquery must not return NULL**: if a subquery returns a `NULL` in any primary-key column, the statement fails.
- **Privileges**: the caller needs read privileges on `source_table` and modify privileges on `destination_table`.

### What gets applied

For each picked primary key:

- If the row exists only in `source_table`, it is inserted into `destination_table`.
- If the row exists in both tables with the same non-key values, nothing changes.
- If the row exists in both tables with different non-key values, the conflict option decides the outcome.
- If the row exists only in `destination_table` and the source side deleted it (relative to the lowest common ancestor), the row is deleted from `destination_table` under `ACCEPT`; it is preserved under `SKIP`; `FAIL` aborts.

Keys that are not present in either side are treated as no-ops.

## Examples

### Example 1: Pick specific rows (no common ancestor)

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (3, 3), (5, 5);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (1, 1), (2, 2), (4, 4);

-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (2);
SELECT * FROM test.t1 ORDER BY a;
+---+---+
| a | b |
+---+---+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 5 | 5 |
+---+---+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 2: Pick multiple rows from a branch (with common ancestor)

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (5, 5), (6, 6), (7, 7);

-- Pick pk=5 and pk=7 from t2 into t1 (skip pk=6)
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (5, 7);
SELECT * FROM test.t1 ORDER BY a;

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 3: Pick using a subquery

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.src (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.src VALUES (1, 10), (2, 20), (3, 30), (4, 40);

-- Expected-Rows: 0
CREATE TABLE test.dst (a INT PRIMARY KEY, b INT);

-- A driver table that lists which keys to pick
-- Expected-Rows: 0
CREATE TABLE test.pick_list (k INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO test.pick_list VALUES (1), (3);

-- Expected-Rows: 0
DATA BRANCH PICK test.src INTO test.dst KEYS (SELECT k FROM test.pick_list);
SELECT * FROM test.dst ORDER BY a;

-- Expected-Rows: 0
DROP TABLE test.src;
-- Expected-Rows: 0
DROP TABLE test.dst;
-- Expected-Rows: 0
DROP TABLE test.pick_list;
```

### Example 4: Conflict handling (FAIL / SKIP / ACCEPT)

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (3, 30);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (3, 40);

-- Default FAIL: both branches inserted pk=3 with different values, abort
-- Expected-Success: false
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3);

-- SKIP keeps t1's value (b = 30)
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3) WHEN CONFLICT SKIP;

-- ACCEPT overwrites with t2's value (b = 40)
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3) WHEN CONFLICT ACCEPT;

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 5: Pick from a source snapshot

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (4, 4), (5, 5);

-- Freeze t2's state, then change it further
-- Expected-Rows: 0
CREATE SNAPSHOT sp_src FOR ACCOUNT sys;
-- Expected-Rows: 1
UPDATE test.t2 SET b = 50 WHERE a = 5;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (6, 6);

-- Pick from the frozen view: pk=5 gets the snapshot value (b = 5), not (b = 50);
-- pk=6 is absent at snapshot time, so picking it is a no-op.
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 {SNAPSHOT='sp_src'} INTO test.t1 KEYS (4, 5, 6);
SELECT * FROM test.t1 ORDER BY a;

-- Expected-Rows: 0
DROP SNAPSHOT sp_src;
-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 6: Pick changes within a snapshot window

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
CREATE SNAPSHOT sp_from FOR ACCOUNT sys;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (2, 2), (3, 3);
-- Expected-Rows: 0
CREATE SNAPSHOT sp_to FOR ACCOUNT sys;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (4, 4);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);

-- Pick only rows changed between sp_from and sp_to (pk=2, pk=3; pk=4 is outside the window)
-- Expected-Rows: 0
DATA BRANCH PICK test.t1 INTO test.t2 BETWEEN SNAPSHOT sp_from AND sp_to;
SELECT * FROM test.t2 ORDER BY a;

-- Expected-Rows: 0
DROP SNAPSHOT sp_from;
-- Expected-Rows: 0
DROP SNAPSHOT sp_to;
-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 7: Composite primary key

<!-- validator-ignore -->
```sql
-- Expected-Rows: 0
CREATE TABLE test.orders (
    tenant_id  INT,
    order_code VARCHAR(8),
    amount     DECIMAL(12, 2),
    PRIMARY KEY (tenant_id, order_code)
);
-- Expected-Rows: 0
INSERT INTO test.orders VALUES
    (100, 'A100', 120.50),
    (100, 'A101',  80.00),
    (101, 'B200', 305.75);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.orders_branch FROM test.orders;
-- Expected-Rows: 0
INSERT INTO test.orders_branch VALUES
    (102, 'C300', 512.25),
    (103, 'D400',  42.00);

-- Pick only (102, 'C300')
-- Expected-Rows: 0
DATA BRANCH PICK test.orders_branch INTO test.orders
    KEYS ((102, 'C300'));
SELECT * FROM test.orders ORDER BY tenant_id, order_code;

-- Expected-Rows: 0
DROP TABLE test.orders;
-- Expected-Rows: 0
DROP TABLE test.orders_branch;
```

## Notes

1. **Difference from `DATA BRANCH MERGE`**: `MERGE` applies the entire delta between two branches; `PICK` applies only the subset you list with `KEYS` or that falls inside the `BETWEEN SNAPSHOT` window.
2. **Default conflict behavior is `FAIL`**: callers that expect to iterate on conflicts should pass `WHEN CONFLICT SKIP` or `WHEN CONFLICT ACCEPT` explicitly.
3. **Table structure consistency**: `source_table` and `destination_table` must share the same column set and types (same as `DATA BRANCH DIFF` / `DATA BRANCH MERGE`).
4. **Implicit transaction only**: because `DATA BRANCH PICK` cannot run inside an explicit transaction, wrap it in its own session step rather than grouping it with surrounding statements under `BEGIN`.
