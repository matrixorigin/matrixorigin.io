# **ILIKE**

## **Description**

The `ILIKE` operator is used similarly to the `LIKE` operator to search for a specified pattern in a column in the WHERE clause.

The main difference between the `ILIKE` operator and the `LIKE` operator is case sensitivity. When using `ILIKE`, characters in a string are treated the same whether they are uppercase or lowercase.

## **Syntax**

```
> SELECT column1, column2, ...
FROM table_name
WHERE columnN ILIKE pattern;
```

## **Examples**

```sql
drop table t1;
create table t1(a varchar(20));
insert into t1 values ('abc'), ('ABC'), ('abC');
select * from t1 where a ilike '%abC%';

mysql> select * from t1 where a ilike '%abC%';
+------+
| a    |
+------+
| abc  |
| ABC  |
| abC  |
+------+
3 rows in set (0.01 sec)
```
