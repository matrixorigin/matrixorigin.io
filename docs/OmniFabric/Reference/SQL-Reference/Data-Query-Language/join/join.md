# **JOIN**

## **Description**

The ``JOIN`` statement is used to combine rows from two or more tables.

The following figure shows seven usages of ``LEFT JOIN``, ``RIGHT JOIN``, ``INNER JOIN``, and ``OUTER JOIN``.

- ``LEFT JOIN``

|SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key|
|---|
|SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key WHERE B.Key IS NULL|

- ``RIGHT JOIN``

|SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key|
|---|
|SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL|

- ``INNER JOIN``

|SELECT [select_list] FROM TableA A INNER JOIN TableB B ON A.Key=B.Key|
|---|

- ``FULL JOIN``

|SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key|
|---|
|SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL OR B.Key IS NULL|

For more information, see the reference below:

- [LEFT JOIN](left-join.md)

- [RIGHT JOIN](right-join.md)

- [INNER JOIN](inner-join.md)

- [FULL JOIN](full-join.md)

- [OUTER JOIN](outer-join.md)

- [NATURAL JOIN](natural-join.md)
