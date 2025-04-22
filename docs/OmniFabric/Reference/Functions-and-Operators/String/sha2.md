# **SHA2()**

## **Function Description**

The `SHA2()` encryption function is used to calculate the SHA2 hash of the input string. The first argument is the plaintext string to hash. The second parameter indicates the desired bit length of the result, which must be 224, 256, 384, 512, or 0 (equivalent to 256), corresponding to the SHA-224, SHA-256, SHA-384, and SHA-512 algorithms, respectively. Returns NULL if the argument is NULL or not a legal value.

## **Function syntax**

```
> SHA2(str, hash_length)
```

## **Parameter interpretation**

| Parameters | Description |
| -------- | ------------ |
| str | Required parameters. The string |
| hash_length | necessary to calculate the hash value. Hash length. |

## **Examples**

```SQL
mysql> select sha2("hello world", 384);
+--------------------------------------------------------------------------------------------------+
| sha2(hello world, 384)                                                                           |
+--------------------------------------------------------------------------------------------------+
| fdbd8e75a67f29f701a4e040385e2e23986303ea10239211af907fcbb83578b3e417cb71ce646efd0819dd8c088de1bd |
+--------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select sha2(null, 512);
+-----------------+
| sha2(null, 512) |
+-----------------+
| NULL            |
+-----------------+
1 row in set (0.00 sec)

mysql> select sha2("abc", 99);
+---------------+
| sha2(abc, 99) |
+---------------+
| NULL          |
+---------------+
1 row in set (0.00 sec)
```
