# MatrixOne to MatrixOne CDC Functionality

## Scenario Description

A social media platform company uses MatrixOne as its production database to store user activity logs (e.g., logins, likes, comments, etc.). To support real-time analytics (such as active user statistics and behavior trends), the user activity data needs to be synchronized in real-time from the production MatrixOne to another MatrixOne analytics database. The `mo_cdc` tool enables efficient data synchronization, ensuring the analytics system receives the latest data.

- **Source Database (Production Database)**: The `user_activities` table in MatrixOne, containing fields such as user ID, activity type, timestamp, etc.
- **Target Database (Analytics Database)**: The `analytics_activities` table in MatrixOne, used for real-time analysis of user behavior.
- **Synchronization Requirement**: Use `mo_cdc` to synchronize data from `user_activities` to `analytics_activities` in real-time, ensuring data consistency in the analytics system.

## Workflow

### Create PITR

```sql
create pitr pitr_activity for account range 2 "h";
```

### Create Table and Insert Data on Source

```sql
CREATE DATABASE production_db;
CREATE TABLE production_db.user_activities (
    activity_id INT PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50),
    timestamp DATETIME,
    device VARCHAR(20)
);
INSERT INTO production_db.user_activities VALUES
    (1, 1001, 'login', '2024-01-01 09:00:00', 'mobile'),
    (2, 1002, 'like', '2024-01-01 10:15:00', 'desktop'),
    (3, 1003, 'comment', '2024-01-02 14:30:00', 'mobile');
```

### Create Downstream Database

```sql
CREATE DATABASE analytics_db;
```

### Create `mo_cdc` Synchronization Task

```bash
./mo_cdc task create \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001" \
    --sink-type "matrixone" \
    --sink-uri "mysql://root:111@10.222.xx.xx:6001" \
    --level table \
    --tables "production_db.user_activities:analytics_db.analytics_activities"
```

### Check Task Status

```bash
> ./mo_cdc task show \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
[
  {
    "task-id": "0195dbb6-e31e-7572-bfdb-812fd02714a1",
    "task-name": "activity_sync",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@10.222.xx.xx:6001",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n}",
    "timestamp": "2025-03-28 15:46:06.077697 +0800 CST"
  }
]
```

### Verify Full Synchronization

Connect to the downstream MatrixOne to check full data synchronization.

```sql
mysql> SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           1 |    1001 | login         | 2024-01-01 09:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
3 rows in set (0.02 sec)
```

### Incremental Synchronization Task

After the task is established, perform data changes in the upstream MatrixOne.

```sql
INSERT INTO production_db.user_activities VALUES
    (4, 1004, 'share', '2024-01-03 16:45:00', 'desktop');
UPDATE production_db.user_activities SET activity_type = 'logout' WHERE activity_id = 1;
```

Connect to the downstream MatrixOne to check incremental data synchronization.

```sql
mysql> SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
4 rows in set (0.01 sec)
```

### Checkpoint Recovery

Now, the task is interrupted due to an unexpected event.

```bash
./mo_cdc task pause \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

During the task interruption, continue inserting data into the upstream MatrixOne.

```sql
INSERT INTO production_db.user_activities VALUES
    (5, 1005, 'login', '2024-01-04 08:00:00', 'mobile');

mysql> select * from production_db.user_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
|           5 |    1005 | login         | 2024-01-04 08:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
5 rows in set (0.01 sec)
```

Manually resume the task.

```bash
> ./mo_cdc task resume \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

Connect to the downstream MySQL to verify checkpoint recovery.

```sql
mysql> -- The downstream should include data inserted during the interruption.
SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
|           5 |    1005 | login         | 2024-01-04 08:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
5 rows in set (0.01 sec)
```

## Application Results

Through this solution, the company achieved:

- Real-time user behavior analysis: e.g., active user statistics, device distribution.
- Data consistency guarantee: Checkpoint recovery ensures no data loss during network interruptions.
- Low latency: The analytics system remains synchronized with production data.