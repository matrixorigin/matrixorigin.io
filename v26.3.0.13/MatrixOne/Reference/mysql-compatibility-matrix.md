---
title: "MySQL Compatibility Matrix"
mysql_compat: full
---

# MySQL Compatibility Matrix

> Auto-generated from `mysql_compat` frontmatter across
> `docs/MatrixOne/Reference/SQL-Reference/**`, `docs/MatrixOne/Reference/Functions-and-Operators/**`, `docs/MatrixOne/Reference/Operators/**`, `docs/MatrixOne/Reference/Data-Types/**`, `docs/MatrixOne/Reference/Language-Structure/**`.
> Do not edit by hand — re-run `node scripts/generate-compat-matrix.js`
> after updating any source page.

## Summary

| Status | Count |
|---|---|
| ✅ Full | 131 |
| ⚠️ Partial | 97 |
| ❌ None | 1 |
| 🟣 MatrixOne-only | 96 |
| ❓ Unknown | 48 |
| **Total** | **373** |

## SQL Statements

| Status | Count |
|---|---|
| ✅ Full | 21 |
| ⚠️ Partial | 58 |
| ❌ None | 1 |
| 🟣 MatrixOne-only | 53 |
| **Total** | **133** |

### SQL Statements

| Statement | MySQL Compat | Notes |
|---|---|---|
| [Type of SQL Statements](./SQL-Reference/SQL-Type.md) | 🟣 MatrixOne-only | [MO-only] Index page describing MatrixOne's own SQL statement taxonomy; not a MySQL-equivalent concept. |

### Data Control Language (DCL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [ALTER ACCOUNT](./SQL-Reference/Data-Control-Language/alter-account.md) | 🟣 MatrixOne-only | [MO-only] ALTER ACCOUNT |
| [ALTER USER](./SQL-Reference/Data-Control-Language/alter-user.md) | ⚠️ Partial | Only ALTER USER can change passwords; account-limit clauses not honoured<br/>Password management options (PASSWORD EXPIRE, PASSWORD HISTORY, PASSWORD REUSE INTERVAL, PASSWORD REQUIRE CURRENT, FAILED_LOGIN_ATTEMPTS, PASSWORD_LOCK_TIME) not supported<br/>Account locking (ACCOUNT LOCK/UNLOCK) not supported<br/>REQUIRE clause (TLS/SSL enforcement) not supported<br/>COMMENT and ATTRIBUTE modification not supported<br/>Multiple users per statement not supported (MySQL 8.0 allows user [, user] ...) |
| [CREATE ACCOUNT](./SQL-Reference/Data-Control-Language/create-account.md) | 🟣 MatrixOne-only | [MO-only] CREATE ACCOUNT … ADMIN_NAME … |
| [CREATE ROLE](./SQL-Reference/Data-Control-Language/create-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. |
| [CREATE USER](./SQL-Reference/Data-Control-Language/create-user.md) | ⚠️ Partial | IDENTIFIED BY is the only supported password form; IDENTIFIED WITH plugins not supported<br/>Connection-IP whitelists and connection-limit clauses not supported<br/>COMMENT and ATTRIBUTE clauses not supported<br/>'user'@'host' syntax is accepted and host is stored in mo_catalog.mo_user.user_host but may not restrict connections; users are scoped to the current account, not server-global as in MySQL<br/>Password management options (PASSWORD EXPIRE, PASSWORD HISTORY, PASSWORD REUSE INTERVAL, PASSWORD REQUIRE CURRENT) not supported<br/>Account locking (ACCOUNT LOCK/UNLOCK) not supported<br/>REQUIRE clause (TLS/SSL enforcement) not supported |
| [DROP ACCOUNT](./SQL-Reference/Data-Control-Language/drop-account.md) | 🟣 MatrixOne-only | [MO-only] DROP ACCOUNT |
| [DROP ROLE](./SQL-Reference/Data-Control-Language/drop-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. |
| [DROP USER](./SQL-Reference/Data-Control-Language/drop-user.md) | ⚠️ Partial | User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples. |
| [GRANT](./SQL-Reference/Data-Control-Language/grant.md) | ⚠️ Partial | Authorization logic differs from MySQL — MatrixOne evaluates via its role/account model<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>AS user [WITH ROLE ...] clause (MySQL 8.0 privilege restriction) not supported<br/>GRANT privilege ... TO only accepts roles; users receive privileges indirectly through role membership (GRANT role TO user)<br/>WITH ADMIN OPTION for role grants is not supported<br/>[MO-only] `GRANT ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>[MO-only] `GRANT ... ON DATABASE *` — MatrixOne-specific database-level grant target<br/>[MO-only] GRANT ... ON VIEW db_name.view_name (separate VIEW object_type; MySQL 8.0 only supports TABLE, FUNCTION, PROCEDURE) |
| [REVOKE](./SQL-Reference/Data-Control-Language/revoke.md) | ⚠️ Partial | Recovery logic differs from MySQL — privileges return to the role/account graph<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>IGNORE UNKNOWN USER clause (MySQL 8.0.30+) not supported<br/>[MO-only] `REVOKE ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>[MO-only] `REVOKE ... ON DATABASE *` — MatrixOne-specific database-level revoke target<br/>[MO-only] REVOKE ... ON VIEW db_name.view_name (separate VIEW object_type) |
| [Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)](./SQL-Reference/Data-Control-Language/role-rule.md) | 🟣 MatrixOne-only | — |

### Data Definition Language (DDL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [ALTER PITR](./SQL-Reference/Data-Definition-Language/alter-pitr.md) | 🟣 MatrixOne-only | [MO-only] ALTER PITR |
| [ALTER PUBLICATION](./SQL-Reference/Data-Definition-Language/alter-publication.md) | 🟣 MatrixOne-only | [MO-only] ALTER PUBLICATION |
| [ALTER REINDEX](./SQL-Reference/Data-Definition-Language/alter-reindex.md) | 🟣 MatrixOne-only | [MO-only] ALTER … REINDEX (rebuild vector index) |
| [ALTER SEQUENCE](./SQL-Reference/Data-Definition-Language/alter-sequence.md) | 🟣 MatrixOne-only | [MO-only] ALTER SEQUENCE |
| [ALTER STAGE](./SQL-Reference/Data-Definition-Language/alter-stage.md) | 🟣 MatrixOne-only | [MO-only] ALTER STAGE |
| [ALTER TABLE](./SQL-Reference/Data-Definition-Language/alter-table.md) | ⚠️ Partial | Multiple ALTER TABLE operations can be combined in one statement, with limitation: DROP PRIMARY KEY cannot be combined with RENAME COLUMN, CHANGE COLUMN, or DROP COLUMN (causes server panic); DROP PK + ADD COLUMN and DROP PK + MODIFY COLUMN work correctly<br/>Temporary tables cannot be altered<br/>ALTER TABLE does not support PARTITION operations |
| [ALTER VIEW](./SQL-Reference/Data-Definition-Language/alter-view.md) | ⚠️ Partial | WITH CHECK OPTION is accepted in CREATE VIEW (syntax only, views are read-only) but rejected as a syntax error in ALTER VIEW |
| [Branch Protect Snapshots](./SQL-Reference/Data-Definition-Language/branch-protect-snapshots.md) | 🟣 MatrixOne-only | — |
| [CREATE CLONE](./SQL-Reference/Data-Definition-Language/create-clone.md) | 🟣 MatrixOne-only | [MO-only] CREATE TABLE … CLONE db.table [TO ACCOUNT …] |
| [CREATE CLUSTER TABLE](./SQL-Reference/Data-Definition-Language/create-cluster-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE CLUSTER TABLE |
| [CREATE DATABASE](./SQL-Reference/Data-Definition-Language/create-database.md) | ⚠️ Partial | Only utf8mb4 / utf8mb4_bin are functional; other charsets/collations are syntactically accepted but have no effect<br/>ENCRYPTION clause accepted but inert |
| [CREATE DYNAMIC TABLE](./SQL-Reference/Data-Definition-Language/create-dynamic-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE DYNAMIC TABLE |
| [CREATE EXTERNAL TABLE](./SQL-Reference/Data-Definition-Language/create-external-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE EXTERNAL TABLE |
| [Create Fulltext Index](./SQL-Reference/Data-Definition-Language/create-fulltext-index.md) | ⚠️ Partial | MatrixOne full-text index is implemented on TAE storage with CJK/English optimizations; MySQL implements it on InnoDB/MyISAM with different stopword and parser semantics. |
| [CREATE FUNCTION...LANGUAGE PYTHON AS](./SQL-Reference/Data-Definition-Language/create-function-python.md) | 🟣 MatrixOne-only | [MO-only] CREATE FUNCTION … LANGUAGE PYTHON AS … |
| [CREATE FUNCTION...LANGUAGE SQL AS](./SQL-Reference/Data-Definition-Language/create-function-sql.md) | ⚠️ Partial | Only LANGUAGE SQL and LANGUAGE PYTHON are supported; usage differs significantly from MySQL stored functions<br/>CREATE OR REPLACE FUNCTION is supported; MySQL 8.0 does not support OR REPLACE for functions (only IF NOT EXISTS since 8.0.29) |
| [CREATE INDEX](./SQL-Reference/Data-Definition-Language/create-index.md) | ⚠️ Partial | Secondary indexes are supported and participate in query optimization (as of MO 3.0.12, EXPLAIN shows Index Table Scan for secondary index queries). Does not support index hints (USE INDEX, FORCE INDEX, IGNORE INDEX), function-based indexes, or FULLTEXT index via CREATE INDEX syntax (use CREATE FULLTEXT INDEX instead).<br/>[MO-only] USING IVFFLAT — vector index for approximate nearest neighbour<br/>[MO-only] USING HNSW — vector index for approximate nearest neighbour<br/>[MO-only] USING MASTER — composite master index |
| [CREATE INDEX USING HNSW](./SQL-Reference/Data-Definition-Language/create-index-hnsw.md) | 🟣 MatrixOne-only | [MO-only] CREATE INDEX … USING HNSW |
| [CREATE INDEX USING IVFFLAT](./SQL-Reference/Data-Definition-Language/create-index-ivfflat.md) | 🟣 MatrixOne-only | [MO-only] CREATE INDEX … USING IVFFLAT |
| [CREATE PITR](./SQL-Reference/Data-Definition-Language/create-pitr.md) | 🟣 MatrixOne-only | [MO-only] CREATE PITR … RANGE N {h\|d\|mo\|y} |
| [CREATE PUBLICATION](./SQL-Reference/Data-Definition-Language/create-publication.md) | 🟣 MatrixOne-only | [MO-only] CREATE PUBLICATION |
| [CREATE SEQUENCE](./SQL-Reference/Data-Definition-Language/create-sequence.md) | 🟣 MatrixOne-only | [MO-only] CREATE SEQUENCE (PostgreSQL-style) |
| [CREATE SNAPSHOT](./SQL-Reference/Data-Definition-Language/create-snapshot.md) | 🟣 MatrixOne-only | [MO-only] CREATE SNAPSHOT FOR {ACCOUNT\|DATABASE\|TABLE\|CLUSTER} |
| [CREATE SOURCE](./SQL-Reference/Data-Definition-Language/create-source.md) | 🟣 MatrixOne-only | [MO-only] CREATE SOURCE (stream/Kafka connector) |
| [CREATE STAGE](./SQL-Reference/Data-Definition-Language/create-stage.md) | 🟣 MatrixOne-only | [MO-only] CREATE STAGE (external file-system binding) |
| [CREATE TABLE](./SQL-Reference/Data-Definition-Language/create-table.md) | ⚠️ Partial | ENGINE= clause is syntactically accepted but ignored; MatrixOne uses TAE exclusively<br/>Spatial type names (GEOMETRY, POINT, etc.) are syntactically accepted but non-functional; MEDIUMINT is syntactically accepted but treated as INT<br/>BOOL is a native boolean type, not an INT alias as in MySQL<br/>AUTO_INCREMENT step is always 1; @@auto_increment_increment is syntactically accepted but inert<br/>Partitioning accepts syntax but only HASH and KEY participate in partition pruning (RANGE/LIST/RANGE COLUMNS/LIST COLUMNS are syntax-only); subpartitioning causes an internal error; ADD/DROP/TRUNCATE PARTITION not supported<br/>CHECK constraints are syntactically accepted but not enforced; MySQL 8.0.16+ enforces them<br/>[MO-only] CLUSTER BY (col, …) — pre-sort columns to accelerate queries<br/>[MO-only] START TRANSACTION table option — non-standard table option with no MySQL 8.0 equivalent |
| [CREATE TABLE ... LIKE](./SQL-Reference/Data-Definition-Language/create-table-like.md) | ✅ Full | — |
| [CREATE TABLE AS SELECT](./SQL-Reference/Data-Definition-Language/create-table-as-select.md) | ✅ Full | — |
| [CREATE TASK (SQL Task)](./SQL-Reference/Data-Definition-Language/sql-task.md) | 🟣 MatrixOne-only | [MO-only] CREATE TASK / ALTER TASK / DROP TASK / EXECUTE TASK / SHOW TASKS (MO-specific scheduled SQL tasks; MySQL uses CREATE EVENT instead) |
| [CREATE VIEW](./SQL-Reference/Data-Definition-Language/create-view.md) | ⚠️ Partial | WITH CHECK OPTION is syntactically accepted but not enforced<br/>Views are read-only; MySQL 8.0 supports INSERT/UPDATE/DELETE through views that meet updatability criteria |
| [CREATE...FROM...PUBLICATION...](./SQL-Reference/Data-Definition-Language/create-subscription.md) | 🟣 MatrixOne-only | [MO-only] CREATE DATABASE … FROM … PUBLICATION … |
| [DATA BRANCH CREATE](./SQL-Reference/Data-Definition-Language/data-branch-create-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH CREATE (Git-for-Data) |
| [DATA BRANCH DELETE](./SQL-Reference/Data-Definition-Language/data-branch-delete-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH DELETE |
| [DATA BRANCH DIFF](./SQL-Reference/Data-Definition-Language/data-branch-diff-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH DIFF |
| [DATA BRANCH MERGE](./SQL-Reference/Data-Definition-Language/data-branch-merge-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH MERGE |
| [DATA BRANCH PICK](./SQL-Reference/Data-Definition-Language/data-branch-pick.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH PICK (cherry-pick specific rows between branch tables, Git-for-Data feature) |
| [DROP DATABASE](./SQL-Reference/Data-Definition-Language/drop-database.md) | ✅ Full | — |
| [DROP FUNCTION](./SQL-Reference/Data-Definition-Language/drop-function.md) | ⚠️ Partial | Drops MatrixOne-style SQL / Python functions, not MySQL stored procedures/functions<br/>Requires argument type list on DROP (e.g. DROP FUNCTION py_add(int, int)); MySQL 8.0 accepts only the function name |
| [DROP INDEX](./SQL-Reference/Data-Definition-Language/drop-index.md) | ⚠️ Partial | MO accepts DROP INDEX IF EXISTS syntax (MySQL 8.0 does not), but IF EXISTS does not suppress errors for missing indexes; it returns internal error 20101 instead of a silent skip |
| [DROP PITR](./SQL-Reference/Data-Definition-Language/drop-pitr.md) | 🟣 MatrixOne-only | [MO-only] DROP PITR |
| [DROP PUBLICATION](./SQL-Reference/Data-Definition-Language/drop-publication.md) | 🟣 MatrixOne-only | [MO-only] DROP PUBLICATION |
| [DROP SEQUENCE](./SQL-Reference/Data-Definition-Language/drop-sequence.md) | 🟣 MatrixOne-only | [MO-only] DROP SEQUENCE |
| [DROP SNAPSHOT](./SQL-Reference/Data-Definition-Language/drop-snapshot.md) | 🟣 MatrixOne-only | [MO-only] DROP SNAPSHOT |
| [DROP STAGE](./SQL-Reference/Data-Definition-Language/drop-stage.md) | 🟣 MatrixOne-only | [MO-only] DROP STAGE |
| [DROP TABLE](./SQL-Reference/Data-Definition-Language/drop-table.md) | ✅ Full | — |
| [DROP VIEW](./SQL-Reference/Data-Definition-Language/drop-view.md) | ⚠️ Partial | MO does not support dropping multiple views in a single statement; only a single view per DROP VIEW. MySQL 8.0 supports dropping multiple views (e.g., DROP VIEW v1, v2). |
| [Rename Table](./SQL-Reference/Data-Definition-Language/rename-table.md) | ⚠️ Partial | MO does not support RENAME TABLE across databases; when given cross-database syntax, MO renames the table within its current database instead of raising an error. MySQL 8.0 supports cross-database RENAME TABLE. |
| [RESTORE ... FROM PITR](./SQL-Reference/Data-Definition-Language/restore-pitr.md) | 🟣 MatrixOne-only | [MO-only] RESTORE … FROM PITR |
| [RESTORE ... SNAPSHOT](./SQL-Reference/Data-Definition-Language/restore-snapshot.md) | 🟣 MatrixOne-only | [MO-only] RESTORE … FROM SNAPSHOT |
| [TRUNCATE TABLE](./SQL-Reference/Data-Definition-Language/truncate-table.md) | ✅ Full | — |

### Data Manipulation Language (DML)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [CASE](./SQL-Reference/Data-Manipulation-Language/case.md) | ✅ Full | This page describes the CASE operator (expression), not the stored-program CASE statement. MatrixOne does not support stored programs, so the stored-program CASE STATEMENT is unavailable; the CASE OPERATOR behaves compatibly. |
| [CURRENT_ROLE()](./SQL-Reference/Data-Manipulation-Language/information-functions/current_role.md) | ⚠️ Partial | Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'. |
| [DELETE](./SQL-Reference/Data-Manipulation-Language/delete.md) | ⚠️ Partial | LOW_PRIORITY, QUICK, IGNORE modifiers are syntactically accepted but have no effect<br/>PARTITION clause not supported |
| [INSERT](./SQL-Reference/Data-Manipulation-Language/insert.md) | ⚠️ Partial | Modifiers LOW_PRIORITY / DELAYED / HIGH_PRIORITY not supported<br/>PARTITION clause not supported |
| [INSERT ... ON DUPLICATE KEY UPDATE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-on-duplicate.md) | ⚠️ Partial | ON DUPLICATE KEY UPDATE only triggers on PRIMARY KEY conflicts; UNIQUE index conflicts are detected but result in errors (ERROR 1062 or ERROR 20102) rather than triggering ON DUPLICATE KEY UPDATE |
| [INSERT IGNORE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-ignore.md) | ⚠️ Partial | LOW_PRIORITY / DELAYED / HIGH_PRIORITY modifiers not supported<br/>Duplicates are silently ignored; MySQL emits a warning for each skipped row.<br/>Does not ignore NULL-into-NOT-NULL, type-conversion, or partition-mismatch errors as MySQL does.<br/>PARTITION clause not supported |
| [INSERT INTO SELECT](./SQL-Reference/Data-Manipulation-Language/insert-into-select.md) | ✅ Full | — |
| [LAST_INSERT_ID()](./SQL-Reference/Data-Manipulation-Language/information-functions/last-insert-id.md) | ⚠️ Partial | Multi-row INSERT returns the last inserted auto-increment value; MySQL returns the first inserted value. |
| [LAST_QUERY_ID](./SQL-Reference/Data-Manipulation-Language/information-functions/last-query-id.md) | 🟣 MatrixOne-only | [MO-only] LAST_QUERY_ID() |
| [LOAD DATA](./SQL-Reference/Data-Manipulation-Language/load-data-infile.md) | ⚠️ Partial | SET clause only accepts columns_name = nullif(expr1, expr2)<br/>JSONLines import uses MatrixOne-specific syntax<br/>Object-storage import (S3/URL) uses MatrixOne-specific syntax<br/>LOW_PRIORITY and CONCURRENT modifiers not supported<br/>REPLACE and IGNORE modifiers not supported<br/>[MO-only] PARALLEL clause (controls parallel file loading)<br/>[MO-only] STRICT clause (controls parallel splitting mode) |
| [LOAD DATA INLINE](./SQL-Reference/Data-Manipulation-Language/load-data-inline.md) | 🟣 MatrixOne-only | [MO-only] LOAD DATA INLINE (stage-sourced import) |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/replace.md) | ⚠️ Partial | node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne)<br/>PARTITION clause not supported<br/>LOW_PRIORITY and DELAYED modifiers not supported<br/>REPLACE only detects conflicts on PRIMARY KEY; secondary UNIQUE index conflicts throw ERROR 1062 (MySQL 8.0 handles both). Constraints section incorrectly states UNIQUE index can also trigger REPLACE; this is wrong per actual MO behavior. |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/upsert/replace.md) | ⚠️ Partial | node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne)<br/>PARTITION clause not supported<br/>LOW_PRIORITY and DELAYED modifiers not supported<br/>REPLACE only detects conflicts on PRIMARY KEY; secondary UNIQUE index conflicts throw ERROR 1062 (MySQL 8.0 handles both). Constraints section incorrectly states UNIQUE index can also trigger REPLACE; this is wrong per actual MO behavior. |
| [UPDATE](./SQL-Reference/Data-Manipulation-Language/update.md) | ⚠️ Partial | LOW_PRIORITY and IGNORE modifiers are syntactically accepted but have no effect<br/>PARTITION clause not supported |
| [UPSERT](./SQL-Reference/Data-Manipulation-Language/upsert/upsert.md) | ⚠️ Partial | INSERT IGNORE does not suppress NOT NULL or type-conversion errors (MySQL 8.0 does)<br/>INSERT ON DUPLICATE KEY UPDATE only triggers on PRIMARY KEY conflicts; UNIQUE index conflicts are detected but result in errors (ERROR 1062 or ERROR 20102) rather than triggering ON DUPLICATE KEY UPDATE<br/>REPLACE does not support REPLACE ... WHERE (parser bug) |

### Data Query Language (DQL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [BY RANK WITH OPTION](./SQL-Reference/Data-Query-Language/by-rank-with-option.md) | 🟣 MatrixOne-only | [MO-only] BY RANK WITH OPTION (IVF vector ranking) |
| [Combining Queries (UNION, INTERSECT, MINUS)](./SQL-Reference/Data-Query-Language/union-intersect-minus-overview.md) | ⚠️ Partial | MINUS keyword is MO-specific; MySQL 8.0.31+ uses EXCEPT for the same set-difference semantics. MINUS ALL is not yet implemented in MO while MySQL 8.0.31+ supports EXCEPT ALL.<br/>INTERSECT was added in MySQL 8.0.31; both MO and MySQL support INTERSECT and INTERSECT ALL with matching semantics.<br/>UNION is standard across both, but MO's type coercion in UNION columns is stricter (errors on incompatible types where MySQL silently coerces).<br/>[MO-only] MINUS keyword (MO-specific syntax; MySQL 8.0.31+ offers equivalent EXCEPT) |
| [Comparisons Using Subqueries](./SQL-Reference/Data-Query-Language/subqueries/comparisons-using-subqueries.md) | ✅ Full | — |
| [CROSS APPLY](./SQL-Reference/Data-Query-Language/apply/cross-apply.md) | 🟣 MatrixOne-only | [MO-only] CROSS APPLY (SQL Server-style, not in MySQL) |
| [CROSS JOIN](./SQL-Reference/Data-Query-Language/join/cross-join.md) | ✅ Full | — |
| [Derived Tables](./SQL-Reference/Data-Query-Language/subqueries/derived-tables.md) | ⚠️ Partial | LATERAL derived tables are not supported in MO (MySQL 8.0.14+ supports LATERAL for correlated subqueries in FROM clause) |
| [FULL JOIN](./SQL-Reference/Data-Query-Language/join/full-join.md) | ❌ None | FULL JOIN with ON clause produces different errors on MO (missing FROM-clause entry) vs MySQL 8.0 (Unknown column in ON clause). FULL JOIN with USING returns INNER JOIN results on both (neither returns unmatched rows). FULL OUTER JOIN produces a syntax error on both. MySQL 8.0 does not natively support either FULL JOIN or FULL OUTER JOIN. |
| [INNER JOIN](./SQL-Reference/Data-Query-Language/join/inner-join.md) | ✅ Full | — |
| [INTERSECT](./SQL-Reference/Data-Query-Language/intersect.md) | ⚠️ Partial | INTERSECT was added in MySQL 8.0.31; MO INTERSECT and INTERSECT ALL semantics match MySQL 8.0 (both return identical results for common test cases including duplicate handling) |
| [JOIN](./SQL-Reference/Data-Query-Language/join/join.md) | ⚠️ Partial | FULL JOIN and FULL OUTER JOIN are not fully supported (FULL JOIN with ON produces errors, FULL JOIN with USING returns INNER JOIN results, FULL OUTER JOIN is a syntax error); MySQL 8.0 also does not support FULL JOIN/OUTER JOIN natively |
| [LEFT JOIN](./SQL-Reference/Data-Query-Language/join/left-join.md) | ✅ Full | — |
| [MINUS](./SQL-Reference/Data-Query-Language/minus.md) | 🟣 MatrixOne-only | MINUS keyword is MO-specific; MySQL 8.0.31+ uses EXCEPT for the same set-difference semantics (MINUS is not a recognized keyword in MySQL)<br/>MINUS ALL is not yet implemented in MO; MySQL 8.0.31+ supports EXCEPT ALL with full duplicate-preserving semantics<br/>[MO-only] MINUS keyword (MO's set-difference operator; MySQL 8.0.31+ offers equivalent functionality via EXCEPT) |
| [NATURAL JOIN](./SQL-Reference/Data-Query-Language/join/natural-join.md) | ✅ Full | — |
| [OUTER APPLY](./SQL-Reference/Data-Query-Language/apply/outer-apply.md) | 🟣 MatrixOne-only | [MO-only] OUTER APPLY (SQL Server-style, not in MySQL) |
| [OUTER JOIN](./SQL-Reference/Data-Query-Language/join/outer-join.md) | ⚠️ Partial | Overview page that includes FULL OUTER JOIN; neither MO nor MySQL 8.0 natively support FULL OUTER JOIN (MO produces syntax error, same as MySQL) |
| [RIGHT JOIN](./SQL-Reference/Data-Query-Language/join/right-join.md) | ✅ Full | — |
| [SELECT](./SQL-Reference/Data-Query-Language/select.md) | ⚠️ Partial | SELECT … FOR UPDATE only supports single-table queries<br/>SELECT INTO OUTFILE is only partially supported<br/>AS OF TIMESTAMP time-travel queries require PITR/snapshot to be enabled on the database; without PITR the syntax produces an error<br/>SELECT ... FOR SHARE is not supported<br/>FOR UPDATE NOWAIT and SKIP LOCKED modifiers are not supported<br/>GROUP BY ... WITH ROLLUP row ordering differs: MO places rollup summary rows at the top of the result set, while MySQL 8.0 places them at the bottom (standard MySQL grouping order)<br/>[MO-only] { AS OF TIMESTAMP 'YYYY-MM-DD HH:MM:SS' } — time-travel query against enabled snapshot/PITR<br/>[MO-only] ORDER BY ... NULLS { FIRST \| LAST } — PostgreSQL-style NULL ordering not available in MySQL |
| [Subqueries with ALL](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-all.md) | ✅ Full | — |
| [Subqueries with ANY or SOME](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-any-some.md) | ✅ Full | — |
| [Subqueries with EXISTS or NOT EXISTS](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-exists.md) | ✅ Full | — |
| [Subqueries with IN](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-in.md) | ✅ Full | — |
| [SUBQUERY](./SQL-Reference/Data-Query-Language/subqueries/subquery.md) | ⚠️ Partial | Multi-column scalar subquery comparisons (e.g., WHERE (a,b) = (SELECT ...)) are not supported; use multi-column IN instead |
| [UNION](./SQL-Reference/Data-Query-Language/union.md) | ⚠️ Partial | UNION type coercion is strict: MO errors on incompatible types in UNION columns (e.g., INT vs VARCHAR), while MySQL 8.0 silently coerces (e.g., varchar to int converts to 0)<br/>UNION ALL type coercion is similarly strict compared to MySQL 8.0's lenient coercion |
| [WITH (Common Table Expressions)](./SQL-Reference/Data-Query-Language/with-cte.md) | ⚠️ Partial | Outer joins (LEFT JOIN, RIGHT JOIN, OUTER JOIN) are not allowed in recursive CTE members; MySQL 8.0 permits them except when the recursive CTE is on the right side of a LEFT JOIN (MySQL allows LEFT JOIN with CTE on the left side; MO rejects all outer joins in recursive CTEs regardless of position) |

### Other

| Statement | MySQL Compat | Notes |
|---|---|---|
| [DEALLOCATE PREPARE](./SQL-Reference/Other/Prepared-Statements/deallocate.md) | ⚠️ Partial | DEALLOCATE PREPARE on a non-existent statement silently succeeds; MySQL returns ERROR 1243 (Unknown prepared statement handler). |
| [DESCRIBE / DESC](./SQL-Reference/Other/describe.md) | ⚠️ Partial | DESCRIBE/DESC output includes an extra `Comment` column (7 columns total vs MySQL's 6).<br/>Type names are displayed in uppercase with display widths (e.g., `INT(32)`, `FLOAT(0)`, `TIMESTAMP(0)`) instead of MySQL's lowercase without widths (e.g., `int`, `float`, `timestamp`).<br/>Column name filter (`DESC tbl_name col_name`) is non-functional; all columns are returned.<br/>Wild pattern (`DESC tbl_name 'pattern'`) not supported; produces syntax error.<br/>For TIMESTAMP columns with DEFAULT CURRENT_TIMESTAMP, MO does not show `DEFAULT_GENERATED` in the Extra column as MySQL does. |
| [EXECUTE](./SQL-Reference/Other/Prepared-Statements/execute.md) | ✅ Full | — |
| [EXPLAIN](./SQL-Reference/Other/Explain/explain.md) | ⚠️ Partial | Output format is a single QUERY PLAN column with tree-structured text (PostgreSQL-style); MySQL uses a multi-column tabular format with id, select_type, table, partitions, type, possible_keys, key, key_len, ref, rows, filtered, Extra<br/>JSON output (FORMAT=JSON) not supported; MO returns syntax error<br/>FORMAT=TREE and FORMAT=TRADITIONAL not supported; FORMAT=TEXT bare keyword also errors; only bare keyword forms (EXPLAIN, EXPLAIN ANALYZE, EXPLAIN VERBOSE) work<br/>EXPLAIN FOR CONNECTION not supported (returns internal error)<br/>EXPLAIN (ANALYZE TRUE/FALSE) and EXPLAIN (VERBOSE TRUE/FALSE) parenthesized boolean syntax WORKS in MO 3.0.12, contrary to doc claims; only parenthesized FORMAT syntax is unsupported |
| [EXPLAIN Output Format](./SQL-Reference/Other/Explain/explain-workflow.md) | ⚠️ Partial | Output is a single QUERY PLAN column with tree-structured text; MySQL uses multi-column tabular EXPLAIN format<br/>JSON output not supported<br/>Node types (Sink, Sink Scan, PreInsert, Fuzzy Filter, etc.) are MO-specific and have no MySQL equivalent |
| [EXPLAIN PREPARED](./SQL-Reference/Other/Explain/explain-prepared.md) | 🟣 MatrixOne-only | [MO-only] EXPLAIN FORCE EXECUTE stmt_name [USING @var] is a MatrixOne extension; MySQL explains prepared statements through EXPLAIN FOR CONNECTION. |
| [Get information with EXPLAIN ANALYZE](./SQL-Reference/Other/Explain/explain-analyze.md) | ⚠️ Partial | Output format mirrors PostgreSQL (QUERY PLAN tree with Analyze sub-lines showing timeConsumed, waitTime, inputRows, outputRows, InputSize, OutputSize, MemorySize); MySQL 8.0 EXPLAIN ANALYZE uses TREE format with cost estimation and actual time in a different structure<br/>JSON output not supported<br/>MO EXPLAIN ANALYZE produces one output row per plan tree line; MySQL produces a single row with the full plan |
| [KILL](./SQL-Reference/Other/kill.md) | ✅ Full | — |
| [PREPARE](./SQL-Reference/Other/Prepared-Statements/prepare.md) | ⚠️ Partial | MatrixOne cannot PREPARE SET, DO, or other TCL/DCL statements<br/>Repreparation on parameter type change may throw a cast error instead of silently converting the value (e.g., passing a string to an integer parameter). |
| [SET ROLE](./SQL-Reference/Other/Set/set-role.md) | ⚠️ Partial | Accepts a single role name only; MySQL 8.0 also supports NONE, DEFAULT, ALL, ALL EXCEPT role_list, and role lists.<br/>[MO-only] SET SECONDARY ROLE {NONE \| ALL} — MatrixOne-only primary/secondary role model. |
| [SHOW ACCOUNTS](./SQL-Reference/Other/SHOW-Statements/show-account.md) | 🟣 MatrixOne-only | [MO-only] SHOW ACCOUNTS |
| [SHOW COLLATION](./SQL-Reference/Other/SHOW-Statements/show-collation.md) | ⚠️ Partial | Only utf8mb4_bin is effective; other collations appear but are inert<br/>MO 3.0.12 returns 11 collations (with `Default` and `Pad_attribute` columns); older doc examples show only 1 row with 5 columns<br/>Output columns (Collation, Charset, Id, Default, Compiled, Sortlen, Pad_attribute) differ slightly from MySQL which also includes Pad_attribute |
| [SHOW COLUMNS](./SQL-Reference/Other/SHOW-Statements/show-columns.md) | ⚠️ Partial | MO SHOW COLUMNS (without FULL) already includes the `Comment` column; MySQL only shows Comment with FULL<br/>MO SHOW FULL COLUMNS returns Collation and Privileges columns but Collation is always NULL<br/>MO accepts EXTENDED keyword (SHOW EXTENDED COLUMNS) and FIELDS synonym (SHOW FIELDS), both returning same columns as SHOW COLUMNS<br/>MO Type column includes display width (e.g. INT(32)) while MySQL shows just int |
| [SHOW CREATE DATABASE](./SQL-Reference/Other/SHOW-Statements/show-create-database.md) | ⚠️ Partial | Output omits CHARACTER SET, COLLATE, and ENCRYPTION clauses present in MySQL 8.0 SHOW CREATE DATABASE output |
| [SHOW CREATE PUBLICATION](./SQL-Reference/Other/SHOW-Statements/show-create-publication.md) | 🟣 MatrixOne-only | [MO-only] SHOW CREATE PUBLICATION |
| [SHOW CREATE TABLE](./SQL-Reference/Other/SHOW-Statements/show-create-table.md) | ⚠️ Partial | Output reflects MatrixOne-specific extensions (CLUSTER BY, USING IVFFLAT/HNSW, etc.)<br/>MO output omits ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci appended by MySQL |
| [SHOW CREATE VIEW](./SQL-Reference/Other/SHOW-Statements/show-create-view.md) | ⚠️ Partial | DEFINER = user clause absent from output; SQL SECURITY {DEFINER\|INVOKER} is emitted<br/>MO output lacks ALGORITHM=UNDEFINED clause that MySQL always includes<br/>MO does not fully qualify column references (MySQL outputs db.table.col AS alias)<br/>MO uses unquoted identifiers; MySQL backtick-quotes database, table, and column names<br/>The rendered Create View output shows `CREATE SQL SECURITY DEFINER VIEW` (not `CREATE ALGORITHM=UNDEFINED DEFINER=user SQL SECURITY DEFINER VIEW` as MySQL does) |
| [SHOW DATABASES](./SQL-Reference/Other/SHOW-Statements/show-databases.md) | ✅ Full | — |
| [SHOW FUNCTION STATUS](./SQL-Reference/Other/SHOW-Statements/show-function-status.md) | ⚠️ Partial | Lists MatrixOne SQL/Python functions; MySQL shows stored routines AND built-in sys schema functions (e.g. extract_schema_from_file_name, format_bytes)<br/>MO only shows user-defined functions; MySQL shows all functions including built-in ones |
| [SHOW GRANTS](./SQL-Reference/Other/SHOW-Statements/show-grants.md) | ⚠️ Partial | Grant syntax output is completely different: MO uses MO-specific format (GRANT create account ON account, GRANT table all ON table) instead of MySQL standard format (GRANT SELECT, INSERT, UPDATE, DELETE ON *.*)<br/>MO output includes backtick-quoted user@host inside grant statements; MySQL uses quoted user@host format with TO clause<br/>USING role_list clause not supported<br/>MO does not support SHOW GRANTS FOR CURRENT_USER (or CURRENT_USER()) as a shorthand for the current user |
| [SHOW INDEX](./SQL-Reference/Other/SHOW-Statements/show-index.md) | ⚠️ Partial | Reflects MatrixOne index model — secondary index rows appear but may not accelerate queries<br/>Index_type may be empty (MySQL typically shows BTREE)<br/>Index_comment column is present (MySQL 8.0 also has Index_comment; difference is minor)<br/>Index_params column is present (MySQL does not have this column)<br/>Expression column shows the column name for non-functional key parts; MySQL shows NULL for non-functional key parts<br/>MO SHOW INDEX returns 16 columns vs MySQL 15 columns (MO adds Index_params, lacks the extra Collation behavior) |
| [SHOW PITR](./SQL-Reference/Other/SHOW-Statements/show-pitrs.md) | 🟣 MatrixOne-only | [MO-only] SHOW PITR |
| [SHOW PROCESSLIST](./SQL-Reference/Other/SHOW-Statements/show-processlist.md) | ⚠️ Partial | MO returns 19 columns (node_id, conn_id, session_id, account, user, host, db, session_start, command, info, txn_id, statement_id, statement_type, query_type, sql_source_type, query_start, client_host, role, proxy_host) vs MySQL 8 columns (Id, User, Host, db, Command, Time, State, Info)<br/>MO column names differ completely: conn_id vs Id, session_start vs Time, no State column, MO adds txn_id/statement_id/statement_type/query_type/sql_source_type/query_start/client_host/role/proxy_host<br/>SHOW FULL PROCESSLIST is accepted by MO but returns same columns as SHOW PROCESSLIST (no behavioral difference) |
| [SHOW PUBLICATIONS](./SQL-Reference/Other/SHOW-Statements/show-publications.md) | 🟣 MatrixOne-only | [MO-only] SHOW PUBLICATIONS |
| [SHOW ROLES](./SQL-Reference/Other/SHOW-Statements/show-roles.md) | 🟣 MatrixOne-only | [MO-only] SHOW ROLES |
| [SHOW SEQUENCES](./SQL-Reference/Other/SHOW-Statements/show-sequences.md) | 🟣 MatrixOne-only | [MO-only] SHOW SEQUENCES |
| [SHOW STAGES](./SQL-Reference/Other/SHOW-Statements/show-stage.md) | 🟣 MatrixOne-only | [MO-only] SHOW STAGES |
| [SHOW SUBSCRIPTIONS](./SQL-Reference/Other/SHOW-Statements/show-subscriptions.md) | 🟣 MatrixOne-only | [MO-only] SHOW SUBSCRIPTIONS |
| [SHOW TABLE STATUS](./SQL-Reference/Other/SHOW-Statements/show-table-status.md) | ⚠️ Partial | Result columns differ from MySQL: MO has 19 cols (adds Role_id, Role_name; omits Version); MySQL has 18 cols (includes Version; no Role_id/Role_name)<br/>Engine column always shows Tae instead of InnoDB<br/>MO's Auto_increment defaults to 0 (MySQL shows NULL for tables without auto-increment)<br/>MO shows views in SHOW TABLE STATUS with Engine=NULL and Comment=VIEW (same as MySQL behavior) |
| [SHOW TABLES](./SQL-Reference/Other/SHOW-Statements/show-tables.md) | ⚠️ Partial | Output column header uses lowercase database name (Tables_in_<db> vs MySQL's Tables_in_<DB>)<br/>MO does not display a parenthesized LIKE pattern in the column header unlike MySQL |
| [SHOW VARIABLES](./SQL-Reference/Other/SHOW-Statements/show-variables.md) | ⚠️ Partial | System variables are mostly syntactic stubs; actual behaviour differs from MySQL<br/>GLOBAL and SESSION scope modifiers are syntactically accepted for both SET and SHOW; SHOW GLOBAL vs SHOW SESSION return different values when SESSION has been overridden, same as MySQL<br/>MO has a completely different set of variable names (e.g. testbotchvar_nodyn, testbothvar_dyn) alongside MySQL-compatible ones (autocommit, sql_mode)<br/>Variable values use lowercase ('on'/'off') while MySQL uses uppercase ('ON'/'OFF') |
| [USE](./SQL-Reference/Other/use-database.md) | ✅ Full | — |

## Functions

| Status | Count |
|---|---|
| ✅ Full | 103 |
| ⚠️ Partial | 26 |
| 🟣 MatrixOne-only | 35 |
| **Total** | **164** |

### Functions

| Function | MySQL Compat | Notes |
|---|---|---|
| [Summary table of functions](./Functions-and-Operators/matrixone-function-list.md) | 🟣 MatrixOne-only | [MO-only] Listing page (includes MatrixOne-only functions). |

### Aggregate Functions

| Function | MySQL Compat | Notes |
|---|---|---|
| [ANY_VALUE](./Functions-and-Operators/Aggregate-Functions/any-value.md) | ✅ Full | — |
| [AVG](./Functions-and-Operators/Aggregate-Functions/avg.md) | ⚠️ Partial | AVG() returns DOUBLE for all input types (MySQL returns DECIMAL for exact-value types) |
| [BIT_AND](./Functions-and-Operators/Aggregate-Functions/bit_and.md) | ✅ Full | — |
| [BIT_OR](./Functions-and-Operators/Aggregate-Functions/bit_or.md) | ✅ Full | — |
| [BIT_XOR](./Functions-and-Operators/Aggregate-Functions/bit_xor.md) | ✅ Full | — |
| [BITMAP function](./Functions-and-Operators/Aggregate-Functions/bitmap.md) | 🟣 MatrixOne-only | [MO-only] BITMAP aggregates are MatrixOne extensions. |
| [COUNT](./Functions-and-Operators/Aggregate-Functions/count.md) | ✅ Full | — |
| [GROUP_CONCAT](./Functions-and-Operators/Aggregate-Functions/group-concat.md) | ✅ Full | — |
| [MAX](./Functions-and-Operators/Aggregate-Functions/max.md) | ✅ Full | — |
| [MEDIAN()](./Functions-and-Operators/Aggregate-Functions/median.md) | 🟣 MatrixOne-only | [MO-only] MEDIAN aggregate is a MatrixOne-specific aggregate (no native MySQL equivalent). |
| [MIN](./Functions-and-Operators/Aggregate-Functions/min.md) | ✅ Full | — |
| [STDDEV_POP](./Functions-and-Operators/Aggregate-Functions/stddev_pop.md) | ✅ Full | — |
| [SUM](./Functions-and-Operators/Aggregate-Functions/sum.md) | ⚠️ Partial | SUM() returns the input integer type rather than DECIMAL for exact-value arguments (MySQL returns DECIMAL) |
| [VAR_POP](./Functions-and-Operators/Aggregate-Functions/var_pop.md) | ✅ Full | — |
| [VARIANCE](./Functions-and-Operators/Aggregate-Functions/variance.md) | ✅ Full | — |

### Datetime

| Function | MySQL Compat | Notes |
|---|---|---|
| [ADDTIME()](./Functions-and-Operators/Datetime/addtime.md) | ✅ Full | — |
| [CONVERT_TZ()](./Functions-and-Operators/Datetime/convert-tz.md) | ✅ Full | — |
| [CURDATE()](./Functions-and-Operators/Datetime/curdate.md) | ⚠️ Partial | curdate()+int returns days since 1970-01-01 rather than coercing both sides to integer and adding like MySQL. |
| [CURRENT_TIMESTAMP()](./Functions-and-Operators/Datetime/current-timestamp.md) | ✅ Full | — |
| [CURTIME()](./Functions-and-Operators/Datetime/curtime.md) | ✅ Full | — |
| [DATE_ADD()](./Functions-and-Operators/Datetime/date-add.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [DATE_FORMAT()](./Functions-and-Operators/Datetime/date-format.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [DATE_SUB()](./Functions-and-Operators/Datetime/date-sub.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [DATE()](./Functions-and-Operators/Datetime/date.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants (yy-mm-dd, yy/mm/dd, yymmdd, etc.). |
| [DATEDIFF()](./Functions-and-Operators/Datetime/datediff.md) | ✅ Full | — |
| [DAY()](./Functions-and-Operators/Datetime/day.md) | ✅ Full | — |
| [DAYOFYEAR()](./Functions-and-Operators/Datetime/dayofyear.md) | ✅ Full | — |
| [EXTRACT()](./Functions-and-Operators/Datetime/extract.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [FROM_UNIXTIME()](./Functions-and-Operators/Datetime/from-unixtime.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [GET_FORMAT()](./Functions-and-Operators/Datetime/get-format.md) | ✅ Full | — |
| [HOUR()](./Functions-and-Operators/Datetime/hour.md) | ✅ Full | — |
| [MINUTE()](./Functions-and-Operators/Datetime/minute.md) | ✅ Full | — |
| [MONTH()](./Functions-and-Operators/Datetime/month.md) | ✅ Full | — |
| [NOW()](./Functions-and-Operators/Datetime/now.md) | ✅ Full | — |
| [SECOND()](./Functions-and-Operators/Datetime/second.md) | ✅ Full | — |
| [STR_TO_DATE()](./Functions-and-Operators/Datetime/str-to-date.md) | ✅ Full | — |
| [SUBTIME()](./Functions-and-Operators/Datetime/subtime.md) | ✅ Full | — |
| [SYSDATE()](./Functions-and-Operators/Datetime/sysdate.md) | ✅ Full | — |
| [TIME()](./Functions-and-Operators/Datetime/time.md) | ✅ Full | — |
| [TIMEDIFF()](./Functions-and-Operators/Datetime/timediff.md) | ✅ Full | — |
| [TIMESTAMP()](./Functions-and-Operators/Datetime/timestamp.md) | ⚠️ Partial | MatrixOne TIMESTAMP range is '0001-01-01'–'9999-12-31' vs MySQL '1970-01-01'–'2038-01-19' (compat doc: Data Types).<br/>Two-argument form TIMESTAMP(expr1, expr2) is not supported; MO only supports single-argument TIMESTAMP(expr) |
| [TIMESTAMPADD()](./Functions-and-Operators/Datetime/timestampadd.md) | ✅ Full | — |
| [TIMESTAMPDIFF()](./Functions-and-Operators/Datetime/timestampdiff.md) | ✅ Full | — |
| [TO_DATE()](./Functions-and-Operators/Datetime/to-date.md) | 🟣 MatrixOne-only | [MO-only] TO_DATE is a MatrixOne alias for MySQL STR_TO_DATE (compat doc: Date and Time Functions). MySQL's own TO_DATE does not exist. |
| [TO_DAYS()](./Functions-and-Operators/Datetime/to-days.md) | ⚠️ Partial | Two-digit year handling differs: MatrixOne completes '08-10-07' to year 0008; MySQL interprets it as 2008.<br/>Dates '0000-00-00' and '0000-01-01' raise an error in MatrixOne rather than being accepted as MySQL does. |
| [TO_SECONDS()](./Functions-and-Operators/Datetime/to-seconds.md) | ⚠️ Partial | Two-digit year handling differs: MatrixOne completes '08-10-07' to year 0008; MySQL interprets it as 2008.<br/>Dates '0000-00-00' and '0000-01-01' raise an error in MatrixOne rather than being accepted as MySQL does. |
| [UNIX_TIMESTAMP()](./Functions-and-Operators/Datetime/unix-timestamp.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
| [UTC_TIMESTAMP()](./Functions-and-Operators/Datetime/utc-timestamp.md) | ✅ Full | — |
| [WEEK()](./Functions-and-Operators/Datetime/week.md) | ✅ Full | — |
| [WEEKDAY()](./Functions-and-Operators/Datetime/weekday.md) | ✅ Full | — |
| [YEAR()](./Functions-and-Operators/Datetime/year.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants.<br/>[MO-only] TOYEAR() is a MatrixOne alias for YEAR() with no MySQL counterpart. |
| [YEARWEEK()](./Functions-and-Operators/Datetime/yearweek.md) | ✅ Full | — |

### Json

| Function | MySQL Compat | Notes |
|---|---|---|
| [JQ()](./Functions-and-Operators/Json/jq.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne integration of the jq JSON query language; no MySQL equivalent. |
| [JSON Arrow Operators -> and ->>](./Functions-and-Operators/Json/json-arrow.md) | ✅ Full | — |
| [JSON_EXTRACT_FLOAT64()](./Functions-and-Operators/Json/json_extract_float64.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne convenience wrapper returning FLOAT64 directly. |
| [JSON_EXTRACT_STRING()](./Functions-and-Operators/Json/json_extract_string.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne convenience wrapper returning a string result directly. |
| [JSON_EXTRACT()](./Functions-and-Operators/Json/json_extract.md) | ✅ Full | — |
| [JSON_QUOTE()](./Functions-and-Operators/Json/json_quote.md) | ✅ Full | — |
| [JSON_ROW()](./Functions-and-Operators/Json/json_row.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne-only; no MySQL equivalent. |
| [JSON_SET()](./Functions-and-Operators/Json/json_set.md) | ✅ Full | — |
| [JSON_UNQUOTE()](./Functions-and-Operators/Json/json_unquote.md) | ✅ Full | — |
| [TRY_JQ()](./Functions-and-Operators/Json/try_jq.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne integration of the jq JSON query language; no MySQL equivalent. |

### Mathematical

| Function | MySQL Compat | Notes |
|---|---|---|
| [ABS()](./Functions-and-Operators/Mathematical/abs.md) | ✅ Full | — |
| [ACOS()](./Functions-and-Operators/Mathematical/acos.md) | ✅ Full | — |
| [ATAN()](./Functions-and-Operators/Mathematical/atan.md) | ✅ Full | — |
| [CEIL()](./Functions-and-Operators/Mathematical/ceil.md) | ✅ Full | — |
| [CEILING()](./Functions-and-Operators/Mathematical/ceiling.md) | ✅ Full | — |
| [COS()](./Functions-and-Operators/Mathematical/cos.md) | ✅ Full | — |
| [COT()](./Functions-and-Operators/Mathematical/cot.md) | ✅ Full | — |
| [CRC32()](./Functions-and-Operators/Mathematical/crc32.md) | ✅ Full | — |
| [EXP()](./Functions-and-Operators/Mathematical/exp.md) | ✅ Full | — |
| [FLOOR()](./Functions-and-Operators/Mathematical/floor.md) | ⚠️ Partial | MatrixOne supports an optional second decimals argument (FLOOR(number, decimals)) to specify decimal places; MySQL 8.0 only supports the single-argument form FLOOR(X)<br/>[MO-only] Two-argument form FLOOR(number, decimals) to specify decimal places |
| [LN()](./Functions-and-Operators/Mathematical/ln.md) | ✅ Full | — |
| [LOG()](./Functions-and-Operators/Mathematical/log.md) | ✅ Full | — |
| [LOG10()](./Functions-and-Operators/Mathematical/log10.md) | ✅ Full | — |
| [LOG2()](./Functions-and-Operators/Mathematical/log2.md) | ✅ Full | — |
| [PI()](./Functions-and-Operators/Mathematical/pi.md) | ✅ Full | — |
| [POWER()](./Functions-and-Operators/Mathematical/power.md) | ✅ Full | — |
| [RAND()](./Functions-and-Operators/Mathematical/rand.md) | ⚠️ Partial | RAND(seed) is not supported; calling RAND(N) with an integer argument produces ERROR 20203 |
| [ROUND()](./Functions-and-Operators/Mathematical/round.md) | ✅ Full | — |
| [SIN()](./Functions-and-Operators/Mathematical/sin.md) | ✅ Full | — |
| [SINH()](./Functions-and-Operators/Mathematical/sinh.md) | 🟣 MatrixOne-only | [MO-only] MySQL 8.0 has no hyperbolic trigonometric functions; SINH() is a MatrixOne extension. |
| [TAN()](./Functions-and-Operators/Mathematical/tan.md) | ✅ Full | — |

### Other

| Function | MySQL Compat | Notes |
|---|---|---|
| [LOAD_FILE()](./Functions-and-Operators/Other/load_file.md) | ⚠️ Partial | LOAD_FILE() takes a DATALINK value (file:// or stage:// URL) rather than MySQL's plain filesystem path argument |
| [SAMPLE Sampling Function](./Functions-and-Operators/Other/sample.md) | 🟣 MatrixOne-only | [MO-only] SAMPLE() is a MatrixOne sampling operator; no MySQL equivalent. |
| [SAVE_FILE()](./Functions-and-Operators/Other/save_file.md) | 🟣 MatrixOne-only | [MO-only] SAVE_FILE() writes to a MatrixOne stage; no MySQL equivalent. |
| [SERIAL_EXTRACT function](./Functions-and-Operators/Other/serial_extract.md) | 🟣 MatrixOne-only | [MO-only] SERIAL_EXTRACT() is a MatrixOne internal serial-column extractor. |
| [SLEEP()](./Functions-and-Operators/Other/sleep.md) | ✅ Full | — |
| [STAGE_LIST()](./Functions-and-Operators/Other/stage_list.md) | 🟣 MatrixOne-only | [MO-only] STAGE_LIST() — MO-specific stage management function (currently unimplemented, returns ERROR 20105) |
| [UUID()](./Functions-and-Operators/Other/uuid.md) | ✅ Full | — |

### String

| Function | MySQL Compat | Notes |
|---|---|---|
| [AES_DECRYPT()](./Functions-and-Operators/String/aes_decrypt.md) | ⚠️ Partial | MatrixOne supports only aes-128-ecb and aes-256-cbc block modes; MySQL 8.0 also supports the full set of ECB/CBC/CFB/OFB variants at multiple key sizes.<br/>MatrixOne AES_DECRYPT does not accept the optional kdf_name / salt / info KDF arguments present in MySQL 8.0. |
| [AES_ENCRYPT()](./Functions-and-Operators/String/aes_encrypt.md) | ⚠️ Partial | MatrixOne supports only aes-128-ecb and aes-256-cbc block modes; MySQL 8.0 also supports the full set of ECB/CBC/CFB/OFB variants at multiple key sizes.<br/>MatrixOne AES_ENCRYPT does not accept the optional kdf_name / salt / info KDF arguments present in MySQL 8.0. |
| [BIN()](./Functions-and-Operators/String/bin.md) | ✅ Full | — |
| [BIT_LENGTH()](./Functions-and-Operators/String/bit-length.md) | ✅ Full | — |
| [CHAR_LENGTH()](./Functions-and-Operators/String/char-length.md) | ✅ Full | — |
| [CONCAT_WS()](./Functions-and-Operators/String/concat-ws.md) | ✅ Full | — |
| [CONCAT()](./Functions-and-Operators/String/concat.md) | ⚠️ Partial | — |
| [ELT()](./Functions-and-Operators/String/elt.md) | ✅ Full | — |
| [EMPTY()](./Functions-and-Operators/String/empty.md) | 🟣 MatrixOne-only | [MO-only] EMPTY() is a MatrixOne helper returning whether a string is empty. |
| [ENDSWITH()](./Functions-and-Operators/String/endswith.md) | 🟣 MatrixOne-only | [MO-only] ENDSWITH() is a MatrixOne helper; MySQL has no direct equivalent. |
| [FIELD()](./Functions-and-Operators/String/field.md) | ✅ Full | — |
| [FIND_IN_SET()](./Functions-and-Operators/String/find-in-set.md) | ✅ Full | — |
| [FORMAT()](./Functions-and-Operators/String/format.md) | ✅ Full | — |
| [FROM_BASE64()](./Functions-and-Operators/String/from_base64.md) | ⚠️ Partial | FROM_BASE64() may include trailing null bytes in decoded output; MySQL strips them (e.g., FROM_BASE64('YQ==') returns 'a\\0\\0' instead of 'a') |
| [HEX()](./Functions-and-Operators/String/hex.md) | ✅ Full | — |
| [INSTR()](./Functions-and-Operators/String/instr.md) | ✅ Full | — |
| [LCASE()](./Functions-and-Operators/String/lcase.md) | ✅ Full | — |
| [LEFT()](./Functions-and-Operators/String/left.md) | ✅ Full | — |
| [LENGTH()](./Functions-and-Operators/String/length.md) | ✅ Full | — |
| [LOCATE()](./Functions-and-Operators/String/locate.md) | ✅ Full | — |
| [LOWER()](./Functions-and-Operators/String/lower.md) | ✅ Full | — |
| [LPAD()](./Functions-and-Operators/String/lpad.md) | ✅ Full | — |
| [LTRIM()](./Functions-and-Operators/String/ltrim.md) | ✅ Full | — |
| [MD5()](./Functions-and-Operators/String/md5.md) | ✅ Full | — |
| [NOT REGEXP](./Functions-and-Operators/String/Regular-Expressions/not-regexp.md) | ✅ Full | — |
| [OCT(N)](./Functions-and-Operators/String/oct.md) | ⚠️ Partial | OCT(N) returns a numeric value rather than MySQL's plain string representation |
| [REGEXP_INSTR()](./Functions-and-Operators/String/Regular-Expressions/regexp-instr.md) | ⚠️ Partial | match_type parameter not yet supported; passing it causes ERROR 20203 |
| [REGEXP_LIKE()](./Functions-and-Operators/String/Regular-Expressions/regexp-like.md) | ✅ Full | — |
| [REGEXP_REPLACE()](./Functions-and-Operators/String/Regular-Expressions/regexp-replace.md) | ✅ Full | — |
| [REGEXP_SUBSTR()](./Functions-and-Operators/String/Regular-Expressions/regexp-substr.md) | ⚠️ Partial | match_type parameter not yet supported; passing it causes ERROR 20203 |
| [Regular Expressions Overview](./Functions-and-Operators/String/Regular-Expressions/Regular-Expression-Functions-Overview.md) | ✅ Full | — |
| [REPEAT()](./Functions-and-Operators/String/repeat.md) | ✅ Full | — |
| [REVERSE()](./Functions-and-Operators/String/reverse.md) | ✅ Full | — |
| [RPAD()](./Functions-and-Operators/String/rpad.md) | ✅ Full | — |
| [RTRIM()](./Functions-and-Operators/String/rtrim.md) | ✅ Full | — |
| [SHA1()/SHA()](./Functions-and-Operators/String/sha1.md) | ✅ Full | — |
| [SHA2()](./Functions-and-Operators/String/sha2.md) | ✅ Full | — |
| [SPACE()](./Functions-and-Operators/String/space.md) | ✅ Full | — |
| [SPLIT_PART()](./Functions-and-Operators/String/split_part.md) | 🟣 MatrixOne-only | [MO-only] SPLIT_PART() is inherited from PostgreSQL; no MySQL equivalent. |
| [STARTSWITH()](./Functions-and-Operators/String/startswith.md) | 🟣 MatrixOne-only | [MO-only] STARTSWITH() is a MatrixOne helper; MySQL has no direct equivalent. |
| [STRCMP()](./Functions-and-Operators/String/strcmp.md) | ✅ Full | — |
| [SUBSTRING_INDEX()](./Functions-and-Operators/String/substring-index.md) | ✅ Full | — |
| [SUBSTRING()](./Functions-and-Operators/String/substring.md) | ✅ Full | — |
| [TO_BASE64()](./Functions-and-Operators/String/to_base64.md) | ✅ Full | — |
| [TRIM()](./Functions-and-Operators/String/trim.md) | ✅ Full | — |
| [UCASE()](./Functions-and-Operators/String/ucase.md) | ✅ Full | — |
| [UNHEX()](./Functions-and-Operators/String/unhex.md) | ✅ Full | — |
| [UPPER()](./Functions-and-Operators/String/upper.md) | ✅ Full | — |

### System Operations

| Function | MySQL Compat | Notes |
|---|---|---|
| [CURRENT_ROLE_NAME()](./Functions-and-Operators/system-ops/current_role_name.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne multi-account/role system management function (compat doc: System Management Functions). |
| [CURRENT_ROLE()](./Functions-and-Operators/system-ops/current_role.md) | ⚠️ Partial | Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'. |
| [CURRENT_USER_NAME()](./Functions-and-Operators/system-ops/current_user_name.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne multi-account/role system management function (compat doc: System Management Functions). |
| [CURRENT_USER, CURRENT_USER()](./Functions-and-Operators/system-ops/current_user.md) | ⚠️ Partial | The host part may be returned as 'localhost' or the resolved client host rather than MySQL's explicit 'username@host' format. |
| [PURGE_LOG()](./Functions-and-Operators/system-ops/purge_log.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne multi-account/role system management function (compat doc: System Management Functions). |
| [VERSION](./Functions-and-Operators/system-ops/version.md) | ✅ Full | — |

### Table

| Function | MySQL Compat | Notes |
|---|---|---|
| [GENERATE_SERIES()](./Functions-and-Operators/Table/generate_series.md) | 🟣 MatrixOne-only | [MO-only] Table-valued function; no direct MySQL equivalent. |
| [UNNEST()](./Functions-and-Operators/Table/unnest.md) | 🟣 MatrixOne-only | [MO-only] Table-valued function; no direct MySQL equivalent. |

### Vector

| Function | MySQL Compat | Notes |
|---|---|---|
| [Arithmetic operators](./Functions-and-Operators/Vector/arithmetic.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [CLUSTER_CENTERS](./Functions-and-Operators/Vector/cluster_centers.md) | 🟣 MatrixOne-only | [MO-only] CLUSTER_CENTERS() — MO-specific vector clustering function (currently unimplemented, returns ERROR 20102) |
| [COSINE_DISTANCE()](./Functions-and-Operators/Vector/cosine_distance.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [cosine_similarity()](./Functions-and-Operators/Vector/cosine_similarity.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [inner_product()](./Functions-and-Operators/Vector/inner_product.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [l1_norm()](./Functions-and-Operators/Vector/l1_norm.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [L2_DISTANCE()](./Functions-and-Operators/Vector/l2_distance.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [l2_norm()](./Functions-and-Operators/Vector/l2_norm.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [Mathematical class functions](./Functions-and-Operators/Vector/misc.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [NORMALIZE_L2()](./Functions-and-Operators/Vector/normalize_l2.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [SUBVECTOR()](./Functions-and-Operators/Vector/subvector.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
| [vector_dims()](./Functions-and-Operators/Vector/vector_dims.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |

### Window Functions

| Function | MySQL Compat | Notes |
|---|---|---|
| [CUME_DIST()](./Functions-and-Operators/Window-Functions/cume_dist.md) | ✅ Full | — |
| [DENSE_RANK()](./Functions-and-Operators/Window-Functions/dense_rank.md) | ✅ Full | — |
| [PERCENT_RANK()](./Functions-and-Operators/Window-Functions/percent_rank.md) | ✅ Full | — |
| [RANK()](./Functions-and-Operators/Window-Functions/rank.md) | ✅ Full | — |
| [ROW_NUMBER()](./Functions-and-Operators/Window-Functions/row_number.md) | ✅ Full | — |

## Operators

| Status | Count |
|---|---|
| ✅ Full | 6 |
| ⚠️ Partial | 4 |
| 🟣 MatrixOne-only | 5 |
| ❓ Unknown | 47 |
| **Total** | **62** |

### Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [INTERVAL](./Operators/interval.md) | ⚠️ Partial | INTERVAL is internally implemented as a two-argument function rather than as a true SQL keyword; documented syntax INTERVAL(expr,unit) differs from MySQL's INTERVAL expr unit keyword-style notation<br/>Malformed dates in DATE_ADD/DATE_SUB raise errors rather than returning NULL (MySQL 8.0 returns NULL) |
| [operator-precedence](./Operators/operator-precedence.md) | ❓ Unknown | — |
| [operators](./Operators/operators.md) | ❓ Unknown | — |

### Arithmetic Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [addition](./Operators/arithmetic-operators/addition.md) | ❓ Unknown | — |
| [arithmetic-operators-overview](./Operators/arithmetic-operators/arithmetic-operators-overview.md) | ❓ Unknown | — |
| [div](./Operators/arithmetic-operators/div.md) | ❓ Unknown | — |
| [division](./Operators/arithmetic-operators/division.md) | ❓ Unknown | — |
| [minus](./Operators/arithmetic-operators/minus.md) | ❓ Unknown | — |
| [mod](./Operators/arithmetic-operators/mod.md) | ❓ Unknown | — |
| [multiplication](./Operators/arithmetic-operators/multiplication.md) | ❓ Unknown | — |
| [unary-minus](./Operators/arithmetic-operators/unary-minus.md) | ❓ Unknown | — |

### Assignment Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [assignment-operators-overview](./Operators/assignment-operators/assignment-operators-overview.md) | ❓ Unknown | — |
| [equal](./Operators/assignment-operators/equal.md) | ❓ Unknown | — |

### Bit Functions and Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [bit-functions-and-operators-overview](./Operators/bit-functions-and-operators/bit-functions-and-operators-overview.md) | ❓ Unknown | — |
| [bitwise-and](./Operators/bit-functions-and-operators/bitwise-and.md) | ❓ Unknown | — |
| [bitwise-inversion](./Operators/bit-functions-and-operators/bitwise-inversion.md) | ❓ Unknown | — |
| [bitwise-or](./Operators/bit-functions-and-operators/bitwise-or.md) | ❓ Unknown | — |
| [bitwise-xor](./Operators/bit-functions-and-operators/bitwise-xor.md) | ❓ Unknown | — |
| [left-shift](./Operators/bit-functions-and-operators/left-shift.md) | ❓ Unknown | — |
| [right-shift](./Operators/bit-functions-and-operators/right-shift.md) | ❓ Unknown | — |

### Cast Functions and Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [binary](./Operators/cast-functions-and-operators/binary.md) | ❓ Unknown | — |
| [CAST](./Operators/cast-functions-and-operators/cast.md) | ⚠️ Partial | CAST('non-numeric' AS SIGNED) raises an error instead of returning 0 or NULL (MySQL 8.0 returns 0 with a warning)<br/>CAST(datetime_typed_value AS CHAR) may fail in some cases (MySQL 8.0 supports it universally) |
| [cast-functions-and-operators-overview](./Operators/cast-functions-and-operators/cast-functions-and-operators-overview.md) | ❓ Unknown | — |
| [CONVERT](./Operators/cast-functions-and-operators/convert.md) | ⚠️ Partial | CONVERT('non-numeric', SIGNED) raises an error instead of returning 0 or NULL<br/>CONVERT(datetime_typed_value, CHAR) may fail in some cases (MySQL 8.0 supports it universally) |
| [DECODE()](./Operators/cast-functions-and-operators/decode.md) | 🟣 MatrixOne-only | [MO-only] DECODE() was deprecated in MySQL 5.7 and removed in MySQL 8.0; MatrixOne continues to support it |
| [ENCODE()](./Operators/cast-functions-and-operators/encode.md) | 🟣 MatrixOne-only | [MO-only] ENCODE() was deprecated in MySQL 5.7 and removed in MySQL 8.0; MatrixOne continues to support it |
| [SERIAL_FULL()](./Operators/cast-functions-and-operators/serial_full.md) | 🟣 MatrixOne-only | [MO-only] SERIAL_FULL() is a MO-specific serialization function variant with NULL preservation, no MySQL 8.0 counterpart |
| [SERIAL()](./Operators/cast-functions-and-operators/serial.md) | 🟣 MatrixOne-only | [MO-only] SERIAL() is a MO-specific serialization function with no MySQL 8.0 counterpart |

### Comparison Functions and Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [<=>](./Operators/comparison-functions-and-operators/null-safe-equal.md) | ✅ Full | — |
| [assign-equal](./Operators/comparison-functions-and-operators/assign-equal.md) | ❓ Unknown | — |
| [between](./Operators/comparison-functions-and-operators/between.md) | ❓ Unknown | — |
| [coalesce](./Operators/comparison-functions-and-operators/coalesce.md) | ❓ Unknown | — |
| [comparison-functions-and-operators-overview](./Operators/comparison-functions-and-operators/comparison-functions-and-operators-overview.md) | ❓ Unknown | — |
| [function_interval](./Operators/comparison-functions-and-operators/function_interval.md) | ❓ Unknown | — |
| [function_isnull](./Operators/comparison-functions-and-operators/function_isnull.md) | ❓ Unknown | — |
| [function_least](./Operators/comparison-functions-and-operators/function_least.md) | ❓ Unknown | — |
| [function_strcmp](./Operators/comparison-functions-and-operators/function_strcmp.md) | ❓ Unknown | — |
| [greater-than](./Operators/comparison-functions-and-operators/greater-than.md) | ❓ Unknown | — |
| [greater-than-or-equal](./Operators/comparison-functions-and-operators/greater-than-or-equal.md) | ❓ Unknown | — |
| [ILIKE](./Operators/comparison-functions-and-operators/ilike.md) | 🟣 MatrixOne-only | [MO-only] ILIKE operator for case-insensitive LIKE matching (PostgreSQL extension) |
| [IN](./Operators/comparison-functions-and-operators/in.md) | ✅ Full | — |
| [is](./Operators/comparison-functions-and-operators/is.md) | ❓ Unknown | — |
| [IS NULL](./Operators/comparison-functions-and-operators/is-null.md) | ✅ Full | — |
| [is-not](./Operators/comparison-functions-and-operators/is-not.md) | ❓ Unknown | — |
| [is-not-null](./Operators/comparison-functions-and-operators/is-not-null.md) | ❓ Unknown | — |
| [less-than](./Operators/comparison-functions-and-operators/less-than.md) | ❓ Unknown | — |
| [less-than-or-equal](./Operators/comparison-functions-and-operators/less-than-or-equal.md) | ❓ Unknown | — |
| [like](./Operators/comparison-functions-and-operators/like.md) | ❓ Unknown | — |
| [NOT IN](./Operators/comparison-functions-and-operators/not-in.md) | ✅ Full | — |
| [not-between](./Operators/comparison-functions-and-operators/not-between.md) | ❓ Unknown | — |
| [not-equal](./Operators/comparison-functions-and-operators/not-equal.md) | ❓ Unknown | — |
| [not-like](./Operators/comparison-functions-and-operators/not-like.md) | ❓ Unknown | — |

### Flow Control Functions

| Operator | MySQL Compat | Notes |
|---|---|---|
| [CASE WHEN](./Operators/flow-control-functions/case-when.md) | ✅ Full | — |
| [flow-control-functions-overview](./Operators/flow-control-functions/flow-control-functions-overview.md) | ❓ Unknown | — |
| [function_ifnull](./Operators/flow-control-functions/function_ifnull.md) | ❓ Unknown | — |
| [function_nullif](./Operators/flow-control-functions/function_nullif.md) | ❓ Unknown | — |
| [IF()](./Operators/flow-control-functions/function_if.md) | ⚠️ Partial | IF(NULL, expr2, expr3) raises an error instead of returning expr3 (MySQL 8.0 returns expr3) |

### Logical Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [and](./Operators/logical-operators/and.md) | ❓ Unknown | — |
| [logical-operators-overview](./Operators/logical-operators/logical-operators-overview.md) | ❓ Unknown | — |
| [NOT / !](./Operators/logical-operators/not.md) | ✅ Full | — |
| [or](./Operators/logical-operators/or.md) | ❓ Unknown | — |
| [xor](./Operators/logical-operators/xor.md) | ❓ Unknown | — |

## Data Types

| Status | Count |
|---|---|
| ✅ Full | 1 |
| ⚠️ Partial | 7 |
| 🟣 MatrixOne-only | 3 |
| ❓ Unknown | 1 |
| **Total** | **12** |

### Data Types

| Data Type | MySQL Compat | Notes |
|---|---|---|
| [blob-text-type](./Data-Types/blob-text-type.md) | ❓ Unknown | — |
| [Data Type Conversion](./Data-Types/data-type-conversion.md) | ⚠️ Partial | BOOLEAN → DECIMAL cast is not supported; other common conversions are supported |
| [Data Types Overview](./Data-Types/data-types.md) | ⚠️ Partial | TIMESTAMP range is 0001-01-01 to 9999-12-31 (MySQL: 1970-01-01 to 2038-01-19)<br/>DATETIME lower bound is 0001-01-01 (MySQL: 1000-01-01)<br/>Non-standard type names FLOAT32/FLOAT64 in addition to MySQL's FLOAT/DOUBLE |
| [DATALINK Type](./Data-Types/datalink-type.md) | 🟣 MatrixOne-only | [MO-only] DATALINK data type with STAGE integration, file:// and stage:// URL schemes<br/>[MO-only] load_file() integration for reading DATALINK values |
| [ENUM Type](./Data-Types/enum-type.md) | ⚠️ Partial | — |
| [Fixed-Point Types (Exact Value) - DECIMAL](./Data-Types/fixed-point-types.md) | ⚠️ Partial | DECIMAL precision supports up to 65 digits via DECIMAL256 |
| [JSON Type](./Data-Types/json-type.md) | ✅ Full | — |
| [SET Type](./Data-Types/set-type.md) | ⚠️ Partial | — |
| [UUID Type](./Data-Types/uuid-type.md) | 🟣 MatrixOne-only | [MO-only] UUID as a native column type (MySQL 8.0 has UUID() function only, no UUID column type)<br/>[MO-only] DEFAULT uuid() on UUID columns |
| [Vector Type](./Data-Types/vector-type.md) | 🟣 MatrixOne-only | [MO-only] vecf32 and vecf64 vector data types for embedding storage and similarity search<br/>[MO-only] Binary vector insert via hex encoding<br/>[MO-only] Dimension specification syntax in column definition |

### Date/Time Data Types

| Data Type | MySQL Compat | Notes |
|---|---|---|
| [TIMESTAMP Initialization](./Data-Types/date-time-data-types/timestamp-initialization.md) | ⚠️ Partial | TIMESTAMP range is 0001-9999 (MySQL 8.0: 1970-2038); auto-initialization behavior near range boundaries may differ<br/>DATETIME DEFAULT 0 is not supported (MySQL 8.0 supports it)<br/>TIMESTAMP ON UPDATE CURRENT_TIMESTAMP without explicit DEFAULT defaults to NULL (MySQL 8.0 defaults to 0)<br/>DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP without explicit DEFAULT rejects NULL insert (MySQL 8.0 defaults to 0) |
| [YEAR Type](./Data-Types/date-time-data-types/year-type.md) | ⚠️ Partial | — |

## Language Structure

| Status | Count |
|---|---|
| ⚠️ Partial | 2 |
| **Total** | **2** |

### Language Structure

| Element | MySQL Compat | Notes |
|---|---|---|
| [Comments](./Language-Structure/comment.md) | ⚠️ Partial | Supports // single-line comments (C++ style); MySQL 8.0 does not support // comments<br/>Does not support /*!...*/ conditional/executable comments (MySQL 8.0 does) |
| [Keywords](./Language-Structure/keywords.md) | ⚠️ Partial | MatrixOne-specific keywords marked with (M) in the keyword list |
