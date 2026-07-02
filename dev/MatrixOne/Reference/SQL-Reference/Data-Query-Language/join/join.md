---
title: "JOIN"
doc_type: reference
mysql_compat: partial
differs_from_mysql:
  - "FULL JOIN and FULL OUTER JOIN are not fully supported (FULL JOIN with ON produces errors, FULL JOIN with USING returns INNER JOIN results, FULL OUTER JOIN is a syntax error); MySQL 8.0 also does not support FULL JOIN/OUTER JOIN natively"
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: "The `JOIN` statement is used to combine rows from two or more tables."
---
# **JOIN**

> The `JOIN` statement is used to combine rows from two or more tables.

## **Description**

The ``JOIN`` statement is used to combine rows from two or more tables.

The following figure shows seven usages of ``LEFT JOIN``, ``RIGHT JOIN``, ``INNER JOIN``, and ``OUTER JOIN``.

- ``LEFT JOIN``

|SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key|![leftjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join.png?raw=true)|
|---|---|
|SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key WHERE B.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join_where.png?raw=true)|

- ``RIGHT JOIN``

|SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join.png?raw=true)|
|---|---|
|SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join_where.png?raw=true)|

- ``INNER JOIN``

|SELECT [select_list] FROM TableA A INNER JOIN TableB B ON A.Key=B.Key|![innerjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/inner_join.png?raw=true)|
|---|---|

- ``FULL JOIN``

!!! note
    `FULL OUTER JOIN` is not supported in MatrixOne and produces a syntax error. `FULL JOIN` with `USING` returns `INNER JOIN` results instead of a true full outer join. To emulate a true full outer join, use the `LEFT JOIN` + `UNION` + `RIGHT JOIN` pattern. For details, see [FULL JOIN](full-join.md).

|SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key|![leftjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/full_join.png?raw=true)|
|---|---|
|SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL OR B.Key IS NULL|![fulljoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/full_join_where.png?raw=true)|

For more information, see the reference below:

- [LEFT JOIN](left-join.md)
- [RIGHT JOIN](right-join.md)
- [INNER JOIN](inner-join.md)
- [FULL JOIN](full-join.md)
- [OUTER JOIN](outer-join.md)
- [NATURAL JOIN](natural-join.md)
