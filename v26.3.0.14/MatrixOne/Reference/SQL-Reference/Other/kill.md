---
title: "KILL"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The KILL statement terminates a running query or process."
---
# **KILL**

> The KILL statement terminates a running query or process.

## **Description**

The `KILL` statement terminates a running query or process.

!!! info
    Terminating a process or query may result in the loss of unsaved data; terminating a running query may consume system resources and affect other running queries.

## **Syntax**

```
> KILL [CONNECTION | QUERY] processlist_id
```

### Explanations

`processlist_id` refers to the identifier of the process or query to be terminated. `processlist_id` is the connection identifier if the `CONNECTION` keyword is used, and `processlist_id` is the query identifier if the `QUERY` keyword is used. In MatrixOne, `SHOW PROCESSLIST` displays the connection ID in the `conn_id` column.

## **Examples**

<!-- validator-ignore-exec -->
```sql
select connection_id();
+-----------------+
| connection_id() |
+-----------------+
|            1008 |
+-----------------+
1 row in set (0.00 sec)

-- Terminate query process
> kill query 1008;
Query OK, 0 rows affected (0.00 sec)

-- Terminate the connection process
> kill connection 1008;
Query OK, 0 rows affected (0.00 sec)

-- After KILL CONNECTION, the connection is terminated.
-- Auto-reconnect behavior after disconnection is client-specific
-- and may differ from the MySQL client's behavior shown below.
> show databases;
ERROR 2013 (HY000): Lost connection to MySQL server during query
```
