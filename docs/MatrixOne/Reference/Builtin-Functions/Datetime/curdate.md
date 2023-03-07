# **CURDATE()**

## **Description**

The `CURDATE()` function returns the current date as a value in `YYYY-MM-DD` format, depending on whether the function is used in string or numeric context.

!!! note
    The difference from MySQL's behavior is: `curdate()+int` returns the number of days from 1970-01-01. For example, `curdate()+1` means the current date minus 1970-01-01 plus 1 day.

## **Syntax**

```
> CURDATE()
```

## **Examples**

```sql
mysql> SELECT CURDATE();
+------------+
| curdate()  |
+------------+
| 2023-02-02 |
+------------+
1 row in set (0.00 sec)

mysql> SELECT CURDATE() + 0;
+---------------+
| curdate() + 0 |
+---------------+
|         19390 |
+---------------+
1 row in set (0.00 sec)

mysql> select cast(now() as date)=curdate() q;
+------+
| q    |
+------+
| true |
+------+
1 row in set (0.01 sec)

create table t1 (a int);
insert into t1 values (1),(2),(3);

mysql> select cast(now() as date)=curdate() q from t1;
+------+
| q    |
+------+
| true |
| true |
| true |
+------+
3 rows in set (0.01 sec)
```
