# MatrixOne to MySQL CDC Functionality

## Scenario Description

An online retail company uses MatrixOne as the production database for its order management system to store order data. To support real-time analytics requirements (such as order volume, sales trends, and customer behavior), order data needs to be synchronized in real-time from MatrixOne to a MySQL analytics database for use by the data analysis team and business systems. The `mo_cdc` tool enables efficient real-time synchronization of order data, ensuring the analytics system always has access to the latest order information.

- **Source Database (Production Database)**: The `orders` table in MatrixOne, containing detailed order records, including order ID, customer ID, order date, order amount, and status.
- **Target Database (Analytics Database)**: The `orders_backup` table in MySQL, used for real-time statistics and analysis of order information, ensuring the business team can monitor sales dynamics in real-time.
- **Synchronization Requirement**: Use `mo_cdc` to synchronize data from the `orders` table in MatrixOne to the `orders_backup` table in MySQL in real-time, ensuring the analytics system remains consistent with the production system.

## Workflow

### Create PITR

```sql
create pitr pitr1 for account range 2 "h";
```

### Create Table and Insert Data on Source

```sql
create database source_db;
CREATE TABLE source_db.orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME,
    amount DECIMAL(10, 2),
    status VARCHAR(20)
);
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
 (1, 101, '2024-01-15 14:30:00', 99.99, 'Shipped'),
 (2, 102, '2024-02-10 10:00:00', 149.50, 'Delivered'),
 (3, 103, '2024-03-05 16:45:00', 75.00, 'Processing'),
 (4, 104, '2024-04-20 09:15:00', 200.00, 'Shipped'),
 (5, 105, '2024-05-12 14:00:00', 49.99, 'Delivered');
```

### Create Downstream Database

```sql
create database analytics_db;
```

### Create `mo_cdc` Synchronization Task

Use the `mo_cdc` tool to create a synchronization task, pushing order data from MatrixOne to MySQL in real-time.

```bash
>./mo_cdc task create \
    --task-name "task1" \
    --source-uri "mysql://root:111@127.0.0.1:6001" \
    --sink-type "mysql" \
    --sink-uri "mysql://root:111@127.0.0.1:3306" \
    --level table \
    --tables "source_db.orders:analytics_db.orders_backup" 
```

Check task status.

```bash
> ./mo_cdc task show \
    --task-name "task1" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
[
  {
    "task-id": "0195db5c-6406-73d8-bbf6-25fb8b9dd45d",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"source_db.orders\": 2025-03-28 14:07:31.036987 +0800 CST,\n}",
    "timestamp": "2025-03-28 14:07:31.376217 +0800 CST"
  }
]
```

Connect to the downstream MySQL to verify full data synchronization.

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Shipped    |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

### Incremental Synchronization Task

After the task is established, perform data changes in the upstream MatrixOne.

```sql
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(6, 106, '2024-10-29 12:00:00', 150.00, 'New');
DELETE FROM source_db.orders WHERE order_id = 6;
UPDATE source_db.orders SET status = 'Delivered' WHERE order_id = 4;

mysql> select * from source_db.orders;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

Connect to the downstream MySQL to verify incremental data synchronization.

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

### Checkpoint Recovery

Now, the task is interrupted due to an unexpected event.

```bash
> ./mo_cdc task pause \
    --task-name "task1" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

During the task interruption, continue inserting data into the upstream MatrixOne.

```sql
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(11, 111, '2024-06-15 08:30:00', 250.75, 'Processing');
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(12, 112, '2024-07-22 15:45:00', 399.99, 'Shipped');
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(13, 113, '2024-08-30 10:20:00', 599.99, 'Delivered');

mysql> select * from source_db.orders;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|       11 |         111 | 2024-06-15 08:30:00 | 250.75 | Processing |
|       12 |         112 | 2024-07-22 15:45:00 | 399.99 | Shipped    |
|       13 |         113 | 2024-08-30 10:20:00 | 599.99 | Delivered  |
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
+----------+-------------+---------------------+--------+------------+
8 rows in set (0.00 sec)
```

Manually resume the task.

```bash
> ./mo_cdc task resume \
    --task-name "task1" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

Connect to the downstream MySQL to verify checkpoint recovery.

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|       11 |         111 | 2024-06-15 08:30:00 | 250.75 | Processing |
|       12 |         112 | 2024-07-22 15:45:00 | 399.99 | Shipped    |
|       13 |         113 | 2024-08-30 10:20:00 | 599.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
8 rows in set (0.00 sec)
```

## Application Results

Through this solution, the retail company achieves:

- Real-time synchronization of order data to the analytics database, enabling applications such as order statistics, sales trend analysis, and customer behavior insights to support business decisions.
- Data consistency during network delays or task interruptions via checkpoint recovery, ensuring the analytics system always has accurate and reliable data sources.
