# **SUBSTRING_INDEX()**

## **Description**

This function ``SUBSTRING_INDEX()`` returns the substring from string str before count occurrences of the delimiter delim.

If count is positive, everything to the left of the final delimiter (counting from the left) is returned.

If count is negative, everything to the right of the final delimiter (counting from the right) is returned. `SUBSTRING_INDEX()` performs a case-sensitive match when searching for delim.

`SUBSTRING_INDEX()` returns `NULL` if any of its arguments are `NULL`.

## **Syntax**

```
> SUBSTRING_INDEX(str,delim,count)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
|str|	A string.|
|delim|	A delimiter.|
|count	|An integer indicating the number of occurrences of delim.|

## **Examples**

```SQL
mysql> SELECT SUBSTRING_INDEX('www.mysql.com', '.', 2);
+--------------------------------------+
| substring_index(www.mysql.com, ., 2) |
+--------------------------------------+
| www.mysql                            |
+--------------------------------------+
1 row in set (0.03 sec)

mysql> select substring_index('xyz', 'abc', 9223372036854775808);
+------------------------------------------------+
| substring_index(xyz, abc, 9223372036854775808) |
+------------------------------------------------+
| xyz                                            |
+------------------------------------------------+
1 row in set (0.02 sec)

mysql> SELECT SUBSTRING_INDEX('www.mysql.com', '.', -2);
+---------------------------------------+
| substring_index(www.mysql.com, ., -2) |
+---------------------------------------+
| mysql.com                             |
+---------------------------------------+
1 row in set (0.02 sec)

mysql> SELECT SUBSTRING_INDEX(SUBSTRING_INDEX('192,168,8,203', ',', 2), ',',-1);
+--------------------------------------------------------------+
| substring_index(substring_index(192,168,8,203, ,, 2), ,, -1) |
+--------------------------------------------------------------+
| 168                                                          |
+--------------------------------------------------------------+
1 row in set (0.02 sec)

create table test(a varchar(100), b varchar(20), c int);
insert into test values('www.mysql.com', '.', 0);
insert into test values('www.mysql.com', '.', 1);
insert into test values('www.mysql.com', '.', 2);
insert into test values('www.mysql.com', '.', 3);
insert into test values('www.mysql.com', '.', 9223372036854775808);
insert into test values('www.mysql.com', '.', -1);
insert into test values('www.mysql.com', '.', -2);
insert into test values('www.mysql.com', '.', -3);
mysql> select SUBSTRING_INDEX(a, b, c) from test;
+--------------------------+
| substring_index(a, b, c) |
+--------------------------+
|                          |
| www                      |
| www.mysql                |
| www.mysql.com            |
| com                      |
| mysql.com                |
| www.mysql.com            |
+--------------------------+
7 rows in set (0.02 sec)
```
