# **LIKE**

## **Description**

The `LIKE` operator is used in a `WHERE` clause to search for a specified pattern in a column.

There are two wildcards often used in conjunction with the `LIKE` operator:

- The percent sign `%` wildcard: means to match any sequence of characters (including empty character sequences).

    + %text: matches a string ending with "text".
    + text%: matches a string starting with "text".
    + %text%: Matches a string containing "text".

- Underscore `_` wildcard: means match a single character.

    + `te_t`: can match "text", "test", etc.

- Other characters: The `LIKE` operator is case-sensitive for other characters.

## **Syntax**

```
> SELECT column1, column2, ...
FROM table_name
WHERE columnN LIKE pattern;
```

## **Examples**

```sql
drop table t1;
create table t1(a varchar(20));
insert into t1 values ('abc'), ('ABC'), ('abC');
select * from t1 where a ilike '%abC%';

mysql> select * from t1 where a like '%abC%';
+------+
| a    |
+------+
| abC  |
+------+
1 row in set (0.00 sec)
```
