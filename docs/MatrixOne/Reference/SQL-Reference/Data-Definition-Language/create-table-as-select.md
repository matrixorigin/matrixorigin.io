# CREATE TABLE AS SELECT

## Syntax Description

The `CREATE TABLE AS SELECT` command creates a new table by copying column definitions and data from existing tables specified in a `SELECT` query. However, it does not copy constraints, indexes, views, or other non-data attributes from the original table.

## Syntax Structure

```
> CREATE [TEMPORARY] TABLE [ IF NOT EXISTS ] table_name
[ (column_name [, ...] ) ] AS {query}

Query can be any select statement in MO syntax.

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
```

## Syntax Explanation

- **ALL**: Default option, returns all matching rows including duplicates.
- **DISTINCT**: Returns only unique rows (removes duplicates).
- **select_expr**: Columns or expressions to select.
- **AS alias**: Assigns an alias to the selected column or expression.
- **[INTO variable [, ...]]**: Stores query results in variables instead of returning them to the client.
- **[FROM table_references]**: Specifies the source table(s) for data retrieval. `table_references` can be a table name or a complex expression (e.g., joins). Optionally copies table data from a specific PITR timestamp.
- **[WHERE where_condition]**: Filters results to rows satisfying the condition.
- **[GROUP BY {col_name | expr | position} [ASC | DESC]]**: Groups results by specified columns/expressions. `ASC`/`DESC` defines sorting within groups.
- **[HAVING where_condition]**: Filters groups after grouping (used with `GROUP BY`).
- **[ORDER BY {col_name | expr | position} [ASC | DESC] [NULLS {FIRST | LAST}]]**: Sorts results. `NULLS FIRST`/`LAST` controls NULL value placement.
- **[LIMIT {[offset,] row_count | row_count OFFSET offset}]**: Limits returned rows. `offset` specifies starting row (0 = first), `row_count` specifies number of rows.

## Permissions

In `MatrixOne`, executing `CREATE TABLE AS SELECT` requires:

- **CREATE** permission: To create tables.
- **INSERT** permission: To insert data into the new table.
- **SELECT** permission: To query source table(s).

For detailed permission operations, see [MatrixOne Permission Types](../../access-control-type.md) and [GRANT](../Data-Control-Language/grant.md).

## Examples

- Example 1: Copy entire table

```sql
CREATE TABLE t1(a INT DEFAULT 123, b CHAR(5));
INSERT INTO t1 VALUES (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE TABLE t2 AS SELECT * FROM t1; -- Full table copy
Query OK, 3 rows affected (0.02 sec)

mysql> DESC t2;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> SELECT * FROM t2;
+------------+------+
| a          | b    |
+------------+------+
|          1 | 1    |
|          2 | 2    |
| 2147483647 | max  |
+------------+------+
3 rows in set (0.00 sec)
```

- Example 2: Column aliasing

```sql
CREATE TABLE t1(a INT DEFAULT 123, b CHAR(5));
INSERT INTO t1 VALUES (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE TABLE test AS SELECT a AS alias_a FROM t1; -- Column alias
Query OK, 3 rows affected (0.02 sec)

mysql> DESC test;
+---------+---------+------+------+---------+-------+---------+
| Field   | Type    | Null | Key  | Default | Extra | Comment |
+---------+---------+------+------+---------+-------+---------+
| alias_a | INT(32) | YES  |      | 123     |       |         |
+---------+---------+------+------+---------+-------+---------+
1 row in set (0.01 sec)

mysql> SELECT * FROM test;
+------------+
| alias_a    |
+------------+
|          1 |
|          2 |
| 2147483647 |
+------------+
3 rows in set (0.01 sec)
```

- Example 3: Copy schema only

```sql
CREATE TABLE t1(a INT DEFAULT 123, b CHAR(5));
INSERT INTO t1 VALUES (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE TABLE t3 AS SELECT * FROM t1 WHERE 1=2; -- Schema only
Query OK, 0 rows affected (0.01 sec)

mysql> DESC t3;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> SELECT * FROM t3;
Empty set (0.00 sec)
```

- Example 4: Aggregated values

```sql
CREATE TABLE t1(a INT DEFAULT 123, b CHAR(5));
INSERT INTO t1 VALUES (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE TABLE t4(n1 INT UNIQUE) AS SELECT MAX(a) FROM t1; -- Aggregated column
Query OK, 1 row affected (0.03 sec)

mysql> DESC t4;
+--------+---------+------+------+---------+-------+---------+
| Field  | Type    | Null | Key  | Default | Extra | Comment |
+--------+---------+------+------+---------+-------+---------+
| n1     | INT(32) | YES  | UNI  | NULL    |       |         |
| MAX(a) | INT(32) | YES  |      | NULL    |       |         |
+--------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> SELECT * FROM t4;
+------+------------+
| n1   | MAX(a)     |
+------+------------+
| NULL | 2147483647 |
+------+------------+
1 row in set (0.00 sec)
```

- Example 5: DISTINCT rows

```sql
CREATE TABLE t5(n1 INT,n2 INT,n3 INT);
INSERT INTO t5 VALUES(1,1,1),(1,1,1),(3,3,3);

mysql> CREATE TABLE t5_1 AS SELECT DISTINCT n1 FROM t5; -- Remove duplicates
Query OK, 2 rows affected (0.02 sec)

mysql> SELECT * FROM t5_1;
+------+
| n1   |
+------+
|    1 |
|    3 |
+------+
2 rows in set (0.00 sec)
```

- Example 6: Sorted results

```sql
CREATE TABLE t6(n1 INT,n2 INT,n3 INT);
INSERT INTO t6 VALUES(1,1,3),(2,2,2),(3,3,1);

mysql> CREATE TABLE t6_1 AS SELECT * FROM t6 ORDER BY n3; -- Sorted copy
Query OK, 3 rows affected (0.01 sec)

mysql> SELECT * FROM t6_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    3 |    3 |    1 |
|    2 |    2 |    2 |
|    1 |    1 |    3 |
+------+------+------+
3 rows in set (0.01 sec)
```

- Example 7: Grouped results

```sql
CREATE TABLE t7(n1 INT,n2 INT,n3 INT);
INSERT INTO t7 VALUES(1,1,3),(1,2,2),(2,3,1),(2,3,1),(3,3,1);

mysql> CREATE TABLE t7_1 AS SELECT n1 FROM t7 GROUP BY n1 HAVING COUNT(n1)>1; -- Group filtering
Query OK, 2 rows affected (0.02 sec)

mysql> SELECT * FROM t7_1;
+------+
| n1   |
+------+
|    1 |
|    2 |
+------+
2 rows in set (0.01 sec)
```

- Example 8: Limited rows

```sql src/main.sql
CREATE TABLE t8(n1 INT,n2 INT,n3 INT);
INSERT INTO t8 VALUES(1,1,1),(2,2,2),(3,3,3);

mysql> CREATE TABLE t8_1 AS SELECT * FROM t8 LIMIT 1 OFFSET 1; -- Second row only
Query OK, 1 row affected (0.01 sec)

mysql> SELECT * FROM t8_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    2 |    2 |    2 |
+------+------+------+
1 row in set (0.00 sec)
```

- Example 9: Constraints handling

```sql
CREATE TABLE t9 (a INT PRIMARY KEY, b VARCHAR(5) UNIQUE KEY);
CREATE TABLE t9_1 (
  a INT PRIMARY KEY,
  b VARCHAR(5) UNIQUE,
  c INT, 
  d INT,
  FOREIGN KEY(c) REFERENCES t9(a),
  INDEX idx_d(d)
);
INSERT INTO t9 VALUES (101,'abc'),(102,'def');
INSERT INTO t9_1 VALUES (1,'zs1',101,1),(2,'zs2',102,1);

mysql> CREATE TABLE t9_2 AS SELECT * FROM t9_1; -- Constraints not copied
Query OK, 2 rows affected (0.01 sec)

mysql> SHOW CREATE TABLE t9_1; -- Original table with constraints
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                   |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_1  | CREATE TABLE `t9_1` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d` (`d`),
CONSTRAINT `018f27eb-0b33-7289-a3c2-af479b1833b1` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> SHOW CREATE TABLE t9_2; -- New table lacks constraints
+-------+-------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                      |
+-------+-------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL
) |
+-------+-------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- Manually add constraints
ALTER TABLE t9_2 ADD PRIMARY KEY (a);
ALTER TABLE t9_2 ADD UNIQUE KEY (b);
ALTER TABLE t9_2 ADD FOREIGN KEY (c) REFERENCES t9 (a);
ALTER TABLE t9_2 ADD INDEX idx_d3 (d);

mysql> SHOW CREATE TABLE t9_2; -- With added constraints
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                    |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d3` (`d`),
CONSTRAINT `018f282d-4563-7e9d-9be5-79c0d0e8136d` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```