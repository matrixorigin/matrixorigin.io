# NOW()

## Function Description

The `NOW()` function returns a value in 'YYYY-MM-DD HH:MM:SS' format for the current date and time.

`NOW()` Returns the time when the statement started executing. This differs from the behavior of [`SYSDATE()`](sysdate.md), which returns a dynamic real-time time during execution.

## Function syntax

```
> NOW(fsp)
```

## Parameter interpretation

| Parameters | Description |
| ---- | ---- |
| fsp | Non-required parameters. If the fsp parameter is given to specify a decimal precision from 0 to 6, the return value includes the decimal fraction of the number. |

## Examples

```sql
mysql> select now();
+----------------------------+
| now()                      |
+----------------------------+
| 2024-04-29 08:03:50.479238 |
+----------------------------+
1 row in set (0.03 sec)

mysql> select now(6);
+----------------------------+
| now(6)                     |
+----------------------------+
| 2024-04-29 08:05:26.528629 |
+----------------------------+
1 row in set (0.02 sec)

mysql> SELECT NOW(), SLEEP(2), NOW();
+----------------------------+----------+----------------------------+
| now()                      | sleep(2) | now()                      |
+----------------------------+----------+----------------------------+
| 2024-04-29 08:17:23.876546 |        0 | 2024-04-29 08:17:23.876546 |
+----------------------------+----------+----------------------------+
1 row in set (2.06 sec)

mysql> SELECT SYSDATE(), SLEEP(2), SYSDATE();
+----------------------------+----------+----------------------------+
| sysdate()                  | sleep(2) | sysdate()                  |
+----------------------------+----------+----------------------------+
| 2024-04-29 16:19:21.439725 |        0 | 2024-04-29 16:19:23.440187 |
+----------------------------+----------+----------------------------+
1 row in set (2.01 sec)
```
