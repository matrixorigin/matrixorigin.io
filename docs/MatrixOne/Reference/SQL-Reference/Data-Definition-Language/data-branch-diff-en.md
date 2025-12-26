# DATA BRANCH DIFF

## Description

The `DATA BRANCH DIFF` statement is used to compare data differences between two tables. This feature is similar to Git's diff command and can display insert, delete, and update operations between two data branches.

The system automatically identifies the Lowest Common Ancestor (LCA) between two tables and calculates differences based on it. The difference results include:
- **INSERT**: Rows that exist in the target table but not in the base table
- **DELETE**: Rows that exist in the base table but not in the target table
- **UPDATE**: Rows with the same primary key in both tables but different values in other columns

## Syntax

```
DATA BRANCH DIFF target_table [{ SNAPSHOT = 'snapshot_name' }] 
    AGAINST base_table [{ SNAPSHOT = 'snapshot_name' }] 
    [OUTPUT output_option]
```

### Output Options

```
output_option:
    COUNT                           -- Return only the count of different rows
  | LIMIT number                    -- Limit the number of returned difference rows
  | FILE 'directory_path'           -- Export differences as SQL file
  | AS table_name                   -- Save differences to a table (not yet supported)
```

## Arguments

### Parameter Description

| Parameter | Description |
|-----------|-------------|
| `target_table` | Target table (the table to compare) |
| `base_table` | Base table (the table used as comparison baseline) |
| `SNAPSHOT = 'snapshot_name'` | Optional parameter to specify using data at a snapshot point for comparison |
| `OUTPUT COUNT` | Return only the count of differences |
| `OUTPUT LIMIT number` | Limit the number of returned difference rows |
| `OUTPUT FILE 'path'` | Export differences as SQL file to specified directory, supports local path or Stage path (e.g., `stage://stage_name/`) |

### Output Column Description

Default output includes the following columns:

| Column Name | Description |
|-------------|-------------|
| `diff target against base` | Shows the table names being compared |
| `flag` | Difference type: INSERT, DELETE, or UPDATE |
| Other columns | All visible columns of the table |

## Usage Notes

### LCA (Lowest Common Ancestor)

The system automatically detects the branch relationship between two tables:

1. **No LCA**: Two tables have no common ancestor, directly compare all data
2. **Has LCA**: Two tables have a common ancestor, calculate incremental differences based on ancestor
3. **Self as LCA**: One table is the ancestor of the other

### Supported Table Types

- Tables with primary key (recommended)
- Tables with composite primary key
- Tables without primary key (using hidden fake primary key)

## Examples

### Example 1: Basic Difference Comparison

Compare two tables without a common ancestor:

```sql
CREATE DATABASE test;
USE test;

-- Create two independent tables
CREATE TABLE t1 (a INT PRIMARY KEY, b VARCHAR(10));
INSERT INTO t1 VALUES (1, '1'), (2, '2'), (3, '3');

CREATE TABLE t2 (a INT PRIMARY KEY, b VARCHAR(10));
INSERT INTO t2 VALUES (1, '1'), (2, '2'), (4, '4');

-- Compare differences
DATA BRANCH DIFF t2 AGAINST t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    4 | 4    |
| t1                | INSERT |    3 | 3    |
+-------------------+--------+------+------+

-- Reverse comparison
DATA BRANCH DIFF t1 AGAINST t2;
+-------------------+--------+------+------+
| diff t1 against t2 | flag   | a    | b    |
+-------------------+--------+------+------+
| t1                | INSERT |    3 | 3    |
| t2                | INSERT |    4 | 4    |
+-------------------+--------+------+------+

DROP TABLE t1;
DROP TABLE t2;
```

### Example 2: Compare Branch Tables (With Common Ancestor)

```sql
-- Create base table
CREATE TABLE t0 (a INT PRIMARY KEY, b INT);
INSERT INTO t0 VALUES (1, 1), (2, 2), (3, 3);

-- Create two branches from t0
DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (4, 4);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (5, 5);

-- Compare differences between two branches
DATA BRANCH DIFF t2 AGAINST t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    5 |    5 |
| t1                | INSERT |    4 |    4 |
+-------------------+--------+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### Example 3: Compare Using Snapshots

```sql
-- Create table and insert data
CREATE TABLE t1 (a INT PRIMARY KEY, b INT);
INSERT INTO t1 VALUES (1, 1), (2, 2);

-- Create snapshot
CREATE SNAPSHOT sp1 FOR TABLE test t1;

-- Continue modifying data
INSERT INTO t1 VALUES (3, 3);
UPDATE t1 SET b = 10 WHERE a = 1;

-- Create another snapshot
CREATE SNAPSHOT sp2 FOR TABLE test t1;

-- Compare differences between two snapshots
DATA BRANCH DIFF t1{SNAPSHOT='sp2'} AGAINST t1{SNAPSHOT='sp1'};
+--------------------+--------+------+------+
| diff t1 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t1                 | INSERT |    3 |    3 |
+--------------------+--------+------+------+

DROP SNAPSHOT sp1;
DROP SNAPSHOT sp2;
DROP TABLE t1;
```

!!! note
    When comparing two snapshots of the same table, the system compares based on incremental changes between snapshots. In this example, although the UPDATE operation modified the row where a=1, due to the special mechanism of snapshot comparison, only the newly inserted row is shown.

### Example 4: Get Only Difference Count

```sql
CREATE TABLE t1 (a INT PRIMARY KEY, b INT);
INSERT INTO t1 SELECT result, result FROM generate_series(1, 1000) g;

DATA BRANCH CREATE TABLE t2 FROM t1;
INSERT INTO t2 SELECT result, result FROM generate_series(1001, 2000) g;
DELETE FROM t2 WHERE a <= 100;

-- Get only difference count
DATA BRANCH DIFF t2 AGAINST t1 OUTPUT COUNT;
+----------+
| COUNT(*) |
+----------+
|     1100 |
+----------+

DROP TABLE t1;
DROP TABLE t2;
```

### Example 5: Limit Returned Rows

```sql
CREATE TABLE t1 (a INT PRIMARY KEY, b INT);
INSERT INTO t1 SELECT result, result FROM generate_series(1, 100) g;

DATA BRANCH CREATE TABLE t2 FROM t1;
INSERT INTO t2 SELECT result, result FROM generate_series(101, 200) g;

-- Limit to first 5 difference rows
DATA BRANCH DIFF t2 AGAINST t1 OUTPUT LIMIT 5;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | INSERT |  106 |  106 |
| t2                 | INSERT |  107 |  107 |
| t2                 | INSERT |  117 |  117 |
| t2                 | INSERT |  124 |  124 |
| t2                 | INSERT |  156 |  156 |
+--------------------+--------+------+------+

DROP TABLE t1;
DROP TABLE t2;
```

!!! note
    The rows returned by `OUTPUT LIMIT` are not necessarily ordered by primary key, but rather return the first N difference rows based on internal storage order.

### Example 6: Export Differences as SQL File

```sql
CREATE TABLE t1 (a INT PRIMARY KEY, b INT);
INSERT INTO t1 VALUES (1, 1), (2, 2);

DATA BRANCH CREATE TABLE t2 FROM t1;
INSERT INTO t2 VALUES (3, 3);
UPDATE t2 SET b = 10 WHERE a = 1;
DELETE FROM t2 WHERE a = 2;

-- Export differences to local file
DATA BRANCH DIFF t2 AGAINST t1 OUTPUT FILE '/tmp/diff_output/';
+------------------------------------------+------------------------------------------+
| FILE SAVED TO                            | HINT                                     |
+------------------------------------------+------------------------------------------+
| /tmp/diff_output/diff_t2_t1_20241225.sql | DELETE FROM test.t1, REPLACE INTO test.t1 |
+------------------------------------------+------------------------------------------+

-- The generated SQL file contains executable DELETE and REPLACE statements
-- These statements can be executed on t1 to synchronize data

DROP TABLE t1;
DROP TABLE t2;
```

#### Output File Types

The system generates different file formats based on the difference type:

| Scenario | File Format | Description |
|----------|-------------|-------------|
| Incremental sync (target table non-empty) | `.sql` | Contains `DELETE FROM ...` and `REPLACE INTO ...` statements |
| Full sync (target table empty) | `.csv` | CSV format, can be imported via `LOAD DATA` |

#### Replaying Patch Files

**Replay SQL file (incremental sync)**:

```
mysql -h <mo_host> -P <mo_port> -u <user> -p <db_name> < diff_t2_t1_20241225.sql
```

**Import CSV file (full sync)**:

```sql
LOAD DATA LOCAL INFILE '/tmp/diff_output/diff_xxx.csv'
INTO TABLE test.t1
FIELDS ENCLOSED BY '"' ESCAPED BY '\\' TERMINATED BY ','
LINES TERMINATED BY '\n';
```

### Example 6b: Export Differences to Stage (Object Storage)

Stage is a logical object in MatrixOne for connecting to external storage (such as S3, HDFS). You can output difference files directly to object storage for cross-cluster/cross-environment data synchronization.

```sql
-- Create Stage (connect to S3)
CREATE STAGE my_stage URL = 's3://my-bucket/diff-output/?region=us-east-1&access_key_id=xxx&secret_access_key=yyy';

-- Output differences to Stage
DATA BRANCH DIFF t2 AGAINST t1 OUTPUT FILE 'stage://my_stage/';
+-------------------------------------------------+------------------------------------------+
| FILE SAVED TO                                   | HINT                                     |
+-------------------------------------------------+------------------------------------------+
| stage://my_stage/diff_t2_t1_20241225.sql        | DELETE FROM test.t1, REPLACE INTO test.t1 |
+-------------------------------------------------+------------------------------------------+

-- View file content on Stage (without downloading)
SELECT load_file(CAST('stage://my_stage/diff_t2_t1_20241225.sql' AS DATALINK));
```

Advantages of using Stage:
- **Security**: No need to expose AK/SK in every SQL statement; administrators configure once
- **Convenience**: Encapsulate complex URL paths into simple object names
- **Cross-cluster sync**: Source writes to object storage, target reads and executes directly

### Example 7: Detect Update Operations

```sql
CREATE TABLE t0 (a INT PRIMARY KEY, b INT, c INT);
INSERT INTO t0 SELECT result, result, result FROM generate_series(1, 100) g;

DATA BRANCH CREATE TABLE t1 FROM t0;
UPDATE t1 SET c = c + 1 WHERE a IN (1, 50, 100);

DATA BRANCH CREATE TABLE t2 FROM t0;
UPDATE t2 SET c = c + 2 WHERE a IN (1, 25, 75);

-- Compare differences, will detect conflicting updates
DATA BRANCH DIFF t2 AGAINST t1;
+--------------------+--------+------+------+------+
| diff t2 against t1 | flag   | a    | b    | c    |
+--------------------+--------+------+------+------+
| t2                 | UPDATE |    1 |    1 |    3 |
| t1                 | UPDATE |    1 |    1 |    2 |
| t2                 | UPDATE |   25 |   25 |   27 |
| t1                 | UPDATE |   50 |   50 |   51 |
| t2                 | UPDATE |   75 |   75 |   77 |
| t1                 | UPDATE |  100 |  100 |  101 |
+--------------------+--------+------+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### Example 8: Difference Comparison for Composite Primary Key Tables

```sql
CREATE TABLE orders (
    tenant_id INT,
    order_code VARCHAR(8),
    amount DECIMAL(12,2),
    PRIMARY KEY (tenant_id, order_code)
);

INSERT INTO orders VALUES
    (100, 'A100', 120.50),
    (100, 'A101', 80.00),
    (101, 'B200', 305.75);

DATA BRANCH CREATE TABLE orders_branch FROM orders;

-- Make modifications on branch
UPDATE orders_branch SET amount = 130.50 WHERE tenant_id = 100 AND order_code = 'A100';
DELETE FROM orders_branch WHERE tenant_id = 100 AND order_code = 'A101';
INSERT INTO orders_branch VALUES (102, 'C300', 512.25);

-- Compare differences
DATA BRANCH DIFF orders_branch AGAINST orders;
+-----------------------------------+--------+-----------+------------+--------+
| diff orders_branch against orders | flag   | tenant_id | order_code | amount |
+-----------------------------------+--------+-----------+------------+--------+
| orders_branch                     | UPDATE |       100 | A100       | 130.50 |
| orders_branch                     | DELETE |       100 | A101       |  80.00 |
| orders_branch                     | INSERT |       102 | C300       | 512.25 |
+-----------------------------------+--------+-----------+------------+--------+

DROP TABLE orders;
DROP TABLE orders_branch;
DROP DATABASE test;
```

## Notes

1. **Table Structure Consistency**: The two tables being compared must have the same table structure (column names, column types).

2. **Primary Key Requirement**: Although tables without primary keys are supported, it is recommended to use tables with primary keys for more accurate difference results.

3. **Performance Considerations**: For large tables, difference comparison may take a long time. It is recommended to use `OUTPUT COUNT` first to understand the scale of differences.

4. **Snapshot Validity**: When comparing using snapshots, ensure the snapshots exist and are valid.

5. **Output File**: When using `OUTPUT FILE`, ensure the target directory exists and has write permissions. The generated SQL file can be executed directly to synchronize data.

6. **LCA Detection**: The system automatically detects LCA without manual specification. The existence of LCA affects how differences are calculated.
