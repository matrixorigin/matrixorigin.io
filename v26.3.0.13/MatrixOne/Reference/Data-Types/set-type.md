---
title: "SET Type"
doc_type: reference
mysql_compat: partial
differs_from_mysql: ["SELECT displays numeric bitmask values, not string representations; WHERE filtering requires numeric values (not string member names); ALTER MODIFY shrink member list is rejected"]
mo_only: false
since: v3.0.12
last_updated: 2026-05-19
llms_summary: "The SET type stores a set of predefined string values as a bitmask, supporting INSERT by name or numeric index, LOAD DATA, DISTINCT, GROUP BY, and ALTER MODIFY to expand members."
---

# SET Type

> The SET type stores a set of predefined string values as a compact bitmask. Each column's member list is defined at table creation time. Values can be inserted by name (e.g. `'red,blue'`) or numeric index sum. SELECT displays the numeric bitmask value, not string member names. WHERE filtering requires numeric comparisons (e.g. `WHERE colors = 3` for red+green). ALTER MODIFY can expand but not shrink the member list.

## Syntax

```
SET('value1', 'value2', ..., 'valueN')
```

A SET column can hold zero or more members from its definition list. Internally, each member corresponds to a bit position (1, 2, 4, 8, ...), and the stored value is the bitwise OR of all present members. For example, with `SET('red','green','blue')`, `'red,blue'` is stored as `1 | 4 = 5`.

## Arguments

| Parameter | Description |
|---|---|
| `value1, value2, ..., valueN` | Comma-separated list of string members. Maximum 64 members per SET. |

## Usage Notes

- When inserting by name, members are matched case-insensitively.
- Inserting a member not in the definition list produces an error.
- Empty string `''` represents an empty set (no members selected).
- NULL is distinct from the empty set.
- `ALTER TABLE MODIFY COLUMN` can expand the member list (add new members) but is rejected if the new list removes any member that was in the previous definition.
- SET columns can be indexed and used in `DISTINCT` and `GROUP BY` clauses.

## Examples

```
DROP DATABASE IF EXISTS set_demo_db;
CREATE DATABASE set_demo_db;
USE set_demo_db;

CREATE TABLE set01 (
    id INT PRIMARY KEY,
    colors SET('red', 'green', 'blue')
);

-- Insert by name
INSERT INTO set01 VALUES (1, 'red'), (2, 'blue,red'), (3, ''), (4, NULL);

-- Insert by numeric index (red=1, green=2, blue=4, so 3 = red+green)
INSERT INTO set01 VALUES (5, 3);

SELECT * FROM set01 ORDER BY id;
-- SELECT displays numeric bitmask values: (1,1), (2,5), (3,0), (4,NULL), (5,3)

-- Filter by set value (SET columns store as numeric bitmask; use numeric values for WHERE)
-- red=1, green=2, blue=4, so 'red,green' = 1+2 = 3
SELECT * FROM set01 WHERE colors = 3 ORDER BY id;

-- Inserting an invalid member produces an error
-- Expected-Success: false
INSERT INTO set01 VALUES (6, 'yellow');
-- ERROR: invalid set value 'yellow'

-- ALTER MODIFY to expand members (succeeds)
ALTER TABLE set01 MODIFY COLUMN colors SET('red','green','blue','yellow');
INSERT INTO set01 VALUES (7, 'red,yellow');
SELECT * FROM set01 WHERE id = 7;

DROP TABLE set01;

-- ALTER MODIFY to shrink members is rejected
CREATE TABLE set_modify (id INT PRIMARY KEY, tags SET('a','b','c'));
INSERT INTO set_modify VALUES (1, 'a,c'), (2, 'b');
-- Expected-Success: false
ALTER TABLE set_modify MODIFY COLUMN tags SET('a','b');
-- ERROR: cannot shrink SET member list

DROP TABLE set_modify;

-- DISTINCT and GROUP BY on SET column
CREATE TABLE set02 (
    id INT PRIMARY KEY,
    colors SET('red', 'green', 'blue')
);
INSERT INTO set02 VALUES (1, 'red'), (2, 'red,green'), (3, 'red'), (4, 'blue');
SELECT DISTINCT colors FROM set02 ORDER BY colors;
SELECT colors, COUNT(*) AS cnt FROM set02 GROUP BY colors ORDER BY colors;

DROP TABLE set02;

-- SET with DEFAULT
CREATE TABLE set03 (
    id INT PRIMARY KEY,
    tags SET('x', 'y') NOT NULL DEFAULT 'x'
);
INSERT INTO set03 VALUES (1, DEFAULT);
INSERT INTO set03 VALUES (2, 3);
SELECT * FROM set03 ORDER BY id;

DROP TABLE set03;
DROP DATABASE set_demo_db;
```
