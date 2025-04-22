# **DECODE()**

## **Function description**

The `DECODE()` function is used to decrypt data encoded by [`ENCODE()`](./encode.md).

## **Function syntax**

```
> DECODE(crypt_str, pass_str)
```

## **Parameter explanation**

| Parameters | Description |
| ---------------| ----------------------------------|
| crypt_str | Encrypted string encoded by ENCODE().           |
| pass_str | Password string used for decryption, must be the same as the key used for encryption.     |

## **Example**

```SQL
mysql> SELECT DECODE(ENCODE('hello', 'mysecretkey'), 'mysecretkey');
+-------------------------------------------------+
| DECODE(ENCODE(hello, mysecretkey), mysecretkey) |
+-------------------------------------------------+
| hello                                           |
+-------------------------------------------------+
1 row in set (0.00 sec)

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    encrypted_password BLOB
);

INSERT INTO users (username, encrypted_password)
VALUES ('john', ENCODE('password123', 'mysecretkey'));

mysql> SELECT username, DECODE(encrypted_password, 'mysecretkey') AS decrypted_password FROM users WHERE username = 'john';
+----------+--------------------+
| username | decrypted_password |
+----------+--------------------+
| john     | password123        |
+----------+--------------------+
1 row in set (0.00 sec)
```
