# DATA BRANCH MERGE

## Description

The `DATA BRANCH MERGE` statement is used to merge data changes from one branch table into another branch table. This feature is similar to Git's merge command and can apply insert, delete, and update operations from the source branch to the target branch.

The system automatically identifies the Lowest Common Ancestor (LCA) between two tables and calculates the changes that need to be merged based on it. When two branches make different modifications to the same row of data, a conflict occurs, which can be handled using conflict handling options.

## Syntax

```
DATA BRANCH MERGE source_table [{ SNAPSHOT = 'snapshot_name' }] 
    INTO destination_table [{ SNAPSHOT = 'snapshot_name' }] 
    [WHEN CONFLICT conflict_option]
```

### Conflict Handling Options

```
conflict_option:
    FAIL                            -- Error and abort on conflict (default behavior)
  | SKIP                            -- Skip conflicting rows, keep destination table data
  | ACCEPT                          -- Accept source table data, overwrite destination table conflicts
```

## Arguments

### Parameter Description

| Parameter | Description |
|-----------|-------------|
| `source_table` | Source table (the data source to merge from) |
| `destination_table` | Destination table (the table receiving merged data) |
| `SNAPSHOT = 'snapshot_name'` | Optional parameter to specify using data at a snapshot point |
| `WHEN CONFLICT FAIL` | Error and abort on conflict (default) |
| `WHEN CONFLICT SKIP` | Skip conflicting rows, keep destination table's original data |
| `WHEN CONFLICT ACCEPT` | Accept source table's data, overwrite destination table's conflicting data |

### Conflict Definition

Conflicts occur when:

- Both branches make different modifications to rows with the same primary key (UPDATE conflict)
- Both branches insert rows with the same primary key but different values (INSERT conflict)

## Usage Notes

### Merge Process

1. The system first calculates the differences between source and destination tables
2. Detects if conflicts exist
3. Handles conflicts according to the conflict handling option
4. Applies non-conflicting changes to the destination table

### Merge Operations

- **INSERT**: Insert new rows from source table into destination table
- **DELETE**: Delete rows from destination table that were deleted in source table
- **UPDATE**: Update rows in destination table that differ from source table

## Examples

### Example 1: Simple Merge (No Conflicts)

```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- Create base table
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- Create two branches
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (4, 4);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (5, 5);

-- View differences
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t1                 | INSERT |    4 |    4 |
| t2                 | INSERT |    5 |    5 |
+--------------------+--------+------+------+

-- Merge t2 into t1
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1;

-- Verify merge result
-- Expected-Rows: 5
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    4 |    4 |
|    5 |    5 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 2: Handling INSERT Conflicts

```sql
-- Create base table
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2);

-- Create two branches, both insert rows with same primary key but different values
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (3, 4);

-- View differences
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    3 |    4 |
| t1                | INSERT |    3 |    3 |
+-------------------+--------+------+------+

-- Default behavior: error on conflict
-- Expected-Success: false
DATA BRANCH MERGE test.t2 INTO test.t1;
-- ERROR: conflict: t2 INSERT and t1 INSERT on pk(3) with different values

-- Use SKIP: skip conflict, keep t1's data
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- Use ACCEPT: accept t2's data
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    4 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 3: Handling UPDATE Conflicts

```sql
-- Create base table
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- Create branch and make different updates
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t1;
-- Expected-Rows: 1
UPDATE test.t2 SET b = b + 2 WHERE a = 1;
-- Expected-Rows: 1
UPDATE test.t1 SET b = b + 1 WHERE a = 1;

-- View differences
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | UPDATE |    1 |    3 |
| t1                 | UPDATE |    1 |    2 |
+--------------------+--------+------+------+

-- Use SKIP: keep t1's update
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 2
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
|    2 |    2 |
+------+------+

-- Use ACCEPT: accept t2's update
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 2
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    3 |
|    2 |    2 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 4: Merge Without Common Ancestor

```sql
-- Create two independent tables
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (1, 2), (3, 3);

-- View differences
-- Expected-Rows: 4
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | INSERT |    1 |    2 |
| t1                 | INSERT |    1 |    1 |
| t1                 | INSERT |    2 |    2 |
| t2                 | INSERT |    3 |    3 |
+--------------------+--------+------+------+

-- Merge with SKIP
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- Merge with ACCEPT
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### Example 5: Complex Merge Scenario

```sql
-- Create base table
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO test.t0 SELECT result, 't0' FROM generate_series(1, 100) g;

-- Create multiple branches with different modifications
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 6
UPDATE test.t1 SET b = 't1' WHERE a IN (1, 20, 40, 60, 80, 100);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 5
UPDATE test.t2 SET b = 't2' WHERE a IN (2, 22, 42, 62, 82);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t3 FROM test.t0;
-- Expected-Rows: 5
UPDATE test.t3 SET b = 't3' WHERE a IN (3, 23, 43, 63, 83);

-- Merge into t0 sequentially
-- Expected-Rows: 0
DATA BRANCH MERGE test.t1 INTO test.t0;
-- Expected-Rows: 2
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   6 | t1   |
|  94 | t0   |
+-----+------+

-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t0;
-- Expected-Rows: 3
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   5 | t2   |
|   6 | t1   |
|  89 | t0   |
+-----+------+

-- Expected-Rows: 0
DATA BRANCH MERGE test.t3 INTO test.t0;
-- Expected-Rows: 4
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   5 | t2   |
|   5 | t3   |
|   6 | t1   |
|  84 | t0   |
+-----+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
-- Expected-Rows: 0
DROP TABLE test.t3;
```

### Example 6: Merge with NULL Values

```sql
-- Create table with NULL values
-- Expected-Rows: 0
CREATE TABLE test.payout_template (
    batch_id INT PRIMARY KEY,
    region VARCHAR(8),
    amount DECIMAL(12,2),
    reviewer VARCHAR(20)
);

-- Expected-Rows: 0
INSERT INTO test.payout_template VALUES
    (10, 'east', 1200.50, 'amy'),
    (20, 'west', NULL, NULL),
    (30, NULL, 4800.00, 'leo');

-- Create two branches
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.payout_stage FROM test.payout_template;
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.payout_ops FROM test.payout_template;

-- Modify on stage branch
-- Expected-Rows: 1
UPDATE test.payout_stage SET amount = NULL, reviewer = NULL WHERE batch_id = 10;
-- Expected-Rows: 1
UPDATE test.payout_stage SET reviewer = 'nina' WHERE batch_id = 20;

-- Modify on ops branch
-- Expected-Rows: 1
UPDATE test.payout_ops SET amount = 1250.75 WHERE batch_id = 10;
-- Expected-Rows: 1
UPDATE test.payout_ops SET amount = NULL WHERE batch_id = 30;

-- View differences
-- Expected-Rows: 6
DATA BRANCH DIFF test.payout_stage AGAINST test.payout_ops;

-- Merge with SKIP
-- Expected-Rows: 0
DATA BRANCH MERGE test.payout_stage INTO test.payout_ops WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT batch_id, region, amount, reviewer FROM test.payout_ops ORDER BY batch_id;

-- Merge with ACCEPT
-- Expected-Rows: 0
DATA BRANCH MERGE test.payout_stage INTO test.payout_ops WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT batch_id, region, amount, reviewer FROM test.payout_ops ORDER BY batch_id;

-- Expected-Rows: 0
DROP TABLE test.payout_template;
-- Expected-Rows: 0
DROP TABLE test.payout_stage;
-- Expected-Rows: 0
DROP TABLE test.payout_ops;
-- Expected-Rows: 0
DROP DATABASE test;
```

## Notes

1. **Table Structure Consistency**: The two tables being merged must have the same table structure (column names, column types).

2. **Primary Key Requirement**: It is recommended to use tables with primary keys for merge operations to accurately identify and handle conflicts.

3. **Conflict Handling**:
   - `FAIL` (default): The safest option, ensures no accidental data overwriting
   - `SKIP`: Conservative strategy, keeps destination table's existing data
   - `ACCEPT`: Aggressive strategy, prioritizes source table's data

4. **Transactional**: The merge operation is atomic - either all changes succeed or all fail.

5. **Performance Considerations**: For large tables, merge operations may take a long time. It is recommended to use `DATA BRANCH DIFF` first to understand the scale of changes.

6. **Data Backup**: Before executing merge operations, it is recommended to create snapshots or backups for rollback if needed.

7. **LCA Impact**: The system automatically detects LCA, and the existence of LCA affects how conflicts are determined.
