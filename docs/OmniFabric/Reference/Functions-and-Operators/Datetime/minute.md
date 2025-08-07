# **MINUTE()**

## **Description**

Returns the minute for time, in the range 0 to 59, or NULL if time is NULL.

## **Syntax**

```
> MINUTE(time)
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| time  | Required. A value that represents time or timestamp. |

## **Examples**

- Example 1:

```sql
mysql> SELECT MINUTE('2008-02-03 10:05:03');

+-----------------------------+
| minute(2008-02-03 10:05:03) |

+-----------------------------+
|                           5 |

+-----------------------------+
1 row in set (0.00 sec)
```

- Example 2:

```sql
drop table if exists t1;
create table t1(a datetime, b timestamp);
insert into t1 values("2022-07-01", "2011-01-31 12:00:00");
insert into t1 values("2011-01-31 12:32:11", "1979-10-22");
insert into t1 values(NULL, "2022-08-01 23:10:11");
insert into t1 values("2011-01-31", NULL);
insert into t1 values("2022-06-01 14:11:09","2022-07-01 00:00:00");
insert into t1 values("2022-12-31","2011-01-31 12:00:00");
insert into t1 values("2022-06-12","2022-07-01 00:00:00");

mysql> select minute(a),minute(b) from t1;

+-----------+-----------+
| minute(a) | minute(b) |

+-----------+-----------+
|         0 |         0 |
|        32 |         0 |
|      NULL |        10 |
|         0 |      NULL |
|        11 |         0 |
|         0 |         0 |
|         0 |         0 |

+-----------+-----------+
7 rows in set (0.00 sec)

mysql> select * from t1 where minute(a)<=minute(b);

+---------------------+---------------------+
| a                   | b                   |

+---------------------+---------------------+
| 2022-07-01 00:00:00 | 2011-01-31 12:00:00 |
| 2022-12-31 00:00:00 | 2011-01-31 12:00:00 |
| 2022-06-12 00:00:00 | 2022-07-01 00:00:00 |

+---------------------+---------------------+
3 rows in set (0.00 sec)
```
