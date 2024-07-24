# SYSDATE()

## Function Description

The `SYSDATE()` function returns a value in 'YYYY-MM-DD HH:MM:SS' format for the current date and time.

`SYSDATE()` Returns the dynamic real-time time during execution. This is different from the behavior of [`NOW()`](now.md), which returns when the statement starts executing.

## Function syntax

```
> SYSDATE(fsp)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| fsp | Non-required parameters. If the fsp parameter is given to specify a decimal precision from 0 to 6, the return value includes the decimal fraction of the number. |

## Examples

```sql
mysql> select sysdate();
+----------------------------+
| sysdate()                  |
+----------------------------+
| 2024-04-30 10:49:39.554807 |
+----------------------------+
1 row in set (0.00 sec)

mysql> select sysdate(6);
+----------------------------+
| sysdate(6)                 |
+----------------------------+
| 2024-04-30 10:50:08.452370 |
+----------------------------+
1 row in set (0.00 sec)

mysql>  SELECT SYSDATE(), SLEEP(2), SYSDATE();
+----------------------------+----------+----------------------------+
| sysdate()                  | sleep(2) | sysdate()                  |
+----------------------------+----------+----------------------------+
| 2024-04-30 10:50:30.004912 |        0 | 2024-04-30 10:50:32.005203 |
+----------------------------+----------+----------------------------+
1 row in set (2.00 sec)

mysql> SELECT NOW(), SLEEP(2), NOW();
+----------------------------+----------+----------------------------+
| now()                      | sleep(2) | now()                      |
+----------------------------+----------+----------------------------+
| 2024-04-30 10:50:47.904309 |        0 | 2024-04-30 10:50:47.904309 |
+----------------------------+----------+----------------------------+
1 row in set (2.00 sec)
```
