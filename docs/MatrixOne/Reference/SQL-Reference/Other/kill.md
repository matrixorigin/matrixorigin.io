# **KILL**

## **Description**

The `KILL` statement terminates a running query or process.

!!! info
    Terminating a process or query may result in the loss of unsaved data; terminating a running query may consume system resources and affect other running queries.

## **Syntax**

```
> KILL [CONNECTION | QUERY] processlist_id
```

### Explanations

`process_id` refers to the identifier of the process or query to be terminated. `process_id` is the connection identifier if the `CONNECTION` keyword is used, and `process_id` is the query identifier if the `QUERY` keyword is used.

## **Examples**

```sql
select connection_id();
+-----------------+
| connection_id() |
+-----------------+
|            1008 |
+-----------------+
1 row in set (0.00 sec)

-- Terminate query process
mysql> kill query 1008;
Query OK, 0 rows affected (0.00 sec)

-- Terminate the connection process
mysql> kill connection 1008;
Query OK, 0 rows affected (0.00 sec)

-- Test for disconnection
mysql> show databases;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    1180
-- The connection has been disconnected, and the service has started to reconnect
```
