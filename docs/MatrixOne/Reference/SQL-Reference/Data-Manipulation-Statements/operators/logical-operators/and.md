# **AND,&&**

## **Description**

Logical `AND,&&`. Evaluates to `true` if all operands are nonzero and not NULL, to `false` if one or more operands are 0, otherwise NULL is returned.

## **Syntax**

```
> SELECT column_1 AND column_2 FROM table_name;
```

## **Examples**

```sql
mysql> select 1 and 1;
+---------+
| 1 and 1 |
+---------+
| true    |
+---------+
mysql> select 1 and 0;
+---------+
| 1 and 0 |
+---------+
| false   |
+---------+
mysql> select 1 and null;
+------------+
| 1 and null |
+------------+
| NULL       |
+------------+
mysql> select null and 0;
+------------+
| null and 0 |
+------------+
| false      |
+------------+
1 row in set (0.01 sec)
```

```sql
create table t1 (a boolean,b bool);
insert into t1 values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);
mysql> select a and b from t1;
+---------+
| a and b |
+---------+
| false   |
| false   |
| true    |
| false   |
| NULL    |
+---------+
5 rows in set (0.00 sec)
```
