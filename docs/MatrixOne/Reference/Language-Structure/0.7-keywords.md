# Keywords

This document introduces the keywords of MatrixOne. In MatrixOne, reserved keywords and non-reserved keywords are classified. When you use SQL statements, you can check reserved keywords and non-reserved keywords.

**Keyword** is a word with a special meaning in SQL statements, such as `SELECT`, `UPDATE`, `DELETE`, and so on.

- **Reserved keyword**: A word in a keyword that requires special processing before it can be used as an identifier is called a reserved keyword.

   When using reserved keywords as identifiers, they must be wrapped with backticks. Otherwise, an error will be reported:

```
\\The reserved keyword select is not wrapped in backticks, resulting in an error.
mysql> CREATE TABLE select (a INT);
ERROR 1064 (HY000): SQL parser error: You have an error in your SQL syntax; check the manual that corresponds to your MatrixOne server version for the right syntax to use. syntax error at line 1 column 19 near " select (a INT)";

\\Correctly wrap the reserved keyword select with backticks.
mysql> CREATE TABLE `select` (a INT);
Query OK, 0 rows affected (0.02 sec)
```

- **Non-reserved keywords**: keywords can be directly used as identifiers, called non-reserved keywords.

   When using non-reserved keywords as identifiers, they can be used directly without wrapping them in backticks.

```
\\BEGIN is not a reserved keyword and can be wrapped without backticks.
mysql> CREATE TABLE `select` (BEGIN int);
Query OK, 0 rows affected (0.01 sec)
```

!!! note
    Unlike MySQL, in MatrixOne, if the qualifier **.** is used, an error will be reported if the reserved keywords are not wrapped in backticks. It is recommended to avoid using reserved keywords when creating tables and databases:

```
mysql> CREATE TABLE test.select (BEGIN int);
ERROR 1064 (HY000): SQL parser error: You have an error in your SQL syntax; check the manual that corresponds to your MatrixOne server version for the right syntax to use. syntax error at line 1 column 24 near "select (BEGIN int)";
```

## Reserved keyword

### A

- ADD
- ADMIN_NAME
- ALL
- AND
- AS
- ASC
- ASCII
- AUTO_INCREMENT

### B

- BETWEEN
- BINARY
- BY

### C

- CASE
- CHAR
- CHARACTER
- CHECK
- COLLATE
- COLLATION
- CONVERT
- COALESCE
- COLUMN_NUMBER
- CONSTRAINT
- CREATE
- CROSS
- CURRENT
- CURRENT_DATE
- CURRENT_ROLE
- CURRENT_USER
- CURRENT_TIME
- CURRENT_TIMESTAMP
- CIPHER

### D

- DATABASE
- DATABASES
- DECLARE
- DEFAULT
- DELAYED
- DELETE
- DESC
- DESCRIBE
- DISTINCT
- DISTINCTROW
- DIV
- DROP

### E

- ELSE
- ENCLOSED
- END
- ESCAPE
- ESCAPED
- EXCEPT
- EXISTS
- EXPLAIN

### F

- FALSE
- FAILED_LOGIN_ATTEMPTS
- FIRST
- FOLLOWING
- FOR
- FORCE
- FOREIGN
- FROM
- FULLTEXT

### G

- GROUP
- GROUPS

### H

- HAVING
- HOUR
- HIGH_PRIORITY

### I

- IDENTIFIED
- IF
- IGNORE
- IMPORT
- IN
- INFILE
- INDEX
- INNER
- INSERT
- INTERVAL
- INTO
- INT1
- INT2
- INT3
- INT4
- INT8
- IS
- ISSUER

### J

- JOIN

### K

- KEY

### L

- LAST
- LEADING
- LEFT
- LIKE
- LIMIT
- LINES
- LOAD
- LOCALTIME
- LOCALTIMESTAMP
- LOCK
- LOCKS
- LOW_PRIORITY

### M

- MATCH
- MAXVALUE
- MICROSECOND
- MINUTE
- MOD
- MODUMP

### N

- NATURAL
- NODE
- NOT
- NONE
- NULL
- NULLS

### O

- ON
- OPTIONAL
- OPTIONALLY
- OR
- ORDER
- OUTER
- OUTFILE
- OVER

### P

- PASSWORD_LOCK_TIME
- PARTITION
- PRECEDING
- PRIMARY

### Q

- QUICK

### R

- RANDOM
- REGEXP
- RENAME
- REPLACE
- RETURNS
- REUSE
- RIGHT
- REQUIRE
- REPEAT
- ROW
- ROWS
- ROW_COUNT
- REFERENCES
- RECURSIVE
- REVERSE

### S

- SAN
- SECONDARY
- SSL
- SUBJECT
- SCHEMA
- SCHEMAS
- SELECT
- SECOND
- SEPARATOR
- SET
- SHOW
- SQL_SMALL_RESULT
- SQL_BIG_RESULT
- STRAIGHT_JOIN
- STARTING
- SUSPEND

### T

- TABLE
- TABLE_NUMBER
- TABLE_SIZE
- TABLE_VALUES
- TERMINATED
- THEN
- TO
- TRAILING
- TRUE
- TRUNCATE

### U

- UNBOUNDED
- UNION
- UNIQUE
- UPDATE
- USE
- USING
- UTC_DATE
- UTC_TIME
- UTC_TIMESTAMP

### V

- VALUES

### W

- WHEN
- WHERE
- WEEK
- WITH

## Non reserved keyword

### A

- ACCOUNT
- ACCOUNTS
- AGAINST
- AVG_ROW_LENGTH
- AUTO_RANDOM
- ATTRIBUTE
- ACTION
- ALGORITHM
- ANY

### B

- BEGIN
- BIGINT
- BIT
- BLOB
- BOOL

### C

- CHAIN
- CHECKSUM
- CLUSTER
- COMPRESSION
- COMMENT_KEYWORD
- COMMIT
- COMMITTED
- CHARSET
- COLUMNS
- CONNECTION
- CONSISTENT
- COMPRESSED
- COMPACT
- COLUMN_FORMAT
- CASCADE

### D

- DATA
- DATE
- DATETIME
- DECIMAL
- DYNAMIC
- DISK
- DO
- DOUBLE
- DIRECTORY
- DUPLICATE
- DELAY_KEY_WRITE

### E

- ENUM
- ENCRYPTION
- ENFORCED
- ENGINE
- ENGINES
- ERRORS
- EXPANSION
- EXPIRE
- EXTENDED
- EXTENSION
- EXTERNAL

### F

- FORMAT
- FLOAT_TYPE
- FULL
- FIXED
- FIELDS
- FORCE_QUOTE

### G

- GEOMETRY
- GEOMETRYCOLLECTION
- GLOBAL
- GRANT

### H

- HASH
- HEADER
- HISTORY

### I

- INT
- INTEGER
- INDEXES
- ISOLATION

### J

- JSON

### K

- KEY_BLOCK_SIZE
- KEYS

### L

- LANGUAGE
- LESS
- LEVEL
- LINESTRING
- LINEAR
- LIST
- LONGBLOB
- LONGTEXT
- LOCAL
- LOW_CARDINALITY

### M

- MAX_CONNECTIONS_PER_HOUR
- MAX_FILE_SIZE
- MAX_QUERIES_PER_HOUR
- MAX_ROWS
- MAX_UPDATES_PER_HOUR
- MAX_USER_CONNECTIONS
- MEDIUMBLOB
- MEDIUMINT
- MEDIUMTEXT
- MEMORY
- MIN_ROWS
- MODE
- MONTH
- MULTILINESTRING
- MULTIPOINT
- MULTIPOLYGON

### N

- NAMES
- NCHAR
- NUMERIC
- NEVER
- NO

### O

- OFFSET
- ONLY
- OPTIMIZE
- OPEN
- OPTION

### P

- PACK_KEYS
- PASSWORD
- PARTIAL
- PARTITIONS
- POINT
- POLYGON
- PROCEDURE
- PROFILES
- PROXY

### Q

- QUARTER
- QUERY

### R

- ROLE
- RANGE
- READ
- REAL
- REORGANIZE
- REDUNDANT
- REPAIR
- REPEATABLE
- RELEASE
- REVOKE
- REPLICATION
- ROW_FORMAT
- ROLLBACK
- RESTRICT

### S

- SESSION
- SERIALIZABLE
- SHARE
- SIGNED
- SMALLINT
- SNAPSHOT
- SOME
- SPATIAL
- START
- STATUS
- STORAGE
- STREAM
- STATS_AUTO_RECALC
- STATS_PERSISTENT
- STATS_SAMPLE_PAGES
- SUBPARTITIONS
- SUBPARTITION
- SIMPLE
- S3OPTION

### T

- TABLES
- TEXT
- THAN
- TINYBLOB
- TIME
- TIMESTAMP
- TINYINT
- TINYTEXT
- TRANSACTION
- TRIGGER
- TRIGGERS
- TYPE

### U

- UNCOMMITTED
- UNKNOWN
- UNSIGNED
- UNUSED
- UNLOCK
- URL
- USER

### V

- VARBINARY
- VARCHAR
- VARIABLES
- VIEW

### W

- WRITE
- WARNINGS
- WORK

### X

- X509

### Y

- YEAR

### Z

- ZEROFILL
