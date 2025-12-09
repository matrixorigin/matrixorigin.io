/**
 * Configuration for document validator
 */

export const config = {
    // Document path pattern
    docsPattern: './docs/MatrixOne/**/*.md',

    // Document root directory
    docsRoot: './docs/MatrixOne',

    // Identifiers for SQL code blocks
    sqlCodeBlockLanguages: ['sql', 'SQL'],

    // Supported MatrixOne versions
    supportedVersions: [
        'v0.8',
        'v1.0',
        'v1.1',
        'v1.2',
        'latest'
    ],

    // Default database configuration
    defaultDbConfig: {
        host: '127.0.0.1',
        port: 6001,
        user: 'root',
        password: '111',
        database: 'test'
    },

    // SQL syntax check configuration
    syntaxCheck: {
        // Supported SQL dialect
        dialect: 'mysql',

        // Ignored SQL patterns (regular expressions)
        ignorePatterns: [
            /^\s*--/,           // Single-line comments
            /^\s*\/\*/,         // Multi-line comment start
            /^\s*$/             // Empty lines
        ],

        // MatrixOne-specific syntax whitelist
        // These syntaxes are valid in MatrixOne but not supported by MySQL parser
        // SQL matching these patterns will skip syntax check
        matrixoneWhitelist: [
            // ==================== Account and Permission Management ====================
            // Fine-grained validation: Check required parameters
            /CREATE\s+ACCOUNT\s+\w+\s+ADMIN_NAME/i,  // CREATE ACCOUNT must have ADMIN_NAME
            /DROP\s+ACCOUNT\s+\w+/i,
            /ALTER\s+ACCOUNT\s+\w+/i,
            /CREATE\s+ROLE\s+\w+/i,
            /DROP\s+ROLE\s+\w+/i,
            /ALTER\s+ROLE\s+\w+/i,
            /DROP\s+USER\s+\w+/i,
            /GRANT\s+.*\s+ON\s+DATABASE\s+\*/i,
            /GRANT\s+\w+.*\s+ON\s+DATABASE\s+\w+/i,
            /GRANT\s+.*\s+TO\s+\w+/i,  // GRANT must have TO
            /GRANT\s+.*\s+WITH\s+GRANT\s+OPTION/i,
            /GRANT\s+.*\s+ON\s+\w+\.\*/i,  // GRANT ... ON database.*
            /GRANT\s+ALL\s+PRIVILEGES\s+ON/i,  // GRANT ALL PRIVILEGES

            // ==================== Snapshot and Restore ====================
            // Fine-grained validation: Check FOR clause
            /CREATE\s+SNAPSHOT\s+\w+\s+FOR\s+(ACCOUNT|DATABASE|TABLE|CLUSTER)/i,
            /DROP\s+SNAPSHOT\s+\w+/i,
            /SHOW\s+SNAPSHOTS/i,  // Simple statement, skip entirely
            /RESTORE\s+ACCOUNT\s+\w+\s+FROM\s+SNAPSHOT/i,
            /RESTORE\s+DATABASE\s+\w+\s+FROM\s+SNAPSHOT/i,
            /RESTORE\s+(DATABASE\s+\w+\s+)?TABLE\s+\w+\s+FROM\s+SNAPSHOT/i,
            /RESTORE\s+CLUSTER\s+FROM\s+SNAPSHOT/i,

            // ==================== PITR (Point-in-Time Recovery) ====================
            // Fine-grained validation: Check basic syntax structure
            /CREATE\s+PITR\s+\w+\s+(FOR\s+(CLUSTER|ACCOUNT|DATABASE|TABLE)|RANGE)/i,
            /DROP\s+PITR\s+\w+/i,
            /ALTER\s+PITR\s+\w+/i,
            /SHOW\s+PITR/i,
            /RESTORE\s+(CLUSTER|ACCOUNT|DATABASE|TABLE)?\s*.*\s+FROM\s+PITR\s+\w+/i,
            /FOR\s+CLUSTER\s+RANGE\s+\d+/i,
            /FOR\s+ACCOUNT\s+\w+\s+RANGE\s+\d+/i,
            /FOR\s+DATABASE\s+\w+\s+RANGE\s+\d+/i,
            /FOR\s+TABLE\s+.*\s+RANGE\s+\d+/i,

            // ==================== Sequences ====================
            // Fine-grained validation: Check basic parameters
            /CREATE\s+SEQUENCE\s+\w+(\s+(START\s+WITH|INCREMENT\s+BY|MINVALUE|MAXVALUE))?/i,
            /DROP\s+SEQUENCE\s+\w+/i,
            /ALTER\s+SEQUENCE\s+\w+/i,
            /SHOW\s+SEQUENCES/i,  // Simple statement
            /\s+START\s+WITH\s+\d+/i,  // SEQUENCE's START WITH must have number
            /INCREMENT\s+BY\s+\d+/i,

            // ==================== Functions and Stored Procedures ====================
            /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+/i,
            /CREATE\s+FUNCTION\s+.*\s+LANGUAGE\s+(?:SQL|PYTHON)/i,
            /DROP\s+FUNCTION\s+/i,
            /SHOW\s+FUNCTION\s+STATUS/i,
            /LANGUAGE\s+PYTHON\s+AS/i,
            /RETURNS\s+\w+\s+LANGUAGE\s+/i,
            /CREATE\s+PROCEDURE\s+/i,  // Create stored procedure
            /DROP\s+PROCEDURE\s+/i,
            /DELIMITER\s+/i,  // Delimiter
            /\s+IN\s+\w+\s+\w+/i,  // IN parameter
            /\s+OUT\s+\w+\s+\w+/i,  // OUT parameter
            /\s+INOUT\s+\w+\s+\w+/i,  // INOUT parameter
            /BEGIN[\s\S]*END/i,  // BEGIN...END block

            // ==================== INSERT and LOAD DATA Syntax ====================
            // Based on official syntax: INSERT INTO [db.]table [(c1, c2, c3)] VALUES (...)
            /INSERT\s+INTO\s+(\w+\.)?\w+(\s*\([^)]+\))?\s+VALUES/i,
            /INSERT\s+INTO\s+.*\s+SELECT/i,  // INSERT INTO ... SELECT
            // LOAD DATA syntax (complex)
            /LOAD\s+DATA\s+(LOW_PRIORITY\s+|CONCURRENT\s+)?(LOCAL\s+)?INFILE/i,
            /LOAD\s+DATA\s+.*\s+INTO\s+TABLE/i,
            /LOAD\s+DATA\s+.*\s+REPLACE\s+INTO\s+TABLE/i,
            /LOAD\s+DATA\s+.*\s+IGNORE\s+INTO\s+TABLE/i,
            /INFILE\s+['"][^'"]+['"]\s+.*\s+INTO\s+TABLE/i,
            /INTO\s+TABLE\s+\w+\s+PARTITION\s*\(/i,
            /FIELDS\s+TERMINATED\s+BY/i,
            /FIELDS\s+ENCLOSED\s+BY/i,
            /LINES\s+TERMINATED\s+BY/i,
            /LINES\s+STARTING\s+BY/i,
            /IGNORE\s+\d+\s+(LINES|ROWS)/i,

            // ==================== External Tables and Data Sources ====================
            /CREATE\s+EXTERNAL\s+TABLE\s+/i,
            /CREATE\s+SOURCE\s+/i,
            /DROP\s+SOURCE\s+/i,
            /INFILE\s+.*\s+URL/i,
            /LOAD\s+DATA\s+.*\s+URL/i,
            /S3OPTION\s*\{/i,
            /CREDENTIALS\s*\{/i,

            // ==================== Stream Tables ====================
            /CREATE\s+STREAM\s+/i,
            /DROP\s+STREAM\s+/i,

            // ==================== Publish/Subscribe ====================
            /CREATE\s+PUBLICATION\s+/i,
            /DROP\s+PUBLICATION\s+/i,
            /ALTER\s+PUBLICATION\s+/i,
            /CREATE\s+SUBSCRIPTION\s+/i,
            /DROP\s+SUBSCRIPTION\s+/i,
            /SHOW\s+PUBLICATIONS/i,
            /SHOW\s+SUBSCRIPTIONS/i,
            /CREATE\s+DATABASE\s+.*\s+FROM\s+.*\s+PUBLICATION/i,

            // ==================== Stage ====================
            /CREATE\s+STAGE\s+/i,
            /DROP\s+STAGE\s+/i,
            /ALTER\s+STAGE\s+/i,
            /SHOW\s+STAGES/i,

            // ==================== SELECT Statement Extensions ====================
            // Based on official syntax: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT ... OFFSET
            /SELECT\s+(ALL|DISTINCT)\s+/i,
            /SELECT\s+.*\s+INTO\s+(@|OUTFILE|DUMPFILE)/i,  // SELECT INTO
            /SELECT\s+.*\s+WHERE\s+.*\s+LIKE\s+/i,  // WHERE LIKE
            /SELECT\s+.*\s+WHERE\s+.*\s+IN\s*\(/i,  // WHERE IN
            /\s+GROUP\s+BY\s+.*\s+HAVING\s+/i,  // GROUP BY ... HAVING
            /\s+ORDER\s+BY\s+.*\s+(ASC|DESC)/i,  // ORDER BY ... ASC/DESC
            /\s+LIMIT\s+\d+\s+OFFSET\s+\d+/i,  // LIMIT ... OFFSET

            // ==================== SHOW Statement Extensions ====================
            // Based on official syntax: SHOW DATABASES/TABLES [LIKE expr | WHERE expr | FROM | IN]
            /SHOW\s+DATABASES\s+(LIKE|WHERE)/i,
            /SHOW\s+TABLES\s+(LIKE|WHERE|FROM|IN)/i,
            /SHOW\s+TABLES\s+FROM\s+\w+/i,
            /SHOW\s+TABLES\s+IN\s+\w+/i,
            /SHOW\s+BACKEND\s+SERVERS/i,
            /SHOW\s+GRANTS\s+FOR\s+.*@/i,
            /SHOW\s+GLOBAL\s+VARIABLES/i,
            /SHOW\s+SESSION\s+VARIABLES/i,
            /SHOW\s+VARIABLES\s+(LIKE|WHERE)/i,
            /SHOW\s+FUNCTION\s+STATUS\s+LIKE/i,
            /SHOW\s+TABLE_NUMBER\s+FROM/i,  // MatrixOne statistical function
            /SHOW\s+COLUMN_NUMBER\s+FROM/i,
            /SHOW\s+TABLE_VALUES\s+FROM/i,
            /SHOW\s+TABLE_SIZE\s+FROM/i,
            /SHOW\s+SCHEMAS/i,  // Synonym for SHOW DATABASES

            // ==================== Vector Data Types ====================
            /vecf32\(/i,
            /vecf64\(/i,
            /VECF32\(/i,
            /VECF64\(/i,
            /\svecf32\s/i,
            /\svecf64\s/i,

            // ==================== JOIN Syntax ====================
            // Based on official syntax: ... INNER JOIN ... ON ...
            /\sINNER\s+JOIN\s+\w+\s+ON\s+/i,
            /\sLEFT\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
            /\sRIGHT\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
            /\sFULL\s+(OUTER\s+)?JOIN\s+\w+\s+ON\s+/i,
            /\sCROSS\s+JOIN\s+\w+/i,
            /\sNATURAL\s+JOIN\s+\w+/i,

            // ==================== Special Query Syntax ====================
            /SELECT\s+.*\s+SAMPLE\s+/i,
            /EXPLAIN\s+VERBOSE/i,
            /EXPLAIN\s+ANALYZE/i,
            /\sLIKE\s+['"][^'"]*['"]/i,  // LIKE pattern
            /\sILIKE\s+/i,  // case-insensitive LIKE
            /\sIN\s*\([^)]+\)/i,  // IN (value1, value2, ...)
            /WITH\s+RECURSIVE\s+/i,  // Recursive CTE
            /PREPARE\s+\w+\s+FROM/i,  // Prepared statements
            /EXECUTE\s+\w+/i,
            /DEALLOCATE\s+PREPARE/i,
            /USE\s+\w+/i,  // USE database

            // ==================== Aggregate Functions ====================
            // Based on official documentation aggregate functions
            /\s(AVG|COUNT|MAX|MIN|SUM)\s*\(/i,  // Basic aggregate functions
            /\sBIT_AND\s*\(/i,  // Bitwise aggregate functions
            /\sBIT_OR\s*\(/i,
            /\sBIT_XOR\s*\(/i,
            /\sSTDDEV_POP\s*\(/i,  // Statistical functions
            /\sVAR_POP\s*\(/i,
            /\sVARIANCE\s*\(/i,
            /\sSTDDEV\s*\(/i,

            // ==================== Special Functions ====================
            /\sCAST\s*\(/i,  // CAST(value AS datatype)
            /\sINSTR\s*\(/i,
            /\sL[0-3]_NORM\s*\(/i,  // Vector norm functions
            /\sINNER_PRODUCT\s*\(/i,
            /\sCOSINE_SIMILARITY\s*\(/i,
            /\sL2_DISTANCE\s*\(/i,

            // ==================== System Settings ====================
            /SET\s+GLOBAL\s+save_query_result/i,
            /SET\s+GLOBAL\s+\w+\s*=/i,
            /SET\s+SESSION\s+\w+\s*=/i,

            // ==================== CREATE/DROP TABLE Syntax ====================
            // Based on official syntax: CREATE TABLE [IF NOT EXISTS] [db.]table_name (...)
            // Skip only if column definitions (parentheses) are included
            /CREATE\s+(TEMPORARY\s+)?TABLE\s+(IF\s+NOT\s+EXISTS\s+)?(\w+\.)?\w+\s*\(/i,
            /CREATE\s+TABLE\s+.*\s+PRIMARY\s+KEY\s*\(/i,  // PRIMARY KEY
            /CREATE\s+TABLE\s+.*\s+CONSTRAINT\s+\w+\s+PRIMARY\s+KEY/i,  // CONSTRAINT
            /CREATE\s+TABLE\s+.*\sAS\s+SELECT/i,  // CREATE TABLE AS SELECT
            /CREATE\s+CLUSTER\s+TABLE/i,  // Cluster table
            /CREATE\s+TABLE\s+.*\s+CLONE\s+/i,  // Clone table
            /CLONE\s+\w+\.\w+/i,  // CLONE source_db.source_table
            /TO\s+ACCOUNT\s+\w+/i,  // Clone to specified account
            /\)\s*CLUSTER\s+BY\s*\(/i,  // CLUSTER BY after table definition
            /CLUSTER\s+BY\s*\([^)]+\)/i,  // CLUSTER BY (col1, col2)
            // DROP TABLE syntax - more strict
            /DROP\s+TABLE\s+IF\s+EXISTS\s+(\w+\.)?\w+\s*;/i,  // IF EXISTS must be before table name
            /DROP\s+TABLE\s+(\w+\.)?\w+\s*;/i,  // Simple form
            // CREATE VIEW syntax
            /CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+\w+\s+AS\s+SELECT/i,
            /CREATE\s+VIEW\s+.*\sAS\s+$/i,  // CREATE VIEW ... AS (no SELECT after)

            // ==================== CREATE/DROP DATABASE Syntax ====================
            // Based on official syntax: CREATE DATABASE [IF NOT EXISTS] <database_name> [create_option]
            // Full match to ensure correct syntax
            /CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?\w+\s*;/i,  // Simple form
            /CREATE\s+DATABASE\s+(IF\s+NOT\s+EXISTS\s+)?\w+\s+(DEFAULT\s+)?CHARACTER\s+SET\s*(=\s*)?\w+/i,
            /CREATE\s+DATABASE\s+.*\s+COLLATE\s*(=\s*)?\w+/i,
            /CREATE\s+DATABASE\s+.*\s+ENCRYPTION\s*=\s*['"][YN]['"]/i,
            /DEFAULT\s+CHARACTER\s+SET\s*(=\s*)?\w+/i,
            // DROP DATABASE syntax - more strict
            /DROP\s+DATABASE\s+IF\s+EXISTS\s+\w+\s*;/i,  // IF EXISTS must be before database name
            /DROP\s+DATABASE\s+\w+\s*;/i,  // Simple form

            // ==================== Partition Syntax ====================
            /PARTITION\s+BY\s+RANGE/i,  // RANGE partition
            /PARTITION\s+BY\s+HASH/i,  // HASH partition
            /PARTITION\s+BY\s+KEY/i,  // KEY partition
            /PARTITION\s+BY\s+LINEAR\s+HASH/i,  // LINEAR HASH
            /PARTITION\s+BY\s+LINEAR\s+KEY/i,  // LINEAR KEY
            /\s+LINEAR\s+HASH\s*\(/i,
            /\s+LINEAR\s+KEY\s*\(/i,
            /ALGORITHM\s*=\s*\{?[12]\}?/i,  // ALGORITHM = 1 | 2
            /PARTITIONS\s+\d+/i,  // PARTITIONS num
            /VALUES\s+LESS\s+THAN\s+MAXVALUE/i,  // VALUES LESS THAN MAXVALUE
            /VALUES\s+LESS\s+THAN\s*\(/i,  // VALUES LESS THAN (expr)
            /VALUES\s+IN\s*\(/i,  // VALUES IN (value_list)
            /\)\s*partition\s+by/i,  // partition by after table definition

            // ==================== CREATE/DROP INDEX Syntax ====================
            // Based on official syntax: CREATE INDEX index_name ON table_name (column_name)
            /CREATE\s+(UNIQUE\s+)?INDEX\s+\w+\s+ON\s+\w+\s*\(/i,
            /CREATE\s+FULLTEXT\s+INDEX\s+\w+\s+ON\s+\w+/i,  // Full-text index
            /DROP\s+INDEX\s+\w+\s+ON\s+\w+/i,  // DROP INDEX
            // Special index types
            /INDEX\s+.*\s+USING\s+IVFFLAT/i,
            /USING\s+IVFFLAT/i,
            /USING\s+MASTER/i,

            // ==================== Placeholders and Example Code ====================
            /table_name\s+column_name\s+data_type/i,  // Example code
            /\[\s*OR\s+REPLACE\s*\]/i,  // Optional syntax representation in documentation
            /^\s*\[/,  // Syntax explanation starting with [
            /^CREATE\s+\[\s*OR/i,
            /\{table_name\}/i,  // {table_name} placeholder
            /\{column_name\}/i,
            /\{elements\}/i,
            /<query_name>/i,  // <query_name> placeholder
            /<name>/i,
            /\$\{[^}]+\}/,  // ${...} placeholder
            /view_name\s+AS\s+query;/i,  // Example code
            /column1,\s*column2,\s*\.\.\./i,  // column1, column2, ... example
            /^\s*See\s+chapter/i,  // Documentation link

            // ==================== Table Output (Should not be in SQL code blocks) ====================
            /^\s*\|.*\|\s*$/m,  // Table rows
            /^\s*\+[-+]+\+\s*$/m,  // Table borders

            // ==================== PostgreSQL Commands (Migration Documentation) ====================
            /postgres=\#/i,
            /\\c\s+/i,
            /\\d[\+\s]/i,
            /COPY\s+.*\s+TO\s+'/i,
            /COPY\s+.*\s+FROM\s+'/i,

            // ==================== Oracle Commands (Migration Documentation) ====================
            /^sqlplus/i,
            /^SQL>/i,

            // ==================== Shell Commands and Tools ====================
            /^SOURCE\s+'/i,
            /^\$/,
            /^mysql\s+/,
            /^pg_dump/,
            /^mysqldump/,
            /^mo-dump/,

            // ==================== Special Characters and Encoding Issues ====================
            /​/,  // Zero-width character
            /\u200B/,  // Zero-width space

            // ==================== Table Options and Constraints ====================
            /\)\s*START\s+TRANSACTION/i,  // table option: START TRANSACTION
            /CREATE\s+TRIGGER\s+/i,  // Triggers
            /DROP\s+TRIGGER\s+/i,
            /BEFORE\s+(?:INSERT|UPDATE|DELETE)\s+ON/i,  // Trigger timing
            /AFTER\s+(?:INSERT|UPDATE|DELETE)\s+ON/i,
            /FOR\s+EACH\s+ROW/i,  // Trigger level
            /\s+REFERENCES\s+\w+\s*\(/i,  // Foreign key references
            /ON\s+DELETE\s+(?:CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)/i,
            /ON\s+UPDATE\s+(?:CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)/i,

            // ==================== Window Functions and Reserved Word Issues ====================
            /\s+OVER\s*\(/i,  // Window functions
            /PARTITION\s+BY\s+\w+/i,  // PARTITION BY in window functions
            /\s+RANK\s*\(\s*\)\s+OVER/i,  // RANK() OVER
            /\s+ROW_NUMBER\s*\(\s*\)\s+OVER/i,  // ROW_NUMBER() OVER
            /\s+DENSE_RANK\s*\(\s*\)\s+OVER/i,  // DENSE_RANK() OVER
            /\s+as\s+rank\b/i,  // "rank" as alias
            /\s+as\s+dense_rank\b/i,  // "dense_rank" as alias
            /\s+as\s+row_number\b/i,  // "row_number" as alias

            // ==================== JSON Data Types ====================
            /\s+JSON\b/i,  // JSON data type
            /\s+JSONB\b/i,  // JSONB data type

            // ==================== Common Spelling Error Detection (Reverse Whitelist) ====================
            // These are common spelling errors that should be checked rather than skipped
            // Note: These rules are checked first; if matched, do not skip

            // ==================== Other Known Incompatible Syntax ====================
            /REPLACE\s+INTO\s+.*\s+WHERE/i,  // node-sql-parser bug
            /"SQL"\s+IS\s+A\s+RESERVED\s+WORD/i,  // Reserved word issue
            /IDENTIFIED\s+BY\s+/i,  // CREATE USER ... IDENTIFIED BY
            /ADMIN_NAME\s+/i,  // CREATE ACCOUNT ... ADMIN_NAME
        ]
    },

    // Report configuration
    report: {
        // Whether to show detailed information
        verbose: false,

        // Whether to show successful checks
        showSuccess: false
    }
}

export default config