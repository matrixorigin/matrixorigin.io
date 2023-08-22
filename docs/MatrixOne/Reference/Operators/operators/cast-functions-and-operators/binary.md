# **BINARY**

## **Description**

The `BINARY()` function is a function used to convert a value into a binary string. It is typically used when comparing text or character data, treating strings as binary rather than ordinary character data. This enables binary comparisons of character data regardless of character set or encoding.

The `BINARY()` function implements binary comparison of character data, which handles cases such as case-sensitive string comparison.

## **Syntax**

```
> BINARY value

```

## **Parameter Values**

|  Parameter   | Description  |
|  ----  | ----  |
| value  | Required. The value to convert |

## **Examples**

```sql
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL, password VARCHAR(100) NOT NULL);

INSERT INTO users (username, password) VALUES ('JohnDoe', 'Abcd123'), ('AliceSmith', 'Efgh456'), ('BobJohnson', 'ijkl789');

-- Use the BINARY() operator for password verification, and the BINARY password = 'Abcd123' part treats the password value as a binary string, so the comparison is case-sensitive. If the entered password matches a record in the database, the query will return the corresponding user id and username. Otherwise, an empty result will be returned.
mysql> SELECT id, username FROM users WHERE username = 'JohnDoe' AND BINARY password = 'Abcd123';
+------+----------+
| id   | username |
+------+----------+
|    1 | JohnDoe  |
+------+----------+
1 row in set (0.00 sec)

mysql> SELECT id, username FROM users WHERE username = 'JohnDoe' AND BINARY password = 'abcd123';
Empty set (0.00 sec)
```
