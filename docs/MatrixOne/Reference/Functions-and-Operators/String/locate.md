# **LOCATE()**

## **Function Description**

The `LOCATE()` function is a function used to find the location of a substring in a string. It returns the position of the substring in the string or 0 if not found.

Because the `LOCATE()` function returns an integer value, it can be nested and used in other functions, such as intercepting strings with the substring function.

Regarding case, the `LOCATE()` function is case-insensitive.

## **Function syntax**

```
> LOCATE(subtr,str,pos)
```

## **Parameter interpretation**

| Parameters | Description |
| ---- | ---- |
| substr | Required parameters. `substring` is the string you are looking for. |
| str | Required parameter. `string` is the string to search in. |
| pos | Unnecessary argument. `position` is the position indicating the start of the query. |

## **Examples**

- Example 1

```sql
mysql> SELECT LOCATE('bar', 'footbarbar');
+-------------------------+
| locate(bar, footbarbar) |
+-------------------------+
|                       5 |
+-------------------------+
1 row in set (0.00 sec)
```

- Example 2

```sql
mysql>SELECT LOCATE('bar', 'footbarbar',6);
+----------------------------+
| locate(bar, footbarbar, 6) |
+----------------------------+
|                          8 |
+----------------------------+
1 row in set (0.00 sec)
```

- Example 3

```sql
mysql>SELECT SUBSTRING('hello world',LOCATE('o','hello world'),5);
+---------------------------------------------------+
| substring(hello world, locate(o, hello world), 5) |
+---------------------------------------------------+
| o wor                                             |
+---------------------------------------------------+
1 row in set (0.00 sec)
```

- Example 4

```sql
mysql>select locate('a','ABC');
+----------------+
| locate(a, ABC) |
+----------------+
|              1 |
+----------------+
1 row in set (0.00 sec)
```