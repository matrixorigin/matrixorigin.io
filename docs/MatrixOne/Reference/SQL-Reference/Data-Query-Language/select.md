# **SELECT**

## **Description**

Retrieves data from a table.

## **Syntax**

``` sql
SELECT
    [ALL | DISTINCT ]
    select_expr [, select_expr] [[AS] alias] ...
    [INTO variable [, ...]]
    [FROM table_references
    [WHERE where_condition]
    [GROUP BY {col_name | expr | position}
      [ASC | DESC]]
    [HAVING where_condition]
    [ORDER BY {col_name | expr | position}
      [ASC | DESC]] [ NULLS { FIRST | LAST } ]
    [LIMIT {[offset,] row_count | row_count OFFSET offset}]
    [FOR {UPDATE}]
```

### Explanations

The most commonly used clauses of `SELECT` statements are these:

#### `select_expr`

Each `select_expr` indicates a column that you want to retrieve. There must be at least one `select_expr`.

The list of `select_expr` terms comprises the select list that indicates which columns to retrieve. Terms specify a column or expression or can use *-shorthand:

- A select list consisting only of a single unqualified * can be used as shorthand to select all columns from all tables:

```
SELECT * FROM t1
```

- `tbl_name.*` can be used as a qualified shorthand to select all columns from the named table:

```
SELECT t1.*, t2.* FROM t1
```

- A `select_expr` can be given an alias using `AS` alias_name.

#### `table_references`

- The `FROM table_references` clause indicates the table or tables from which to retrieve rows.

- You can refer to a table within the default database as `tbl_name`, or as `db_name.tbl_name` to specify a database explicitly. You can refer to a column as `col_name`, `tbl_name.col_name`, or `db_name.tbl_name.col_name`. You need not specify a `tbl_name` or `db_name.tbl_name` prefix for a column reference unless the reference would be ambiguous.

- A table reference can be aliased using `tbl_name AS alias_name` or `tbl_name alias_name`.

#### `WHERE`

The `WHERE` clause, if given, indicates the condition or conditions that rows must satisfy to be selected. `where_condition` is an expression that evaluates to true for each row to be selected. The statement selects all rows if there is no `WHERE` clause.

#### `GROUP BY`

Columns selected for output can be referred to in ORDER BY and GROUP BY clauses using column names, column aliases, or column positions.

!!! note
    - In the `GROUP BY` or `HAVING` clauses, it is not allowed to use an alias to define another alias.
    - In the `GROUP BY` or `HAVING` clauses, the SQL engine first attempts to group or filter by column names. If the corresponding column names are not found in these clauses, it checks if aliases match and use the matched aliases as a fallback.
    - It is recommended to avoid ambiguous column references when using aliases in the `GROUP BY` or `HAVING` clauses. In such cases, the SQL engine looks for matching columns based on the aliases, and if multiple matches are found, it will raise an error.
    - In the `ORDER BY` clause, sorting is first attempted using aliases. If aliases are not found, the SQL engine attempts sorting using column names.

#### `HAVING`

The `HAVING` clause, like the `WHERE` clause, specifies selection conditions.

#### `ORDER BY`

To sort in reverse order, add the DESC (descending) keyword to the name of the column in the `ORDER BY` clause that you are sorting by. The default is ascending order; this can be specified explicitly using the ASC keyword.

#### `LIMIT`

The `LIMIT` clause can be used to constrain the number of rows returned by the SELECT statement.

#### `FOR UPDATE`

`SELECT...FOR UPDATE` is mainly used to lock a set of data rows in transaction processing to prevent them from being modified by other concurrent transactions. This statement is most commonly used in "read-modify-write" scenarios. That is, when you need to read a data set, make changes to it, and then write the results back to the database, you don't want other transactions to modify this data set.

Using `SELECT FOR UPDATE` in a transaction can lock the selected rows until the transaction ends (either by commit or rollback) and the locks are released. This way, other transactions attempting to modify these rows are blocked until the first transaction is complete.

See the example below:

```sql
START TRANSACTION;

SELECT * FROM Orders
WHERE OrderID = 1
FOR UPDATE;
```

In the above transaction, the `SELECT FOR UPDATE` statement selects and locks the row with `OrderID` 1 in the `Orders` table. Other transactions cannot modify this row before the transaction ends. After you have finished modifying this row, you can commit the transaction to release the lock:

```sql
UPDATE Orders
SET Quantity = Quantity - 1
WHERE OrderID = 1;

COMMIT;
```

The above `UPDATE` statement modifies the `Quantity` value of the selected row, and then the `COMMIT` statement commits the transaction and releases the lock. At this point, other blocked transactions can continue. If you decide not to make any changes, you can use the `ROLLBACK` statement to end the transaction and release the lock.

## **Examples**

```sql
create table t1 (spID int,userID int,score smallint);
insert into t1 values (1,1,1);
insert into t1 values (2,2,2);
insert into t1 values (2,1,4);
insert into t1 values (3,3,3);
insert into t1 values (1,1,5);
insert into t1 values (4,6,10);
insert into t1 values (5,11,99);
insert into t1 values (null,0,99);

mysql> SELECT * FROM t1 WHERE spID>2 AND userID <2 || userID >=2 OR userID < 2 LIMIT 3;
+------+--------+-------+
| spid | userid | score |
+------+--------+-------+
| NULL |      0 |    99 |
|    1 |      1 |     1 |
|    2 |      2 |     2 |
+------+--------+-------+

mysql> SELECT userID,MAX(score) max_score FROM t1 WHERE userID <2 || userID > 3 GROUP BY userID ORDER BY max_score;
+--------+-----------+
| userid | max_score |
+--------+-----------+
|      1 |         5 |
|      6 |        10 |
|      0 |        99 |
|     11 |        99 |
+--------+-----------+

mysql> select userID,count(score) from t1 group by userID having count(score)>1 order by userID;
+--------+--------------+
| userid | count(score) |
+--------+--------------+
|      1 |            3 |
+--------+--------------+

mysql> select userID,count(score) from t1 where userID>2 group by userID having count(score)>1 order by userID;
Empty set (0.01 sec)s

mysql> select * from t1 order by spID asc nulls last;
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

## **Constraints**

1. `SELECT...FOR UPDATE` currently only supports single-table queries.
2. `INTO OUTFILE` is limitedly support.
3. When the table name is `DUAL`, it is not supported to execute `SELECT xx from DUAL` directly into the corresponding database (`USE DBNAME`), but you can specify the database name to query the table `DUAL` by using `SELECT xx from DBNAME.DUAL`.