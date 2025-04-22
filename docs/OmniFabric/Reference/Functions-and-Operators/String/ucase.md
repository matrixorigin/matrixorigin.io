# **UCASE()**

## **Function Description**

`UCASE()` is used to convert a given string to uppercase form, a synonym for [`UPPER()`](upper.md).

## **Function syntax**

```
> UCASE(str)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| str | Required parameters, alphabetic characters. |

## **Examples**

```sql
mysql> select ucase('hello');
+--------------+
| ucase(hello) |
+--------------+
| HELLO        |
+--------------+
1 row in set (0.03 sec)

mysql> select ucase('a'),ucase('b'),ucase('c');
+----------+----------+----------+
| ucase(a) | ucase(b) | ucase(c) |
+----------+----------+----------+
| A        | B        | C        |
+----------+----------+----------+
1 row in set (0.03 sec)
```