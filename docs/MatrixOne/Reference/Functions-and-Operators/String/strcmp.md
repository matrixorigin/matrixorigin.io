# **STRCMP()**

## **Function Description**

The `STRCMP()` function is used to compare two strings *str1* and *str2*. If both strings are identical, it returns 0; if *str1* is less than *str2* according to the current character set sorting, it returns -1; if *str1* is greater than *str2*, it returns 1. If either parameter is `NULL`, it returns `NULL`.

## **Function Syntax**

```
> STRCMP(str1, str2)
```

## **Parameter Explanation**

| Parameter | Description |
| ---- | ---- |
| str1 | Required. The first string to be compared. |
| str2 | Required. The second string to be compared. |

## **Examples**

```SQL
mysql> select strcmp('hello', 'hello') from dual;
+-------------------------+
| strcmp(hello, hello) |
+-------------------------+
| 0 |
+-------------------------+
1 row in set (0.00 sec)
mysql> select strcmp('apple', 'banana') from dual;
+---------------------------+
| strcmp(apple, banana) |
+---------------------------+
| -1 |
+---------------------------+
1 row in set (0.00 sec)
mysql> select strcmp('banana', 'apple') from dual;
+---------------------------+
| strcmp(banana, apple) |
+---------------------------+
| 1 |
+---------------------------+
1 row in set (0.00 sec)
drop table if exists t1;
CREATE TABLE t1 (str1 VARCHAR(100), str2 VARCHAR(100));
insert into t1 values('hello', 'world');
insert into t1 values('abc', 'ABC');
insert into t1 values('test', 'test');
insert into t1 values(null, 'value');
insert into t1 values('value', null);
mysql> select strcmp(str1, str2) from t1;
+-------------------+
| strcmp(str1, str2) |
+-------------------+
| -1 |
| 1 |
| 0 |
| NULL |
| NULL |
+-------------------+
5 rows in set (0.01 sec)
```