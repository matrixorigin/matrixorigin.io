# DATA BRANCH CREATE

## Description

The `DATA BRANCH CREATE` statement is used to create data branches. Data branching is a data version management feature provided by MatrixOne that allows users to create an independent data copy (branch) from an existing table or database for data isolation, testing, development, and other scenarios.

A data branch shares the same table structure as the source data but maintains independent data. After creating a branch, modifications to the branch do not affect the source data, and vice versa. The system automatically records branch metadata information for subsequent DIFF and MERGE operations.

## Syntax

### Create Table Branch

```
DATA BRANCH CREATE TABLE [database_name.]table_name FROM source_table [{ SNAPSHOT = 'snapshot_name' }] [TO ACCOUNT account_name]
```

### Create Database Branch

```
DATA BRANCH CREATE DATABASE database_name FROM source_database [{ SNAPSHOT = 'snapshot_name' }] [TO ACCOUNT account_name]
```

## Arguments

### Parameter Description

| Parameter | Description |
|-----------|-------------|
| `database_name` | Database name. When creating a table branch, it can be omitted if a database has been selected via `USE` statement; otherwise it must be specified |
| `table_name` | Name of the new branch table to be created. The table must not exist, otherwise an error will be raised |
| `source_table` | Source table name, can include database prefix like `db.table` |
| `source_database` | Source database name |
| `SNAPSHOT = 'snapshot_name'` | Optional parameter to specify creating a branch from a specific snapshot point. If not specified, creates from the current point in time |
| `TO ACCOUNT account_name` | Optional parameter to specify creating the branch in another tenant (only available for sys tenant) |

### Snapshot Options

You can specify the data point in time using the following methods:

- `{SNAPSHOT = 'snapshot_name'}` - Use a pre-created snapshot
- `{TIMESTAMP = 'timestamp_value'}` - Use a specified timestamp

## Usage Notes

### Permission Requirements

- User needs read permission on the source table/database
- User needs permission to create tables/databases at the target location
- Cross-tenant operations are limited to sys tenant only

### Restrictions

- The branch table name must not already exist; an error will be raised if the target table already exists
- System databases (such as `mo_catalog`, `information_schema`, etc.) cannot be branched
- Branch metadata is recorded when creating a branch to track branch relationships

### Difference from CREATE CLONE

`DATA BRANCH CREATE` relies on `CREATE CLONE` internally for data copying, but there are fundamental differences between them:

| Feature | DATA BRANCH CREATE | CREATE CLONE |
|---------|-------------------|--------------|
| Data Copy | ✓ | ✓ |
| Record Branch Metadata | ✓ | ✗ |
| Data Lineage | ✓ Branch maintains lineage with source | ✗ Completely independent after clone |
| Support DIFF Operation | ✓ Can compare differences between branches | ✗ |
| Support MERGE Operation | ✓ Can merge branch data | ✗ |
| Use Cases | Data version management, multi-branch collaborative development | Simple data backup, one-time copy |

**Recommendation**:
- If you need to perform data difference comparison (DIFF) or data merging (MERGE) later, use `DATA BRANCH CREATE`
- If you only need simple data copying without tracking data lineage, you can use `CREATE CLONE`

> **Note**: Tables without data lineage (such as those created via `CREATE CLONE` or created independently) can also perform DIFF/MERGE operations, but with the following limitations:
> 1. **Lower Performance**: Without branch metadata, the system cannot leverage lineage relationships to optimize difference calculation, requiring full data comparison
> 2. **Cannot Reflect Lineage**: The difference results cannot reflect the evolution history and source relationships between data

## Examples

### Example 1: Create Table Branch (Basic Usage)

Create a data branch from an existing table:

```sql
-- Create source table and insert data
CREATE DATABASE test;
USE test;

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(50),
    amount DECIMAL(10,2)
);

INSERT INTO orders VALUES 
    (1, 'Alice', 100.00),
    (2, 'Bob', 200.00),
    (3, 'Charlie', 300.00);

-- Create branch table (database name can be omitted after USE)
DATA BRANCH CREATE TABLE orders_dev FROM orders;

-- You can also explicitly specify the database name
DATA BRANCH CREATE TABLE test.orders_dev2 FROM test.orders;

-- Verify branch table data
SELECT * FROM orders_dev;
+----------+---------------+--------+
| order_id | customer_name | amount |
+----------+---------------+--------+
|        1 | Alice         | 100.00 |
|        2 | Bob           | 200.00 |
|        3 | Charlie       | 300.00 |
+----------+---------------+--------+

-- Modify branch table without affecting source table
UPDATE orders_dev SET amount = 150.00 WHERE order_id = 1;
INSERT INTO orders_dev VALUES (4, 'David', 400.00);

-- Source table data remains unchanged
SELECT * FROM orders;
+----------+---------------+--------+
| order_id | customer_name | amount |
+----------+---------------+--------+
|        1 | Alice         | 100.00 |
|        2 | Bob           | 200.00 |
|        3 | Charlie       | 300.00 |
+----------+---------------+--------+

-- If target table already exists, an error will be raised
DATA BRANCH CREATE TABLE orders_dev FROM orders;
-- ERROR: table orders_dev already exists
```

### Example 2: Create Table Branch from Snapshot

Create a data branch from a specific point in time using a snapshot:

```sql
-- Create source table and insert initial data
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(50),
    price DECIMAL(10,2)
);

INSERT INTO products VALUES (1, 'Phone', 999.00), (2, 'Laptop', 1999.00);

-- Create snapshot
CREATE SNAPSHOT sp_products FOR TABLE test products;

-- Continue modifying source table
INSERT INTO products VALUES (3, 'Tablet', 599.00);
UPDATE products SET price = 899.00 WHERE product_id = 1;

-- Create branch from snapshot (get data at snapshot time)
DATA BRANCH CREATE TABLE products_snapshot FROM products{SNAPSHOT='sp_products'};

-- Branch table contains data at snapshot time
SELECT * FROM products_snapshot;
+------------+--------+---------+
| product_id | name   | price   |
+------------+--------+---------+
|          1 | Phone  |  999.00 |
|          2 | Laptop | 1999.00 |
+------------+--------+---------+

-- Cleanup
DROP SNAPSHOT sp_products;
```

### Example 3: Create Database Branch

Create a branch of an entire database:

```sql
-- Create source database and tables
CREATE DATABASE source_db;
USE source_db;

CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));
CREATE TABLE logs (id INT PRIMARY KEY, message VARCHAR(100));

INSERT INTO users VALUES (1, 'User1'), (2, 'User2');
INSERT INTO logs VALUES (1, 'Log entry 1');

-- Create database branch
DATA BRANCH CREATE DATABASE dev_db FROM source_db;

-- Verify branch database
USE dev_db;
SHOW TABLES;
+------------------+
| Tables_in_dev_db |
+------------------+
| logs             |
| users            |
+------------------+

SELECT * FROM users;
+----+-------+
| id | name  |
+----+-------+
|  1 | User1 |
|  2 | User2 |
+----+-------+
```

### Example 4: Create Database Branch from Snapshot

```sql
-- Create snapshot
CREATE SNAPSHOT sp_source FOR DATABASE source_db;

-- Modify source database
USE source_db;
INSERT INTO users VALUES (3, 'User3');

-- Create branch from snapshot
DATA BRANCH CREATE DATABASE backup_db FROM source_db{SNAPSHOT='sp_source'};

-- Branch database contains data at snapshot time
USE backup_db;
SELECT * FROM users;
+----+-------+
| id | name  |
+----+-------+
|  1 | User1 |
|  2 | User2 |
+----+-------+

-- Cleanup
DROP SNAPSHOT sp_source;
```

### Example 5: Multi-level Branching

Create new branches from existing branches:

```sql
USE test;

-- Create base table
CREATE TABLE base_table (a INT PRIMARY KEY, b INT);
INSERT INTO base_table VALUES (1, 1), (2, 2), (3, 3);

-- Create first-level branch
DATA BRANCH CREATE TABLE branch_level1 FROM base_table;
INSERT INTO branch_level1 VALUES (4, 4);

-- Create second-level branch from first-level branch
DATA BRANCH CREATE TABLE branch_level2 FROM branch_level1;
INSERT INTO branch_level2 VALUES (5, 5);

-- Each table has independent data
SELECT COUNT(*) FROM base_table;
SELECT COUNT(*) FROM branch_level1;
SELECT COUNT(*) FROM branch_level2;
```

## Notes

1. **Data Isolation**: After branch creation, source data and branch data are completely independent and do not affect each other.

2. **Metadata Recording**: The system records branch relationships in the `mo_catalog.mo_branch_metadata` table to support subsequent DIFF and MERGE operations. This table is only accessible by the sys tenant.

3. **Storage Overhead**: Creating a branch copies data, which incurs additional storage overhead.

4. **Snapshot Dependency**: If using a snapshot to create a branch, ensure the snapshot exists and is valid before creating the branch.

5. **Cross-tenant Restrictions**: Cross-tenant branch creation is limited to sys tenant operations and requires pre-created snapshots.
