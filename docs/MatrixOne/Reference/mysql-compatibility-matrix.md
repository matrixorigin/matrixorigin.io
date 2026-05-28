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
| ✅ Full | 141 |
| ⚠️ Partial | 60 |
| ❌ None | 0 |
| 🟣 MatrixOne-only | 92 |
| ❓ Unknown | 74 |
| **Total** | **367** |

## SQL Statements

| Status | Count |
|---|---|
| ✅ Full | 30 |
| ⚠️ Partial | 43 |
| 🟣 MatrixOne-only | 56 |
| **Total** | **129** |

### SQL Statements

| Statement | MySQL Compat | Notes |
|---|---|---|
| [Type of SQL Statements](./SQL-Reference/SQL-Type.md) | 🟣 MatrixOne-only | [MO-only] Index page describing MatrixOne's own SQL statement taxonomy; not a MySQL-equivalent concept. |

### Data Control Language (DCL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [ALTER ACCOUNT](./SQL-Reference/Data-Control-Language/alter-account.md) | 🟣 MatrixOne-only | [MO-only] ALTER ACCOUNT |
| [ALTER USER](./SQL-Reference/Data-Control-Language/alter-user.md) | ⚠️ Partial | Only ALTER USER can change passwords; account-limit clauses not honoured |
| [CREATE ACCOUNT](./SQL-Reference/Data-Control-Language/create-account.md) | 🟣 MatrixOne-only | [MO-only] CREATE ACCOUNT … ADMIN_NAME … |
| [CREATE ROLE](./SQL-Reference/Data-Control-Language/create-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. |
| [CREATE USER](./SQL-Reference/Data-Control-Language/create-user.md) | ⚠️ Partial | IDENTIFIED BY is the only supported password form; IDENTIFIED WITH plugins not supported<br/>Connection-IP whitelists and connection-limit clauses not supported<br/>COMMENT and ATTRIBUTE clauses are accepted syntactically but not honoured<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples |
| [DROP ACCOUNT](./SQL-Reference/Data-Control-Language/drop-account.md) | 🟣 MatrixOne-only | [MO-only] DROP ACCOUNT |
| [DROP ROLE](./SQL-Reference/Data-Control-Language/drop-role.md) | ⚠️ Partial | Role exists inside MatrixOne's multi-account model; roles are account-scoped, not server-global as in MySQL. |
| [DROP USER](./SQL-Reference/Data-Control-Language/drop-user.md) | ⚠️ Partial | User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples. |
| [GRANT](./SQL-Reference/Data-Control-Language/grant.md) | ⚠️ Partial | Authorization logic differs from MySQL — MatrixOne evaluates via its role/account model<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>[MO-only] `GRANT ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>[MO-only] `GRANT ... ON DATABASE *` — MatrixOne-specific database-level grant target |
| [REVOKE](./SQL-Reference/Data-Control-Language/revoke.md) | ⚠️ Partial | Recovery logic differs from MySQL — privileges return to the role/account graph<br/>User identifier is a bare username scoped to the current account; MySQL uses 'user'@'host' tuples<br/>[MO-only] `REVOKE ... ON ACCOUNT *` — account-level privileges have no MySQL counterpart<br/>[MO-only] `REVOKE ... ON DATABASE *` — MatrixOne-specific database-level revoke target |
| [Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)](./SQL-Reference/Data-Control-Language/role-rule.md) | 🟣 MatrixOne-only | — |

### Data Definition Language (DDL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [ALTER PITR](./SQL-Reference/Data-Definition-Language/alter-pitr.md) | 🟣 MatrixOne-only | [MO-only] ALTER PITR |
| [ALTER PUBLICATION](./SQL-Reference/Data-Definition-Language/alter-publication.md) | 🟣 MatrixOne-only | [MO-only] ALTER PUBLICATION |
| [ALTER REINDEX](./SQL-Reference/Data-Definition-Language/alter-reindex.md) | 🟣 MatrixOne-only | [MO-only] ALTER … REINDEX (rebuild vector index) |
| [ALTER SEQUENCE](./SQL-Reference/Data-Definition-Language/alter-sequence.md) | 🟣 MatrixOne-only | [MO-only] ALTER SEQUENCE |
| [ALTER STAGE](./SQL-Reference/Data-Definition-Language/alter-stage.md) | 🟣 MatrixOne-only | [MO-only] ALTER STAGE |
| [ALTER TABLE](./SQL-Reference/Data-Definition-Language/alter-table.md) | ⚠️ Partial | CHANGE [COLUMN], MODIFY [COLUMN], RENAME COLUMN, ADD/DROP PRIMARY KEY, ALTER COLUMN ORDER BY cannot be combined with other clauses in the same ALTER TABLE<br/>Temporary tables cannot be altered<br/>Tables created with CLUSTER BY cannot be altered<br/>ALTER TABLE does not support PARTITION operations |
| [ALTER VIEW](./SQL-Reference/Data-Definition-Language/alter-view.md) | ⚠️ Partial | Inherits CREATE VIEW limitations: no WITH CHECK OPTION, no DEFINER = user clause |
| [CREATE CLONE](./SQL-Reference/Data-Definition-Language/create-clone.md) | 🟣 MatrixOne-only | [MO-only] CREATE TABLE … CLONE db.table [TO ACCOUNT …] |
| [CREATE CLUSTER TABLE](./SQL-Reference/Data-Definition-Language/create-cluster-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE CLUSTER TABLE |
| [CREATE DATABASE](./SQL-Reference/Data-Definition-Language/create-database.md) | ⚠️ Partial | Chinese database names not supported<br/>Only utf8mb4 / utf8mb4_bin are supported and cannot be changed<br/>ENCRYPTION clause accepted but inert |
| [CREATE DYNAMIC TABLE](./SQL-Reference/Data-Definition-Language/create-dynamic-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE DYNAMIC TABLE |
| [CREATE EXTERNAL TABLE](./SQL-Reference/Data-Definition-Language/create-external-table.md) | 🟣 MatrixOne-only | [MO-only] CREATE EXTERNAL TABLE |
| [Create Fulltext Index](./SQL-Reference/Data-Definition-Language/create-fulltext-index.md) | ⚠️ Partial | MatrixOne full-text index is implemented on TAE storage with CJK/English optimizations; MySQL implements it on InnoDB/MyISAM with different stopword and parser semantics. |
| [CREATE FUNCTION...LANGUAGE PYTHON AS](./SQL-Reference/Data-Definition-Language/create-function-python.md) | 🟣 MatrixOne-only | [MO-only] CREATE FUNCTION … LANGUAGE PYTHON AS … |
| [CREATE FUNCTION...LANGUAGE SQL AS](./SQL-Reference/Data-Definition-Language/create-function-sql.md) | ⚠️ Partial | Only LANGUAGE SQL and LANGUAGE PYTHON are supported; usage differs significantly from MySQL stored functions |
| [CREATE INDEX](./SQL-Reference/Data-Definition-Language/create-index.md) | ⚠️ Partial | Secondary indexes are syntactically accepted but do not yet provide query speed-up<br/>Foreign keys do not support ON CASCADE DELETE<br/>[MO-only] USING IVFFLAT — vector index for approximate nearest neighbour<br/>[MO-only] USING HNSW — vector index for approximate nearest neighbour<br/>[MO-only] USING MASTER — composite master index |
| [CREATE INDEX USING HNSW](./SQL-Reference/Data-Definition-Language/create-index-hnsw.md) | 🟣 MatrixOne-only | [MO-only] CREATE INDEX … USING HNSW |
| [CREATE INDEX USING IVFFLAT](./SQL-Reference/Data-Definition-Language/create-index-ivfflat.md) | 🟣 MatrixOne-only | [MO-only] CREATE INDEX … USING IVFFLAT |
| [CREATE PITR](./SQL-Reference/Data-Definition-Language/create-pitr.md) | 🟣 MatrixOne-only | [MO-only] CREATE PITR … RANGE N {h\|d\|mo\|y} |
| [CREATE PUBLICATION](./SQL-Reference/Data-Definition-Language/create-publication.md) | 🟣 MatrixOne-only | [MO-only] CREATE PUBLICATION |
| [CREATE SEQUENCE](./SQL-Reference/Data-Definition-Language/create-sequence.md) | 🟣 MatrixOne-only | [MO-only] CREATE SEQUENCE (PostgreSQL-style) |
| [CREATE SNAPSHOT](./SQL-Reference/Data-Definition-Language/create-snapshot.md) | 🟣 MatrixOne-only | [MO-only] CREATE SNAPSHOT FOR {ACCOUNT\|DATABASE\|TABLE\|CLUSTER} |
| [CREATE SOURCE](./SQL-Reference/Data-Definition-Language/create-source.md) | 🟣 MatrixOne-only | [MO-only] CREATE SOURCE (stream/Kafka connector) |
| [CREATE STAGE](./SQL-Reference/Data-Definition-Language/create-stage.md) | 🟣 MatrixOne-only | [MO-only] CREATE STAGE (external file-system binding) |
| [CREATE TABLE](./SQL-Reference/Data-Definition-Language/create-table.md) | ⚠️ Partial | ENGINE= clause in table definition not supported (MatrixOne has a single TAE engine)<br/>Spatial and SET types not supported; MEDIUMINT not supported<br/>BOOL is a native boolean type, not an INT alias as in MySQL<br/>AUTO_INCREMENT step is always 1; @@auto_increment_increment / @@auto_increment_offset are syntactically accepted but inert<br/>Partitioning accepts syntax but only HASH and KEY participate in partition pruning (RANGE/LIST/RANGE COLUMNS/LIST COLUMNS are syntax-only); subpartitioning is syntax-only; ADD/DROP/TRUNCATE PARTITION not supported<br/>[MO-only] CLUSTER BY (col, …) — pre-sort columns to accelerate queries |
| [CREATE TABLE ... LIKE](./SQL-Reference/Data-Definition-Language/create-table-like.md) | ✅ Full | — |
| [CREATE TABLE AS SELECT](./SQL-Reference/Data-Definition-Language/create-table-as-select.md) | ✅ Full | — |
| [CREATE TASK (SQL Task)](./SQL-Reference/Data-Definition-Language/sql-task.md) | 🟣 MatrixOne-only | — |
| [CREATE VIEW](./SQL-Reference/Data-Definition-Language/create-view.md) | ⚠️ Partial | WITH CHECK OPTION clause not supported<br/>DEFINER = user clause not supported; SQL SECURITY {DEFINER \| INVOKER} is supported<br/>ALGORITHM = {UNDEFINED \| MERGE \| TEMPTABLE} clause not supported |
| [CREATE...FROM...PUBLICATION...](./SQL-Reference/Data-Definition-Language/create-subscription.md) | 🟣 MatrixOne-only | [MO-only] CREATE DATABASE … FROM … PUBLICATION … |
| [DATA BRANCH CREATE](./SQL-Reference/Data-Definition-Language/data-branch-create-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH CREATE (Git-for-Data) |
| [DATA BRANCH DELETE](./SQL-Reference/Data-Definition-Language/data-branch-delete-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH DELETE |
| [DATA BRANCH DIFF](./SQL-Reference/Data-Definition-Language/data-branch-diff-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH DIFF |
| [DATA BRANCH MERGE](./SQL-Reference/Data-Definition-Language/data-branch-merge-en.md) | 🟣 MatrixOne-only | [MO-only] DATA BRANCH MERGE |
| [DATA BRANCH PICK](./SQL-Reference/Data-Definition-Language/data-branch-pick.md) | 🟣 MatrixOne-only | — |
| [DROP DATABASE](./SQL-Reference/Data-Definition-Language/drop-database.md) | ✅ Full | — |
| [DROP FUNCTION](./SQL-Reference/Data-Definition-Language/drop-function.md) | ⚠️ Partial | Drops MatrixOne-style SQL / Python functions, not MySQL stored procedures/functions |
| [DROP INDEX](./SQL-Reference/Data-Definition-Language/drop-index.md) | ✅ Full | — |
| [DROP PITR](./SQL-Reference/Data-Definition-Language/drop-pitr.md) | 🟣 MatrixOne-only | [MO-only] DROP PITR |
| [DROP PUBLICATION](./SQL-Reference/Data-Definition-Language/drop-publication.md) | 🟣 MatrixOne-only | [MO-only] DROP PUBLICATION |
| [DROP SEQUENCE](./SQL-Reference/Data-Definition-Language/drop-sequence.md) | 🟣 MatrixOne-only | [MO-only] DROP SEQUENCE |
| [DROP SNAPSHOT](./SQL-Reference/Data-Definition-Language/drop-snapshot.md) | 🟣 MatrixOne-only | [MO-only] DROP SNAPSHOT |
| [DROP STAGE](./SQL-Reference/Data-Definition-Language/drop-stage.md) | 🟣 MatrixOne-only | [MO-only] DROP STAGE |
| [DROP TABLE](./SQL-Reference/Data-Definition-Language/drop-table.md) | ✅ Full | — |
| [DROP VIEW](./SQL-Reference/Data-Definition-Language/drop-view.md) | ✅ Full | — |
| [Rename Table](./SQL-Reference/Data-Definition-Language/rename-table.md) | ✅ Full | — |
| [RESTORE ... FROM PITR](./SQL-Reference/Data-Definition-Language/restore-pitr.md) | 🟣 MatrixOne-only | [MO-only] RESTORE … FROM PITR |
| [RESTORE ... SNAPSHOT](./SQL-Reference/Data-Definition-Language/restore-snapshot.md) | 🟣 MatrixOne-only | [MO-only] RESTORE … FROM SNAPSHOT |
| [TRUNCATE TABLE](./SQL-Reference/Data-Definition-Language/truncate-table.md) | ✅ Full | — |

### Data Manipulation Language (DML)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [CASE](./SQL-Reference/Data-Manipulation-Language/case.md) | ✅ Full | — |
| [CURRENT_ROLE()](./SQL-Reference/Data-Manipulation-Language/information-functions/current_role.md) | ⚠️ Partial | Returns a single active role name; MySQL 8.0 can return multiple comma-separated active roles or 'NONE'. |
| [DELETE](./SQL-Reference/Data-Manipulation-Language/delete.md) | ⚠️ Partial | LOW_PRIORITY, QUICK, IGNORE modifiers not supported |
| [INSERT](./SQL-Reference/Data-Manipulation-Language/insert.md) | ⚠️ Partial | Modifiers LOW_PRIORITY / DELAYED / HIGH_PRIORITY not supported |
| [INSERT ... ON DUPLICATE KEY UPDATE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-on-duplicate.md) | ✅ Full | — |
| [INSERT IGNORE](./SQL-Reference/Data-Manipulation-Language/upsert/insert-ignore.md) | ⚠️ Partial | LOW_PRIORITY / DELAYED / HIGH_PRIORITY modifiers not supported<br/>Duplicates are silently ignored; MySQL emits a warning for each skipped row.<br/>Does not ignore NULL-into-NOT-NULL, type-conversion, or partition-mismatch errors as MySQL does. |
| [INSERT INTO SELECT](./SQL-Reference/Data-Manipulation-Language/insert-into-select.md) | ✅ Full | — |
| [LAST_INSERT_ID()](./SQL-Reference/Data-Manipulation-Language/information-functions/last-insert-id.md) | ⚠️ Partial | Multi-row INSERT returns the last inserted auto-increment value; MySQL returns the first inserted value. |
| [LAST_QUERY_ID](./SQL-Reference/Data-Manipulation-Language/information-functions/last-query-id.md) | 🟣 MatrixOne-only | [MO-only] LAST_QUERY_ID() |
| [LOAD DATA](./SQL-Reference/Data-Manipulation-Language/load-data-infile.md) | ⚠️ Partial | LOAD DATA LOCAL requires --local-infile on the client<br/>SET clause only accepts columns_name = nullif(expr1, expr2)<br/>JSONLines import uses MatrixOne-specific syntax<br/>Object-storage import (S3/URL) uses MatrixOne-specific syntax |
| [LOAD DATA INLINE](./SQL-Reference/Data-Manipulation-Language/load-data-inline.md) | 🟣 MatrixOne-only | [MO-only] LOAD DATA INLINE (stage-sourced import) |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/replace.md) | ⚠️ Partial | REPLACE does not support VALUES row_constructor_list<br/>node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne) |
| [REPLACE](./SQL-Reference/Data-Manipulation-Language/upsert/replace.md) | ⚠️ Partial | REPLACE does not support VALUES row_constructor_list<br/>node-sql-parser rejects REPLACE … WHERE (parser bug, not MatrixOne) |
| [UPDATE](./SQL-Reference/Data-Manipulation-Language/update.md) | ⚠️ Partial | LOW_PRIORITY and IGNORE modifiers not supported |
| [UPSERT](./SQL-Reference/Data-Manipulation-Language/upsert/upsert.md) | 🟣 MatrixOne-only | [MO-only] UPSERT (convenience alias over INSERT … ON DUPLICATE KEY UPDATE) |

### Data Query Language (DQL)

| Statement | MySQL Compat | Notes |
|---|---|---|
| [BY RANK WITH OPTION](./SQL-Reference/Data-Query-Language/by-rank-with-option.md) | 🟣 MatrixOne-only | [MO-only] BY RANK WITH OPTION (IVF vector ranking) |
| [Combining Queries (UNION, INTERSECT, MINUS)](./SQL-Reference/Data-Query-Language/union-intersect-minus-overview.md) | 🟣 MatrixOne-only | [MO-only] MINUS, INTERSECT set operators |
| [Comparisons Using Subqueries](./SQL-Reference/Data-Query-Language/subqueries/comparisons-using-subqueries.md) | ✅ Full | — |
| [CROSS APPLY](./SQL-Reference/Data-Query-Language/apply/cross-apply.md) | 🟣 MatrixOne-only | [MO-only] CROSS APPLY (SQL Server-style, not in MySQL) |
| [CROSS JOIN](./SQL-Reference/Data-Query-Language/join/cross-join.md) | ✅ Full | — |
| [Derived Tables](./SQL-Reference/Data-Query-Language/subqueries/derived-tables.md) | ✅ Full | — |
| [FULL JOIN](./SQL-Reference/Data-Query-Language/join/full-join.md) | 🟣 MatrixOne-only | [MO-only] FULL JOIN / FULL OUTER JOIN is not supported in MySQL 8.0 (users must emulate it with LEFT JOIN UNION RIGHT JOIN). |
| [INNER JOIN](./SQL-Reference/Data-Query-Language/join/inner-join.md) | ✅ Full | — |
| [INTERSECT](./SQL-Reference/Data-Query-Language/intersect.md) | 🟣 MatrixOne-only | [MO-only] INTERSECT set operator is not available in MySQL 8.0. |
| [JOIN](./SQL-Reference/Data-Query-Language/join/join.md) | ✅ Full | — |
| [LEFT JOIN](./SQL-Reference/Data-Query-Language/join/left-join.md) | ✅ Full | — |
| [MINUS](./SQL-Reference/Data-Query-Language/minus.md) | 🟣 MatrixOne-only | [MO-only] MINUS (set-difference query, not in MySQL) |
| [NATURAL JOIN](./SQL-Reference/Data-Query-Language/join/natural-join.md) | ✅ Full | — |
| [OUTER APPLY](./SQL-Reference/Data-Query-Language/apply/outer-apply.md) | 🟣 MatrixOne-only | [MO-only] OUTER APPLY (SQL Server-style, not in MySQL) |
| [OUTER JOIN](./SQL-Reference/Data-Query-Language/join/outer-join.md) | ⚠️ Partial | Overview page that includes FULL OUTER JOIN, which MySQL 8.0 does not support. |
| [RIGHT JOIN](./SQL-Reference/Data-Query-Language/join/right-join.md) | ✅ Full | — |
| [SELECT](./SQL-Reference/Data-Query-Language/select.md) | ⚠️ Partial | SELECT … FOR UPDATE only supports single-table queries<br/>SELECT INTO OUTFILE is only partially supported<br/>Unqualified SELECT ... FROM DUAL requires explicit database name (SELECT ... FROM dbname.DUAL)<br/>[MO-only] { AS OF TIMESTAMP 'YYYY-MM-DD HH:MM:SS' } — time-travel query against snapshot/PITR<br/>[MO-only] ORDER BY ... NULLS { FIRST \| LAST } — PostgreSQL-style NULL ordering not available in MySQL |
| [Subqueries with ALL](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-all.md) | ✅ Full | — |
| [Subqueries with ANY or SOME](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-any-some.md) | ✅ Full | — |
| [Subqueries with EXISTS or NOT EXISTS](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-exists.md) | ✅ Full | — |
| [Subqueries with IN](./SQL-Reference/Data-Query-Language/subqueries/subquery-with-in.md) | ⚠️ Partial | Multi-level correlated subqueries inside IN() are not supported |
| [SUBQUERY](./SQL-Reference/Data-Query-Language/subqueries/subquery.md) | ⚠️ Partial | Multi-level correlated subqueries inside IN() are not supported |
| [UNION](./SQL-Reference/Data-Query-Language/union.md) | ✅ Full | — |
| [WITH (Common Table Expressions)](./SQL-Reference/Data-Query-Language/with-cte.md) | ✅ Full | — |

### Other

| Statement | MySQL Compat | Notes |
|---|---|---|
| [DEALLOCATE PREPARE](./SQL-Reference/Other/Prepared-Statements/deallocate.md) | ✅ Full | — |
| [EXECUTE](./SQL-Reference/Other/Prepared-Statements/execute.md) | ✅ Full | — |
| [EXPLAIN](./SQL-Reference/Other/Explain/explain.md) | ⚠️ Partial | Output format mirrors PostgreSQL, not MySQL<br/>JSON output not supported |
| [EXPLAIN Output Format](./SQL-Reference/Other/Explain/explain-workflow.md) | ⚠️ Partial | Output format mirrors PostgreSQL; JSON output not supported |
| [EXPLAIN PREPARED](./SQL-Reference/Other/Explain/explain-prepared.md) | 🟣 MatrixOne-only | [MO-only] EXPLAIN FORCE EXECUTE stmt_name [USING @var] is a MatrixOne extension; MySQL explains prepared statements through EXPLAIN FOR CONNECTION. |
| [Get information with EXPLAIN ANALYZE](./SQL-Reference/Other/Explain/explain-analyze.md) | ⚠️ Partial | Output format mirrors PostgreSQL; JSON output not supported |
| [KILL](./SQL-Reference/Other/kill.md) | ✅ Full | — |
| [PREPARE](./SQL-Reference/Other/Prepared-Statements/prepare.md) | ⚠️ Partial | MatrixOne cannot PREPARE SET statements |
| [SET ROLE](./SQL-Reference/Other/Set/set-role.md) | ⚠️ Partial | Accepts a single role name only; MySQL 8.0 also supports NONE, DEFAULT, ALL, ALL EXCEPT role_list, and role lists.<br/>[MO-only] SET SECONDARY ROLE {NONE \| ALL} — MatrixOne-only primary/secondary role model. |
| [SHOW ACCOUNTS](./SQL-Reference/Other/SHOW-Statements/show-account.md) | 🟣 MatrixOne-only | [MO-only] SHOW ACCOUNTS |
| [SHOW COLLATION](./SQL-Reference/Other/SHOW-Statements/show-collation.md) | ⚠️ Partial | Only utf8mb4_bin is effective; other collations appear but are inert |
| [SHOW COLUMNS](./SQL-Reference/Other/SHOW-Statements/show-columns.md) | ✅ Full | — |
| [SHOW CREATE PUBLICATION](./SQL-Reference/Other/SHOW-Statements/show-create-publication.md) | 🟣 MatrixOne-only | [MO-only] SHOW CREATE PUBLICATION |
| [SHOW CREATE TABLE](./SQL-Reference/Other/SHOW-Statements/show-create-table.md) | ⚠️ Partial | Output reflects MatrixOne-specific extensions (CLUSTER BY, USING IVFFLAT/HNSW, etc.) |
| [SHOW CREATE VIEW](./SQL-Reference/Other/SHOW-Statements/show-create-view.md) | ⚠️ Partial | DEFINER = user clause absent from output; SQL SECURITY {DEFINER\|INVOKER} is emitted |
| [SHOW DATABASES](./SQL-Reference/Other/SHOW-Statements/show-databases.md) | ✅ Full | — |
| [SHOW FUNCTION STATUS](./SQL-Reference/Other/SHOW-Statements/show-function-status.md) | ⚠️ Partial | Lists MatrixOne SQL/Python functions, not MySQL stored routines |
| [SHOW GRANTS](./SQL-Reference/Other/SHOW-Statements/show-grants.md) | ⚠️ Partial | Results reflect MatrixOne role/account graph and differ from MySQL significantly |
| [SHOW INDEX](./SQL-Reference/Other/SHOW-Statements/show-index.md) | ⚠️ Partial | Reflects MatrixOne index model — secondary index rows appear but may not accelerate queries |
| [SHOW PITR](./SQL-Reference/Other/SHOW-Statements/show-pitrs.md) | 🟣 MatrixOne-only | [MO-only] SHOW PITR |
| [SHOW PROCESSLIST](./SQL-Reference/Other/SHOW-Statements/show-processlist.md) | ⚠️ Partial | Output differs significantly from MySQL due to different implementation |
| [SHOW PUBLICATIONS](./SQL-Reference/Other/SHOW-Statements/show-publications.md) | 🟣 MatrixOne-only | [MO-only] SHOW PUBLICATIONS |
| [SHOW ROLES](./SQL-Reference/Other/SHOW-Statements/show-roles.md) | 🟣 MatrixOne-only | [MO-only] SHOW ROLES |
| [SHOW SEQUENCES](./SQL-Reference/Other/SHOW-Statements/show-sequences.md) | 🟣 MatrixOne-only | [MO-only] SHOW SEQUENCES |
| [SHOW STAGES](./SQL-Reference/Other/SHOW-Statements/show-stage.md) | 🟣 MatrixOne-only | [MO-only] SHOW STAGES |
| [SHOW SUBSCRIPTIONS](./SQL-Reference/Other/SHOW-Statements/show-subscriptions.md) | 🟣 MatrixOne-only | [MO-only] SHOW SUBSCRIPTIONS |
| [SHOW TABLES](./SQL-Reference/Other/SHOW-Statements/show-tables.md) | ⚠️ Partial | Result column is named 'name' rather than MySQL's 'Tables_in_<dbname>'. |
| [SHOW VARIABLES](./SQL-Reference/Other/SHOW-Statements/show-variables.md) | ⚠️ Partial | System variables are mostly syntactic stubs; actual behaviour differs from MySQL |
| [USE](./SQL-Reference/Other/use-database.md) | ✅ Full | — |

## Functions

| Status | Count |
|---|---|
| ✅ Full | 110 |
| ⚠️ Partial | 17 |
| 🟣 MatrixOne-only | 36 |
| **Total** | **163** |

### Functions

| Function | MySQL Compat | Notes |
|---|---|---|
| [Summary table of functions](./Functions-and-Operators/matrixone-function-list.md) | 🟣 MatrixOne-only | [MO-only] Listing page (includes MatrixOne-only functions). |

### Aggregate Functions

| Function | MySQL Compat | Notes |
|---|---|---|
| [ANY_VALUE](./Functions-and-Operators/Aggregate-Functions/any-value.md) | ✅ Full | — |
| [AVG](./Functions-and-Operators/Aggregate-Functions/avg.md) | ✅ Full | — |
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
| [SUM](./Functions-and-Operators/Aggregate-Functions/sum.md) | ✅ Full | — |
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
| [DAYOFYEAR()](./Functions-and-Operators/Datetime/dayofyear.md) | ⚠️ Partial | Date literals accept only 'yyyy-mm-dd' and 'yyyymmdd' formats; MySQL accepts wider variants. |
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
| [TIMESTAMP()](./Functions-and-Operators/Datetime/timestamp.md) | ⚠️ Partial | MatrixOne TIMESTAMP range is '0001-01-01'–'9999-12-31' vs MySQL '1970-01-01'–'2038-01-19' (compat doc: Data Types). |
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

### Json

| Function | MySQL Compat | Notes |
|---|---|---|
| [JQ()](./Functions-and-Operators/Json/jq.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne integration of the jq JSON query language; no MySQL equivalent. |
| [JSON Arrow Operators -> and ->>](./Functions-and-Operators/Json/json-arrow.md) | ✅ Full | — |
| [JSON_EXTRACT_FLOAT64()](./Functions-and-Operators/Json/json_extract_float64.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne convenience wrapper returning FLOAT64 directly. |
| [JSON_EXTRACT_FLOAT64()](./Functions-and-Operators/Json/json_extract_string.md) | 🟣 MatrixOne-only | [MO-only] MatrixOne convenience wrapper returning a string result directly. |
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
| [FLOOR()](./Functions-and-Operators/Mathematical/floor.md) | ✅ Full | — |
| [LN()](./Functions-and-Operators/Mathematical/ln.md) | ✅ Full | — |
| [LOG()](./Functions-and-Operators/Mathematical/log.md) | ✅ Full | — |
| [LOG10()](./Functions-and-Operators/Mathematical/log10.md) | ✅ Full | — |
| [LOG2()](./Functions-and-Operators/Mathematical/log2.md) | ✅ Full | — |
| [PI()](./Functions-and-Operators/Mathematical/pi.md) | ✅ Full | — |
| [POWER()](./Functions-and-Operators/Mathematical/power.md) | ✅ Full | — |
| [RAND()](./Functions-and-Operators/Mathematical/rand.md) | ✅ Full | — |
| [ROUND()](./Functions-and-Operators/Mathematical/round.md) | ✅ Full | — |
| [SIN()](./Functions-and-Operators/Mathematical/sin.md) | ✅ Full | — |
| [SINH()](./Functions-and-Operators/Mathematical/sinh.md) | 🟣 MatrixOne-only | [MO-only] MySQL 8.0 has no hyperbolic trigonometric functions; SINH() is a MatrixOne extension. |
| [TAN()](./Functions-and-Operators/Mathematical/tan.md) | ✅ Full | — |

### Other

| Function | MySQL Compat | Notes |
|---|---|---|
| [LOAD_FILE()](./Functions-and-Operators/Other/load_file.md) | 🟣 MatrixOne-only | [MO-only] LOAD_FILE() takes a DATALINK value (file:// or stage:// URL) rather than MySQL's plain filesystem path argument; semantics differ. |
| [SAMPLE Sampling Function](./Functions-and-Operators/Other/sample.md) | 🟣 MatrixOne-only | [MO-only] SAMPLE() is a MatrixOne sampling operator; no MySQL equivalent. |
| [SAVE_FILE()](./Functions-and-Operators/Other/save_file.md) | 🟣 MatrixOne-only | [MO-only] SAVE_FILE() writes to a MatrixOne stage; no MySQL equivalent. |
| [SERIAL_EXTRACT function](./Functions-and-Operators/Other/serial_extract.md) | 🟣 MatrixOne-only | [MO-only] SERIAL_EXTRACT() is a MatrixOne internal serial-column extractor. |
| [SLEEP()](./Functions-and-Operators/Other/sleep.md) | ✅ Full | — |
| [STAGE_LIST()](./Functions-and-Operators/Other/stage_list.md) | 🟣 MatrixOne-only | [MO-only] STAGE_LIST() lists MatrixOne stage contents. |
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
| [CONCAT()](./Functions-and-Operators/String/concat.md) | ✅ Full | — |
| [ELT()](./Functions-and-Operators/String/elt.md) | ✅ Full | — |
| [EMPTY()](./Functions-and-Operators/String/empty.md) | 🟣 MatrixOne-only | [MO-only] EMPTY() is a MatrixOne helper returning whether a string is empty. |
| [ENDSWITH()](./Functions-and-Operators/String/endswith.md) | 🟣 MatrixOne-only | [MO-only] ENDSWITH() is a MatrixOne helper; MySQL has no direct equivalent. |
| [FIELD()](./Functions-and-Operators/String/field.md) | ✅ Full | — |
| [FIND_IN_SET()](./Functions-and-Operators/String/find-in-set.md) | ✅ Full | — |
| [FORMAT()](./Functions-and-Operators/String/format.md) | ✅ Full | — |
| [FROM_BASE64()](./Functions-and-Operators/String/from_base64.md) | ✅ Full | — |
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
| [OCT(N)](./Functions-and-Operators/String/oct.md) | ✅ Full | — |
| [REGEXP_INSTR()](./Functions-and-Operators/String/Regular-Expressions/regexp-instr.md) | ✅ Full | — |
| [REGEXP_LIKE()](./Functions-and-Operators/String/Regular-Expressions/regexp-like.md) | ✅ Full | — |
| [REGEXP_REPLACE()](./Functions-and-Operators/String/Regular-Expressions/regexp-replace.md) | ✅ Full | — |
| [REGEXP_SUBSTR()](./Functions-and-Operators/String/Regular-Expressions/regexp-substr.md) | ✅ Full | — |
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
| [CURRENT_USER, CURRENT_USER()](./Functions-and-Operators/system-ops/current_user.md) | ⚠️ Partial | Return format is 'username@0.0.0.0' rather than MySQL's 'username@host' with a resolved client host. |
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
| [CLUSTER_CENTERS](./Functions-and-Operators/Vector/cluster_centers.md) | 🟣 MatrixOne-only | [MO-only] Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — \"MatrixOne supports vector types\"). |
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
| ✅ Full | 1 |
| ❓ Unknown | 61 |
| **Total** | **62** |

### Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [interval](./Operators/interval.md) | ❓ Unknown | — |
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
| [cast](./Operators/cast-functions-and-operators/cast.md) | ❓ Unknown | — |
| [cast-functions-and-operators-overview](./Operators/cast-functions-and-operators/cast-functions-and-operators-overview.md) | ❓ Unknown | — |
| [convert](./Operators/cast-functions-and-operators/convert.md) | ❓ Unknown | — |
| [decode](./Operators/cast-functions-and-operators/decode.md) | ❓ Unknown | — |
| [encode](./Operators/cast-functions-and-operators/encode.md) | ❓ Unknown | — |
| [serial](./Operators/cast-functions-and-operators/serial.md) | ❓ Unknown | — |
| [serial_full](./Operators/cast-functions-and-operators/serial_full.md) | ❓ Unknown | — |

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
| [ilike](./Operators/comparison-functions-and-operators/ilike.md) | ❓ Unknown | — |
| [in](./Operators/comparison-functions-and-operators/in.md) | ❓ Unknown | — |
| [is](./Operators/comparison-functions-and-operators/is.md) | ❓ Unknown | — |
| [is-not](./Operators/comparison-functions-and-operators/is-not.md) | ❓ Unknown | — |
| [is-not-null](./Operators/comparison-functions-and-operators/is-not-null.md) | ❓ Unknown | — |
| [is-null](./Operators/comparison-functions-and-operators/is-null.md) | ❓ Unknown | — |
| [less-than](./Operators/comparison-functions-and-operators/less-than.md) | ❓ Unknown | — |
| [less-than-or-equal](./Operators/comparison-functions-and-operators/less-than-or-equal.md) | ❓ Unknown | — |
| [like](./Operators/comparison-functions-and-operators/like.md) | ❓ Unknown | — |
| [not-between](./Operators/comparison-functions-and-operators/not-between.md) | ❓ Unknown | — |
| [not-equal](./Operators/comparison-functions-and-operators/not-equal.md) | ❓ Unknown | — |
| [not-in](./Operators/comparison-functions-and-operators/not-in.md) | ❓ Unknown | — |
| [not-like](./Operators/comparison-functions-and-operators/not-like.md) | ❓ Unknown | — |

### Flow Control Functions

| Operator | MySQL Compat | Notes |
|---|---|---|
| [case-when](./Operators/flow-control-functions/case-when.md) | ❓ Unknown | — |
| [flow-control-functions-overview](./Operators/flow-control-functions/flow-control-functions-overview.md) | ❓ Unknown | — |
| [function_if](./Operators/flow-control-functions/function_if.md) | ❓ Unknown | — |
| [function_ifnull](./Operators/flow-control-functions/function_ifnull.md) | ❓ Unknown | — |
| [function_nullif](./Operators/flow-control-functions/function_nullif.md) | ❓ Unknown | — |

### Logical Operators

| Operator | MySQL Compat | Notes |
|---|---|---|
| [and](./Operators/logical-operators/and.md) | ❓ Unknown | — |
| [logical-operators-overview](./Operators/logical-operators/logical-operators-overview.md) | ❓ Unknown | — |
| [not](./Operators/logical-operators/not.md) | ❓ Unknown | — |
| [or](./Operators/logical-operators/or.md) | ❓ Unknown | — |
| [xor](./Operators/logical-operators/xor.md) | ❓ Unknown | — |

## Data Types

| Status | Count |
|---|---|
| ❓ Unknown | 11 |
| **Total** | **11** |

### Data Types

| Data Type | MySQL Compat | Notes |
|---|---|---|
| [blob-text-type](./Data-Types/blob-text-type.md) | ❓ Unknown | — |
| [data-type-conversion](./Data-Types/data-type-conversion.md) | ❓ Unknown | — |
| [data-types](./Data-Types/data-types.md) | ❓ Unknown | — |
| [datalink-type](./Data-Types/datalink-type.md) | ❓ Unknown | — |
| [enum-type](./Data-Types/enum-type.md) | ❓ Unknown | — |
| [fixed-point-types](./Data-Types/fixed-point-types.md) | ❓ Unknown | — |
| [json-type](./Data-Types/json-type.md) | ❓ Unknown | — |
| [uuid-type](./Data-Types/uuid-type.md) | ❓ Unknown | — |
| [vector-type](./Data-Types/vector-type.md) | ❓ Unknown | — |

### Date/Time Data Types

| Data Type | MySQL Compat | Notes |
|---|---|---|
| [timestamp-initialization](./Data-Types/date-time-data-types/timestamp-initialization.md) | ❓ Unknown | — |
| [year-type](./Data-Types/date-time-data-types/year-type.md) | ❓ Unknown | — |

## Language Structure

| Status | Count |
|---|---|
| ❓ Unknown | 2 |
| **Total** | **2** |

### Language Structure

| Element | MySQL Compat | Notes |
|---|---|---|
| [comment](./Language-Structure/comment.md) | ❓ Unknown | — |
| [keywords](./Language-Structure/keywords.md) | ❓ Unknown | — |
