# **LOG2()**

## **Description**

LOG2(X) returns the base-2 logarithm of X.

## **Syntax**

```
> LOG2(X)
```

## **Arguments**

| Arguments | Description                                    |
|-----------|------------------------------------------------|
| X         | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a float, b float);
insert into t1 values(1024,17.231);
insert into t1 values(4096,23.331);

mysql>select log2(a),log2(b) from t1;
+---------+-------------------+
| log2(a) | log2(b)           |
+---------+-------------------+
|      10 | 4.106934600972237 |
|      12 | 4.544176200820541 |
+---------+-------------------+
2 rows in set (0.01 sec)
```
