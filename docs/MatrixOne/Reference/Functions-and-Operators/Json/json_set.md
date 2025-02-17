# **JSON_SET()**

## **Function Description**

`JSON_SET()` is used to set or update the value of a key in a JSON document. If the key does not exist, JSON_SET will add it to the JSON document.

## **Syntax**

```sql
select json_set(json_doc, path, value[, path, value] ...)
```

## **Parameter Explanation**

| Parameter | Description |
| --------- | ----------- |
| json_doc  | The JSON document to be modified. |
| path      | The key path to be modified or inserted. |
| value     | The value to be set. |

## **Examples**

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    profile JSON
);

INSERT INTO users (name, profile)
VALUES
('Alice', '{"age": 30, "city": "New York", "email": "alice@example.com"}'),
('Bob', '{"age": 25, "city": "Los Angeles", "email": "bob@example.com"}');

mysql> select * from users;
+------+-------+----------------------------------------------------------------+
| id   | name  | profile                                                        |
+------+-------+----------------------------------------------------------------+
|    1 | Alice | {"age": 30, "city": "New York", "email": "alice@example.com"}  |
|    2 | Bob   | {"age": 25, "city": "Los Angeles", "email": "bob@example.com"} |
+------+-------+----------------------------------------------------------------+
2 rows in set (0.00 sec)

-- Update Alice's city and email in the profile
UPDATE users
SET profile = JSON_SET(profile, '$.city', 'San Francisco', '$.email', 'alice@newdomain.com')
WHERE name = 'Alice';

mysql> SELECT * FROM users WHERE name = 'Alice';
+------+-------+----------------------------------------------------------------------+
| id   | name  | profile                                                              |
+------+-------+----------------------------------------------------------------------+
|    1 | Alice | {"age": 30, "city": "San Francisco", "email": "alice@newdomain.com"} |
+------+-------+----------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Add a new key 'phone' to Bob's profile
UPDATE users
SET profile = JSON_SET(profile, '$.phone', '123-456-7890')
WHERE name = 'Bob';

mysql> SELECT * FROM users WHERE name = 'Bob';
+------+------+-----------------------------------------------------------------------------------------+
| id   | name | profile                                                                                 |
+------+------+-----------------------------------------------------------------------------------------+
|    2 | Bob  | {"age": 25, "city": "Los Angeles", "email": "bob@example.com", "phone": "123-456-7890"} |
+------+------+-----------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```