---
title: "MySQL Compatibility Matrix"
mysql_compat: full
---

# MySQL Compatibility Matrix

> Auto-generated from `mysql_compat` frontmatter across
> `docs/MatrixOne/Reference/SQL-Reference/**`. Do not edit by hand —
> re-run `node scripts/generate-compat-matrix.js` after updating any
> source page.

## Summary

| Status | Count |
|---|---|
| ✅ Full | 21 |
| ⚠️ Partial | 58 |
| ❌ None | 1 |
| 🟣 MatrixOne-only | 53 |
| ❓ Unknown | 0 |
| **Total** | **133** |

## Data Definition Language (DDL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [ALTER PITR](./SQL-Reference/Data-Definition-Language/alter-pitr.md) | 🟣 MatrixOne-only | — | ALTER PITR |
| [ALTER PUBLICATION](./SQL-Reference/Data-Definition-Language/alter-publication.md) | 🟣 MatrixOne-only | — | ALTER PUBLICATION |
| [ALTER REINDEX](./SQL-Reference/Data-Definition-Language/alter-reindex.md) | 🟣 MatrixOne-only | — | ALTER … REINDEX (rebuild vector index) |
| [ALTER SEQUENCE](./SQL-Reference/Data-Definition-Language/alter-sequence.md) | 🟣 MatrixOne-only | — | ALTER SEQUENCE |
| [ALTER STAGE](./SQL-Reference/Data-Definition-Language/alter-stage.md) | 🟣 MatrixOne-only | — | ALTER STAGE |
| [ALTER TABLE](./SQL-Reference/Data-Definition-Language/alter-table.md) | ⚠️ Partial | Multiple ALTER TABLE operations can be combined in one statement, with limitation: DROP PRIMARY KEY cannot be combined with RENAME COLUMN, CHANGE COLUMN, or DROP COLUMN (causes server panic); DROP PK + ADD COLUMN and DROP PK + MODIFY COLUMN work correctly<br/>Temporary tables cannot be altered<br/>ALTER TABLE does not support PARTITION operations | — |
| [ALTER VIEW](./SQL-Reference/Data-Definition-Language/alter-view.md) | ⚠️ Partial | WITH CHECK OPTION is accepted in CREATE VIEW (syntax only, views are read-only) but rejected as a syntax error in ALTER VIEW | — |
| [Branch Protect Snapshots](./SQL-Reference/Data-Definition-Language/branch-protect-snapshots.md) | 🟣 MatrixOne-only | — | — |
| [CREATE CLONE](./SQL-Reference/Data-Definition-Language/create-clone.md) | 🟣 MatrixOne-only | — | CREATE TABLE … CLONE db.table [TO ACCOUNT …] |
| [CREATE CLUSTER TABLE](./SQL-Reference/Data-Definition-Language/create-cluster-table.md) | 🟣 MatrixOne-only | — | CREATE CLUSTER TABLE |
| [CREATE DATABASE](./SQL-Reference/Data-Definition-Language/create-database.md) | ⚠️ Partial | Only utf8mb4 / utf8mb4_bin are functional; other charsets/collations are syntactically accepted but have no effect<br/>ENCRYPTION clause accepted but inert | — |
| [CREATE DYNAMIC TABLE](./SQL-Reference/Data-Definition-Language/create-dynamic-table.md) | 🟣 MatrixOne-only | — | CREATE DYNAMIC TABLE |
| [CREATE EXTERNAL TABLE](./SQL-Reference/Data-Definition-Language/create-external-table.md) | 🟣 MatrixOne-only | — | CREATE EXTERNAL TABLE |
| [Create Fulltext Index](./SQL-Reference/Data-Definition-Language/create-fulltext-index.md) | ⚠️ Partial | MatrixOne full-text index is implemented on TAE storage with CJK/English optimizations; MySQL implements it on InnoDB/MyISAM with different stopword and parser semantics. | — |
| [CREATE FUNCTION...LANGUAGE PYTHON AS](./SQL-Reference/Data-Definition-Language/create-function-python.md) | 🟣 MatrixOne-only | — | CREATE FUNCTION … LANGUAGE PYTHON AS … |
| [CREATE FUNCTION...LANGUAGE SQL AS](./SQL-Reference/Data-Definition-Language/create-function-sql.md) | ⚠️ Partial | Only LANGUAGE SQL and LANGUAGE PYTHON are supported; usage differs significantly from MySQL stored functions<br/>CREATE OR REPLACE FUNCTION is supported; MySQL 8.0 does not support OR REPLACE for functions (only IF NOT EXISTS since 8.0.29) | — |
| [CREATE INDEX](./SQL-Reference/Data-Definition-Language/create-index.md) | ⚠️ Partial | Secondary indexes are supported and participate in query optimization (as of MO 3.0.12, EXPLAIN shows Index Table Scan for secondary index queries). Does not support index hints (USE INDEX, FORCE INDEX, IGNORE INDEX), function-based indexes, or FULLTEXT index via CREATE INDEX syntax (use CREATE FULLTEXT INDEX instead). | USING IVFFLAT — vector index for approximate nearest neighbour<br/>USING HNSW — vector index for approximate nearest neighbour<br/>USING MASTER — composite master index |
| [CREATE INDEX USING HNSW](./SQL-Reference/Data-Definition-Language/create-index-hnsw.md) | 🟣 MatrixOne-only | — | CREATE INDEX … USING HNSW |
| [CREATE INDEX USING IVFFLAT](./SQL-Reference/Data-Definition-Language/create-index-ivfflat.md) | 🟣 MatrixOne-only | — | CREATE INDEX … USING IVFFLAT |
| [CREATE PITR](./SQL-Reference/Data-Definition-Language/create-pitr.md) | 🟣 MatrixOne-only | — | CREATE PITR … RANGE N {h\|d\|mo\|y} |
| [CREATE PUBLICATION](./SQL-Reference/Data-Definition-Language/create-publication.md) | 🟣 MatrixOne-only | — | CREATE PUBLICATION |
| [CREATE SEQUENCE](./SQL-Reference/Data-Definition-Language/create-sequence.md) | 🟣 MatrixOne-only | — | CREATE SEQUENCE (PostgreSQL-style) |
| [CREATE SNAPSHOT](./SQL-Reference/Data-Definition-Language/create-snapshot.md) | 🟣 MatrixOne-only | — | CREATE SNAPSHOT FOR {ACCOUNT\|DATABASE\|TABLE\|CLUSTER} |
| [CREATE SOURCE](./SQL-Reference/Data-Definition-Language/create-source.md) | 🟣 MatrixOne-only | — | CREATE SOURCE (stream/Kafka connector) |
| [CREATE STAGE](./SQL-Reference/Data-Definition-Language/create-stage.md) | 🟣 MatrixOne-only | — | CREATE STAGE (external file-system binding) |
| [CREATE TABLE](./SQL-Reference/Data-Definition-Language/create-table.md) | ⚠️ Partial | ENGINE= clause is syntactically accepted but ignored; MatrixOne uses TAE exclusively<br/>Spatial type names (GEOMETRY, POINT, etc.) are syntactically accepted but non-functional; MEDIUMINT is syntactically accepted but treated as INT<br/>BOOL is a native boolean type, not an INT alias as in MySQL<br/>AUTO_INCREMENT step is always 1; @@auto_increment_increment is syntactically accepted but inert<br/>Partitioning accepts syntax but only HASH and KEY participate in partition pruning (RANGE/LIST/RANGE COLUMNS/LIST COLUMNS are syntax-only); subpartitioning causes an internal error; ADD/DROP/TRUNCATE PARTITION not supported<br/>CHECK constraints are syntactically accepted but not enforced; MySQL 8.0.16+ enforces them | CLUSTER BY (col, …) — pre-sort columns to accelerate queries<br/>START TRANSACTION table option — non-standard table option with no MySQL 8.0 equivalent |
| [CREATE TABLE ... LIKE](./SQL-Reference/Data-Definition-Language/create-table-like.md) | ✅ Full | — | — |
| [CREATE TABLE AS SELECT](./SQL-Reference/Data-Definition-Language/create-table-as-select.md) | ✅ Full | — | — |
| [CREATE TASK (SQL Task)](./SQL-Reference/Data-Definition-Language/sql-task.md) | 🟣 MatrixOne-only | — | CREATE TASK / ALTER TASK / DROP TASK / EXECUTE TASK / SHOW TASKS (MO-specific scheduled SQL tasks; MySQL uses CREATE EVENT instead) |
| [CREATE VIEW](./SQL-Reference/Data-Definition-Language/create-view.md) | ⚠️ Partial | WITH CHECK OPTION is syntactically accepted but not enforced<br/>Views are read-only; MySQL 8.0 supports INSERT/UPDATE/DELETE through views that meet updatability criteria | — |
| [CREATE...FROM...PUBLICATION...](./SQL-Reference/Data-Definition-Language/create-subscription.md) | 🟣 MatrixOne-only | — | CREATE DATABASE … FROM … PUBLICATION … |
| [DATA BRANCH CREATE](./SQL-Reference/Data-Definition-Language/data-branch-create-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH CREATE (Git-for-Data) |
| [DATA BRANCH DELETE](./SQL-Reference/Data-Definition-Language/data-branch-delete-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH DELETE |
| [DATA BRANCH DIFF](./SQL-Reference/Data-Definition-Language/data-branch-diff-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH DIFF |
| [DATA BRANCH MERGE](./SQL-Reference/Data-Definition-Language/data-branch-merge-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH MERGE |
| [DATA BRANCH PICK](./SQL-Reference/Data-Definition-Language/data-branch-pick.md) | 🟣 MatrixOne-only | — | DATA BRANCH PICK (cherry-pick specific rows between branch tables, Git-for-Data feature) |
| [DROP DATABASE](./SQL-Reference/Data-Definition-Language/drop-database.md) | ✅ Full | — | — |
| [DROP FUNCTION](./SQL-Reference/Data-Definition-Language/drop-function.md) | ⚠️ Partial | Drops MatrixOne-style SQL / Python functions, not MySQL stored procedures/functions<br/>Requires argument type list on DROP (e.g. DROP FUNCTION py_add(int, int)); MySQL 8.0 accepts only the function name | — |
| [DROP INDEX](./SQL-Reference/Data-Definition-Language/drop-index.md) | ⚠️ Partial | MO accepts DROP INDEX IF EXISTS syntax (MySQL 8.0 does not), but IF EXISTS does not suppress errors for missing indexes; it returns internal error 20101 instead of a silent skip | — |
| [DROP PITR](./SQL-Reference/Data-Definition-Language/drop-pitr.md) | 🟣 MatrixOne-only | — | DROP PITR |
| [DROP PUBLICATION](./SQL-Reference/Data-Definition-Language/drop-publication.md) | 🟣 MatrixOne-only | — | DROP PUBLICATION |
| [DROP SEQUENCE](./SQL-Reference/Data-Definition-Language/drop-sequence.md) | 🟣 MatrixOne-only | — | DROP SEQUENCE |
| [DROP SNAPSHOT](./SQL-Reference/Data-Definition-Language/drop-snapshot.md) | 🟣 MatrixOne-only | — | DROP SNAPSHOT |
| [DROP STAGE](./SQL-Reference/Data-Definition-Language/drop-stage.md) | 🟣 MatrixOne-only | — | DROP STAGE |
| [DROP TABLE](./SQL-Reference/Data-Definition-Language/drop-table.md) | ✅ Full | — | — |
| [DROP VIEW](./SQL-Reference/Data-Definition-Language/drop-view.md) | ⚠️ Partial | MO does not support dropping multiple views in a single statement; only a single view per DROP VIEW. MySQL 8.0 supports dropping multiple views (e.g., DROP VIEW v1, v2). | — |
| [Rename Table](./SQL-Reference/Data-Definition-Language/rename-table.md) | ⚠️ Partial | MO does not support RENAME TABLE across databases; when given cross-database syntax, MO renames the table within its current database instead of raising an error. MySQL 8.0 supports cross-database RENAME TABLE. | — |
| [RESTORE ... FROM PITR](./SQL-Reference/Data-Definition-Language/restore-pitr.md) | 🟣 MatrixOne-only | — | RESTORE … FROM PITR |
| [RESTORE ... SNAPSHOT](./SQL-Reference/Data-Definition-Language/restore-snapshot.md) | 🟣 MatrixOne-only | — | RESTORE … FROM SNAPSHOT |
| [TRUNCATE TABLE](./SQL-Reference/Data-Definition-Language/truncate-table.md) | ✅ Full | — | — |

## Data Manipulation Language (DML)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [CASE](./SQL-Reference/Data-Manipulation-Language/case.md) | ✅ Full | This page describes the CASE operator (expression), not the stored-program CASE statement. MatrixOne does not support stored programs, so the stored-program CASE STATEMENT is unavailable; the CASE OPERATOR behaves compatibly. | — |
| [CURRENT_ROLE()](./SQL-Reference/Data-Manipulation-Language/information-functions/current_role.md) | ⚠️ Partial | Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'. | — |
| [DELETE](./SQL-Reference/Data-Manipulation-Language/delete.md) | ⚠️ Partial | LOW_PRIORITY, QUICK, IGNORE modifiers are syntactically accepted but have no effect<br/>PARTITION clause not supported | — |
| [INSERT](./SQL-Reference/Data-Manipulation-Language/insert.md) | ⚠️ Partial | Modifiers LOW_PRIORITY / DELAYED / HIGH_PRIORITY not supported<br/>PARTITION clause not supported | — |
| [INSERT ... ON DUPLICATE KEY UPDATE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-on-duplicate.md) | ⚠️ Partial | ON DUPLICATE KEY UPDATE only triggers on PRIMARY KEY conflicts; UNIQUE index conflicts are detected but result in errors (ERROR 1062 or ERROR 20102) rather than triggering ON DUPLICATE KEY UPDATE | — |
| [INSERT IGNORE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-ignore.md) | ⚠️ Partial | LOW_PRIORITY / DELAYED / HIGH_PRIORITY modifiers not supported<br/>Duplicates are silently ignored; MySQL emits a warning for each skipped row.<br/>Does not ignore NULL-into-NOT-NULL, type-conversion, or partition-mismatch errors as MySQL does.<br/>PARTITION clause not supported | — |
| [INSERT INTO SELECT](./SQL-Reference/Data-Manipulation-Language/insert-into-select.md) | ✅ Full | — | — |
| [LAST_INSERT_ID()](./SQL-Reference/Data-Manipulation-Language/information-functions/last-insert-id.md) | ⚠️ Partial | Multi-row INSERT returns the last inserted auto-increment value; MySQL returns the first inserted value. | — |
| [LAST_QUERY_ID](./SQL-Reference/Data-Manipulation-Language/information-functions/last-query-id.md) | 🟣 MatrixOne-only | — | LAST_QUERY_ID() |
| [LOAD DATA](./SQL-Reference/Data-Manipulation-Language/load-data-infile.md) | ⚠️ Partial | SET clause only accepts columns_name = nullif(expr1, expr2)<br/>JSONLines import uses MatrixOne-specific syntax<br/>Object-storage import (S3/URL) uses MatrixOne-specific syntax<br/>LOW_PRIORITY and CONCURRENT modifiers not supported<br/>REPLACE and IGNORE modifiers not supported | PARALLEL clause (controls parallel file loading)<br/>STRICT clause (controls parallel splitting mode) |
| [LOAD DATA INLINE](./SQL-Reference/Data-Manipulation-Language/load-data-inline.md) | 🟣 MatrixOne-only | — | LOAD DATA INLINE (stage-sourced import) |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/replace.md) | ⚠️ Partial | node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne)<br/>PARTITION clause not supported<br/>LOW_PRIORITY and DELAYED modifiers not supported<br/>REPLACE only detects conflicts on PRIMARY KEY; secondary UNIQUE index conflicts throw ERROR 1062 (MySQL 8.0 handles both). Constraints section incorrectly states UNIQUE index can also trigger REPLACE; this is wrong per actual MO behavior. | — |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/upsert/replace.md) | ⚠️ Partial | node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne)<br/>PARTITION clause not supported<br/>LOW_PRIORITY and DELAYED modifiers not supported<br/>REPLACE only detects conflicts on PRIMARY KEY; secondary UNIQUE index conflicts throw ERROR 1062 (MySQL 8.0 handles both). Constraints section incorrectly states UNIQUE index can also trigger REPLACE; this is wrong per actual MO behavior. | — |
| [UPDATE](./SQL-Reference/Data-Manipulation-Language/update.md) | ⚠️ Partial | LOW_PRIORITY and IGNORE modifiers are syntactically accepted but have no effect<br/>PARTITION clause not supported | — |
| [UPSERT](./SQL-Reference/Data-Manipulation-Language/upsert/upsert.md) | ⚠️ Partial | INSERT IGNORE does not suppress NOT NULL or type-conversion errors (MySQL 8.0 does)<br/>INSERT ON DUPLICATE KEY UPDATE only triggers on PRIMARY KEY conflicts; UNIQUE index conflicts are detected but result in errors (ERROR 1062 or ERROR 20102) rather than triggering ON DUPLICATE KEY UPDATE<br/>REPLACE does not support REPLACE ... WHERE (parser bug) | — |

## Data Query Language (DQL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [BY RANK WITH OPTION](./SQL-Reference/Data-Query-Language/by-rank-with-option.md) | 🟣 MatrixOne-only | — | BY RANK WITH OPTION (IVF vector ranking) |
| [Combining Queries (UNION, INTERSECT, MINUS)](./SQL-Reference/Data-Query-Language/union-intersect-minus-overview.md) | ⚠️ Partial | MINUS keyword is MO-specific; MySQL 8.0.31+ uses EXCEPT for the same set-difference semantics. MINUS ALL is not yet implemented in MO while MySQL 8.0.31+ supports EXCEPT ALL.<br/>INTERSECT was added in MySQL 8.0.31; both MO and MySQL support INTERSECT and INTERSECT ALL with matching semantics.<br/>UNION is standard across both, but MO's type coercion in UNION columns is stricter (errors on incompatible types where MySQL silently coerces). | MINUS keyword (MO-specific syntax; MySQL 8.0.31+ offers equivalent EXCEPT) |
| [Comparisons Using Subqueries](./SQL-Reference/Data-Query-Language/subqueries/comparisons-using-subqueries.md) | ✅ Full | — | — |
| [CROSS APPLY](./SQL-Reference/Data-Query-Language/apply/cross-apply.md) | 🟣 MatrixOne-only | — | CROSS APPLY (SQL Server-style, not in MySQL) |
| [CROSS JOIN](./SQL-Reference/Data-Query-Language/join/cross-join.md) | ✅ Full | — | — |
| [Derived Tables](./SQL-Reference/Data-Query-Language/subqueries/derived-tables.md) | ⚠️ Partial | LATERAL derived tables are not supported in MO (MySQL 8.0.14+ supports LATERAL for correlated subqueries in FROM clause) | — |
| [FULL JOIN](./SQL-Reference/Data-Query-Language/join/full-join.md) | ❌ None | FULL JOIN with ON clause produces different errors on MO (missing FROM-clause entry) vs MySQL 8.0 (Unknown column in ON clause). FULL JOIN with USING returns INNER JOIN results on both (neither returns unmatched rows). FULL OUTER JOIN produces a syntax error on both. MySQL 8.0 does not natively support either FULL JOIN or FULL OUTER JOIN. | — |
| [INNER JOIN](./SQL-Reference/Data-Query-Language/join/inner-join.md) | ✅ Full | — | — |
| [INTERSECT](./SQL-Reference/Data-Query-Language/intersect.md) | ⚠️ Partial | INTERSECT was added in MySQL 8.0.31; MO INTERSECT and INTERSECT ALL semantics match MySQL 8.0 (both return identical results for common test cases including duplicate handling) | — |
| [JOIN](./SQL-Reference/Data-Query-Language/join/join.md) | ⚠️ Partial | FULL JOIN and FULL OUTER JOIN are not fully supported (FULL JOIN with ON produces errors, FULL JOIN with USING returns INNER JOIN results, FULL OUTER JOIN is a syntax error); MySQL 8.0 also does not support FULL JOIN/OUTER JOIN natively | — |
| [LEFT JOIN](./SQL-Reference/Data-Query-Language/join/left-join.md) | ✅ Full | — | — |
| [MINUS](./SQL-Reference/Data-Query-Language/minus.md) | 🟣 MatrixOne-only | MINUS keyword is MO-specific; MySQL 8.0.31+ uses EXCEPT for the same set-difference semantics (MINUS is not a recognized keyword in MySQL)<br/>MINUS ALL is not yet implemented in MO; MySQL 8.0.31+ supports EXCEPT ALL with full duplicate-preserving semantics | MINUS keyword (MO's set-difference operator; MySQL 8.0.31+ offers equivalent functionality via EXCEPT) |
| [NATURAL JOIN](./SQL-Reference/Data-Query-Language/join/natural-join.md) | ✅ Full | — | — |
| [OUTER APPLY](./SQL-Reference/Data-Query-Language/apply/outer-apply.md) | 🟣 MatrixOne-only | — | OUTER APPLY (SQL Server-style, not in MySQL) |
| [OUTER JOIN](./SQL-Reference/Data-Query-Language/join/outer-join.md) | ⚠️ Partial | Overview page that includes FULL OUTER JOIN; neither MO nor MySQL 8.0 natively support FULL OUTER JOIN (MO produces syntax error, same as MySQL) | — |
| [RIGHT JOIN](./SQL-Reference/Data-Query-Language/join/right-join.md) | ✅ Full | — | — |
| [SELECT](./SQL-Reference/Data-Query-Language/select.md) | ⚠️ Partial | SELECT … FOR UPDATE only supports single-table queries<br/>SELECT INTO OUTFILE is only partially supported<br/>AS OF TIMESTAMP time-travel queries require PITR/snapshot to be enabled on the database; without PITR the syntax produces an error<br/>SELECT ... FOR SHARE is not supported<br/>FOR UPDATE NOWAIT and SKIP LOCKED modifiers are not supported<br/>GROUP BY ... WITH ROLLUP row ordering differs: MO places rollup summary rows at the top of the result set, while MySQL 8.0 places them at the bottom (standard MySQL grouping order) | { AS OF TIMESTAMP 'YYYY-MM-DD HH:MM:SS' } — time-travel query against enabled snapshot/PITR<br/>ORDER BY ... NULLS { FIRST \| LAST } — PostgreSQL-style NULL ordering not available in MySQL |
| [Subqueries with ALL](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-all.md) | ✅ Full | — | — |
| [Subqueries with ANY or SOME](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-any-some.md) | ✅ Full | — | — |
| [Subqueries with EXISTS or NOT EXISTS](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-exists.md) | ✅ Full | — | — |
| [Subqueries with IN](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-in.md) | ✅ Full | — | — |
| [SUBQUERY](./SQL-Reference/Data-Query-Language/subqueries/subquery.md) | ⚠️ Partial | Multi-column scalar subquery comparisons (e.g., WHERE (a,b) = (SELECT ...)) are not supported; use multi-column IN instead | — |
| [UNION](./SQL-Reference/Data-Query-Language/union.md) | ⚠️ Partial | UNION type coercion is strict: MO errors on incompatible types in UNION columns (e.g., INT vs VARCHAR), while MySQL 8.0 silently coerces (e.g., varchar to int converts to 0)<br/>UNION ALL type coercion is similarly strict compared to MySQL 8.0's lenient coercion | — |
| [WITH (Common Table Expressions)](./SQL-Reference/Data-Query-Language/with-cte.md) | ⚠️ Partial | Outer joins (LEFT JOIN, RIGHT JOIN, OUTER JOIN) are not allowed in recursive CTE members; MySQL 8.0 permits them except when the recursive CTE is on the right side of a LEFT JOIN (MySQL allows LEFT JOIN with CTE on the left side; MO rejects all outer joins in recursive CTEs regardless of position) | — |

## Data Control Language (DCL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [ALTER ACCOUNT](./SQL-Reference/Data-Control-Language/alter-account.md) | 🟣 MatrixOne-only | — | ALTER ACCOUNT |
| [ALTER USER](./SQL-Reference/Data-Control-Language/alter-user.md) | ⚠️ Partial | Only ALTER USER can change passwords; account-limit clauses not honoured<br/>Password management options (PASSWORD EXPIRE, PASSWORD HISTORY, PASSWORD REUSE INTERVAL, PASSWORD REQUIRE CURRENT, FAILED_LOGIN_ATTEMPTS, PASSWORD_LOCK_TIME) not supported<br/>Account locking (ACCOUNT LOCK/UNLOCK) not supported<br/>REQUIRE clause (TLS/SSL enforcement) not supported<br/>COMMENT and ATTRIBUTE modification not supported<br/>Multiple users per statement not supported (MySQL 8.0 allows user [, user] ...) | — |
| [CREATE ACCOUNT](./SQL-Reference/Data-Control-Language/create-account.md) | 🟣 MatrixOne-only | — | CREATE ACCOUNT … ADMIN_NAME … |
| [CREATE ROLE](./SQL-Reference/Data-Control-Language/create-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. | — |
| [CREATE USER](./SQL-Reference/Data-Control-Language/create-user.md) | ⚠️ Partial | IDENTIFIED BY is the only supported password form; IDENTIFIED WITH plugins not supported<br/>Connection-IP whitelists and connection-limit clauses not supported<br/>COMMENT and ATTRIBUTE clauses not supported<br/>'user'@'host' syntax is accepted and host is stored in mo_catalog.mo_user.user_host but may not restrict connections; users are scoped to the current account, not server-global as in MySQL<br/>Password management options (PASSWORD EXPIRE, PASSWORD HISTORY, PASSWORD REUSE INTERVAL, PASSWORD REQUIRE CURRENT) not supported<br/>Account locking (ACCOUNT LOCK/UNLOCK) not supported<br/>REQUIRE clause (TLS/SSL enforcement) not supported | — |
| [DROP ACCOUNT](./SQL-Reference/Data-Control-Language/drop-account.md) | 🟣 MatrixOne-only | — | DROP ACCOUNT |
| [DROP ROLE](./SQL-Reference/Data-Control-Language/drop-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. | — |
| [DROP USER](./SQL-Reference/Data-Control-Language/drop-user.md) | ⚠️ Partial | User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples. | — |
| [GRANT](./SQL-Reference/Data-Control-Language/grant.md) | ⚠️ Partial | Authorization logic differs from MySQL — MatrixOne evaluates via its role/account model<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>AS user [WITH ROLE ...] clause (MySQL 8.0 privilege restriction) not supported<br/>GRANT privilege ... TO only accepts roles; users receive privileges indirectly through role membership (GRANT role TO user)<br/>WITH ADMIN OPTION for role grants is not supported | `GRANT ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>`GRANT ... ON DATABASE *` — MatrixOne-specific database-level grant target<br/>GRANT ... ON VIEW db_name.view_name (separate VIEW object_type; MySQL 8.0 only supports TABLE, FUNCTION, PROCEDURE) |
| [REVOKE](./SQL-Reference/Data-Control-Language/revoke.md) | ⚠️ Partial | Recovery logic differs from MySQL — privileges return to the role/account graph<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>IGNORE UNKNOWN USER clause (MySQL 8.0.30+) not supported | `REVOKE ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>`REVOKE ... ON DATABASE *` — MatrixOne-specific database-level revoke target<br/>REVOKE ... ON VIEW db_name.view_name (separate VIEW object_type) |
| [Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)](./SQL-Reference/Data-Control-Language/role-rule.md) | 🟣 MatrixOne-only | — | — |

## Other

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [DEALLOCATE PREPARE](./SQL-Reference/Other/Prepared-Statements/deallocate.md) | ⚠️ Partial | DEALLOCATE PREPARE on a non-existent statement silently succeeds; MySQL returns ERROR 1243 (Unknown prepared statement handler). | — |
| [DESCRIBE / DESC](./SQL-Reference/Other/describe.md) | ⚠️ Partial | DESCRIBE/DESC output includes an extra `Comment` column (7 columns total vs MySQL's 6).<br/>Type names are displayed in uppercase with display widths (e.g., `INT(32)`, `FLOAT(0)`, `TIMESTAMP(0)`) instead of MySQL's lowercase without widths (e.g., `int`, `float`, `timestamp`).<br/>Column name filter (`DESC tbl_name col_name`) is non-functional; all columns are returned.<br/>Wild pattern (`DESC tbl_name 'pattern'`) not supported; produces syntax error.<br/>For TIMESTAMP columns with DEFAULT CURRENT_TIMESTAMP, MO does not show `DEFAULT_GENERATED` in the Extra column as MySQL does. | — |
| [EXECUTE](./SQL-Reference/Other/Prepared-Statements/execute.md) | ✅ Full | — | — |
| [EXPLAIN](./SQL-Reference/Other/Explain/explain.md) | ⚠️ Partial | Output format is a single QUERY PLAN column with tree-structured text (PostgreSQL-style); MySQL uses a multi-column tabular format with id, select_type, table, partitions, type, possible_keys, key, key_len, ref, rows, filtered, Extra<br/>JSON output (FORMAT=JSON) not supported; MO returns syntax error<br/>FORMAT=TREE and FORMAT=TRADITIONAL not supported; FORMAT=TEXT bare keyword also errors; only bare keyword forms (EXPLAIN, EXPLAIN ANALYZE, EXPLAIN VERBOSE) work<br/>EXPLAIN FOR CONNECTION not supported (returns internal error)<br/>EXPLAIN (ANALYZE TRUE/FALSE) and EXPLAIN (VERBOSE TRUE/FALSE) parenthesized boolean syntax WORKS in MO 3.0.12, contrary to doc claims; only parenthesized FORMAT syntax is unsupported | — |
| [EXPLAIN Output Format](./SQL-Reference/Other/Explain/explain-workflow.md) | ⚠️ Partial | Output is a single QUERY PLAN column with tree-structured text; MySQL uses multi-column tabular EXPLAIN format<br/>JSON output not supported<br/>Node types (Sink, Sink Scan, PreInsert, Fuzzy Filter, etc.) are MO-specific and have no MySQL equivalent | — |
| [EXPLAIN PREPARED](./SQL-Reference/Other/Explain/explain-prepared.md) | 🟣 MatrixOne-only | — | EXPLAIN FORCE EXECUTE stmt_name [USING @var] is a MatrixOne extension; MySQL explains prepared statements through EXPLAIN FOR CONNECTION. |
| [Get information with EXPLAIN ANALYZE](./SQL-Reference/Other/Explain/explain-analyze.md) | ⚠️ Partial | Output format mirrors PostgreSQL (QUERY PLAN tree with Analyze sub-lines showing timeConsumed, waitTime, inputRows, outputRows, InputSize, OutputSize, MemorySize); MySQL 8.0 EXPLAIN ANALYZE uses TREE format with cost estimation and actual time in a different structure<br/>JSON output not supported<br/>MO EXPLAIN ANALYZE produces one output row per plan tree line; MySQL produces a single row with the full plan | — |
| [KILL](./SQL-Reference/Other/kill.md) | ✅ Full | — | — |
| [PREPARE](./SQL-Reference/Other/Prepared-Statements/prepare.md) | ⚠️ Partial | MatrixOne cannot PREPARE SET, DO, or other TCL/DCL statements<br/>Repreparation on parameter type change may throw a cast error instead of silently converting the value (e.g., passing a string to an integer parameter). | — |
| [SET ROLE](./SQL-Reference/Other/Set/set-role.md) | ⚠️ Partial | Accepts a single role name only; MySQL 8.0 also supports NONE, DEFAULT, ALL, ALL EXCEPT role_list, and role lists. | SET SECONDARY ROLE {NONE \| ALL} — MatrixOne-only primary/secondary role model. |
| [SHOW ACCOUNTS](./SQL-Reference/Other/SHOW-Statements/show-account.md) | 🟣 MatrixOne-only | — | SHOW ACCOUNTS |
| [SHOW COLLATION](./SQL-Reference/Other/SHOW-Statements/show-collation.md) | ⚠️ Partial | Only utf8mb4_bin is effective; other collations appear but are inert<br/>MO 3.0.12 returns 11 collations (with `Default` and `Pad_attribute` columns); older doc examples show only 1 row with 5 columns<br/>Output columns (Collation, Charset, Id, Default, Compiled, Sortlen, Pad_attribute) differ slightly from MySQL which also includes Pad_attribute | — |
| [SHOW COLUMNS](./SQL-Reference/Other/SHOW-Statements/show-columns.md) | ⚠️ Partial | MO SHOW COLUMNS (without FULL) already includes the `Comment` column; MySQL only shows Comment with FULL<br/>MO SHOW FULL COLUMNS returns Collation and Privileges columns but Collation is always NULL<br/>MO accepts EXTENDED keyword (SHOW EXTENDED COLUMNS) and FIELDS synonym (SHOW FIELDS), both returning same columns as SHOW COLUMNS<br/>MO Type column includes display width (e.g. INT(32)) while MySQL shows just int | — |
| [SHOW CREATE DATABASE](./SQL-Reference/Other/SHOW-Statements/show-create-database.md) | ⚠️ Partial | Output omits CHARACTER SET, COLLATE, and ENCRYPTION clauses present in MySQL 8.0 SHOW CREATE DATABASE output | — |
| [SHOW CREATE PUBLICATION](./SQL-Reference/Other/SHOW-Statements/show-create-publication.md) | 🟣 MatrixOne-only | — | SHOW CREATE PUBLICATION |
| [SHOW CREATE TABLE](./SQL-Reference/Other/SHOW-Statements/show-create-table.md) | ⚠️ Partial | Output reflects MatrixOne-specific extensions (CLUSTER BY, USING IVFFLAT/HNSW, etc.)<br/>MO output omits ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci appended by MySQL | — |
| [SHOW CREATE VIEW](./SQL-Reference/Other/SHOW-Statements/show-create-view.md) | ⚠️ Partial | DEFINER = user clause absent from output; SQL SECURITY {DEFINER\|INVOKER} is emitted<br/>MO output lacks ALGORITHM=UNDEFINED clause that MySQL always includes<br/>MO does not fully qualify column references (MySQL outputs db.table.col AS alias)<br/>MO uses unquoted identifiers; MySQL backtick-quotes database, table, and column names<br/>The rendered Create View output shows `CREATE SQL SECURITY DEFINER VIEW` (not `CREATE ALGORITHM=UNDEFINED DEFINER=user SQL SECURITY DEFINER VIEW` as MySQL does) | — |
| [SHOW DATABASES](./SQL-Reference/Other/SHOW-Statements/show-databases.md) | ✅ Full | — | — |
| [SHOW FUNCTION STATUS](./SQL-Reference/Other/SHOW-Statements/show-function-status.md) | ⚠️ Partial | Lists MatrixOne SQL/Python functions; MySQL shows stored routines AND built-in sys schema functions (e.g. extract_schema_from_file_name, format_bytes)<br/>MO only shows user-defined functions; MySQL shows all functions including built-in ones | — |
| [SHOW GRANTS](./SQL-Reference/Other/SHOW-Statements/show-grants.md) | ⚠️ Partial | Grant syntax output is completely different: MO uses MO-specific format (GRANT create account ON account, GRANT table all ON table) instead of MySQL standard format (GRANT SELECT, INSERT, UPDATE, DELETE ON *.*)<br/>MO output includes backtick-quoted user@host inside grant statements; MySQL uses quoted user@host format with TO clause<br/>USING role_list clause not supported<br/>MO does not support SHOW GRANTS FOR CURRENT_USER (or CURRENT_USER()) as a shorthand for the current user | — |
| [SHOW INDEX](./SQL-Reference/Other/SHOW-Statements/show-index.md) | ⚠️ Partial | Reflects MatrixOne index model — secondary index rows appear but may not accelerate queries<br/>Index_type may be empty (MySQL typically shows BTREE)<br/>Index_comment column is present (MySQL 8.0 also has Index_comment; difference is minor)<br/>Index_params column is present (MySQL does not have this column)<br/>Expression column shows the column name for non-functional key parts; MySQL shows NULL for non-functional key parts<br/>MO SHOW INDEX returns 16 columns vs MySQL 15 columns (MO adds Index_params, lacks the extra Collation behavior) | — |
| [SHOW PITR](./SQL-Reference/Other/SHOW-Statements/show-pitrs.md) | 🟣 MatrixOne-only | — | SHOW PITR |
| [SHOW PROCESSLIST](./SQL-Reference/Other/SHOW-Statements/show-processlist.md) | ⚠️ Partial | MO returns 19 columns (node_id, conn_id, session_id, account, user, host, db, session_start, command, info, txn_id, statement_id, statement_type, query_type, sql_source_type, query_start, client_host, role, proxy_host) vs MySQL 8 columns (Id, User, Host, db, Command, Time, State, Info)<br/>MO column names differ completely: conn_id vs Id, session_start vs Time, no State column, MO adds txn_id/statement_id/statement_type/query_type/sql_source_type/query_start/client_host/role/proxy_host<br/>SHOW FULL PROCESSLIST is accepted by MO but returns same columns as SHOW PROCESSLIST (no behavioral difference) | — |
| [SHOW PUBLICATIONS](./SQL-Reference/Other/SHOW-Statements/show-publications.md) | 🟣 MatrixOne-only | — | SHOW PUBLICATIONS |
| [SHOW ROLES](./SQL-Reference/Other/SHOW-Statements/show-roles.md) | 🟣 MatrixOne-only | — | SHOW ROLES |
| [SHOW SEQUENCES](./SQL-Reference/Other/SHOW-Statements/show-sequences.md) | 🟣 MatrixOne-only | — | SHOW SEQUENCES |
| [SHOW STAGES](./SQL-Reference/Other/SHOW-Statements/show-stage.md) | 🟣 MatrixOne-only | — | SHOW STAGES |
| [SHOW SUBSCRIPTIONS](./SQL-Reference/Other/SHOW-Statements/show-subscriptions.md) | 🟣 MatrixOne-only | — | SHOW SUBSCRIPTIONS |
| [SHOW TABLE STATUS](./SQL-Reference/Other/SHOW-Statements/show-table-status.md) | ⚠️ Partial | Result columns differ from MySQL: MO has 19 cols (adds Role_id, Role_name; omits Version); MySQL has 18 cols (includes Version; no Role_id/Role_name)<br/>Engine column always shows Tae instead of InnoDB<br/>MO's Auto_increment defaults to 0 (MySQL shows NULL for tables without auto-increment)<br/>MO shows views in SHOW TABLE STATUS with Engine=NULL and Comment=VIEW (same as MySQL behavior) | — |
| [SHOW TABLES](./SQL-Reference/Other/SHOW-Statements/show-tables.md) | ⚠️ Partial | Output column header uses lowercase database name (Tables_in_<db> vs MySQL's Tables_in_<DB>)<br/>MO does not display a parenthesized LIKE pattern in the column header unlike MySQL | — |
| [SHOW VARIABLES](./SQL-Reference/Other/SHOW-Statements/show-variables.md) | ⚠️ Partial | System variables are mostly syntactic stubs; actual behaviour differs from MySQL<br/>GLOBAL and SESSION scope modifiers are syntactically accepted for both SET and SHOW; SHOW GLOBAL vs SHOW SESSION return different values when SESSION has been overridden, same as MySQL<br/>MO has a completely different set of variable names (e.g. testbotchvar_nodyn, testbothvar_dyn) alongside MySQL-compatible ones (autocommit, sql_mode)<br/>Variable values use lowercase ('on'/'off') while MySQL uses uppercase ('ON'/'OFF') | — |
| [USE](./SQL-Reference/Other/use-database.md) | ✅ Full | — | — |

## Uncategorized

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [Type of SQL Statements](./SQL-Reference/SQL-Type.md) | 🟣 MatrixOne-only | — | Index page describing MatrixOne's own SQL statement taxonomy; not a MySQL-equivalent concept. |
