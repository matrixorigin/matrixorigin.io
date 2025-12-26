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
-- Create test environment
CREATE DATABASE test_db;
USE test_db;

-- Create source table
CREATE TABLE base_table (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
INSERT INTO base_table VALUES (1, 'Alice'), (2, 'Bob');

-- Create snapshot
CREATE SNAPSHOT sp_base FOR TABLE test_db base_table;

-- Create branch table
DATA BRANCH CREATE TABLE branch_table FROM base_table{SNAPSHOT='sp_base'};

-- Verify branch table exists
SHOW TABLES;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
| branch_table    |
+-----------------+

-- View branch metadata (table_deleted is false)
-- Note: mo_branch_metadata table is only accessible by sys tenant
SELECT table_id, table_deleted 
FROM mo_catalog.mo_branch_metadata 
WHERE table_id = (
    SELECT rel_id FROM mo_catalog.mo_tables 
    WHERE reldatabase = 'test_db' AND relname = 'branch_table'
);

-- Delete branch table
DATA BRANCH DELETE TABLE test_db.branch_table;

-- Verify table is deleted
SHOW TABLES;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
+-----------------+

-- View branch metadata (table_deleted changed to true)
-- Note: Table is deleted but metadata record is preserved

-- Cleanup
DROP SNAPSHOT sp_base;
DROP DATABASE test_db;
```

### Example 2: Delete Database Branch

```sql
-- Create source database
CREATE DATABASE source_db;
USE source_db;

CREATE TABLE t1 (a INT PRIMARY KEY);
CREATE TABLE t2 (a INT PRIMARY KEY);
INSERT INTO t1 VALUES (1), (2);
INSERT INTO t2 VALUES (3), (4);

-- Create database branch
DATA BRANCH CREATE DATABASE branch_db FROM source_db;

-- Verify branch database exists
SHOW DATABASES LIKE 'branch_db';
+--------------------+
| Database (branch_db) |
+--------------------+
| branch_db          |
+--------------------+

USE branch_db;
SHOW TABLES;
+-------------------+
| Tables_in_branch_db |
+-------------------+
| t1                |
| t2                |
+-------------------+

-- Delete database branch
DATA BRANCH DELETE DATABASE branch_db;

-- Verify database is deleted
SHOW DATABASES LIKE 'branch_db';
-- Empty result

-- Cleanup
DROP DATABASE source_db;
```

### Example 3: Metadata Status After Branch Deletion

```sql
-- Create test environment
CREATE DATABASE br_meta_db;
USE br_meta_db;

CREATE TABLE base_tbl (a INT PRIMARY KEY, b VARCHAR(10));
INSERT INTO base_tbl VALUES (1, 'a'), (2, 'b');

CREATE SNAPSHOT sp_base_tbl FOR TABLE br_meta_db base_tbl;

-- Create branch table
DATA BRANCH CREATE TABLE branch_tbl FROM base_tbl{SNAPSHOT='sp_base_tbl'};

-- Get branch table ID
SET @branch_tbl_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'br_meta_db' AND relname = 'branch_tbl'
);

-- View metadata status before deletion
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| false         |
+---------------+

-- Delete branch table
DATA BRANCH DELETE TABLE br_meta_db.branch_tbl;

-- View metadata status after deletion
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| true          |
+---------------+

-- Cleanup
DROP SNAPSHOT sp_base_tbl;
DROP DATABASE br_meta_db;
```

### Example 4: Batch Delete All Branch Tables in a Database

```sql
-- Create source database
CREATE DATABASE src_db;
USE src_db;

CREATE TABLE t1 (a INT PRIMARY KEY);
CREATE TABLE t2 (a INT PRIMARY KEY);
INSERT INTO t1 VALUES (1);
INSERT INTO t2 VALUES (2);

-- Create database branch
DATA BRANCH CREATE DATABASE dst_db FROM src_db;

-- Get IDs of all tables in branch database
SET @dst_t1_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't1'
);
SET @dst_t2_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't2'
);

-- View status before deletion
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| false         |
| false         |
+---------------+

-- Delete entire database branch
DATA BRANCH DELETE DATABASE dst_db;

-- View status after deletion (all tables marked as deleted)
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| true          |
| true          |
+---------------+

-- Cleanup
DROP DATABASE src_db;
```

## Notes

1. **Irreversible**: The delete operation is irreversible. Data will be permanently lost after deletion. Please confirm before executing.

2. **Metadata Preservation**: Although data is deleted, branch metadata is preserved in the system table with the `table_deleted` field marked as `true`. The metadata table (`mo_catalog.mo_branch_metadata`) is only accessible by the sys tenant.

3. **Cascade Deletion**: When deleting a database branch, all tables in that database are deleted, and all related table metadata is updated.

4. **Permission Check**: Executing delete operations requires appropriate permissions. Ensure the current user has sufficient privileges.

5. **Audit Trail**: Since metadata is preserved, the sys tenant can track branch history by querying the `mo_catalog.mo_branch_metadata` table.
