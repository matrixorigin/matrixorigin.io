# Migrate data from MySQL to MatrixOne

This document describes how to migrate data from MySQL to MatrixOne.

### 1. Dump MySQL data

We suppose you have full access to your MySQL instances.

Firstly, we use `mysqldump` to dump MySQL table structures and data to a single file with the following command. You can take a look at this wonderful [tutorial](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/) if you are not familiar with `mysqldump`. The syntax is as below:

```
mysqldump -h IP_ADDRESS -uUSERNAME -pPASSWORD -d DB_NAME1 DB_NAME2 ... OUTPUT_FILE_NAME.SQL
```

For example, this following command dumps all table structures and data of the database `test` to a single file named `a.sql`.

```
mysqldump -h 127.0.0.1 -uroot -proot -d test > a.sql
```

### 2. Modify SQL file

The SQL file dumped from MySQL is not fully compatible with MatrixOne yet. We'll need to remove and modify several elements to adapt the SQL file to MatrixOne's format.

* Unsupported syntax or features need to be removed:  CHARACTER SET/CHARSET, COLLATE, ROW_FORMAT, USING BTREE, LOCK TABLE, SET SYSTEM_VARIABLE, ENGINE.
* Unsupported data type: If you use BINARY type, you can modify them to BLOB type.

We take a typical `mysqldump` table as an example:

```
DROP TABLE IF EXISTS `tool`;
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tool_id` bigint DEFAULT NULL COMMENT 'id',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'type',
  `remark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'remark',
  `create_user` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'create user',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tool_id_IDX` (`tool_id`) USING BTREE,
  KEY `operation_type_IDX` (`operation_type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1913 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='tool table';
```

To be able to successfully create this table in MatrixOne, it will be modifed as:

```
DROP TABLE IF EXISTS `tool`;
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tool_id` bigint DEFAULT NULL COMMENT 'id',
  `operation_type` varchar(50) DEFAULT NULL COMMENT 'type',
  `remark` varchar(100) DEFAULT NULL COMMENT 'remark',
  `create_user` varchar(20) DEFAULT NULL COMMENT 'create user',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  PRIMARY KEY (`id`),
  KEY `tool_id_IDX` (`tool_id`),
  KEY `operation_type_IDX` (`operation_type`)
) COMMENT='tool table';
```

### 3. Import into MatrixOne

Once your dumped SQL file was ready, you can import the whole table structures and data into MatrixOne.

1. Open a MySQL terminal and connect to MatrixOne.
2. Import the SQL file into MatrixOne by the `source` command.

```
mysql> source '/YOUR_PATH/a.sql'
```

If your SQL file is big, you can use the following command to run the import task in the background. For example:

```
nohup mysql -h 127.0.0.1 -P 6001 -udump -p111 -e 'source /YOUR_PATH/a.sql' &
```
