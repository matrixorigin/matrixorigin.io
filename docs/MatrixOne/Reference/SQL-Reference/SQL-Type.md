# Type of SQL Statements

In MatrixOne, SQL statements are classified into various categories, and each category's definition and contents are presented in the following sections:

## DDL - Data Definition Language

Data Definition Language (DDL) is a subset of DBMS language used for defining data objects. In MatrixOne, DDL statements are divided into five categories:

### CREATE Statements - Creating Various Objects in MatrixOne

- [CREATE DATABASE](Data-Definition-Language/create-database.md)
- [CREATE INDEX](Data-Definition-Language/create-index.md)
- [CREATE TABLE](Data-Definition-Language/create-table.md)
- [CREATE EXTERNAL TABLE](Data-Definition-Language/create-external-table.md)
- [CREATE FUNCTION](Data-Definition-Language/create-function-sql.md)
- [CREATE PITR](Data-Definition-Language/create-pitr.md)
- [CREATE PUBLICATION](Data-Definition-Language/create-publication.md)
- [CREATE SEQUENCE](Data-Definition-Language/create-sequence.md)
- [CREATE SNAPSHOT](Data-Definition-Language/create-snapshot.md)
- [CREATE STAGE](Data-Definition-Language/create-stage.md)
- [CREATE...FROM...PUBLICATION...](Data-Definition-Language/create-subscription.md)
- [CREATE VIEW](Data-Definition-Language/create-view.md)

### DROP Statements - Deleting Various Objects in MatrixOne

- [DROP INDEX](Data-Definition-Language/drop-index.md)
- [DROP TABLE](Data-Definition-Language/drop-table.md)
- [DROP FUNCTION](Data-Definition-Language/drop-function.md)
- [DROP PITR](Data-Definition-Language/drop-pitr.md)
- [DROP PUBLICATION](Data-Definition-Language/drop-publication.md)
- [DROP SEQUENCE](Data-Definition-Language/drop-sequence.md)
- [DROP SNAPSHOT](Data-Definition-Language/drop-snapshot.md)
- [DROP STAGE](Data-Definition-Language/drop-stage.md)
- [DROP VIEW](Data-Definition-Language/drop-view.md)

### ALTER Statements - Modifying Various Objects in MatrixOne

- [ALTER TABLE](Data-Definition-Language/alter-table.md)
- [ALTER PUBLICATION](Data-Definition-Language/alter-publication.md)
- [ALTER PITR](Data-Definition-Language/alter-pitr.md)
- [ALTER REINDEX](Data-Definition-Language/alter-reindex.md)
- [ALTER SEQUENCE](Data-Definition-Language/alter-sequence.md)
- [ALTER STAGE](Data-Definition-Language/alter-stage.md)
- [ALTER VIEW](Data-Definition-Language/alter-view.md)

### TRUNCATE Statement - Clearing Data from a Table

- [TRUNCATE TABLE](Data-Definition-Language/truncate-table.md)

### RENAME 语句

- [RENAME TABLE](Data-Definition-Language/rename-table.md)

### RESTORE 语句

- [RESTORE SNAPSHOT](Data-Definition-Language/restore-snapshot.md)
- [RESTORE PITR](Data-Definition-Language/restore-pitr.md)

## DML - Data Manipulation Language

Data Manipulation Language (DML) is used for database operations, including programming statements to work with database objects and data. In MatrixOne, DML is categorized as follows:

### INSERT Statements - Inserting New Rows into a Table

- [INSERT](Data-Manipulation-Language/insert.md)
- [INSERT INTO SELECT](Data-Manipulation-Language/insert-into-select.md)
- [INSERT IGNORE](Data-Manipulation-Language/upsert/insert-ignore.md)
- [INSERT ON DUPLICATE KEY UPDATE](Data-Manipulation-Language/upsert/insert-on-duplicate.md)

### DELETE Statement - Deleting Existing Rows from a Table

- [DELETE](Data-Manipulation-Language/delete.md)

### UPDATE Statement - Modifying Data in Existing Rows of a Table

- [UPDATE](Data-Manipulation-Language/update.md)

### LOAD DATA Statement - Bulk Importing Data from Files into the Database

- [LOAD DATA](Data-Manipulation-Language/load-data.md)

### REPLACE Statement - Replacing Rows

- [REPLACE](Data-Manipulation-Language/replace.md)

## DQL - Data Query Language

Data Query Language (DQL) is used to retrieve existing data in MatrixOne. It primarily consists of SELECT statements and includes the following categories:

### Single-Table Query - Involving a Single Table with One-Level Hierarchy

- [SELECT](Data-Query-Language/select.md)

### Subquery - Nested Queries Embedded in Another SQL Query

- [SUBQUERY with ANY or SOME](Data-Query-Language/subqueries/subquery-with-any-some.md)
- [SUBQUERY with ALL](Data-Query-Language/subqueries/subquery-with-all.md)
- [SUBQUERY with EXISTS](Data-Query-Language/subqueries/subquery-with-exists.md)
- [SUBQUERY with IN](Data-Query-Language/subqueries/subquery-with-in.md)

### Apply Query - A query that applies an operation to each row of data

- [CROSS APPLY](Data-Query-Language/apply/cross-apply.md)
- [OUTER APPLY](Data-Query-Language/apply/outer-apply.md)
  
### Join Query - Combining Results from Multiple Tables

- [INNER JOIN](Data-Query-Language/join/inner-join.md)
- [LEFT JOIN](Data-Query-Language/join/left-join.md)
- [RIGHT JOIN](Data-Query-Language/join/right-join.md)
- [FULL JOIN](Data-Query-Language/join/full-join.md)
- [OUTER JOIN](Data-Query-Language/join/outer-join.md)
- [NATURAL JOIN](Data-Query-Language/join/natural-join.md)

### Common Table Expressions - Temporary Results for Reuse in Queries

- [With CTE](Data-Query-Language/with-cte.md)

### Combination Queries - Combining Results of Multiple Queries with UNION, INTERSECT, and MINUS Operations

- [UNION](Data-Query-Language/union.md)
- [INTERSECT](Data-Query-Language/intersect.md)
- [MINUS](Data-Query-Language/minus.md)

### In addition to SELECT statements, DQL includes VALUES statements for constants

- [SELECT](Data-Query-Language/select.md)

### And internal commands corresponding to the modump tool

- [Export Data](../../Develop/export-data/modump.md)

## TCL - Transaction Control Language

Transaction Control Language (TCL) in MatrixOne provides specialized language for transaction management and includes the following categories:

### START TRANSACTION - Initiating a Transaction (BEGIN can be used as a dialect in MatrixOne)

```
START TRANSACTION;
  TRANSACTION STATEMENTS
```

### COMMIT - Committing a Transaction

```
START TRANSACTION;
  TRANSACTION STATEMENTS
  COMMIT;
  OR
  SET AUTOCOMMIT=0;
  TRANSACTION STATEMENTS
  COMMIT;
```

### ROLLBACK - Rolling Back a Transaction

```
START TRANSACTION;
  TRANSACTION STATEMENTS
  ROLLBACK;
  OR
  SET AUTOCOMMIT=0;
  TRANSACTION STATEMENTS
  ROLLBACK;
```

## DCL - Data Control Language

Data Control Language (DCL) includes commands for resource allocation and deallocation, user and role creation and deletion, and authorization and revocation of permissions in MatrixOne, categorized as follows:

### CREATE Statements - Creating Tenants, Users, and Roles

- [CREATE ACCOUNT](Data-Control-Language/create-account.md)
- [CREATE ROLE](Data-Control-Language/create-role.md)
- [CREATE USER](Data-Control-Language/create-user.md)

### DROP Statements - Deleting Accounts, Users, and Roles

- [DROP ACCOUNT](Data-Control-Language/drop-account.md)
- [DROP USER](Data-Control-Language/drop-user.md)
- [DROP ROLE](Data-Control-Language/drop-role.md)

### ALTER Statements - Modifying Account or User Information

- [ALTER ACCOUNT](Data-Control-Language/alter-account.md)
- [ALTER USER](Data-Control-Language/alter-user.md)

### GRANT Statement - Granting Permissions to Users or Roles

- [GRANT](Data-Control-Language/grant.md)

### REVOKE Statement - Revoking Permissions from Users or Roles

- [REVOKE](Data-Control-Language/revoke.md)

## Other - Management Language

Management language in MatrixOne pertains to parameters and resource allocation not directly associated with data. It includes various statement types:

### SHOW Statements

Using SHOW statements to retrieve information:

- [SHOW DATABASES](Other/SHOW-Statements/show-databases.md)
- [SHOW CREATE TABLE](Other/SHOW-Statements/show-create-table.md)
- [SHOW CREATE VIEW](Other/SHOW-Statements/show-create-view.md)
- [SHOW CREATE PUBLICATION](Other/SHOW-Statements/show-create-publication.md)
- [SHOW TABLES](Other/SHOW-Statements/show-tables.md)
- [SHOW INDEX](Other/SHOW-Statements/show-index.md)
- [SHOW COLLATION](Other/SHOW-Statements/show-collation.md)
- [SHOW COLUMNS](Other/SHOW-Statements/show-columns.md)
- [SHOW FUNCTION STATUS](Other/SHOW-Statements/show-function-status.md)
- [SHOW GRANT](Other/SHOW-Statements/show-grants.md)
- [SHOW PROCESSLIST](Other/SHOW-Statements/show-processlist.md)
- [SHOW PUBLICATIONS](Other/SHOW-Statements/show-publications.md)
- [SHOW ROLES](Other/SHOW-Statements/show-roles.md)
- [SHOW SEQUENCES](Other/SHOW-Statements/show-sequences.md)
- [SHOW STAGE](Other/SHOW-Statements/show-stage.md)
- [SHOW SUBSCRIPTIONS](Other/SHOW-Statements/show-subscriptions.md)
- [SHOW VARIABLES](Other/SHOW-Statements/show-variables.md)

### SET Statements

Using SET statements to adjust various database parameters, with results displayed via SHOW commands:

- [SET ROLE](Other/Set/set-role.md)

### KILL Statement

Used to terminate a specific database connection:

- [KILL](Other/kill.md)

### USE Statement

Utilized for connecting to an existing database:

- [USE DATABASE](Other/use-database.md)

### Explain Statement

Used to view SQL execution plans:

- [Explain Analyze](Other/Explain/explain-analyze.md)

### PREPARE Statement

Prepares a SQL statement and assigns it a name:

- [PREPARE](Other/Prepared-Statements/prepare.md)

### EXECUTE Statement

After preparing a statement using PREPARE, you can reference the precompiled statement name and execute it:

- [EXECUTE](Other/Prepared-Statements/execute.md)

### DEALLOCATE PREPARE Statement

Used to release precompiled statements generated by PREPARE. Executing the precompiled statement after deallocation will result in an error:

- [DEALLOCATE](Other/Prepared-Statements/deallocate.md)
