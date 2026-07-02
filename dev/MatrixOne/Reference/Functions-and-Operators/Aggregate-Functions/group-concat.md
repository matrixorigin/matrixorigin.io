---
title: "GROUP_CONCAT"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-26
llms_summary: "This function returns a string result with the concatenated non-NULL values from a group."
---
# **GROUP_CONCAT**

> This function returns a string result with the concatenated non-NULL values from a group.

## **Description**

This function returns a string result with the concatenated non-NULL values from a group. It returns NULL if there are no non-NULL values.

## **Syntax**

```
> GROUP_CONCAT(expr)
```

The full syntax is as follows:

```
GROUP_CONCAT([DISTINCT] expr [,expr ...]
             [ORDER BY {unsigned_integer | col_name | expr}
                 [ASC | DESC] [,col_name ...]]
             [SEPARATOR str_val])
```

## **Arguments**

|  Arguments   | Description  |
|  ----  | ----  |
| expr  | Required. It specifies one or more columns or expressions to join. |
| DISTINCT |Optional. To eliminate duplicate values.|
| ORDER BY | Optional. To sort values in the result. To sort in reverse order, add the DESC (descending) keyword to the name of the column you are sorting by in the ORDER BY clause. The default is ascending order; this may be specified explicitly using the ASC keyword. |
| SEPARATOR | Optional.  The default separator between values in a group is comma (,).|

## **Returned Value**

The return value is a nonbinary or binary string, depending on whether the arguments are nonbinary or binary strings.

It returns NULL if there are no non-NULL values.

## **Examples**

<!-- validator-ignore-exec -->
```sql
create table t1(a int,b text,c text);
insert into t1 values(1,"a","bc"),(2,"ab","c"),(3,"aa","bb"),(3,"aa","bb");

mysql> select group_concat(distinct a,b,c separator '|') from t1;
+-----------------------------------+
| group_concat(distinct a, b, c, |) |
+-----------------------------------+
| 1abc|2abc|3aabb                   |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1 group by a;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc                            |
| abc                            |
| aabb                           |
+--------------------------------+
3 rows in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc|abc|aabb                   |
+--------------------------------+
1 row in set (0.01 sec)
```

### Multi-Argument GROUP_CONCAT with ORDER BY

```sql
DROP DATABASE IF EXISTS group_concat_demo;
CREATE DATABASE group_concat_demo;
USE group_concat_demo;

CREATE TABLE t1 (g INT, k INT, a VARCHAR(10), b VARCHAR(10));
INSERT INTO t1 VALUES (1, 2, 'a2', 'b2'), (1, 1, 'a1', 'b1');

-- Multi-argument GROUP_CONCAT with ORDER BY sorts by the specified column.
SELECT g, GROUP_CONCAT(a, ':', b ORDER BY k) AS gc FROM t1 GROUP BY g;

DROP DATABASE group_concat_demo;
```

### Multiple GROUP_CONCAT with Independent ORDER BY

```sql
DROP DATABASE IF EXISTS group_concat_multi_demo;
CREATE DATABASE group_concat_multi_demo;
USE group_concat_multi_demo;

CREATE TABLE t1 (g INT, a VARCHAR(10), b VARCHAR(10), x INT, y INT);
INSERT INTO t1 VALUES (1, 'a1', 'b1', 1, 2), (1, 'a2', 'b2', 2, 1);

-- Each GROUP_CONCAT uses its own ORDER BY independently.
SELECT
  g,
  GROUP_CONCAT(a ORDER BY x) AS by_x,
  GROUP_CONCAT(b ORDER BY y) AS by_y
FROM t1
GROUP BY g;

DROP DATABASE group_concat_multi_demo;
```
