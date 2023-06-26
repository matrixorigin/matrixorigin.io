# **RAND()**

## **Description**

The `RAND()` function is used to generate a Float64 type random number between 0 and 1. It does not accept any arguments and generates a random number that is unpredictable and non-repeating each time it is called.

If you need to randomly select data from a table, you can use the `RAND()` function to generate a random number, and then use `ORDER BY` to sort the data in the table according to this random number. For example:

```sql
-- Randomly retrieve all data from the table and sort it in a random order, the order of the query results may differ each time.
SELECT * FROM table ORDER BY RAND();
```

## **Syntax**

```
> RAND([seed])
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| seed | Optional argument. It is an integer value used to specify the `seed` when generating random numbers. If the `seed` parameter is not specified, the current time is used as the seed value by default. The return value type is consistent with the input type.<br>MatrixOne does not currently support specifying `seed`. |

## **Examples**

- Example 1

```sql
mysql> SELECT RAND();
+---------------------+
| rand()              |
+---------------------+
| 0.25193285156620004 |
+---------------------+
1 row in set (0.00 sec)
```

- Example 2

```sql
CREATE TABLE Users (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    UserName VARCHAR(255) NOT NULL,
    Email VARCHAR(255));

INSERT INTO Users (UserName, Email) VALUES
    ('John', 'john@example.com'),
    ('Jane', 'jane@example.com'),
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- Select a user's information randomly from the Users table.
mysql> SELECT * FROM Users ORDER BY RAND() LIMIT 1;
+------+----------+-----------------+
| id   | username | email           |
+------+----------+-----------------+
|    4 | Bob      | bob@example.com | -- Bob's information is randomly selected.
+------+----------+-----------------+
1 row in set (0.01 sec)

-- Execute the above query again, and another user may be selected.
mysql> SELECT * FROM Users  ORDER BY RAND() LIMIT 1;
+------+----------+-------------------+
| id   | username | email             |
+------+----------+-------------------+
|    3 | Alice    | alice@example.com | -- Alice's information is randomly selected.
+------+----------+-------------------+
1 row in set (0.01 sec)
```

## **Constraints**

MatrixOne does not currently support specifying the seed value for the RAND(seed) function (i.e., the seed parameter).
