# **LCASE()**

## **Function Description**

`LCASE()` is used to convert a given string to lowercase, a synonym for [`LOWER()`](lower.md).

## **Function syntax**

```
> LCASE(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

```sql
mysql> select lcase('HELLO');
+--------------+
| lcase(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lcase('A'),lcase('B'),lcase('C');
+----------+----------+----------+
| lcase(A) | lcaser(B) | lcase(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```
