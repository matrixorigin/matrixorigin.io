# INSERT IGNORE

## Syntax Description

`INSERT IGNORE` is used when inserting data into a database table with the same unique index or primary key to ignore the data if it already exists instead of returning an error, otherwise insert new data.

Unlike MySQL, MatrixOne ignores errors when inserting duplicate values for unique indexes or primary keys, whereas MySQL has alert messages.  

## Syntax structure

```
> INSERT IGNORE INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...;
```

## Examples

```sql
CREATE TABLE user (
    id INT(11) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT(3) NOT NULL
);
-- Insert a new piece of data, the id doesn't exist, so enter the new data.
mysql> INSERT IGNORE INTO user VALUES (1, 'Tom', 18);
Query OK, 0 rows affected (0.02 sec)

mysql> SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)

-- Insert a new piece of data, the id exists, and the data is ignored.
mysql> INSERT IGNORE INTO user VALUES (1, 'Jane', 16);
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)
```

## Limitations
  
- `INSERT IGNORE` does not support writing `NULL` to `NOT NULL` columns.
- `INSERT IGNORE` does not support incorrect data type conversions.
- `INSERT IGNORE` does not support handling operations where inserted data in a partition table contains mismatched partition values.