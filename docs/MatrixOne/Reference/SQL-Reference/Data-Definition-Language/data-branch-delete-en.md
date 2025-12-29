<!-- version: v3.0.4 -->

# DATA BRANCH DELETE

## Description

The `DATA BRANCH DELETE` statement is used to delete data branches. This statement deletes the specified branch table or branch database while updating the branch metadata to mark the corresponding branch as deleted.

Unlike regular `DROP TABLE` or `DROP DATABASE`, `DATA BRANCH DELETE` preserves the branch metadata record (marked as deleted), which is useful for auditing and tracking branch history.

## Syntax

### Delete Table Branch

```
DATA BRANCH DELETE TABLE [database_name.]table_name
```

### Delete Database Branch

```
DATA BRANCH DELETE DATABASE database_name
```

## Arguments

### Parameter Description

| Parameter | Description |
|-----------|-------------|
| `table_name` | Name of the branch table to delete |
| `database_name` | Database name. Optional when deleting a table, required when deleting a database |

## Usage Notes

### Permission Requirements

- User needs delete permission on the target table/database

### Execution Effects

1. **Delete Table Branch**: Deletes the specified table and marks the `table_deleted` field as `true` in `mo_catalog.mo_branch_metadata`
2. **Delete Database Branch**: Deletes all tables in the specified database and marks all related table metadata as deleted

### Difference from DROP

| Operation | Data Deleted | Metadata Preserved |
|-----------|--------------|-------------------|
| `DROP TABLE` | Yes | No |
| `DATA BRANCH DELETE TABLE` | Yes | Yes (marked as deleted) |
| `DROP DATABASE` | Yes | No |
| `DATA BRANCH DELETE DATABASE` | Yes | Yes (marked as deleted) |

## Examples

### Example 1: Delete Table Branch

```sql
-- Expected-Rows: 0
CREATE DATABASE test_db;
-- Expected-Rows: 0
USE test_db;

-- Expected-Rows: 0
CREATE TABLE test_db.base_table (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
-- Expected-Rows: 0
INSERT INTO test_db.base_table VALUES (1, 'Alice'), (2, 'Bob');

-- Expected-Rows: 0
CREATE SNAPSHOT sp_base FOR TABLE test_db base_table;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test_db.branch_table FROM test_db.base_table{SNAPSHOT='sp_base'};

-- Expected-Rows: 2
SHOW TABLES FROM test_db;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
| branch_table    |
+-----------------+

-- Expected-Rows: 1
SELECT table_id, table_deleted 
FROM mo_catalog.mo_branch_metadata 
WHERE table_id = (
    SELECT rel_id FROM mo_catalog.mo_tables 
    WHERE reldatabase = 'test_db' AND relname = 'branch_table'
);

-- Expected-Rows: 0
DATA BRANCH DELETE TABLE test_db.branch_table;

-- Expected-Rows: 1
SHOW TABLES FROM test_db;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
+-----------------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_base;
-- Expected-Rows: 0
DROP DATABASE test_db;
```

### Example 2: Delete Database Branch

```sql
-- Expected-Rows: 0
CREATE DATABASE source_db;
-- Expected-Rows: 0
USE source_db;

-- Expected-Rows: 0
CREATE TABLE source_db.t1 (a INT PRIMARY KEY);
-- Expected-Rows: 0
CREATE TABLE source_db.t2 (a INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO source_db.t1 VALUES (1), (2);
-- Expected-Rows: 0
INSERT INTO source_db.t2 VALUES (3), (4);

-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE branch_db FROM source_db;

-- Expected-Rows: 1
SHOW DATABASES LIKE 'branch_db';
+--------------------+
| Database (branch_db) |
+--------------------+
| branch_db          |
+--------------------+

-- Expected-Rows: 2
SHOW TABLES FROM branch_db;
+-------------------+
| Tables_in_branch_db |
+-------------------+
| t1                |
| t2                |
+-------------------+

-- Expected-Rows: 0
DATA BRANCH DELETE DATABASE branch_db;

-- Expected-Rows: 0
SHOW DATABASES LIKE 'branch_db';

-- Expected-Rows: 0
DROP DATABASE source_db;
```

### Example 3: Metadata Status After Branch Deletion

```sql
-- Expected-Rows: 0
CREATE DATABASE br_meta_db;
-- Expected-Rows: 0
USE br_meta_db;

-- Expected-Rows: 0
CREATE TABLE br_meta_db.base_tbl (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO br_meta_db.base_tbl VALUES (1, 'a'), (2, 'b');

-- Expected-Rows: 0
CREATE SNAPSHOT sp_base_tbl FOR TABLE br_meta_db base_tbl;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE br_meta_db.branch_tbl FROM br_meta_db.base_tbl{SNAPSHOT='sp_base_tbl'};

-- Expected-Rows: 0
SET @branch_tbl_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'br_meta_db' AND relname = 'branch_tbl'
);

-- Expected-Rows: 1
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| false         |
+---------------+

-- Expected-Rows: 0
DATA BRANCH DELETE TABLE br_meta_db.branch_tbl;

-- Expected-Rows: 1
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| true          |
+---------------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_base_tbl;
-- Expected-Rows: 0
DROP DATABASE br_meta_db;
```

### Example 4: Batch Delete All Branch Tables in a Database

```sql
-- Expected-Rows: 0
CREATE DATABASE src_db;
-- Expected-Rows: 0
USE src_db;

-- Expected-Rows: 0
CREATE TABLE src_db.t1 (a INT PRIMARY KEY);
-- Expected-Rows: 0
CREATE TABLE src_db.t2 (a INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO src_db.t1 VALUES (1);
-- Expected-Rows: 0
INSERT INTO src_db.t2 VALUES (2);

-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE dst_db FROM src_db;

-- Expected-Rows: 0
SET @dst_t1_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't1'
);
-- Expected-Rows: 0
SET @dst_t2_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't2'
);

-- Expected-Rows: 2
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| false         |
| false         |
+---------------+

-- Expected-Rows: 0
DATA BRANCH DELETE DATABASE dst_db;

-- Expected-Rows: 2
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| true          |
| true          |
+---------------+

-- Expected-Rows: 0
DROP DATABASE src_db;
```

## Notes

1. **Irreversible**: The delete operation is irreversible. Data will be permanently lost after deletion. Please confirm before executing.

2. **Metadata Preservation**: Although data is deleted, branch metadata is preserved in the system table with the `table_deleted` field marked as `true`. The metadata table (`mo_catalog.mo_branch_metadata`) is only accessible by the sys tenant.

3. **Cascade Deletion**: When deleting a database branch, all tables in that database are deleted, and all related table metadata is updated.

4. **Permission Check**: Executing delete operations requires appropriate permissions. Ensure the current user has sufficient privileges.

5. **Audit Trail**: Since metadata is preserved, the sys tenant can track branch history by querying the `mo_catalog.mo_branch_metadata` table.
