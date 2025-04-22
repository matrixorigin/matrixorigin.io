# **LOWER()**

## **Function Description**

`LOWER()` Converts the given string to lowercase.

## **Function syntax**

```
> LOWER(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

```sql
mysql> select lower('HELLO');
+--------------+
| lower(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lower('A'),lower('B'),lower('C');
+----------+----------+----------+
| lower(A) | lower(B) | lower(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```