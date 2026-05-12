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
| ✅ Full | 30 |
| ⚠️ Partial | 43 |
| ❌ None | 0 |
| 🟣 MatrixOne-only | 56 |
| ❓ Unknown | 0 |
| **Total** | **129** |

## Data Definition Language (DDL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [ALTER PITR](./SQL-Reference/Data-Definition-Language/alter-pitr.md) | 🟣 MatrixOne-only | — | ALTER PITR |
| [ALTER PUBLICATION](./SQL-Reference/Data-Definition-Language/alter-publication.md) | 🟣 MatrixOne-only | — | ALTER PUBLICATION |
| [ALTER REINDEX](./SQL-Reference/Data-Definition-Language/alter-reindex.md) | 🟣 MatrixOne-only | — | ALTER … REINDEX (rebuild vector index) |
| [ALTER SEQUENCE](./SQL-Reference/Data-Definition-Language/alter-sequence.md) | 🟣 MatrixOne-only | — | ALTER SEQUENCE |
| [ALTER STAGE](./SQL-Reference/Data-Definition-Language/alter-stage.md) | 🟣 MatrixOne-only | — | ALTER STAGE |
| [ALTER TABLE](./SQL-Reference/Data-Definition-Language/alter-table.md) | ⚠️ Partial | CHANGE [COLUMN], MODIFY [COLUMN], RENAME COLUMN, ADD/DROP PRIMARY KEY, ALTER COLUMN ORDER BY cannot be combined with other clauses in the same ALTER TABLE<br/>Temporary tables cannot be altered<br/>Tables created with CLUSTER BY cannot be altered<br/>ALTER TABLE does not support PARTITION operations | — |
| [ALTER VIEW](./SQL-Reference/Data-Definition-Language/alter-view.md) | ⚠️ Partial | Inherits CREATE VIEW limitations: no WITH CHECK OPTION, no DEFINER = user clause | — |
| [CREATE CLONE](./SQL-Reference/Data-Definition-Language/create-clone.md) | 🟣 MatrixOne-only | — | CREATE TABLE … CLONE db.table [TO ACCOUNT …] |
| [CREATE CLUSTER TABLE](./SQL-Reference/Data-Definition-Language/create-cluster-table.md) | 🟣 MatrixOne-only | — | CREATE CLUSTER TABLE |
| [CREATE DATABASE](./SQL-Reference/Data-Definition-Language/create-database.md) | ⚠️ Partial | Chinese database names not supported<br/>Only utf8mb4 / utf8mb4_bin are supported and cannot be changed<br/>ENCRYPTION clause accepted but inert | — |
| [CREATE DYNAMIC TABLE](./SQL-Reference/Data-Definition-Language/create-dynamic-table.md) | 🟣 MatrixOne-only | — | CREATE DYNAMIC TABLE |
| [CREATE EXTERNAL TABLE](./SQL-Reference/Data-Definition-Language/create-external-table.md) | 🟣 MatrixOne-only | — | CREATE EXTERNAL TABLE |
| [Create Fulltext Index](./SQL-Reference/Data-Definition-Language/create-fulltext-index.md) | ⚠️ Partial | MatrixOne full-text index is implemented on TAE storage with CJK/English optimizations; MySQL implements it on InnoDB/MyISAM with different stopword and parser semantics. | — |
| [CREATE FUNCTION...LANGUAGE PYTHON AS](./SQL-Reference/Data-Definition-Language/create-function-python.md) | 🟣 MatrixOne-only | — | CREATE FUNCTION … LANGUAGE PYTHON AS … |
| [CREATE FUNCTION...LANGUAGE SQL AS](./SQL-Reference/Data-Definition-Language/create-function-sql.md) | ⚠️ Partial | Only LANGUAGE SQL and LANGUAGE PYTHON are supported; usage differs significantly from MySQL stored functions | — |
| [CREATE INDEX](./SQL-Reference/Data-Definition-Language/create-index.md) | ⚠️ Partial | Secondary indexes are syntactically accepted but do not yet provide query speed-up<br/>Foreign keys do not support ON CASCADE DELETE | USING IVFFLAT — vector index for approximate nearest neighbour<br/>USING HNSW — vector index for approximate nearest neighbour<br/>USING MASTER — composite master index |
| [CREATE INDEX USING HNSW](./SQL-Reference/Data-Definition-Language/create-index-hnsw.md) | 🟣 MatrixOne-only | — | CREATE INDEX … USING HNSW |
| [CREATE INDEX USING IVFFLAT](./SQL-Reference/Data-Definition-Language/create-index-ivfflat.md) | 🟣 MatrixOne-only | — | CREATE INDEX … USING IVFFLAT |
| [CREATE PITR](./SQL-Reference/Data-Definition-Language/create-pitr.md) | 🟣 MatrixOne-only | — | CREATE PITR … RANGE N {h\|d\|mo\|y} |
| [CREATE PUBLICATION](./SQL-Reference/Data-Definition-Language/create-publication.md) | 🟣 MatrixOne-only | — | CREATE PUBLICATION |
| [CREATE SEQUENCE](./SQL-Reference/Data-Definition-Language/create-sequence.md) | 🟣 MatrixOne-only | — | CREATE SEQUENCE (PostgreSQL-style) |
| [CREATE SNAPSHOT](./SQL-Reference/Data-Definition-Language/create-snapshot.md) | 🟣 MatrixOne-only | — | CREATE SNAPSHOT FOR {ACCOUNT\|DATABASE\|TABLE\|CLUSTER} |
| [CREATE SOURCE](./SQL-Reference/Data-Definition-Language/create-source.md) | 🟣 MatrixOne-only | — | CREATE SOURCE (stream/Kafka connector) |
| [CREATE STAGE](./SQL-Reference/Data-Definition-Language/create-stage.md) | 🟣 MatrixOne-only | — | CREATE STAGE (external file-system binding) |
| [CREATE TABLE](./SQL-Reference/Data-Definition-Language/create-table.md) | ⚠️ Partial | ENGINE= clause in table definition not supported (MatrixOne has a single TAE engine)<br/>Spatial and SET types not supported; MEDIUMINT not supported<br/>BOOL is a native boolean type, not an INT alias as in MySQL<br/>AUTO_INCREMENT step is always 1; @@auto_increment_increment / @@auto_increment_offset are syntactically accepted but inert<br/>Partitioning accepts syntax but only HASH and KEY participate in partition pruning (RANGE/LIST/RANGE COLUMNS/LIST COLUMNS are syntax-only); subpartitioning is syntax-only; ADD/DROP/TRUNCATE PARTITION not supported | CLUSTER BY (col, …) — pre-sort columns to accelerate queries |
| [CREATE TABLE ... LIKE](./SQL-Reference/Data-Definition-Language/create-table-like.md) | ✅ Full | — | — |
| [CREATE TABLE AS SELECT](./SQL-Reference/Data-Definition-Language/create-table-as-select.md) | ✅ Full | — | — |
| [CREATE TASK (SQL Task)](./SQL-Reference/Data-Definition-Language/sql-task.md) | 🟣 MatrixOne-only | — | — |
| [CREATE VIEW](./SQL-Reference/Data-Definition-Language/create-view.md) | ⚠️ Partial | WITH CHECK OPTION clause not supported<br/>DEFINER = user clause not supported; SQL SECURITY {DEFINER \| INVOKER} is supported<br/>ALGORITHM = {UNDEFINED \| MERGE \| TEMPTABLE} clause not supported | — |
| [CREATE...FROM...PUBLICATION...](./SQL-Reference/Data-Definition-Language/create-subscription.md) | 🟣 MatrixOne-only | — | CREATE DATABASE … FROM … PUBLICATION … |
| [DATA BRANCH CREATE](./SQL-Reference/Data-Definition-Language/data-branch-create-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH CREATE (Git-for-Data) |
| [DATA BRANCH DELETE](./SQL-Reference/Data-Definition-Language/data-branch-delete-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH DELETE |
| [DATA BRANCH DIFF](./SQL-Reference/Data-Definition-Language/data-branch-diff-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH DIFF |
| [DATA BRANCH MERGE](./SQL-Reference/Data-Definition-Language/data-branch-merge-en.md) | 🟣 MatrixOne-only | — | DATA BRANCH MERGE |
| [DATA BRANCH PICK](./SQL-Reference/Data-Definition-Language/data-branch-pick.md) | 🟣 MatrixOne-only | — | — |
| [DROP DATABASE](./SQL-Reference/Data-Definition-Language/drop-database.md) | ✅ Full | — | — |
| [DROP FUNCTION](./SQL-Reference/Data-Definition-Language/drop-function.md) | ⚠️ Partial | Drops MatrixOne-style SQL / Python functions, not MySQL stored procedures/functions | — |
| [DROP INDEX](./SQL-Reference/Data-Definition-Language/drop-index.md) | ✅ Full | — | — |
| [DROP PITR](./SQL-Reference/Data-Definition-Language/drop-pitr.md) | 🟣 MatrixOne-only | — | DROP PITR |
| [DROP PUBLICATION](./SQL-Reference/Data-Definition-Language/drop-publication.md) | 🟣 MatrixOne-only | — | DROP PUBLICATION |
| [DROP SEQUENCE](./SQL-Reference/Data-Definition-Language/drop-sequence.md) | 🟣 MatrixOne-only | — | DROP SEQUENCE |
| [DROP SNAPSHOT](./SQL-Reference/Data-Definition-Language/drop-snapshot.md) | 🟣 MatrixOne-only | — | DROP SNAPSHOT |
| [DROP STAGE](./SQL-Reference/Data-Definition-Language/drop-stage.md) | 🟣 MatrixOne-only | — | DROP STAGE |
| [DROP TABLE](./SQL-Reference/Data-Definition-Language/drop-table.md) | ✅ Full | — | — |
| [DROP VIEW](./SQL-Reference/Data-Definition-Language/drop-view.md) | ✅ Full | — | — |
| [Rename Table](./SQL-Reference/Data-Definition-Language/rename-table.md) | ✅ Full | — | — |
| [RESTORE ... FROM PITR](./SQL-Reference/Data-Definition-Language/restore-pitr.md) | 🟣 MatrixOne-only | — | RESTORE … FROM PITR |
| [RESTORE ... SNAPSHOT](./SQL-Reference/Data-Definition-Language/restore-snapshot.md) | 🟣 MatrixOne-only | — | RESTORE … FROM SNAPSHOT |
| [TRUNCATE TABLE](./SQL-Reference/Data-Definition-Language/truncate-table.md) | ✅ Full | — | — |

## Data Manipulation Language (DML)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [CASE](./SQL-Reference/Data-Manipulation-Language/case.md) | ✅ Full | — | — |
| [CURRENT_ROLE()](./SQL-Reference/Data-Manipulation-Language/information-functions/current_role.md) | ⚠️ Partial | Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'. | — |
| [DELETE](./SQL-Reference/Data-Manipulation-Language/delete.md) | ⚠️ Partial | LOW_PRIORITY, QUICK, IGNORE modifiers not supported | — |
| [INSERT](./SQL-Reference/Data-Manipulation-Language/insert.md) | ⚠️ Partial | Modifiers LOW_PRIORITY / DELAYED / HIGH_PRIORITY not supported | — |
| [INSERT ... ON DUPLICATE KEY UPDATE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-on-duplicate.md) | ✅ Full | — | — |
| [INSERT IGNORE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-ignore.md) | ⚠️ Partial | LOW_PRIORITY / DELAYED / HIGH_PRIORITY modifiers not supported<br/>Duplicates are silently ignored; MySQL emits a warning for each skipped row.<br/>Does not ignore NULL-into-NOT-NULL, type-conversion, or partition-mismatch errors as MySQL does. | — |
| [INSERT INTO SELECT](./SQL-Reference/Data-Manipulation-Language/insert-into-select.md) | ✅ Full | — | — |
| [LAST_INSERT_ID()](./SQL-Reference/Data-Manipulation-Language/information-functions/last-insert-id.md) | ⚠️ Partial | Multi-row INSERT returns the last inserted auto-increment value; MySQL returns the first inserted value. | — |
| [LAST_QUERY_ID](./SQL-Reference/Data-Manipulation-Language/information-functions/last-query-id.md) | 🟣 MatrixOne-only | — | LAST_QUERY_ID() |
| [LOAD DATA](./SQL-Reference/Data-Manipulation-Language/load-data-infile.md) | ⚠️ Partial | LOAD DATA LOCAL requires --local-infile on the client<br/>SET clause only accepts columns_name = nullif(expr1, expr2)<br/>JSONLines import uses MatrixOne-specific syntax<br/>Object-storage import (S3/URL) uses MatrixOne-specific syntax | — |
| [LOAD DATA INLINE](./SQL-Reference/Data-Manipulation-Language/load-data-inline.md) | 🟣 MatrixOne-only | — | LOAD DATA INLINE (stage-sourced import) |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/replace.md) | ⚠️ Partial | REPLACE does not support VALUES row_constructor_list<br/>node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne) | — |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/upsert/replace.md) | ⚠️ Partial | REPLACE does not support VALUES row_constructor_list<br/>node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne) | — |
| [UPDATE](./SQL-Reference/Data-Manipulation-Language/update.md) | ⚠️ Partial | LOW_PRIORITY and IGNORE modifiers not supported | — |
| [UPSERT](./SQL-Reference/Data-Manipulation-Language/upsert/upsert.md) | 🟣 MatrixOne-only | — | UPSERT (convenience alias over INSERT … ON DUPLICATE KEY UPDATE) |

## Data Query Language (DQL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [BY RANK WITH OPTION](./SQL-Reference/Data-Query-Language/by-rank-with-option.md) | 🟣 MatrixOne-only | — | BY RANK WITH OPTION (IVF vector ranking) |
| [Combining Queries (UNION, INTERSECT, MINUS)](./SQL-Reference/Data-Query-Language/union-intersect-minus-overview.md) | 🟣 MatrixOne-only | — | MINUS, INTERSECT set operators |
| [Comparisons Using Subqueries](./SQL-Reference/Data-Query-Language/subqueries/comparisons-using-subqueries.md) | ✅ Full | — | — |
| [CROSS APPLY](./SQL-Reference/Data-Query-Language/apply/cross-apply.md) | 🟣 MatrixOne-only | — | CROSS APPLY (SQL Server-style, not in MySQL) |
| [CROSS JOIN](./SQL-Reference/Data-Query-Language/join/cross-join.md) | ✅ Full | — | — |
| [Derived Tables](./SQL-Reference/Data-Query-Language/subqueries/derived-tables.md) | ✅ Full | — | — |
| [FULL JOIN](./SQL-Reference/Data-Query-Language/join/full-join.md) | 🟣 MatrixOne-only | — | FULL JOIN / FULL OUTER JOIN is not supported in MySQL 8.0 (users must emulate it with LEFT JOIN UNION RIGHT JOIN). |
| [INNER JOIN](./SQL-Reference/Data-Query-Language/join/inner-join.md) | ✅ Full | — | — |
| [INTERSECT](./SQL-Reference/Data-Query-Language/intersect.md) | 🟣 MatrixOne-only | — | INTERSECT set operator is not available in MySQL 8.0. |
| [JOIN](./SQL-Reference/Data-Query-Language/join/join.md) | ✅ Full | — | — |
| [LEFT JOIN](./SQL-Reference/Data-Query-Language/join/left-join.md) | ✅ Full | — | — |
| [MINUS](./SQL-Reference/Data-Query-Language/minus.md) | 🟣 MatrixOne-only | — | MINUS (set-difference query, not in MySQL) |
| [NATURAL JOIN](./SQL-Reference/Data-Query-Language/join/natural-join.md) | ✅ Full | — | — |
| [OUTER APPLY](./SQL-Reference/Data-Query-Language/apply/outer-apply.md) | 🟣 MatrixOne-only | — | OUTER APPLY (SQL Server-style, not in MySQL) |
| [OUTER JOIN](./SQL-Reference/Data-Query-Language/join/outer-join.md) | ⚠️ Partial | Overview page that includes FULL OUTER JOIN, which MySQL 8.0 does not support. | — |
| [RIGHT JOIN](./SQL-Reference/Data-Query-Language/join/right-join.md) | ✅ Full | — | — |
| [SELECT](./SQL-Reference/Data-Query-Language/select.md) | ⚠️ Partial | SELECT … FOR UPDATE only supports single-table queries<br/>SELECT INTO OUTFILE is only partially supported<br/>Unqualified SELECT ... FROM DUAL requires explicit database name (SELECT ... FROM dbname.DUAL) | { AS OF TIMESTAMP 'YYYY-MM-DD HH:MM:SS' } — time-travel query against snapshot/PITR<br/>ORDER BY ... NULLS { FIRST \| LAST } — PostgreSQL-style NULL ordering not available in MySQL |
| [Subqueries with ALL](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-all.md) | ✅ Full | — | — |
| [Subqueries with ANY or SOME](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-any-some.md) | ✅ Full | — | — |
| [Subqueries with EXISTS or NOT EXISTS](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-exists.md) | ✅ Full | — | — |
| [Subqueries with IN](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-in.md) | ⚠️ Partial | Multi-level correlated subqueries inside IN() are not supported | — |
| [SUBQUERY](./SQL-Reference/Data-Query-Language/subqueries/subquery.md) | ⚠️ Partial | Multi-level correlated subqueries inside IN() are not supported | — |
| [UNION](./SQL-Reference/Data-Query-Language/union.md) | ✅ Full | — | — |
| [WITH (Common Table Expressions)](./SQL-Reference/Data-Query-Language/with-cte.md) | ✅ Full | — | — |

## Data Control Language (DCL)

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [ALTER ACCOUNT](./SQL-Reference/Data-Control-Language/alter-account.md) | 🟣 MatrixOne-only | — | ALTER ACCOUNT |
| [ALTER USER](./SQL-Reference/Data-Control-Language/alter-user.md) | ⚠️ Partial | Only ALTER USER can change passwords; account-limit clauses not honoured | — |
| [CREATE ACCOUNT](./SQL-Reference/Data-Control-Language/create-account.md) | 🟣 MatrixOne-only | — | CREATE ACCOUNT … ADMIN_NAME … |
| [CREATE ROLE](./SQL-Reference/Data-Control-Language/create-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. | — |
| [CREATE USER](./SQL-Reference/Data-Control-Language/create-user.md) | ⚠️ Partial | IDENTIFIED BY is the only supported password form; IDENTIFIED WITH plugins not supported<br/>Connection-IP whitelists and connection-limit clauses not supported<br/>COMMENT and ATTRIBUTE clauses are accepted syntactically but not honoured<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples | — |
| [DROP ACCOUNT](./SQL-Reference/Data-Control-Language/drop-account.md) | 🟣 MatrixOne-only | — | DROP ACCOUNT |
| [DROP ROLE](./SQL-Reference/Data-Control-Language/drop-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. | — |
| [DROP USER](./SQL-Reference/Data-Control-Language/drop-user.md) | ⚠️ Partial | User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples. | — |
| [GRANT](./SQL-Reference/Data-Control-Language/grant.md) | ⚠️ Partial | Authorization logic differs from MySQL — MatrixOne evaluates via its role/account model<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples | `GRANT ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>`GRANT ... ON DATABASE *` — MatrixOne-specific database-level grant target |
| [REVOKE](./SQL-Reference/Data-Control-Language/revoke.md) | ⚠️ Partial | Recovery logic differs from MySQL — privileges return to the role/account graph<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples | `REVOKE ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>`REVOKE ... ON DATABASE *` — MatrixOne-specific database-level revoke target |
| [Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)](./SQL-Reference/Data-Control-Language/role-rule.md) | 🟣 MatrixOne-only | — | — |

## Other

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [DEALLOCATE PREPARE](./SQL-Reference/Other/Prepared-Statements/deallocate.md) | ✅ Full | — | — |
| [EXECUTE](./SQL-Reference/Other/Prepared-Statements/execute.md) | ✅ Full | — | — |
| [EXPLAIN](./SQL-Reference/Other/Explain/explain.md) | ⚠️ Partial | Output format mirrors PostgreSQL, not MySQL<br/>JSON output not supported | — |
| [EXPLAIN Output Format](./SQL-Reference/Other/Explain/explain-workflow.md) | ⚠️ Partial | Output format mirrors PostgreSQL; JSON output not supported | — |
| [EXPLAIN PREPARED](./SQL-Reference/Other/Explain/explain-prepared.md) | 🟣 MatrixOne-only | — | EXPLAIN FORCE EXECUTE stmt_name [USING @var] is a MatrixOne extension; MySQL explains prepared statements through EXPLAIN FOR CONNECTION. |
| [Get information with EXPLAIN ANALYZE](./SQL-Reference/Other/Explain/explain-analyze.md) | ⚠️ Partial | Output format mirrors PostgreSQL; JSON output not supported | — |
| [KILL](./SQL-Reference/Other/kill.md) | ✅ Full | — | — |
| [PREPARE](./SQL-Reference/Other/Prepared-Statements/prepare.md) | ⚠️ Partial | MatrixOne cannot PREPARE SET statements | — |
| [SET ROLE](./SQL-Reference/Other/Set/set-role.md) | ⚠️ Partial | Accepts a single role name only; MySQL 8.0 also supports NONE, DEFAULT, ALL, ALL EXCEPT role_list, and role lists. | SET SECONDARY ROLE {NONE \| ALL} — MatrixOne-only primary/secondary role model. |
| [SHOW ACCOUNTS](./SQL-Reference/Other/SHOW-Statements/show-account.md) | 🟣 MatrixOne-only | — | SHOW ACCOUNTS |
| [SHOW COLLATION](./SQL-Reference/Other/SHOW-Statements/show-collation.md) | ⚠️ Partial | Only utf8mb4_bin is effective; other collations appear but are inert | — |
| [SHOW COLUMNS](./SQL-Reference/Other/SHOW-Statements/show-columns.md) | ✅ Full | — | — |
| [SHOW CREATE PUBLICATION](./SQL-Reference/Other/SHOW-Statements/show-create-publication.md) | 🟣 MatrixOne-only | — | SHOW CREATE PUBLICATION |
| [SHOW CREATE TABLE](./SQL-Reference/Other/SHOW-Statements/show-create-table.md) | ⚠️ Partial | Output reflects MatrixOne-specific extensions (CLUSTER BY, USING IVFFLAT/HNSW, etc.) | — |
| [SHOW CREATE VIEW](./SQL-Reference/Other/SHOW-Statements/show-create-view.md) | ⚠️ Partial | DEFINER = user clause absent from output; SQL SECURITY {DEFINER\|INVOKER} is emitted | — |
| [SHOW DATABASES](./SQL-Reference/Other/SHOW-Statements/show-databases.md) | ✅ Full | — | — |
| [SHOW FUNCTION STATUS](./SQL-Reference/Other/SHOW-Statements/show-function-status.md) | ⚠️ Partial | Lists MatrixOne SQL/Python functions, not MySQL stored routines | — |
| [SHOW GRANTS](./SQL-Reference/Other/SHOW-Statements/show-grants.md) | ⚠️ Partial | Results reflect MatrixOne role/account graph and differ from MySQL significantly | — |
| [SHOW INDEX](./SQL-Reference/Other/SHOW-Statements/show-index.md) | ⚠️ Partial | Reflects MatrixOne index model — secondary index rows appear but may not accelerate queries | — |
| [SHOW PITR](./SQL-Reference/Other/SHOW-Statements/show-pitrs.md) | 🟣 MatrixOne-only | — | SHOW PITR |
| [SHOW PROCESSLIST](./SQL-Reference/Other/SHOW-Statements/show-processlist.md) | ⚠️ Partial | Output differs significantly from MySQL due to different implementation | — |
| [SHOW PUBLICATIONS](./SQL-Reference/Other/SHOW-Statements/show-publications.md) | 🟣 MatrixOne-only | — | SHOW PUBLICATIONS |
| [SHOW ROLES](./SQL-Reference/Other/SHOW-Statements/show-roles.md) | 🟣 MatrixOne-only | — | SHOW ROLES |
| [SHOW SEQUENCES](./SQL-Reference/Other/SHOW-Statements/show-sequences.md) | 🟣 MatrixOne-only | — | SHOW SEQUENCES |
| [SHOW STAGES](./SQL-Reference/Other/SHOW-Statements/show-stage.md) | 🟣 MatrixOne-only | — | SHOW STAGES |
| [SHOW SUBSCRIPTIONS](./SQL-Reference/Other/SHOW-Statements/show-subscriptions.md) | 🟣 MatrixOne-only | — | SHOW SUBSCRIPTIONS |
| [SHOW TABLES](./SQL-Reference/Other/SHOW-Statements/show-tables.md) | ⚠️ Partial | Result column is named 'name' rather than MySQL's 'Tables_in_<dbname>'. | — |
| [SHOW VARIABLES](./SQL-Reference/Other/SHOW-Statements/show-variables.md) | ⚠️ Partial | System variables are mostly syntactic stubs; actual behaviour differs from MySQL | — |
| [USE](./SQL-Reference/Other/use-database.md) | ✅ Full | — | — |

## Uncategorized

| Statement | MySQL Compat | Differences from MySQL | MatrixOne-only |
|---|---|---|---|
| [Type of SQL Statements](./SQL-Reference/SQL-Type.md) | 🟣 MatrixOne-only | — | Index page describing MatrixOne's own SQL statement taxonomy; not a MySQL-equivalent concept. |
