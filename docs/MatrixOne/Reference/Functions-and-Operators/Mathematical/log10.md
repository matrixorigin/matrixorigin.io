# **LOG10()**

## **Description**

LOG10(X) returns the base-10 logarithm of X.

## **Syntax**

```
> LOG10(X)
```

## **Arguments**

| Arguments | Description                                    |
|-----------|------------------------------------------------|
| X         | Required. Any numeric data type supported now. |

## **Examples**

```sql
drop table if exists t1;
create table t1(a float, b float);
insert into t1 values(10000,3784.159);
insert into t1 values(2738,682.325);

mysql> select log10(a),log10(b) from t1;
+-------------------+--------------------+
| log10(a)             | log10(b)              |
+-------------------+--------------------+
|                 4 |  3.577969368581086 |
| 3.437433443797971 | 2.8339912916439594 |
+-------------------+--------------------+
2 rows in set (0.00 sec)
```
