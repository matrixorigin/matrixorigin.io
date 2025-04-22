# **SELECT**

## **Syntax Description**

The `SELECT` statement is used to retrieve data from a table.

## **Syntax Structure**

```sql
SELECT
    [ALL | DISTINCT ]
    select_expr [, select_expr] [[AS] alias] ...
    [INTO variable [, ...]]
    [FROM table_references[{as of timestamp 'YYYY-MM-DD HH:MM:SS'}]]
    [WHERE where_condition]
    [GROUP BY {col_name | expr | position}
      [ASC | DESC]]
    [HAVING where_condition]
    [ORDER BY {col_name | expr | position}
      [ASC | DESC]] [ NULLS { FIRST | LAST } ]
    [LIMIT {[offset,] row_count | row_count OFFSET offset}]
    [FOR {UPDATE}]
```

### Syntax Explanation

The most commonly used clauses or conditions in the `SELECT` statement are explained below:

#### `ALL` & `DISTINCT`

The `ALL` and `DISTINCT` modifiers specify whether duplicate rows should be returned. `ALL` (the default) specifies that all matching rows, including duplicates, should be returned. `DISTINCT` specifies that duplicate rows should be removed from the result set.

#### `select_expr`

Each `select_expr` expression represents a column you want to query, and there must be at least one `select_expr`.

The `select_expr` list contains the columns to be selected. You can specify columns explicitly or use `*` to select all columns:

```sql src/main.sql
SELECT * FROM t1
```

- `tbl_name.*` can be used to select all columns from a table:

```sql src/main.sql
SELECT t1.*, t2.* FROM t1
```

- `select_expr` can use `AS` to assign an alias to a column.

#### `table_references`

- Tables in the default database can be referred to as `tbl_name` or `db_name.tbl_name`, primarily to explicitly specify the database. Columns can be referred to as `col_name`, `tbl_name.col_name`, or `db_name.tbl_name.col_name`. You do not need to specify `tbl_name` or `db_name.tbl_name` for columns unless necessary for clarity.

- Table aliases can be assigned using `tbl_name AS alias_name` or `tbl_name alias_name`.

- To view the table's data at a specific point-in-time (PITR), append `{as of timestamp 'YYYY-MM-DD HH:MM:SS'}` to the table name.

#### `WHERE`

The `WHERE` clause (if given) specifies one or more conditions that rows must satisfy to be selected. The `where_condition` expression evaluates to true for each row to be selected. If no `WHERE` clause is provided, the statement selects all rows.

#### `GROUP BY`

Column names, column aliases, or column positions can be used in the `ORDER BY` and `GROUP BY` clauses to reference selected columns.

!!! note
    - In `GROUP BY` or `HAVING` clauses, you cannot use one alias to define another alias.
    - In `GROUP BY` or `HAVING` clauses, the system first attempts to group or filter using column names. If no matching column name is found, it checks for aliases and uses them if available.
    - Avoid ambiguous column references when using aliases in `GROUP BY` or `HAVING` clauses. If multiple matching columns are found, an error will occur.
    - The `ORDER BY` clause first attempts to sort by aliases. If no alias is found, it then tries to sort by column names.

#### `HAVING`

The `HAVING` clause, like `WHERE`, specifies selection conditions.

#### `ORDER BY`

`ORDER BY` defaults to ascending order; you can explicitly specify this with the `ASC` keyword. To sort in descending order, add the `DESC` keyword to the column name in the clause.

#### `LIMIT`

The `LIMIT` clause can be used to restrict the number of rows returned by the `SELECT` statement.

#### `FOR UPDATE**

`SELECT...FOR UPDATE` is primarily used in transactions to lock a set of rows, preventing them from being modified by other concurrent transactions. This statement is most commonly used in **read-modify-write** scenarios, where you need to read data, modify it, and write it back to the database while ensuring no other transactions modify the same data during the process.

Using `SELECT FOR UPDATE` in a transaction locks the selected rows until the transaction ends (via commit or rollback). Other transactions attempting to modify these rows will be blocked until the first transaction completes.

See the example below:

```sql src/main.sql
START TRANSACTION;

SELECT * FROM Orders
WHERE OrderID = 1
FOR UPDATE;
```

In this transaction, the `SELECT FOR UPDATE` statement selects and locks the row in the `Orders` table where `OrderID` is 1. Other transactions cannot modify this row until the transaction ends. After modifying the row, you can commit the transaction to release the lock:

```sql src/main.sql
UPDATE Orders
SET Quantity = Quantity - 1
WHERE OrderID = 1;

COMMIT;
```

The `UPDATE` statement modifies the `Quantity` value of the selected row, and the `COMMIT` statement releases the lock. Other blocked transactions can then proceed. If you decide not to make any changes, use `ROLLBACK` to end the transaction and release the lock.

## **Examples**

```sql src/main.sql
CREATE TABLE t1 (spID INT, userID INT, score SMALLINT);
INSERT INTO t1 VALUES (1,1,1);
INSERT INTO t1 VALUES (2,2,2);
INSERT INTO t1 VALUES (2,1,4);
INSERT INTO t1 VALUES (3,3,3);
INSERT INTO t1 VALUES (1,1,5);
INSERT INTO t1 VALUES (4,6,10);
INSERT INTO t1 VALUES (5,11,99);
INSERT INTO t1 VALUES (NULL,0,99);

mysql> SELECT spID FROM t1;
+------+
| spid |
+------+
|    1 |
|    2 |
|    2 |
|    3 |
|    1 |
|    4 |
|    5 |
| NULL |
+------+

mysql> SELECT DISTINCT spID FROM t1;
+------+
| spid |
+------+
|    1 |
|    2 |
|    3 |
|    4 |
|    5 |
| NULL |
+------+

mysql> SELECT * FROM t1 WHERE spID>2 AND userID <2 || userID >=2 OR userID < 2 LIMIT 3;
+------+--------+-------+
| spid | userid | score |
+------+--------+-------+
| NULL |      0 |    99 |
|    1 |      1 |     1 |
|    2 |      2 |     2 |
+------+--------+-------+

mysql> SELECT userID, MAX(score) max_score FROM t1 WHERE userID <2 || userID > 3 GROUP BY userID ORDER BY max_score;
+--------+-----------+
| userid | max_score |
+--------+-----------+
|      1 |         5 |
|      6 |        10 |
|      0 |        99 |
|     11 |        99 |
+--------+-----------+

mysql> SELECT userID, COUNT(score) FROM t1 GROUP BY userID HAVING COUNT(score)>1 ORDER BY userID;
+--------+--------------+
| userid | count(score) |
+--------+--------------+
|      1 |            3 |
+--------+--------------+

mysql> SELECT userID, COUNT(score) FROM t1 WHERE userID>2 GROUP BY userID HAVING COUNT(score)>1 ORDER BY userID;
Empty set (0.01 sec)

mysql> SELECT * FROM t1 ORDER BY spID ASC NULLS LAST;
+------+--------+-------+
| spid | userid | score |
+------+--------+-------+
|    1 |      1 |     1 |
|    1 |      1 |     5 |
|    2 |      2 |     2 |
|    2 |      1 |     4 |
|    3 |      3 |     3 |
|    4 |      6 |    10 |
|    5 |     11 |    99 |
| NULL |      0 |    99 |
+------+--------+-------+
```

## **Limitations**

- `SELECT...FOR UPDATE` currently only supports single-table queries.
- Partial support for `INTO OUTFILE`.
- When the table name is `DUAL`, directly querying it in the default database (`USE DBNAME`) with `SELECT xx FROM DUAL` is not supported. You must specify the database name as `SELECT xx FROM DBNAME.DUAL`.
