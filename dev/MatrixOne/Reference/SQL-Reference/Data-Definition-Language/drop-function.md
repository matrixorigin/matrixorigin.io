---
title: "DROP FUNCTION"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Drops MatrixOne-style SQL / Python functions, not MySQL stored procedures/functions"
  - "Requires argument type list on DROP (e.g. DROP FUNCTION py_add(int, int)); MySQL 8.0 accepts only the function name"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The DROP FUNCTION statement represents the deletion of a user-defined function."
---
# **DROP FUNCTION**

> The DROP FUNCTION statement represents the deletion of a user-defined function.

## **Grammar description**

The `DROP FUNCTION` statement represents the deletion of a user-defined function.

## **Grammar structure**

```
> DROP FUNCTION <name> ([<arg_data_type> ]… )
```

## **Examples**

**Example 1**

<!-- validator-ignore-exec -->
```sql
--Removing Parametric Functions

create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';

mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.01 sec)

--When we no longer need the function, we can remove it
drop function py_add(int, int);
```

**Example 2**

```sql
--Deleting Unreferenced Functions
mysql> CREATE FUNCTION t1_fun () RETURNS VARCHAR LANGUAGE SQL AS 'select n1 from t1 limit 1' ;
Query OK, 0 rows affected (0.01 sec)

mysql> drop function t1_fun();
Query OK, 0 rows affected (0.01 sec)
```