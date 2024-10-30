# MatrixOne to MySQL CDC function

## Scene description

An online retail company uses MatrixOne as the production database for its order management system to store order data. In order to support the real-time analysis needs of the business (such as order quantity, sales trends, customer behavior, etc.), order data needs to be synchronized from MatrixOne to the MySQL analysis database in real time for use by the data analysis team and business systems. Through the `mo_cdc` tool, real-time synchronization of order data can be efficiently achieved, allowing the analysis system to obtain the latest order information at any time.

-Source database (production database): The `orders` table in MatrixOne contains order data and records the details of each order, including order ID, customer ID, order time, order amount and status.
-Target database (analysis database): `orders_backup` table in MySQL, used for real-time statistics and analysis of order information. Ensure that the sales team can grasp sales dynamics in real time.
-Synchronization requirements: Use `mo_cdc` to synchronize data in MatrixOne's `orders` table to MySQL's `orders_backup` table in real time to ensure that the analysis system data is consistent with the production system.

## Operation process

### Create table structure

Ensure that the table structures in the source database MatrixOne and the target database MySQL are identical to facilitate seamless data synchronization.

- `orders` table in MatrixOne:

   ```sql
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

- `orders_backup` table in MySQL:

   ```sql
   CREATE TABLE analytics_db.orders_backup (
       order_id INT PRIMARY KEY,
       customer_id INT,
       order_date DATETIME,
       amount DECIMAL(10, 2),
       status VARCHAR(20)
   );
   ```

### Create `mo_cdc` synchronization task

Create a synchronization task through the `mo_cdc` tool to push MatrixOne's order data to MySQL in real time.

```bash
>./mo_cdc task create \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001" \
       --sink-type "mysql" \
       --sink-uri "mysql://root:111@127.0.0.1:3306" \
       --tables "source_db.orders:analytics_db.orders_backup" \
       --level "account" \
       --account "sys"
```

View task status

```bash
> ./mo_cdc task show \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
[
  {
    "task-id": "0192d76f-d89a-70b3-a60d-615c5f2fd33d",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"source_db.orders\": 2024-10-29 16:43:00.318404 +0800 CST,\n}",
    "timestamp": "2024-10-29 16:43:01.299298 +0800 CST"
  }
] 
```

Connect to downstream mysql to view full data synchronization status

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
5 rows in set (0.01 sec)
```

### Incremental synchronization task

After the task is established, perform data change operations on the upstream MatrixOne

```sql
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(6, 106, '2024-10-29 12:00:00', 150.00, 'New');
DELETE FROM source_db.orders WHERE order_id = 6;
UPDATE source_db.orders SET status = 'Delivered' WHERE order_id = 4;

mysql> select * from source_db.orders;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

Connect to downstream mysql to view incremental data synchronization status

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

### Resume upload from breakpoint

Now the mission is interrupted due to an accident.

```bash
> ./mo_cdc task pause \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
```

During the task interruption, data continues to be inserted into the upstream MatrixOne.

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
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|       11 |         111 | 2024-06-15 08:30:00 | 250.75 | Processing |
|       12 |         112 | 2024-07-22 15:45:00 | 399.99 | Shipped    |
|       13 |         113 | 2024-08-30 10:20:00 | 599.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
8 rows in set (0.01 sec)
```

Manual recovery tasks.

```bash
> ./mo_cdc task resume \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
```

Connect to the downstream mysql to check the resumed transmission status.

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

## Apply effects

Through this solution, retail companies can synchronize order data to the analysis database in real time to implement application scenarios such as order statistics, sales trend analysis, and customer behavior insights to support business decisions. At the same time, breakpoint resumption ensures data consistency when network delays or task interruptions occur, so that the data analysis system always maintains an accurate and reliable data source.