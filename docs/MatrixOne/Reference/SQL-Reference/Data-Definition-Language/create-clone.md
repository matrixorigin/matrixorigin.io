# **CREATE CLONE**

## **Syntax Description**

The CLONE operation allows copying the structure and data of tables or databases within the MatrixOne database. Cloning can be performed within the same tenant or across different tenants (only executable by the sys tenant). Cross-tenant cloning requires the use of a pre-created snapshot.

## **Prerequisites**

Before executing a CLONE operation, ensure:

- The source database and table must already exist.
- The target database (for table cloning) must already exist or be pre-created using CREATE DATABASE.
- For cross-tenant cloning, a snapshot must be pre-created.
- The executing user needs to have the appropriate permissions.

## **Connecting to Other Tenants**

To connect to other tenants for operations, use the specific connection string format:

```bash
# Connect to ordinary tenant acc1
mysql -h 127.0.0.1 -P 6001 -u root:acc1 -p

# Connect to ordinary tenant acc2
mysql -h 127.0.0.1 -P 6001 -u root:acc2 -p

# Connect to sys tenant
mysql -h 127.0.0.1 -P 6001 -u root:sys -p
```

## **Syntax Structure**

### Clone Table

```
CREATE TABLE [IF NOT EXISTS] target_db.target_table
CLONE source_db.source_table
[{SNAPSHOT = "snapshot_name"}]
[TO ACCOUNT account_name]
```

### Clone Database

```
CREATE DATABASE [IF NOT EXISTS] target_db
CLONE source_db
[{SNAPSHOT = "snapshot_name"}]
[TO ACCOUNT account_name]
```

## **Usage Notes**

- Cloning within the same tenant can be executed directly without a snapshot.
- Cross-tenant cloning can only be performed by the sys tenant and requires a pre-created snapshot.
- A snapshot provides a point-in-time view of the data, ensuring consistency for the clone operation.
- The clone operation copies the table's structure, data, and related metadata.
- The target table or database must not exist, or the `IF NOT EXISTS` clause must be used.

## **Permission Restrictions**

1. **System Database Restrictions**:
    - Ordinary tenants cannot clone system databases (`mo_task`, `mo_catalog`, `system`, `mysql`, `system_metric`, `information_schema`, `mo_debug`).
    - All tenants (including sys) cannot clone data *into* system databases.

2. **Cluster Table Restrictions**:
    - Ordinary tenants cannot clone cluster tables.
    - Only the sys tenant can clone system tables.

3. **Subscribed Data Cloning**:
    - Ordinary tenants can only clone databases or tables to which they are subscribed.
    - Cross-tenant cloning must be executed by the sys tenant.

## **Examples**

### Preparation: Create Test Tenants, Databases, and Tables

```sql
-- Create test tenants under the sys tenant
CREATE ACCOUNT acc1 ADMIN_NAME = 'admin' IDENTIFIED BY '111';
CREATE ACCOUNT acc2 ADMIN_NAME = 'admin' IDENTIFIED BY '111';

-- Connect to acc1 tenant to create test data
-- mysql -h 127.0.0.1 -P 6001 -u acc1:admin -p111
CREATE DATABASE acc1_db;
USE acc1_db;
CREATE TABLE acc1_tbl (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO acc1_tbl (id, name) VALUES (1, 'Alice'), (2, 'Bob');

-- Connect to acc2 tenant to create test data
-- mysql -h 127.0.0.1 -P 6001 -u acc2:admin -p111
CREATE DATABASE acc2_db;
USE acc2_db;
CREATE TABLE acc2_tbl (
    id INT PRIMARY KEY,
    email VARCHAR(100)
);
INSERT INTO acc2_tbl (id, email) VALUES (1, 'alice@example.com'), (2, 'bob@example.com');
```

### Case 1: Clone Within the Same Tenant

**Clone Table:**

```sql
-- Clone a table within the same tenant
CREATE TABLE acc1_db.t2 CLONE acc1_db.acc1_tbl;

mysql> SELECT * FROM acc1_db.acc1_tbl;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)

-- Clone using a specified snapshot
CREATE SNAPSHOT sp FOR ACCOUNT acc1;

CREATE TABLE acc1_db.t3 CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp"};

mysql>  SELECT * FROM acc1_db.t3;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)
```

**Clone Database:**

```sql
-- Clone a database within the same tenant
CREATE DATABASE acc1_db_clone CLONE acc1_db;

mysql> USE acc1_db_clone;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+-------------------------+
| Tables_in_acc1_db_clone |
+-------------------------+
| acc1_tbl                |
| t2                      |
| t3                      |
+-------------------------+
3 rows in set (0.01 sec)

-- Clone database using a specified snapshot
mysql> CREATE DATABASE acc1_db_clone_snapshot CLONE acc1_db {SNAPSHOT = "sp"};
Query OK, 0 rows affected (0.02 sec)

mysql> use acc1_db_clone_snapshot;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+----------------------------------+
| Tables_in_acc1_db_clone_snapshot |
+----------------------------------+
| acc1_tbl                         |
| t2                               |
+----------------------------------+
2 rows in set (0.01 sec)
```

> **Note:** Cross-tenant cloning can only be performed by the sys tenant and requires a pre-created snapshot.

### Case 2: Clone Data from Another Ordinary Tenant to Sys

```sql
-- Switch to sys tenant
-- mysql -h 127.0.0.1 -P 6001 -u sys:root -p111

-- Sys creates an account-level snapshot for tenant acc1
CREATE SNAPSHOT sp_acc1 FOR ACCOUNT acc1;

-- Clone database to sys
CREATE DATABASE sys_db_from_acc1 CLONE acc1_db {SNAPSHOT = "sp_acc1"};
mysql> use sys_db_from_acc1;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+----------------------------+
| Tables_in_sys_db_from_acc1 |
+----------------------------+
| acc1_tbl                   |
| t2                         |
| t3                         |
+----------------------------+
3 rows in set (0.00 sec)

-- Clone table to sys
CREATE TABLE sys_db_from_acc1.acc1_tbl_clone CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp_acc1"};

mysql> select * from sys_db_from_acc1.acc1_tbl_clone;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)
```

### Case 3: Clone Sys Tenant Data to Another Ordinary Tenant

```sql
-- Create test data under the sys tenant
CREATE DATABASE sys_db;
USE sys_db;
CREATE TABLE sys_tbl (
    id INT PRIMARY KEY,
    data VARCHAR(100)
);
INSERT INTO sys_tbl (id, data) VALUES (1, 'Sys Data 1'), (2, 'Sys Data 2');

-- Sys creates a snapshot for itself
CREATE SNAPSHOT sp_sys FOR ACCOUNT sys;

-- Clone database to ordinary tenant acc1
CREATE DATABASE acc1_from_sys CLONE sys_db {SNAPSHOT = "sp_sys"} TO ACCOUNT acc1;

-- Clone table to ordinary tenant acc1
CREATE TABLE acc1_db.sys_tbl_clone CLONE sys_db.sys_tbl {SNAPSHOT = "sp_sys"} TO ACCOUNT acc1;

-- Connect to acc1
mysql> use acc1_from_sys;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+-------------------------+
| Tables_in_acc1_from_sys |
+-------------------------+
| sys_tbl                 |
+-------------------------+
1 row in set (0.00 sec)

mysql> select * from acc1_db.sys_tbl_clone;
+------+------------+
| id   | data       |
+------+------------+
|    1 | Sys Data 1 |
|    2 | Sys Data 2 |
+------+------------+
2 rows in set (0.01 sec)
```

### Case 4: Clone Data from One Ordinary Tenant to Another

```sql
-- Sys creates a snapshot for the source tenant acc1
CREATE SNAPSHOT sp_acc1_for_clone FOR ACCOUNT acc1;

-- Clone table from acc1 to acc2
CREATE TABLE acc2_db.acc1_tbl_clone CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp_acc1_for_clone"} TO ACCOUNT acc2;

-- Clone database from acc1 to acc2
CREATE DATABASE acc2_from_acc1 CLONE acc1_db {SNAPSHOT = "sp_acc1_for_clone"} TO ACCOUNT acc2;

-- Connect to tenant acc2
mysql> select * from acc2_db.acc1_tbl_clone;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.00 sec)

mysql> use acc2_from_acc1;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+--------------------------+
| Tables_in_acc2_from_acc1 |
+--------------------------+
| acc1_tbl                 |
| sys_tbl_clone            |
| t2                       |
| t3                       |
+--------------------------+
4 rows in set (0.01 sec)
```

## **Important Considerations**

- **Permission Requirements**:
    - Cloning within the same tenant requires SELECT permission on the source object and CREATE permission on the target database.
    - Cross-tenant cloning can only be executed by the sys tenant.
    - Ordinary tenants can only clone non-system databases and tables to which they are subscribed.

- **System Object Restrictions**:
    - Cloning *into* system databases is prohibited.
    - Ordinary tenants are prohibited from cloning system tables and cluster tables.

- **Snapshot Validity**:
    - Snapshots have a validity period; they cannot be used for cloning after expiration.
    - It is recommended to complete the clone operation soon after creating the snapshot.

- **Resource Consumption**:
    - Clone operations consume storage space and computational resources.
    - Cloning large databases or tables may take a significant amount of time.

- **Data Consistency**:
    - Using a snapshot ensures point-in-time consistency for the cloned data.
    - Cloning without a snapshot reflects the data state at the current moment.