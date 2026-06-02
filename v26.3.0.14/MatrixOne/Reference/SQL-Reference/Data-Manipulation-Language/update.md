---
title: "UPDATE"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "LOW_PRIORITY and IGNORE modifiers are syntactically accepted but have no effect"
  - "PARTITION clause not supported"
mo_only: false
since: unknown
last_updated: 2026-06-02
llms_summary: "The UPDATE statement is used to modify the existing records in a table, including PostgreSQL-style UPDATE ... FROM syntax."
---
# **UPDATE**

> The UPDATE statement is used to modify the existing records in a table. Supports single-table, multi-table, and PostgreSQL-style `UPDATE ... SET ... FROM ... WHERE` syntax.

## **Description**

The `UPDATE` statement is used to modify the existing records in a table.

## **Syntax**

### **Single-table Syntax**

```
UPDATE table_reference
    SET assignment_list
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

### **PostgreSQL-style UPDATE FROM Syntax**

```
UPDATE table_reference [ [AS] alias ]
    SET assignment_list
    FROM table_references
    [WHERE where_condition]
```

#### Explanations

+ The `UPDATE` statement updates columns of existing rows in the named table with new values.  
+ The `SET` clause indicates which columns to modify and the values they should be given. Each value can be given as an expression, or the keyword `DEFAULT` to set a column explicitly to its default value.
+ The `WHERE` clause, if given, specifies the conditions that identify which rows to update. With no `WHERE` clause, all rows are updated.
+ If the `ORDER BY` clause is specified, the rows are updated in the order that is specified.
+ The `LIMIT` clause places a limit on the number of rows that can be updated.
+ The PostgreSQL-style `FROM` clause introduces additional read-only join sources. The target table is updated; `FROM`-clause tables are used as join sources and are not modified. `ORDER BY` and `LIMIT` are not supported with the `FROM` syntax.

## **Examples**

- **Single-table Examples**

<!-- validator-ignore-exec -->
```sql
CREATE TABLE t1 (a bigint(3), b bigint(5) primary key);
insert INTO t1 VALUES (1,1),(1,2);
update t1 set a=2 where a=1 limit 1;

mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    2 |    1 |
|    1 |    2 |
+------+------+
```

- **Multiple-table Examples**

<!-- validator-ignore-exec -->
```sql
drop table if exists t1;
create table t1 (a int);
insert into t1 values(1), (2), (4);
drop table if exists t2;
create table t2 (b int);
insert into t2 values(1), (2), (3);
update t1, t2 set a = 1, b =2;

mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
|    1 |
|    1 |
+------+

update t1, t2 set a = null, b =null;

mysql> select * from t2;
+------+
| b    |
+------+
| NULL |
| NULL |
| NULL |
+------+
mysql> select * from t1;
+------+
| a    |
+------+
| NULL |
| NULL |
| NULL |
+------+
```

Multiple-table join Syntax is also supported.

```sql
drop table if exists t1;
drop table if exists t2;
create table t1 (a int, b int, c int);
insert into t1 values(1, 2, 3), (4, 5, 6), (7, 8, 9);
create table t2 (a int, b int, c int);
insert into t2 values(1, 2, 3), (4, 5, 6), (7, 8, 9);
update t1 join t2 on t1.a = t2.a set t1.b = 222, t1.c = 333, t2.b = 222, t2.c = 333;

mysql> select * from t1;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |  222 |  333 |
|    4 |  222 |  333 |
|    7 |  222 |  333 |
+------+------+------+

mysql> with t11 as (select * from (select * from t1) as t22) update t11 join t2 on t11.a = t2.a set t2.b = 666;

mysql> select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |  666 |  333 |
|    4 |  666 |  333 |
|    7 |  666 |  333 |
+------+------+------+
3 rows in set (0.00 sec)
```

- **PostgreSQL-style UPDATE FROM Examples**

```sql
DROP DATABASE IF EXISTS update_from_tests;
CREATE DATABASE update_from_tests;
USE update_from_tests;

CREATE TABLE company (id INT PRIMARY KEY, province VARCHAR(50));
INSERT INTO company VALUES (101, 'BJ'), (102, 'SH'), (103, 'GZ');

CREATE TABLE vec_join_case (id INT PRIMARY KEY, company_id INT, remark VARCHAR(100));
INSERT INTO vec_join_case VALUES (10, 101, 'init'), (20, 102, 'init'), (30, 103, 'init');

-- Basic PostgreSQL-style UPDATE FROM
UPDATE vec_join_case t
SET remark = CONCAT('hot-', c.province)
FROM company c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

-- UPDATE FROM with CTE
WITH cc AS (SELECT id, province FROM company)
UPDATE vec_join_case t
SET remark = c.province
FROM cc c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

-- UPDATE FROM with LEFT JOIN
UPDATE vec_join_case t
SET remark = COALESCE(c.province, 'unknown')
FROM company c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

DROP DATABASE update_from_tests;
```
