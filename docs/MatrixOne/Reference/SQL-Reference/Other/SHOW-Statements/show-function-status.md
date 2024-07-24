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
create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';
create function twosum (x float, y float) returns float language sql as 'select $1 + $2' ;
create function helloworld () returns int language sql as 'select id from tbl1 limit 1';

mysql> show function status;
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name        | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| db1  | py_add      | FUNCTION | root    | 2024-01-16 08:00:21 | 2024-01-16 08:00:21 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| db1  | twosum      | FUNCTION | root    | 2024-01-16 08:00:39 | 2024-01-16 08:00:39 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| db1  | helloworld  | FUNCTION | root    | 2024-01-16 08:00:53 | 2024-01-16 08:00:53 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
3 rows in set (0.01 sec)

mysql> show function status like 'two%';
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name   | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| db1  | twosum | FUNCTION | root    | 2024-01-16 08:00:39 | 2024-01-16 08:00:39 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
1 rows in set (0.01 sec)
```