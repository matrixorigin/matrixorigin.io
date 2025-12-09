/**
 * SQL Execution Tester - Phase 3 Implementation
 *
 * Core Strategy:
 * 1. Use MO official parser (via EXPLAIN and PREPARE)
 * 2. Execute in isolated test database
 * 3. Intelligently distinguish between syntax errors and semantic errors
 * 4. Accumulate context (DDL within the same document creates environment for subsequent SQL)
 *
 * ================== Automatic Context Completion Feature ==================
 *
 * [Coverage Scope]
 * ✅ Table Level: Automatically create missing tables
 *    - Support: Tables in FROM, JOIN, INSERT, UPDATE, DELETE
 *    - Support: Cross-database references (db.table)
 *    - Support: Tables in simple subqueries
 *
 * ✅ Column Level: Extract column names from SQL and infer types
 *    - SELECT list
 *    - WHERE conditions
 *    - GROUP BY / ORDER BY / HAVING
 *    - INSERT column list
 *    - UPDATE SET clause
 *    - JOIN ON conditions
 *
 * ✅ Type Inference: Intelligent inference based on column name patterns
 *    - ID type: INT, VARCHAR(36)
 *    - Time type: DATE, DATETIME
 *    - Numeric type: INT, DECIMAL(10,2)
 *    - Text type: VARCHAR(n), TEXT
 *    - Boolean type: BOOLEAN
 *    - Enum type: VARCHAR(50)
 *
 * [Limitations]
 * ❌ Unsupported Scenarios:
 *    - Complex nested subqueries (more than 3 layers)
 *    - CTE (WITH clause)
 *    - View references
 *    - Stored procedure/function calls
 *    - Trigger dependencies
 *    - Foreign key constraint validation
 *    - Queries requiring specific data (e.g., aggregation results)
 *
 * [Handling Principles]
 * - Complete as much as possible → WARNING_OK
 * - Still failed after completion → WARNING_FAIL (manual check required)
 * - Cannot complete but syntax is correct → WARNING_OK (explain reason)
 * - True syntax error → ERROR
 *
 * ================== Status Explanation ==================
 * ✅ SUCCESS: Both syntax and semantics are correct, execution successful
 * ⚠️ WARNING_OK: Syntax is correct, only missing context (successful after automatic table creation)
 * ⚠️ WARNING_FAIL: Syntax is correct, but there are other semantic issues (still failed after automatic table creation)
 * ❌ ERROR: True syntax error
 * ⏭️ SKIP: Administrative command, skip execution
 */

import { extractSqlFromFile, splitSqlStatements } from '../utils/sql-extractor.js'
import { DbConnectionManager } from '../utils/db-connection.js'
import { config } from '../config.js'

const SQL_TYPES = {
    DDL: 'DDL',
    DML: 'DML',
    QUERY: 'QUERY',
    ADMIN: 'ADMIN',
    UNKNOWN: 'UNKNOWN'
}

const VALIDATION_STATUS = {
    SUCCESS: 'SUCCESS',
    WARNING_OK: 'WARNING_OK',      // Syntax correct, only missing context (executed successfully after automatic table creation)
    WARNING_FAIL: 'WARNING_FAIL',  // Syntax correct, but other semantic issues (still failed after automatic table creation)
    ERROR: 'ERROR',
    SKIP: 'SKIP'
}

export class SqlRunner {
    constructor(dbConfig = null) {
        this.dbConfig = dbConfig || config.defaultDbConfig
        this.dbManager = new DbConnectionManager(this.dbConfig)
        this.enabled = false
        this.currentTestDb = null
    }

    enable() {
        this.enabled = true
    }

    disable() {
        this.enabled = false
    }

    async connect() {
        try {
            await this.dbManager.connect()
            return true
        } catch (error) {
            console.error('Database connection failed:', error.message)
            return false
        }
    }

    async disconnect() {
        await this.dbManager.cleanupAllTestDatabases()
        await this.dbManager.disconnect()
    }

    async checkFile(filePath) {
        if (!this.enabled) {
            return {
                passed: true,
                errors: [],
                skipped: true,
                message: 'SQL execution test is not enabled'
            }
        }

        const errors = []
        const warnings = []
        const successes = []

        try {
            const sqlBlocks = extractSqlFromFile(filePath)

            if (sqlBlocks.length === 0) {
                return {
                    passed: true,
                    errors: [],
                    warnings: [],
                    sqlCount: 0
                }
            }

            const baseName = filePath.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
            this.currentTestDb = await this.dbManager.createTestDatabase(baseName)

            for (const block of sqlBlocks) {
                const blockResults = await this.checkSqlBlock(block)

                for (const result of blockResults) {
                    if (result.status === VALIDATION_STATUS.ERROR) {
                        errors.push(result)
                    } else if (result.status === VALIDATION_STATUS.WARNING_OK || result.status === VALIDATION_STATUS.WARNING_FAIL) {
                        warnings.push(result)
                    } else if (result.status === VALIDATION_STATUS.SUCCESS) {
                        successes.push(result)
                    }
                }

                // After executing each SQL block, ensure to return to the test database
                // This handles cases where statements like USE or DROP DATABASE change the current database
                try {
                    await this.dbManager.query(`USE \`${this.currentTestDb}\``)
                } catch (error) {
                    // Ignore error (database may have been deleted)
                }
            }

            if (this.currentTestDb) {
                await this.dbManager.dropTestDatabase(this.currentTestDb)
                this.currentTestDb = null
            }

            return {
                passed: errors.length === 0,
                errors,
                warnings,
                successes,
                sqlCount: sqlBlocks.length,
                totalStatements: successes.length + warnings.length + errors.length
            }
        } catch (error) {
            if (this.currentTestDb) {
                await this.dbManager.dropTestDatabase(this.currentTestDb)
                this.currentTestDb = null
            }

            return {
                passed: false,
                errors: [{
                    line: 0,
                    message: `File processing error: ${error.message}`,
                    type: 'file_error',
                    status: VALIDATION_STATUS.ERROR
                }],
                warnings: [],
                sqlCount: 0
            }
        }
    }

    async checkSqlBlock(block) {
        const results = []
        const statements = splitSqlStatements(block.sql)

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]

            if (!statement.trim()) continue
            if (this.isComment(statement)) continue

            const result = await this.validateSql(statement, block.startLine + i)

            results.push({
                ...result,
                line: block.startLine,
                sql: statement.length > 100 ? statement.substring(0, 100) + '...' : statement,
                version: block.version
            })
        }

        return results
    }

    async validateSql(sql, line) {
        const sqlType = this.detectSqlType(sql)

        // Special handling for administrative commands (at least check syntax)
        if (sqlType === SQL_TYPES.ADMIN) {
            return await this.validateAdminCommand(sql, sqlType)
        }

        // Phase 3 does not use whitelist, directly validate all SQL with MO official parser
        // Note: Whitelist functionality is still retained in Phase 3 (sql-syntax.js)
        return await this.validateWithMO(sql, sqlType, line)
    }

    async validateWithMO(sql, sqlType, line) {
        // DDL statements are executed directly without EXPLAIN (to create context)
        if (sqlType === SQL_TYPES.DDL) {
            try {
                await this.dbManager.query(sql)
                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'DDL executed successfully',
                    type: sqlType
                }
            } catch (execError) {
                // DDL execution failed, determine if it's a syntax error or other issue
                const errorMsg = execError.message.toLowerCase()

                // If it's an obvious syntax error
                if (errorMsg.includes('syntax error') || errorMsg.includes('sql syntax')) {
                    return {
                        status: VALIDATION_STATUS.ERROR,
                        message: `SQL syntax error: ${execError.message}`,
                        type: sqlType,
                        detail: execError.message
                    }
                }

                // Other errors (e.g., permissions, dependencies, etc.)
                return {
                    status: VALIDATION_STATUS.WARNING_FAIL,
                    message: `DDL execution failed: ${execError.message}`,
                    type: sqlType,
                    detail: execError.message
                }
            }
        }

        // DML and QUERY use EXPLAIN to check
        try {
            // Check if SQL is already an EXPLAIN statement to avoid adding EXPLAIN repeatedly
            const isExplainQuery = /^\s*EXPLAIN\s+/i.test(sql)
            const queryToRun = isExplainQuery ? sql : `EXPLAIN ${sql}`

            await this.dbManager.query(queryToRun)

            return {
                status: VALIDATION_STATUS.SUCCESS,
                message: 'Syntax and semantic validation passed',
                type: sqlType
            }

        } catch (explainError) {
            return await this.validateSyntaxOnly(sql, sqlType, explainError)
        }
    }

    async validateSyntaxOnly(sql, sqlType, originalError) {
        // Step 1: First check syntax with PREPARE
        try {
            // Properly escape SQL: replace single quotes with double single quotes
            const escapedSql = sql.replace(/'/g, "''")
            await this.dbManager.query(`PREPARE stmt FROM '${escapedSql}'`)
            await this.dbManager.query('DEALLOCATE PREPARE stmt')

            // PREPARE success = syntax is correct

            // Step 2: Check if original error is a context error
            const errorMessage = originalError.message.toLowerCase()

            if (this.isContextError(errorMessage)) {
                // Try to automatically create tables and execute
                return await this.tryExecuteWithAutoCreateTable(sql, sqlType, originalError)
            }

            // Syntax is correct, but there are other semantic issues
            return {
                status: VALIDATION_STATUS.WARNING_FAIL,
                message: 'Syntax is correct, but there are semantic issues',
                type: sqlType,
                detail: originalError.message
            }

        } catch (syntaxError) {
            // PREPARE also failed, check if it's a context error
            const syntaxErrorMessage = syntaxError.message.toLowerCase()

            // If PREPARE error message also contains context-related keywords like table not exists
            // It means this is not a true syntax error but missing context
            if (this.isContextError(syntaxErrorMessage)) {
                // Try to automatically create tables and execute
                return await this.tryExecuteWithAutoCreateTable(sql, sqlType, syntaxError)
            }

            // PREPARE failed = true syntax error
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `SQL syntax error: ${syntaxError.message}`,
                type: sqlType,
                detail: syntaxError.message
            }
        }
    }

    /**
     * Try to automatically create tables and execute SQL
     *
     * Strategy (Iterative Learning):
     * 1. Extract table names and column information, create tables
     * 2. Try to execute (maximum 3 times)
     * 3. If failed, extract missing columns from error
     * 4. Add missing columns
     * 5. Repeat 2-4 until success or no new columns to add
     */
    async tryExecuteWithAutoCreateTable(sql, sqlType, originalError) {
        try {
            // 1. Extract table names and column information from SQL
            const tableInfo = this.extractTableInfo(sql)

            if (!tableInfo || !tableInfo.tables || tableInfo.tables.length === 0) {
                return {
                    status: VALIDATION_STATUS.WARNING_OK,
                    message: 'Syntax is correct, but missing context (table does not exist)',
                    type: sqlType,
                    detail: originalError.message
                }
            }

            // 2. Create empty tables for each missing table
            for (const table of tableInfo.tables) {
                await this.createEmptyTable(table, tableInfo.columns)
            }

            // 3. Handle cross-database references: replace db.table with table
            let sqlToExecute = this.removeCrossDatabaseReferences(sql, tableInfo.tables)

            // 4. Iteratively try to execute (maximum 3 times)
            const maxRetries = 3
            const addedColumns = []

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    await this.dbManager.query(sqlToExecute)

                    // Execution successful
                    if (addedColumns.length > 0) {
                        return {
                            status: VALIDATION_STATUS.WARNING_OK,
                            message: '✅ Executed successfully after automatically adding missing columns (only missing context)',
                            type: sqlType,
                            detail: `Automatically added ${addedColumns.length} missing columns: ${addedColumns.join(', ')}`
                        }
                    } else {
                        return {
                            status: VALIDATION_STATUS.WARNING_OK,
                            message: '✅ Syntax is correct, executed successfully after automatic table creation (only missing context)',
                            type: sqlType,
                            detail: 'Empty tables were automatically created for validation'
                        }
                    }

                } catch (execError) {
                    // 5. Extract missing columns from error message
                    const missingColumns = this.extractMissingColumnsFromError(execError)

                    if (missingColumns.length === 0) {
                        // No missing columns, it's another type of error
                        return {
                            status: VALIDATION_STATUS.WARNING_FAIL,
                            message: '⚠️ Syntax is correct, but execution still failed after automatic table creation (there may be other semantic errors)',
                            type: sqlType,
                            detail: execError.message
                        }
                    }

                    // 6. Add missing columns
                    let anyAdded = false
                    for (const col of missingColumns) {
                        if (!addedColumns.includes(col)) {
                            // Try to add to each table (since it's uncertain which table the column belongs to)
                            for (const table of tableInfo.tables) {
                                const added = await this.addColumnToTable(table, col)
                                if (added) {
                                    anyAdded = true
                                    addedColumns.push(col)
                                    break // Successfully added to one table, exit inner loop
                                }
                            }
                        }
                    }

                    if (!anyAdded) {
                        // Cannot add new columns, stop trying
                        return {
                            status: VALIDATION_STATUS.WARNING_FAIL,
                            message: '⚠️ Cannot automatically add missing columns (there may be other issues)',
                            type: sqlType,
                            detail: execError.message
                        }
                    }

                    // Continue to next attempt
                }
            }

            // Reached maximum number of attempts
            return {
                status: VALIDATION_STATUS.WARNING_FAIL,
                message: '⚠️ Multiple attempts to automatically add columns still failed',
                type: sqlType,
                detail: `Added columns: ${addedColumns.join(', ')}, but there are still other issues`
            }

        } catch (error) {
            // Failed to automatically create tables, downgrade to only report correct syntax
            return {
                status: VALIDATION_STATUS.WARNING_OK,
                message: 'Syntax is correct, but missing context (cannot automatically create tables)',
                type: sqlType,
                detail: originalError.message
            }
        }
    }

    /**
     * Extract table names and column information from SQL
     *
     * Coverage:
     * ✅ Table names in FROM/JOIN
     * ✅ Cross-database references (db.table)
     * ✅ Columns in SELECT/WHERE/GROUP BY/ORDER BY/HAVING
     * ✅ Columns in INSERT column list
     * ✅ Columns in JOIN ON conditions
     * ✅ Tables in subqueries (basic support)
     *
     * Limitations:
     * ❌ Complex nested subqueries
     * ❌ CTE (WITH clause)
     * ❌ View/function calls
     */
    extractTableInfo(sql) {
        const info = {
            tables: [],
            columns: []
        }

        // ==================== Extract Table Names ====================

        // 1. Table names in FROM clause (supports db.table format)
        const fromMatches = sql.matchAll(/FROM\s+(?:(\w+)\.)?(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi)
        for (const match of fromMatches) {
            // match[1] = database, match[2] = table, match[3] = alias
            info.tables.push(match[2])
        }

        // 2. Table names in JOIN clause (supports db.table format)
        const joinMatches = sql.matchAll(/JOIN\s+(?:(\w+)\.)?(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi)
        for (const match of joinMatches) {
            info.tables.push(match[2])
        }

        // 3. Table names in INSERT INTO
        const insertMatch = sql.match(/INSERT\s+INTO\s+(?:(\w+)\.)?(\w+)/i)
        if (insertMatch) {
            info.tables.push(insertMatch[2])
        }

        // 4. Table names in UPDATE
        const updateMatch = sql.match(/UPDATE\s+(?:(\w+)\.)?(\w+)/i)
        if (updateMatch) {
            info.tables.push(updateMatch[2])
        }

        // 5. Table names in DELETE FROM
        const deleteMatch = sql.match(/DELETE\s+FROM\s+(?:(\w+)\.)?(\w+)/i)
        if (deleteMatch) {
            info.tables.push(deleteMatch[2])
        }

        // 6. Tables in subqueries (simple processing)
        const subqueryMatches = sql.matchAll(/\(\s*SELECT\s+.*?\s+FROM\s+(\w+)/gi)
        for (const match of subqueryMatches) {
            info.tables.push(match[1])
        }

        // ==================== Extract Column Names ====================

        // 1. Columns in SELECT clause
        const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i)
        if (selectMatch && selectMatch[1] !== '*' && !selectMatch[1].trim().startsWith('*')) {
            const columns = this.extractColumnsFromList(selectMatch[1])
            info.columns.push(...columns)
        }

        // 2. Columns in WHERE clause
        const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|UNION|$)/i)
        if (whereMatch) {
            const columns = this.extractColumnsFromCondition(whereMatch[1])
            info.columns.push(...columns)
        }

        // 3. Columns in GROUP BY clause
        const groupByMatch = sql.match(/GROUP\s+BY\s+([\s\S]+?)(?:HAVING|ORDER\s+BY|LIMIT|UNION|$)/i)
        if (groupByMatch) {
            const columns = this.extractColumnsFromList(groupByMatch[1])
            info.columns.push(...columns)
        }

        // 4. Columns in ORDER BY clause
        const orderByMatch = sql.match(/ORDER\s+BY\s+([\s\S]+?)(?:LIMIT|UNION|$)/i)
        if (orderByMatch) {
            const columns = this.extractColumnsFromList(orderByMatch[1])
            info.columns.push(...columns)
        }

        // 5. Columns in HAVING clause
        const havingMatch = sql.match(/HAVING\s+([\s\S]+?)(?:ORDER\s+BY|LIMIT|UNION|$)/i)
        if (havingMatch) {
            const columns = this.extractColumnsFromCondition(havingMatch[1])
            info.columns.push(...columns)
        }

        // 6. INSERT column list
        const insertColsMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i)
        if (insertColsMatch) {
            const columns = insertColsMatch[1].split(',').map(c => c.trim().replace(/[`"'\[\]]/g, ''))
            info.columns.push(...columns)
        }

        // 7. Columns in UPDATE SET clause
        const setMatch = sql.match(/SET\s+([\s\S]+?)(?:WHERE|$)/i)
        if (setMatch) {
            const setColumns = setMatch[1].match(/(\w+)\s*=/g)
            if (setColumns) {
                info.columns.push(...setColumns.map(c => c.replace(/\s*=$/, '')))
            }
        }

        // 8. Columns in JOIN ON conditions
        const joinOnMatches = sql.matchAll(/ON\s+(?:\w+\.)?(\w+)\s*=\s*(?:\w+\.)?(\w+)/gi)
        for (const match of joinOnMatches) {
            info.columns.push(match[1], match[2])
        }

        // Deduplicate and filter
        info.tables = [...new Set(info.tables)].filter(t => t && t.length > 0)
        info.columns = [...new Set(info.columns)].filter(c =>
            c &&
            c.length > 0 &&
            !c.match(/^\d+$/) &&  // Exclude pure numbers
            !c.match(/^['"]/) &&  // Exclude string literals
            c !== 'NULL' &&
            c !== 'TRUE' &&
            c !== 'FALSE'
        )

        return info
    }

    /**
     * Extract column names from column list (handle aliases, functions, etc.)
     */
    extractColumnsFromList(listStr) {
        const columns = []
        const parts = listStr.split(',')

        for (const part of parts) {
            const trimmed = part.trim()

            // Skip aggregate functions, window functions, etc.
            if (/^(COUNT|SUM|AVG|MAX|MIN|RANK|ROW_NUMBER|DENSE_RANK)\s*\(/i.test(trimmed)) {
                // Try to extract column names inside functions
                const innerMatch = trimmed.match(/\((?:\w+\.)?(\w+)\)/)
                if (innerMatch && innerMatch[1] !== '*') {
                    columns.push(innerMatch[1])
                }
                continue
            }

            // Handle table.column or alias.column
            const qualifiedMatch = trimmed.match(/^(?:\w+\.)?(\w+)/)
            if (qualifiedMatch) {
                const colName = qualifiedMatch[1]
                // Exclude SQL keywords
                if (!['AS', 'FROM', 'WHERE', 'OVER', 'PARTITION'].includes(colName.toUpperCase())) {
                    columns.push(colName)
                }
            }
        }

        return columns
    }

    /**
     * Extract column names from condition expressions
     */
    extractColumnsFromCondition(conditionStr) {
        const columns = []

        // Extract all columns in column op value pattern
        const matches = conditionStr.matchAll(/(?:\w+\.)?(\w+)\s*(?:[=<>!]+|IN|LIKE|BETWEEN)/gi)
        for (const match of matches) {
            columns.push(match[1])
        }

        return columns
    }

    /**
     * Create empty table
     */
    async createEmptyTable(tableName, columns = []) {
        // If no column information or only *, create the simplest table
        if (columns.length === 0 || columns.includes('*')) {
            const createSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (id INT)`
            await this.dbManager.query(createSql)
            return
        }

        // Create table based on column names with inferred types
        const columnDefs = columns.map(col => {
            const type = this.inferColumnType(col)
            return `\`${col}\` ${type}`
        }).join(', ')

        const createSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefs})`
        await this.dbManager.query(createSql)
    }

    /**
     * Infer column type (improved version)
     *
     * Infer the most likely data type based on column name patterns:
     * - ID type columns: INT or VARCHAR(36) for UUID
     * - Time type columns: DATE, DATETIME, TIMESTAMP
     * - Monetary type columns: DECIMAL(10,2)
     * - Text type columns: VARCHAR(n) or TEXT
     * - Boolean type columns: BOOLEAN
     * - Enum type columns: VARCHAR(50)
     */
    inferColumnType(columnName) {
        const name = columnName.toLowerCase()

        // ==================== ID Type ====================
        // UUID format (36 characters)
        if (/^(uuid|guid|.*_uuid|.*_guid)$/.test(name)) {
            return 'VARCHAR(36)'
        }
        // Regular ID (integer)
        if (/^(id|.*_id)$/.test(name)) {
            return 'INT'
        }
        // Code, number
        if (/^(code|number|no|.*_code|.*_number|.*_no)$/.test(name)) {
            return 'VARCHAR(50)'
        }

        // ==================== Time/Date Type ====================
        // Date
        if (/(^|_)(date|day)(_|$)/.test(name) && !name.includes('update') && !name.includes('create')) {
            return 'DATE'
        }
        // Timestamp, creation time, update time
        if (/(created|updated|modified|deleted)_(at|time|date)/.test(name)) {
            return 'DATETIME'
        }
        if (/(timestamp|.*_time|.*_at)$/.test(name)) {
            return 'DATETIME'
        }
        // Year
        if (/(^|_)year(_|$)/.test(name)) {
            return 'INT'
        }

        // ==================== Numeric Type ====================
        // Price, amount, salary
        if (/(price|amount|salary|cost|fee|total|subtotal|revenue|profit)/.test(name)) {
            return 'DECIMAL(10,2)'
        }
        // Count, quantity
        if (/(count|quantity|num|number|qty|stock)/.test(name) && !name.includes('phone')) {
            return 'INT'
        }
        // Percentage, ratio
        if (/(rate|ratio|percent|percentage)/.test(name)) {
            return 'DECIMAL(5,2)'
        }
        // Score, rating
        if (/(score|rating|point|rank)/.test(name)) {
            return 'DECIMAL(5,2)'
        }

        // ==================== Boolean Type ====================
        if (/^(is_|has_|can_|should_|enabled|disabled|active|deleted)/.test(name)) {
            return 'BOOLEAN'
        }

        // ==================== Contact Information Type ====================
        if (/(email|mail)/.test(name)) {
            return 'VARCHAR(255)'
        }
        if (/(phone|mobile|tel|fax)/.test(name)) {
            return 'VARCHAR(20)'
        }
        if (/(url|link|website|domain)/.test(name)) {
            return 'VARCHAR(500)'
        }
        if (/(address|addr)/.test(name)) {
            return 'VARCHAR(500)'
        }
        if (/(zip|postal|postcode)/.test(name)) {
            return 'VARCHAR(10)'
        }

        // ==================== Identifier Type ====================
        if (/(username|login|account)/.test(name)) {
            return 'VARCHAR(50)'
        }
        if (/(password|pwd|hash|token|key|secret)/.test(name)) {
            return 'VARCHAR(255)'
        }

        // ==================== Name Type ====================
        if (/(name|title|label)$/.test(name)) {
            return 'VARCHAR(100)'
        }
        if (/(first_name|last_name|full_name)/.test(name)) {
            return 'VARCHAR(50)'
        }

        // ==================== Text Content Type ====================
        if (/(description|desc|comment|remark|note|content|text|body|message)/.test(name)) {
            return 'TEXT'
        }
        if (/(summary|abstract|intro)/.test(name)) {
            return 'VARCHAR(500)'
        }

        // ==================== Status/Enum Type ====================
        if (/(status|state|type|kind|category|level|priority|gender)/.test(name)) {
            return 'VARCHAR(50)'
        }

        // ==================== IP Address ====================
        if (/(ip|ip_address|ipaddr)/.test(name)) {
            return 'VARCHAR(45)'  // IPv6 maximum 45 characters
        }

        // ==================== Default Type ====================
        // Default for short fields
        if (name.length <= 10) {
            return 'VARCHAR(100)'
        }
        // Default for long fields
        return 'VARCHAR(255)'
    }

    detectSqlType(sql) {
        const trimmed = sql.trim().toUpperCase()

        // DDL statements
        if (/^(CREATE|DROP|ALTER|TRUNCATE|RENAME)\s+/i.test(trimmed)) {
            return SQL_TYPES.DDL
        }

        // DML statements
        if (/^(INSERT|UPDATE|DELETE|REPLACE|LOAD\s+DATA)\s+/i.test(trimmed)) {
            return SQL_TYPES.DML
        }

        // Special DDL statements (USE DATABASE)
        if (/^USE\s+/i.test(trimmed)) {
            return SQL_TYPES.DDL
        }

        // Transaction Control Language (TCL) - execute directly
        if (/^(BEGIN|START\s+TRANSACTION|COMMIT|ROLLBACK|SAVEPOINT)\s*;?$/i.test(trimmed)) {
            return SQL_TYPES.DDL  // Treat as DDL, execute directly
        }

        // Administrative commands (including some SHOW statements)
        if (/^(GRANT|REVOKE|CREATE\s+USER|CREATE\s+ACCOUNT|CREATE\s+ROLE|CREATE\s+SNAPSHOT|CREATE\s+PITR|SHOW\s+PUBLICATIONS|SHOW\s+SNAPSHOTS)/i.test(trimmed)) {
            return SQL_TYPES.ADMIN
        }

        // Regular queries (SELECT, SHOW, DESCRIBE, EXPLAIN)
        if (/^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN)\s+/i.test(trimmed)) {
            return SQL_TYPES.QUERY
        }

        return SQL_TYPES.UNKNOWN
    }

    isContextError(errorMessage) {
        const contextKeywords = [
            'table',
            'not exist',
            "doesn't exist",
            'unknown table',
            'unknown column',
            'unknown database',  // Added: cross-database references
            'column',
            'database',          // Added: database-related errors
            'not found'
        ]

        return contextKeywords.some(keyword => errorMessage.includes(keyword))
    }

    /**
     * Extract missing column names from error message
     *
     * Supported error formats:
     * - "column 'price' not found in table"
     * - "column id does not exist"
     * - "unknown column 'email'"
     * - "invalid input: column price does not exist"
     */
    extractMissingColumnsFromError(error) {
        const columns = []
        const msg = error.message || String(error)

        // Match various missing column error messages
        const patterns = [
            /column ['"]?(\w+)['"]? not found/gi,
            /column (\w+) does not exist/gi,
            /unknown column ['"]?(\w+)['"]?/gi,
            /invalid input: column (\w+) does not exist/gi,
            /['"]?(\w+)['"]? column not found/gi
        ]

        for (const pattern of patterns) {
            const matches = msg.matchAll(pattern)
            for (const match of matches) {
                const colName = match[1]
                if (colName && !columns.includes(colName)) {
                    columns.push(colName)
                }
            }
        }

        return columns
    }

    /**
     * Add column to table
     *
     * @param {string} tableName - Table name
     * @param {string} columnName - Column name
     * @returns {boolean} Whether added successfully
     */
    async addColumnToTable(tableName, columnName) {
        try {
            const type = this.inferColumnType(columnName)
            const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${type}`
            await this.dbManager.query(sql)
            return true
        } catch (error) {
            // Ignore error (column may already exist, or table does not exist)
            return false
        }
    }

    /**
     * Remove cross-database references from SQL
     *
     * Replace `db.table` format with `table`, since we create tables in current test database
     *
     * @param {string} sql - Original SQL
     * @param {Array<string>} tables - Extracted table name list
     * @returns {string} Processed SQL
     */
    removeCrossDatabaseReferences(sql, tables) {
        let result = sql

        // For each table name, find and replace db.table format
        // Match patterns: (\w+)\.(tableName)
        // Support backticks: `db`.`table` or db.table
        for (const table of tables) {
            // Match various formats:
            // 1. db.table
            // 2. `db`.`table`
            // 3. db.`table`
            // 4. `db`.table
            const patterns = [
                new RegExp('\\w+\\.' + table + '\\b', 'gi'),           // db.table
                new RegExp('`\\w+`\\.`' + table + '`', 'gi'),          // `db`.`table`
                new RegExp('\\w+\\.`' + table + '`', 'gi'),            // db.`table`
                new RegExp('`\\w+`\\.' + table + '\\b', 'gi')          // `db`.table
            ]

            for (const pattern of patterns) {
                result = result.replace(pattern, table)
            }
        }

        return result
    }

    /**
     * Validate administrative commands (at least check syntax)
     */
    async validateAdminCommand(sql, sqlType) {
        try {
            // Check syntax with PREPARE
            const escapedSql = sql.replace(/'/g, "''")
            await this.dbManager.query(`PREPARE stmt FROM '${escapedSql}'`)
            await this.dbManager.query('DEALLOCATE PREPARE stmt')

            return {
                status: VALIDATION_STATUS.SKIP,
                message: 'Administrative command, syntax is correct but execution skipped',
                type: sqlType
            }
        } catch (error) {
            // Check if it's "internal error" (MatrixOne's PREPARE does not support some administrative commands)
            const errorMsg = error.message.toLowerCase()

            if (errorMsg.includes('internal error')) {
                // internal error means PREPARE does not support this statement, but it doesn't mean syntax error
                // We consider this normal and skip execution
                return {
                    status: VALIDATION_STATUS.SKIP,
                    message: 'Administrative command, syntax check and execution skipped',
                    type: sqlType,
                    detail: 'PREPARE does not support this type of administrative command'
                }
            }

            // Other errors are true syntax errors
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `Administrative command syntax error: ${error.message}`,
                type: sqlType,
                detail: error.message
            }
        }
    }

    isComment(sql) {
        const trimmed = sql.trim()
        return trimmed.startsWith('--') ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('/*')
    }
}

export default SqlRunner