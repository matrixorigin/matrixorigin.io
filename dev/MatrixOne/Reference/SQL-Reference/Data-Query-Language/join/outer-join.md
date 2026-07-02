---
title: "OUTER JOIN"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "Overview page that includes FULL OUTER JOIN; neither MO nor MySQL 8.0 natively support FULL OUTER JOIN (MO produces syntax error, same as MySQL)"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "When performing an `INNER JOIN, rows from either table that are unmatched in the other table are not returned."
---
# **OUTER JOIN**

> When performing an `INNER JOIN, rows from either table that are unmatched in the other table are not returned.

## **Description**

When performing an ``INNER JOIN``, rows from either table that are unmatched in the other table are not returned. In an ``OUTER JOIN``, unmatched rows in one or both tables can be returned. There are a few types of outer joins:

- ``LEFT JOIN`` returns only unmatched rows from the left table. For more information, see [LEFT JOIN](left-join.md).
- ``RIGHT JOIN`` returns only unmatched rows from the right table.For more information, see [RIGHT JOIN](right-join.md).
- ``FULL OUTER JOIN`` returns unmatched rows from both tables. Neither MatrixOne nor MySQL 8.0 natively supports `FULL OUTER JOIN` syntax (both produce a syntax error). To emulate a true full outer join, use the `LEFT JOIN` + `UNION` + `RIGHT JOIN` pattern. For details, see [FULL JOIN](full-join.md).

# **Examples**

<!-- validator-ignore-exec -->
```sql
create table t1 (a1 int, a2 char(3));
insert into t1 values(10,'aaa'), (10,null), (10,'bbb'), (20,'zzz');
create table t2(a1 char(3), a2 int, a3 real);
insert into t2 values('AAA', 10, 0.5);
insert into t2 values('BBB', 20, 1.0);

mysql> select t1.a1, t1.a2, t2.a1, t2.a2 from t1 left outer join t2 on t1.a1=10;
+------+------+------+------+
| a1   | a2   | a1   | a2   |
+------+------+------+------+
|   10 | aaa  | AAA  |   10 |
|   10 | aaa  | BBB  |   20 |
|   10 | NULL | AAA  |   10 |
|   10 | NULL | BBB  |   20 |
|   10 | bbb  | AAA  |   10 |
|   10 | bbb  | BBB  |   20 |
|   20 | zzz  | NULL | NULL |
+------+------+------+------+
```
