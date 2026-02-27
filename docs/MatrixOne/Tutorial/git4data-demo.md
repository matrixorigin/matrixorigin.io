# Git for Data: Data Branch Management

In daily data development, you must have encountered scenarios like these:

- The risk control team needs to modify rule tables while the operations team simultaneously adjusts campaign data — both sides worry about breaking each other's data
- The test environment needs an exact copy of production data, but copying TB-scale tables is slow and expensive
- After adjusting data metrics, you want to know "exactly which rows changed," but can only rely on manual comparison

The traditional approach is to "make a copy first" — duplicate databases, duplicate tables, run scripts. But copying is slow, costly, and most critically: **it's hard to articulate what changed, and even harder to safely bring those changes back.**

MatrixOne's **Data Branch** feature turns data change management into an engineering workflow similar to Git. You can use SQL to: create branches, view diffs, merge changes, and handle conflicts — managing data just like managing code.

This tutorial will guide you from scratch through a complete hands-on scenario to learn all the core operations of Data Branch.

> **Version Requirement**: The Data Branch feature is available in MatrixOne v3.0 and above.

## Core Concepts

Before getting started, understand these 5 key actions:

| Action | SQL Syntax | Git Analogy | Purpose |
|--------|-----------|-------------|---------|
| Snapshot | `CREATE SNAPSHOT` | `git tag` | Mark a point-in-time for data as a safety anchor |
| Create Branch | `DATA BRANCH CREATE` | `git branch` + `git checkout` | Create an independent experimental table from the main table/snapshot |
| View Diff | `DATA BRANCH DIFF` | `git diff` | Compare data differences between two branches row by row |
| Merge | `DATA BRANCH MERGE` | `git merge` | Merge changes from a branch back into the target table |
| Delete Branch | `DATA BRANCH DELETE` | `git branch -d` | Clean up branches no longer needed, retaining audit metadata |

Similar to how Git manages code, the typical Data Branch workflow is:

```
Main Table → Snapshot → Create Branch → Independent Modifications → Diff Review → Merge Back to Main Table
```

!!! note
    Data Branch is based on a Copy-on-Write mechanism. Creating a branch does not actually copy data — new storage space is only allocated when modifications are made. Therefore, creating a branch is very fast and takes almost no extra storage.

## Prerequisites

Before you begin, make sure:

- You have a MatrixOne v3.0 or above instance and can connect to it
- You have installed the MySQL client and can connect to MatrixOne

Connect to MatrixOne:

```bash
mysql -h 127.0.0.1 -P 6001 -u root -p111
```

## Hands-on Scenario: Parallel Modifications on an Orders Table

We simulate a real-world scenario: a main orders table where the risk control team and the operations team need to make modifications simultaneously without interfering with each other, and finally merge their respective changes back into the main table.

### Step 1: Prepare the Main Table Data

```sql
-- Create demo database
DROP DATABASE IF EXISTS demo_branch;
CREATE DATABASE demo_branch;
USE demo_branch;

-- Create the main orders table
CREATE TABLE orders (
    order_id    INT PRIMARY KEY,
    customer    VARCHAR(20),
    amount      DECIMAL(10,2),
    risk_flag   TINYINT DEFAULT 0,
    promo_tag   VARCHAR(20)
);

-- Insert initial data
INSERT INTO orders VALUES
    (1001, 'Alice',   99.90,  0, NULL),
    (1002, 'Bob',    199.00,  0, NULL),
    (1003, 'Charlie', 10.00,  0, NULL),
    (1004, 'Diana',  350.00,  0, NULL),
    (1005, 'Eve',     75.50,  0, NULL);

-- Verify data
SELECT * FROM orders ORDER BY order_id;
```

Result:

```
+----------+----------+--------+-----------+-----------+
| order_id | customer | amount | risk_flag | promo_tag |
+----------+----------+--------+-----------+-----------+
|     1001 | Alice    |  99.90 |         0 | NULL      |
|     1002 | Bob      | 199.00 |         0 | NULL      |
|     1003 | Charlie  |  10.00 |         0 | NULL      |
|     1004 | Diana    | 350.00 |         0 | NULL      |
|     1005 | Eve      |  75.50 |         0 | NULL      |
+----------+----------+--------+-----------+-----------+
```

### Step 2: Take a Snapshot to Establish a Safety Anchor

Before any modifications, take a snapshot of the main table first. This is your "safety net" — no matter what happens next, you can always return to this point.

```sql
CREATE SNAPSHOT sp_orders_v1 FOR TABLE demo_branch orders;
```

### Step 3: Create Two Branches

Create two independent branch tables from the main table, one for each team:

```sql
-- Risk control branch: for flagging high-risk orders
DATA BRANCH CREATE TABLE orders_risk FROM orders;

-- Operations branch: for adding campaign tags and adjusting prices
DATA BRANCH CREATE TABLE orders_promo FROM orders;
```

At this point, all three tables have identical data. Let's verify:

```sql
SELECT * FROM orders_risk ORDER BY order_id;
SELECT * FROM orders_promo ORDER BY order_id;
```

Both queries return the same results as the main table.

!!! info
    You can also create a branch from a snapshot: `DATA BRANCH CREATE TABLE orders_risk FROM orders{SNAPSHOT='sp_orders_v1'};`. This way, even if the main table was modified before creating the branch, the branch is still based on the data at the snapshot point.

### Step 4: Independent Modifications on Two Branches

Now both teams work on their own branches independently, without interfering with each other.

**Risk control team** operates on `orders_risk`:

```sql
-- Flag Bob's order as high risk
UPDATE orders_risk SET risk_flag = 1 WHERE order_id = 1002;

-- Delete Charlie's abnormally small order
DELETE FROM orders_risk WHERE order_id = 1003;

-- Add a new order that needs review
INSERT INTO orders_risk VALUES (1006, 'Frank', 500.00, 1, NULL);
```

**Operations team** operates on `orders_promo`:

```sql
-- Add campaign tags to Alice's and Bob's orders, and apply a 10% discount
UPDATE orders_promo SET promo_tag = 'summer_sale', amount = amount * 0.9
WHERE order_id IN (1001, 1002);

-- Add a new campaign order
INSERT INTO orders_promo VALUES (1007, 'Grace', 39.90, 0, 'summer_sale');
```

At this point, the main table is completely unaffected:

```sql
SELECT * FROM orders ORDER BY order_id;
-- Still the original 5 rows, with no changes whatsoever
```

### Step 5: Use DIFF to View Differences

Before merging, let's see what each branch has changed relative to the main table.

**View differences between the risk control branch and the main table:**

```sql
DATA BRANCH DIFF orders_risk AGAINST orders;
```

Result:

```
+----------------------------+--------+----------+----------+--------+-----------+-----------+
| diff orders_risk against orders | flag   | order_id | customer | amount | risk_flag | promo_tag |
+----------------------------+--------+----------+----------+--------+-----------+-----------+
| orders_risk                | UPDATE |     1002 | Bob      | 199.00 |         1 | NULL      |
| orders_risk                | DELETE |     1003 | Charlie  |  10.00 |         0 | NULL      |
| orders_risk                | INSERT |     1006 | Frank    | 500.00 |         1 | NULL      |
+----------------------------+--------+----------+----------+--------+-----------+-----------+
```

You can clearly see: 1 row updated, 1 row deleted, 1 row inserted.

**View differences between the operations branch and the main table:**

```sql
DATA BRANCH DIFF orders_promo AGAINST orders;
```

Result:

```
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
| diff orders_promo against orders | flag   | order_id | customer | amount | risk_flag | promo_tag   |
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
| orders_promo                | UPDATE |     1001 | Alice    |  89.91 |         0 | summer_sale |
| orders_promo                | UPDATE |     1002 | Bob      | 179.10 |         0 | summer_sale |
| orders_promo                | INSERT |     1007 | Grace    |  39.90 |         0 | summer_sale |
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
```

2 rows updated, 1 row inserted.

**You can also directly compare the differences between two branches:**

```sql
DATA BRANCH DIFF orders_risk AGAINST orders_promo;
```

This shows all differing rows between the two branches, helping you anticipate potential conflicts before merging.

!!! tip

    For large tables, you can first use `OUTPUT COUNT` to understand the scale of differences:

    ```sql
    DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT COUNT;
    ```

    You can also use `OUTPUT LIMIT 10` to view only the first 10 rows of differences.

**Export differences as a patch file:**

If you need to bring changes to another environment (e.g., syncing from staging to production), you can export the DIFF results as a file before merging:

```sql
-- Export to local directory (execute before merge to ensure the patch reflects the original branch changes)
DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT FILE '/tmp/diff_output/';
```

The system will generate a `.sql` file (for incremental scenarios) or a `.csv` file (for full scenarios), and tell you the file path and usage instructions.

Replay the patch in the target environment:

```bash
# Replay SQL patch
mysql -h <target_host> -P 6001 -u root -p111 demo_branch < /tmp/diff_output/diff_xxx.sql
```

You can also export to object storage (via Stage):

```sql
-- Create a Stage pointing to S3
CREATE STAGE my_stage URL = 's3://my-bucket/diffs/?region=us-east-1&access_key_id=<ak>&secret_access_key=<sk>';

-- Export to Stage
DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT FILE 'stage://my_stage/';
```

### Step 6: Merge Branches into the Main Table

First, merge the risk control branch (no conflict scenario):

```sql
DATA BRANCH MERGE orders_risk INTO orders;
```

Verify the main table:

```sql
SELECT * FROM orders ORDER BY order_id;
```

Result:

```
+----------+----------+--------+-----------+-----------+
| order_id | customer | amount | risk_flag | promo_tag |
+----------+----------+--------+-----------+-----------+
|     1001 | Alice    |  99.90 |         0 | NULL      |
|     1002 | Bob      | 199.00 |         1 | NULL      |
|     1004 | Diana    | 350.00 |         0 | NULL      |
|     1005 | Eve      |  75.50 |         0 | NULL      |
|     1006 | Frank    | 500.00 |         1 | NULL      |
+----------+----------+--------+-----------+-----------+
```

The risk control modifications are now in effect: Bob is flagged as high risk, Charlie's order is deleted, and Frank's order is added.

### Step 7: Handle Merge Conflicts

Now merge the operations branch. Note that the operations branch also modified `order_id = 1002` (Bob's order), while the risk control branch has already merged its modification to the same row — this creates a conflict.

**Default behavior — error on conflict:**

```sql
DATA BRANCH MERGE orders_promo INTO orders;
-- ERROR: conflict on pk(1002)
```

The system tells you which rows have conflicts and will not silently overwrite data.

**Three conflict resolution strategies:**

| Strategy | Syntax | Behavior | Use Case |
|----------|--------|----------|----------|
| FAIL | Default | Error immediately on conflict | Scenarios requiring manual review |
| SKIP | `WHEN CONFLICT SKIP` | Skip conflicting rows, keep main table data | Main table data takes priority |
| ACCEPT | `WHEN CONFLICT ACCEPT` | Overwrite main table with branch data | Branch data takes priority |

In this scenario, the risk control flag is more important than the operations discount, so we choose SKIP (keep the risk control modifications in the main table):

```sql
DATA BRANCH MERGE orders_promo INTO orders WHEN CONFLICT SKIP;
```

Verify the final result:

```sql
SELECT * FROM orders ORDER BY order_id;
```

Result:

```
+----------+----------+--------+-----------+-------------+
| order_id | customer | amount | risk_flag | promo_tag   |
+----------+----------+--------+-----------+-------------+
|     1001 | Alice    |  89.91 |         0 | summer_sale |
|     1002 | Bob      | 199.00 |         1 | NULL        |
|     1004 | Diana    | 350.00 |         0 | NULL        |
|     1005 | Eve      |  75.50 |         0 | NULL        |
|     1006 | Frank    | 500.00 |         1 | NULL        |
|     1007 | Grace    |  39.90 |         0 | summer_sale |
+----------+----------+--------+-----------+-------------+
```

- Alice's order: The operations discount and tag took effect (no conflict)
- Bob's order: The risk control `risk_flag = 1` was preserved (conflict was SKIPped)
- Grace's order: The new order added by operations was successfully merged

### Step 8: Delete Branches

After branches are no longer needed, clean them up promptly:

```sql
DATA BRANCH DELETE TABLE orders_risk;
DATA BRANCH DELETE TABLE orders_promo;
```

Unlike a regular `DROP TABLE`, `DATA BRANCH DELETE` retains metadata records in the system table `mo_catalog.mo_branch_metadata` (marked as deleted), making it convenient for subsequent audit tracking.

### Step 9: Rollback (If Needed)

If issues are discovered after merging, you can use the snapshot to return to the initial state:

```sql
RESTORE TABLE sys.demo_branch.orders{SNAPSHOT='sp_orders_v1'};
```

> **Note**: The syntax above is for MatrixOne versions after v3.0. For v3.0, use the following syntax:
> ```sql
> -- v3.0 syntax
> -- RESTORE ACCOUNT sys DATABASE demo_branch TABLE orders FROM SNAPSHOT sp_orders_v1;
> ```

This is the value of snapshots — turning "rollback" from a high-risk operation into a routine action.

### Clean Up the Environment

```sql
DROP SNAPSHOT sp_orders_v1;
DROP DATABASE demo_branch;
```

## Advanced Usage

### Database-Level Branches

In addition to table-level branches, you can also create branches for an entire database, copying all tables at once:

```sql
DATA BRANCH CREATE DATABASE dev_db FROM prod_db;

-- Freely modify within dev_db without affecting prod_db
-- Merge back after modifications are complete
```

### Creating Branches from Snapshots

Create a branch from a specific historical point in time, suitable for "going back to yesterday's data for analysis":

```sql
CREATE SNAPSHOT sp_yesterday FOR TABLE mydb mytable;
-- ... time passes, data changes ...
DATA BRANCH CREATE TABLE mytable_analysis FROM mytable{SNAPSHOT='sp_yesterday'};
```

### Multi-Level Branches

Branches can create further branches, forming a multi-level structure:

```sql
DATA BRANCH CREATE TABLE branch_v1 FROM main_table;
-- Modify on branch_v1...
DATA BRANCH CREATE TABLE branch_v2 FROM branch_v1;
-- Continue modifying on branch_v2...
```

## Best Practices

1. **Snapshot before operating**: Before any batch modification, `CREATE SNAPSHOT` first to give yourself a way back
2. **Tables should strongly have primary keys**: DIFF and MERGE rely on primary keys to locate rows. Although tables without primary keys are supported (the system uses internal hidden primary keys), results are more controllable and conflict identification is more precise with primary keys
3. **DIFF before merging**: Use `DATA BRANCH DIFF ... OUTPUT COUNT` to understand the scale of changes and avoid blind merging
4. **Unified naming conventions**: Branch tables and snapshots should include purpose and date, such as `orders_risk_20260226`, `sp_orders_v1`
5. **Clean up branches promptly**: `DATA BRANCH DELETE` branches that are no longer needed to keep the environment tidy
6. **Agree on conflict strategies in advance**: Teams should agree on FAIL/SKIP/ACCEPT usage rules beforehand, rather than relying on verbal communication

## Syntax Quick Reference

| Operation | Syntax |
|-----------|--------|
| Create table branch | `DATA BRANCH CREATE TABLE new_table FROM source_table` |
| Create database branch | `DATA BRANCH CREATE DATABASE new_db FROM source_db` |
| Create from snapshot | `DATA BRANCH CREATE TABLE t FROM src{SNAPSHOT='sp_name'}` |
| View diff | `DATA BRANCH DIFF target AGAINST base` |
| Diff count | `DATA BRANCH DIFF target AGAINST base OUTPUT COUNT` |
| Diff with row limit | `DATA BRANCH DIFF target AGAINST base OUTPUT LIMIT 10` |
| Export diff file | `DATA BRANCH DIFF target AGAINST base OUTPUT FILE '/path/'` |
| Merge (default error) | `DATA BRANCH MERGE source INTO dest` |
| Merge (skip conflicts) | `DATA BRANCH MERGE source INTO dest WHEN CONFLICT SKIP` |
| Merge (accept overwrite) | `DATA BRANCH MERGE source INTO dest WHEN CONFLICT ACCEPT` |
| Delete table branch | `DATA BRANCH DELETE TABLE table_name` |
| Delete database branch | `DATA BRANCH DELETE DATABASE db_name` |

## Reference Documentation

- [DATA BRANCH CREATE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-create-cn.md)
- [DATA BRANCH DIFF](../Reference/SQL-Reference/Data-Definition-Language/data-branch-diff-cn.md)
- [DATA BRANCH MERGE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-merge-cn.md)
- [DATA BRANCH DELETE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-delete-cn.md)
- [CREATE SNAPSHOT](../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE SNAPSHOT](../Reference/SQL-Reference/Data-Definition-Language/restore-snapshot.md)
