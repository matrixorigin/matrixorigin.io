# DATA BRANCH PICK

## Description

The `DATA BRANCH PICK` statement cherry-picks a selected set of rows from
a source branch table into a destination branch table. Compared with
`DATA BRANCH MERGE`, which applies every diff between two branches,
`PICK` only applies the rows the user selects — either by listing their
primary keys (`KEYS`) or by bounding them with a snapshot range
(`BETWEEN SNAPSHOT`).

Under the hood the system reuses the diff pipeline that
`DATA BRANCH DIFF` / `DATA BRANCH MERGE` use. It automatically detects
the Lowest Common Ancestor (LCA) between the two tables, computes the
effective INSERT / DELETE / UPDATE set for the picked keys, and applies
them to the destination table under the chosen conflict policy.

## Syntax

```
DATA BRANCH PICK source_table INTO destination_table
    KEYS ( key_list | select_stmt )
    [WHEN CONFLICT conflict_option]

DATA BRANCH PICK source_table INTO destination_table
    BETWEEN SNAPSHOT from_snapshot AND to_snapshot
    [KEYS ( key_list | select_stmt )]
    [WHEN CONFLICT conflict_option]
```

### KEYS clause

```
KEYS ( expr [, expr ...] )          -- literal primary-key values
KEYS ( select_stmt )                -- subquery yielding primary-key rows
```

For a composite primary key, each literal key must be written as a
tuple matching the PK column order, and a subquery must return the same
number of columns as the PK.

### BETWEEN SNAPSHOT clause

```
BETWEEN SNAPSHOT snapshot_name AND snapshot_name
```

Snapshot names may be supplied either as identifiers or as quoted
string literals. The range identifies the source-side window from which
rows are picked.

### Conflict handling options

```
conflict_option:
    FAIL                            -- Error and abort on conflict (default)
  | SKIP                            -- Skip conflicting rows, keep destination value
  | ACCEPT                          -- Overwrite destination with source value
```

## Arguments

| Parameter | Description |
|-----------|-------------|
| `source_table` | Source branch table to pick from. May include a `{SNAPSHOT = 'snapshot_name'}` option to pin the source at a specific snapshot. |
| `destination_table` | Destination branch table that receives the picked rows. A destination-side snapshot option is not allowed. |
| `KEYS ( key_list )` | Literal primary-key values. Scalar values for a single-column PK; tuples `(v1, v2, ...)` for a composite PK. |
| `KEYS ( select_stmt )` | Subquery returning primary-key columns. For a single-column PK the subquery must return one column; for a composite PK it must return exactly the PK columns in order. |
| `BETWEEN SNAPSHOT from_snapshot AND to_snapshot` | Restrict picked rows to the source-side changes that fall between two snapshots. May be combined with `KEYS` to pick only those rows whose PK is in the KEYS set. |
| `WHEN CONFLICT FAIL` | Default. Error out if a picked row conflicts with the destination. |
| `WHEN CONFLICT SKIP` | Keep the destination value for conflicting keys. |
| `WHEN CONFLICT ACCEPT` | Overwrite the destination value with the source value for conflicting keys. |

### Conflict definition

A conflict is reported for a picked key when the same primary key
exists on both sides with different values — for example, when both
branches inserted the same PK with different column values or both
branches updated the same PK to different values. Picking a key that
was deleted on one side and modified on the other is also a conflict.

## Usage Notes

- `DATA BRANCH PICK` is not supported inside an explicit transaction
  (`BEGIN ... COMMIT`). The statement must be issued in auto-commit
  mode.
- The statement requires either a `KEYS` clause, a
  `BETWEEN SNAPSHOT ... AND ...` clause, or both. Neither clause alone
  being present is an error.
- `BETWEEN SNAPSHOT` cannot be combined with a `{SNAPSHOT = ...}`
  option on the source table — pick one of the two ways to pin the
  source.
- A snapshot option on the destination table is not supported and will
  be rejected.
- Subqueries passed in `KEYS` must not return `NULL` for a
  primary-key column.
- When no `WHEN CONFLICT` clause is specified, the default is
  `WHEN CONFLICT FAIL`.
- Privileges: the executor must hold the privileges required to read
  the source table and modify the destination table.

## Examples

### Example 1: Pick by primary key

Cherry-pick a single row from one branch into another.

```sql
CREATE DATABASE test;
USE test;

CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1),(3,3),(5,5);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(4,4);

DATA BRANCH PICK t2 INTO t1 KEYS(2);
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    5 |    5 |
+------+------+

DATA BRANCH PICK t2 INTO t1 KEYS(4);
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    4 |    4 |
|    5 |    5 |
+------+------+

DROP TABLE t1;
DROP TABLE t2;
```

### Example 2: Pick with conflict handling

Both branches insert the same primary key with different values. The
default `WHEN CONFLICT FAIL` aborts; `WHEN CONFLICT SKIP` keeps the
destination value; `WHEN CONFLICT ACCEPT` overwrites with the source
value.

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2);

DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (3,30);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (3,40);

-- default is FAIL: this statement errors out
DATA BRANCH PICK t2 INTO t1 KEYS(3);

DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT SKIP;
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |   30 |
+------+------+

DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT ACCEPT;
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |   40 |
+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### Example 3: Pick via subquery (composite primary key)

Use a subquery to drive the set of picked keys. For a composite PK the
subquery must return the same number of columns as the PK, in order.

```sql
CREATE TABLE t0 (a INT, b INT, c VARCHAR(20), PRIMARY KEY(a, b));
INSERT INTO t0 VALUES (1,1,'base'),(2,2,'base');

DATA BRANCH CREATE TABLE t1 FROM t0;
DATA BRANCH CREATE TABLE t2 FROM t0;

INSERT INTO t2 VALUES (3,3,'new'),(4,4,'new'),(5,5,'new'),(6,6,'new');

DATA BRANCH PICK t2 INTO t1
    KEYS(SELECT a, b FROM t2 WHERE a >= 4 AND a % 2 = 0);

SELECT * FROM t1 ORDER BY a, b;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    1 | base |
|    2 |    2 | base |
|    4 |    4 | new  |
|    6 |    6 | new  |
+------+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### Example 4: Pick rows between two snapshots

`BETWEEN SNAPSHOT` restricts the pick to changes that happened on the
source side between two snapshots. Snapshot names may be supplied as
identifiers or as string literals.

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp_from FOR ACCOUNT sys;
INSERT INTO t1 VALUES (2,2),(3,3);
CREATE SNAPSHOT sp_to FOR ACCOUNT sys;
INSERT INTO t1 VALUES (4,4);

-- only pick rows inserted on t1 between sp_from and sp_to
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT 'sp_from' AND 'sp_to';
SELECT * FROM t0 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

DROP SNAPSHOT sp_from;
DROP SNAPSHOT sp_to;
DROP TABLE t0;
DROP TABLE t1;
```

### Example 5: Combine BETWEEN SNAPSHOT with KEYS

`BETWEEN SNAPSHOT` and `KEYS` can be combined to pick only the rows in
the snapshot range whose primary keys are in the KEYS set.

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp1 FOR ACCOUNT sys;
INSERT INTO t1 VALUES (4,4),(5,5),(6,6);
CREATE SNAPSHOT sp2 FOR ACCOUNT sys;
INSERT INTO t1 VALUES (7,7);

-- only pk=5, among {4,5,6} inserted between sp1 and sp2
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT 'sp1' AND 'sp2' KEYS(5);
SELECT * FROM t0 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    5 |    5 |
+------+------+

DROP SNAPSHOT sp1;
DROP SNAPSHOT sp2;
DROP TABLE t0;
DROP TABLE t1;
```

## Notes

1. **KEYS or BETWEEN SNAPSHOT is required.** The server will refuse a
   `DATA BRANCH PICK` that has neither.
2. **Explicit transactions are not supported.** Issue `DATA BRANCH PICK`
   in auto-commit mode; a statement inside `BEGIN ... COMMIT` is
   rejected.
3. **Source-snapshot exclusivity.** `BETWEEN SNAPSHOT` cannot be
   combined with a `{SNAPSHOT = ...}` option on the source table.
4. **Destination snapshot not supported.** The destination table must
   reference the live table — a `{SNAPSHOT = ...}` option is rejected.
5. **NULL keys are not accepted.** A subquery in `KEYS` must not
   produce `NULL` for any primary-key column.
6. **Default conflict policy is FAIL.** Supply
   `WHEN CONFLICT SKIP` or `WHEN CONFLICT ACCEPT` explicitly if you
   want a non-failing behavior.
