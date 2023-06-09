# **SLEEP()**

## **Description**

Sleeps (pauses) for the number of seconds given by the duration argument, then returns 0.  

## **Syntax**

```
>
SLEEP(duration)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| duration | Required. The number of seconds. The `duration` may have a fractional part. The `duration` is not allowed NULL or negative.|

## **Returned Value**

- When sleep returns normally (without interruption), it returns 0.

- When SLEEP() returns 1 (with interruption or time out), the query returns no error.

    For example:

    1. In session 1, execute the following command to query the current connection_id and execute the `SLEEP()` function:

        ```sql
        mysql> select connection_id();
        +-----------------+
        | connection_id() |
        +-----------------+
        |            1476 |
        +-----------------+
        1 row in set (0.03 sec)
        mysql> select sleep(200);
        ```

    2. At this point, open a new session, interrupt session 1, and run the following command.

        ```sql
        mysql> kill 1463;
        Query OK, 0 rows affected (0.00 sec)
        ```

    3. Check the query result of session 1:

        ```
        mysql> select sleep(200);
        +------------+
        | sleep(200) |
        +------------+
        |          1 |
        +------------+
        1 row in set (26.50 sec)
        ```

- When SLEEP() returns an error (part of a query is uninterrupted). For example:

    ```sql
    mysql> SELECT 1 FROM t1 WHERE SLEEP(1000);
    ERROR 20101 (HY000): internal error: pipeline closed unexpectedly
    ```

## **Examples**

```sql
-- without interruption
mysql> SELECT SLEEP(1);
+----------+
| sleep(1) |
+----------+
|        0 |
+----------+
1 row in set (1.01 sec)

-- without interruption
mysql> SELECT SLEEP(1000);
+-------------+
| sleep(1000) |
+-------------+
|           0 |
+-------------+
1 row in set (18 min 20.87 sec)

create table t1 (a int,b int);
insert into t1 values (1,1),(1,null);
mysql> select sleep(a) from t1;
+----------+
| sleep(a) |
+----------+
|        0 |
|        0 |
+----------+
2 rows in set (2.01 sec)
```
