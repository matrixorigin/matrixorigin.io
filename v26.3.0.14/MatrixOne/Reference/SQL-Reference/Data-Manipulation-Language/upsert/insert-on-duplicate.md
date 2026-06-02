---
title: "INSERT ... ON DUPLICATE KEY UPDATE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "ON DUPLICATE KEY UPDATE only triggers on PRIMARY KEY conflicts; UNIQUE index conflicts are detected but result in errors (ERROR 1062 or ERROR 20102) rather than triggering ON DUPLICATE KEY UPDATE"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "INSERT ... ON DUPLICATE KEY UPDATE When inserting data into a database table, update the data if it already exists, otherwise insert new data."
---
# **INSERT ... ON DUPLICATE KEY UPDATE**

> INSERT ... ON DUPLICATE KEY UPDATE When inserting data into a database table, update the data if it already exists, otherwise insert new data.

## **Grammar description**

`INSERT ... ON` DUPLICATE KEY UPDATE When inserting data into a database table, update the data if it already exists, otherwise insert new data.

The `INSERT INTO` statement is the standard statement used to insert data into a database table; the `ON DUPLICATE KEY UPDATE` statement is used to update when there are duplicate records in the table. If a record with the same primary key exists in the table, use the `UPDATE` clause to update the corresponding column value, otherwise use the `INSERT` clause to insert a new record.

It is important to note that using this syntax presupposes that a primary key constraint needs to be established in the table to determine if there are duplicate records. At the same time, both update and insert operations need to have the corresponding column values set, otherwise syntax errors will result.

## **Grammar structure**

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
  [ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...];
```

## **Examples**

<!-- validator-ignore-exec -->
```sql
CREATE TABLE user (
    id INT(11) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT(3) NOT NULL
);
-- Insert a new piece of data, the id doesn't exist, so enter the new data.
INSERT INTO user (id, name, age) VALUES (1, 'Tom', 18)
ON DUPLICATE KEY UPDATE name='Tom', age=18;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)

-- Increases the age field of an existing record by 1, while leaving the name field unchanged.
INSERT INTO user (id, name, age) VALUES (1, 'Tom', 18)
ON DUPLICATE KEY UPDATE age=age+1;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   19 |
+------+------+------+
1 row in set (0.00 sec)

-- Inserts a new row, updating the name and age fields to the specified values.
INSERT INTO user (id, name, age) VALUES (2, 'Lucy', 20)
ON DUPLICATE KEY UPDATE name='Lucy', age=20;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   19 |
|    2 | Lucy |   20 |
+------+------+------+
2 rows in set (0.01 sec)
```

## **Restrictions**

`INSERT ... ON DUPLICATE KEY UPDATE` only detects conflicts on the PRIMARY KEY. If a table has secondary UNIQUE indexes, conflicts on those indexes are not handled by `ON DUPLICATE KEY UPDATE`; instead they throw ERROR 1062 (Duplicate entry), regardless of whether the value is `NULL`. Ensure the target table has a primary key and verify that secondary UNIQUE index columns do not produce duplicate values.
