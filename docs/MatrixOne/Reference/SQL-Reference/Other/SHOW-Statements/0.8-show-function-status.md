# **SHOW FUNCTION STATUS**

## **Description**

`SHOW FUNCTION STATUS` displays information about all functions in the database, including function name, database name, creation time, etc.

The `SHOW FUNCTION STATUS` command only shows user-defined functions, not system functions.

## **Syntax**

```
> SHOW FUNCTION STATUS
    [LIKE 'pattern' | WHERE expr]
```

### Explanations

`LIKE 'pattern'` is an optional argument to filter the functions to display. `pattern` is a string that can use `%` and `_` wildcards. For example, to display all functions starting with `my_function`, the following command can be used:

```sql
SHOW FUNCTION STATUS LIKE 'my_function%';
```

The output will include the function name, database name, type, creation time, and modification time.

## **Examples**

```sql
mysql> create function twosum (x float, y float) returns float language sql as 'select $1 + $2' ;
Query OK, 0 rows affected (0.03 sec)

mysql> create function mysumtable(x int) returns int language sql as 'select mysum(test_val, id) from tbl1 where id = $1';
Query OK, 0 rows affected (0.02 sec)

mysql> create function helloworld () returns int language sql as 'select id from tbl1 limit 1';
Query OK, 0 rows affected (0.02 sec)

mysql> show function status;
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name       | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| aab  | twosum     | FUNCTION | root    | 2023-03-27 06:25:41 | 2023-03-27 06:25:41 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| aab  | mysumtable | FUNCTION | root    | 2023-03-27 06:25:51 | 2023-03-27 06:25:51 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| aab  | helloworld | FUNCTION | root    | 2023-03-27 06:25:58 | 2023-03-27 06:25:58 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
3 rows in set (0.00 sec)

mysql> show function status like 'two%';
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name   | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| aab  | twosum | FUNCTION | root    | 2023-03-27 06:25:41 | 2023-03-27 06:25:41 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
1 row in set (0.01 sec)
```
