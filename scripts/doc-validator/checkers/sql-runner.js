/** SQL Execution Tester - validates SQL syntax/semantics and compares results with expected */
import { extractSqlFromFile, splitSqlStatements, splitSqlStatementsWithAnnotations, parseAnnotationsToExpectedResults } from '../utils/sql-extractor.js'
import { DbConnectionManager } from '../utils/db-connection.js'
import { config } from '../config.js'

const SQL_TYPES = {
    DDL: 'DDL',
    DML: 'DML',
    QUERY: 'QUERY',
    ADMIN: 'ADMIN',
    SESSION: 'SESSION',  // SET statements - cannot be PREPAREd, must execute directly
    UNKNOWN: 'UNKNOWN'
}

const VALIDATION_STATUS = {
    SUCCESS: 'SUCCESS',  // SQL executed successfully (or semantics validated if no expected results)
    ERROR: 'ERROR',      // SQL failed due to syntax error, semantic error, or result mismatch
    SKIP: 'SKIP'         // Administrative command, syntax checked but execution skipped
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

            // Track user-created databases within this file for cleanup
            this.userCreatedDatabases = new Set()

            for (const block of sqlBlocks) {
                const blockResults = await this.checkSqlBlock(block)

                for (const result of blockResults) {
                    if (result.status === VALIDATION_STATUS.ERROR) {
                        errors.push(result)
                    } else if (result.status === VALIDATION_STATUS.SUCCESS) {
                        successes.push(result)
                    } else if (result.status === VALIDATION_STATUS.SKIP) {
                        // SKIP status - administrative commands
                        successes.push(result)
                    }
                }

                // NOTE: Do NOT switch back to test database after each block!
                // This allows cross-block state sharing (e.g., CREATE TABLE in block 1, INSERT in block 2)
                // The test database is only used as a fallback when no user database is specified
            }

            // Cleanup user-created databases
            for (const dbName of this.userCreatedDatabases) {
                try {
                    await this.dbManager.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
            this.userCreatedDatabases = null

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
            // Cleanup user-created databases on error
            if (this.userCreatedDatabases) {
                for (const dbName of this.userCreatedDatabases) {
                    try {
                        await this.dbManager.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
                    } catch (e) { /* ignore */ }
                }
                this.userCreatedDatabases = null
            }

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
        // Use new function that preserves per-statement annotations
        const statementsWithAnnotations = splitSqlStatementsWithAnnotations(block.sql)

        // Block-level validation mode (can be overridden per-statement)
        const blockValidationMode = block.validationMode || 'syntax-only'

        // Block-level expected results (used for output comparison from separated format)
        const blockExpectedResults = block.expectedResults || {}

        for (let i = 0; i < statementsWithAnnotations.length; i++) {
            const { sql: statement, annotations } = statementsWithAnnotations[i]

            if (!statement.trim()) continue
            if (this.isComment(statement)) continue
            // Skip syntax templates (e.g., <table_name>, col1, col2, ..., [optional])
            if (this.isSyntaxTemplate(statement)) continue

            // Parse per-statement annotations to get expected results
            const parsed = parseAnnotationsToExpectedResults(annotations)

            // Merge: per-statement annotations take priority over block-level
            // But if no per-statement annotations, fall back to block-level (for separated format output)
            let expectedResults = parsed.expectedResults
            let validationMode = parsed.validationMode || blockValidationMode

            // If this is the last statement and block has output, use block's output
            // (This handles the separated format where output follows the SQL block)
            if (i === statementsWithAnnotations.length - 1 &&
                blockExpectedResults.output &&
                Object.keys(expectedResults).length === 0) {
                expectedResults = blockExpectedResults
            }

            // Auto-enable strict mode if ANY expected results are defined
            const hasExpectedResults = Object.keys(expectedResults).length > 0
            if (hasExpectedResults && validationMode === 'syntax-only') {
                validationMode = 'strict'
            }

            const result = await this.validateSql(
                statement,
                block.startLine + i,
                validationMode,
                expectedResults
            )

            results.push({
                ...result,
                line: block.startLine,
                sql: statement.length > 100 ? statement.substring(0, 100) + '...' : statement,
                version: block.version,
                validationMode
            })
        }

        return results
    }

    async validateSql(sql, line, validationMode = 'syntax-only', expectedResults = {}) {
        const sqlType = this.detectSqlType(sql)

        // Special handling for administrative commands (at least check syntax)
        if (sqlType === SQL_TYPES.ADMIN) {
            return await this.validateAdminCommand(sql, sqlType)
        }

        // Special handling for SESSION commands (SET statements)
        // MO cannot PREPARE SET statements, so execute directly
        if (sqlType === SQL_TYPES.SESSION) {
            return await this.validateSessionCommand(sql, sqlType)
        }

        // Phase 3 does not use whitelist, directly validate all SQL with MO official parser
        // Note: Whitelist functionality is still retained in Phase 3 (sql-syntax.js)
        return await this.validateWithMO(sql, sqlType, line, validationMode, expectedResults)
    }

    async validateWithMO(sql, sqlType, line, validationMode = 'syntax-only', expectedResults = {}) {
        // Handle Expected-Success: false - when we expect the SQL to fail
        const expectFailure = expectedResults.success === false

        // DDL statements are executed directly without EXPLAIN (to create context)
        if (sqlType === SQL_TYPES.DDL) {
            try {
                // Track user-created databases for cleanup
                const createDbMatch = sql.match(/CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i)
                if (createDbMatch && this.userCreatedDatabases) {
                    this.userCreatedDatabases.add(createDbMatch[1])
                }

                const result = await this.dbManager.query(sql)

                // In strict mode, validate expected results
                if (validationMode === 'strict' && Object.keys(expectedResults).length > 0) {
                    const comparison = this.compareResults(result, expectedResults, sqlType)
                    if (!comparison.matched) {
                        return {
                            status: VALIDATION_STATUS.ERROR,
                            message: `Result validation failed: ${comparison.reason}`,
                            type: sqlType,
                            detail: comparison.reason
                        }
                    }
                }

                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'DDL executed successfully',
                    type: sqlType
                }
            } catch (execError) {
                // DDL execution failed, determine if it's a syntax error or other issue
                const errorMsg = execError.message.toLowerCase()

                // If Expected-Success: false, this failure is expected
                if (expectFailure) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DDL failed as expected',
                        type: sqlType,
                        detail: execError.message
                    }
                }

                // If it's an obvious syntax error
                if (errorMsg.includes('syntax error') || errorMsg.includes('sql syntax')) {
                    return {
                        status: VALIDATION_STATUS.ERROR,
                        message: this.formatError(execError.message),
                        type: sqlType,
                        detail: execError.message
                    }
                }

                // Handle "already exists" errors - treat as SUCCESS (idempotent DDL)
                if (errorMsg.includes('already exists')) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DDL skipped (object already exists)',
                        type: sqlType
                    }
                }

                // Handle duplicate entry errors - treat as SUCCESS (data already inserted)
                if (errorMsg.includes('duplicate entry')) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DML skipped (duplicate entry)',
                        type: sqlType
                    }
                }

                // Other errors (e.g., permissions, dependencies, etc.)
                return {
                    status: VALIDATION_STATUS.ERROR,
                    message: `DDL execution failed: ${this.formatError(execError.message)}`,
                    type: sqlType,
                    detail: execError.message
                }
            }
        }

        // ==================== Phase 4: Check if expected results exist ====================
        // DML statements (INSERT/UPDATE/DELETE) should ALWAYS execute to maintain state
        // Only QUERY statements can skip execution when no expected results
        if (sqlType === SQL_TYPES.DML) {
            try {
                const result = await this.dbManager.query(sql)

                // If expected results defined, validate them
                if (this.hasExpectedResults(expectedResults)) {
                    const comparison = this.compareResults(result, expectedResults, sqlType)
                    if (!comparison.matched) {
                        return {
                            status: VALIDATION_STATUS.ERROR,
                            message: `Result validation failed: ${comparison.reason}`,
                            type: sqlType,
                            detail: comparison.reason
                        }
                    }
                }

                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'DML executed successfully',
                    type: sqlType
                }
            } catch (execError) {
                const errorMsg = execError.message.toLowerCase()

                // If Expected-Success: false, this failure is expected
                if (expectFailure) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DML failed as expected',
                        type: sqlType,
                        detail: execError.message
                    }
                }

                // Handle duplicate entry as success
                if (errorMsg.includes('duplicate entry')) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DML skipped (duplicate entry)',
                        type: sqlType
                    }
                }

                // Context errors for DML - try auto-complete if has expected results
                if (this.isContextError(errorMsg) && this.hasExpectedResults(expectedResults)) {
                    return await this.tryExecuteWithAutoComplete(sql, sqlType, execError, expectedResults)
                }

                // For DML without expected results, context error means table doesn't exist
                if (this.isContextError(errorMsg)) {
                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'DML validated (table created at runtime)',
                        type: sqlType
                    }
                }

                return {
                    status: VALIDATION_STATUS.ERROR,
                    message: `DML execution failed: ${this.formatError(execError.message)}`,
                    type: sqlType,
                    detail: execError.message
                }
            }
        }

        // ==================== QUERY statements: Always execute ====================
        // Execute all QUERY statements directly (no PREPARE validation)
        // This is more reliable as MO's PREPARE has bugs with some statement types
        try {
            const result = await this.dbManager.query(sql)

            // If expected results defined, compare them
            if (this.hasExpectedResults(expectedResults)) {
                const comparison = this.compareResults(result, expectedResults, sqlType)
                if (!comparison.matched) {
                    return {
                        status: VALIDATION_STATUS.ERROR,
                        message: `Result validation failed: ${comparison.reason}`,
                        type: sqlType,
                        detail: comparison.reason
                    }
                }
                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'SQL executed successfully and result matches expected',
                    type: sqlType
                }
            }

            // No expected results - just verify execution succeeded
            return {
                status: VALIDATION_STATUS.SUCCESS,
                message: 'SQL executed successfully',
                type: sqlType
            }

        } catch (execError) {
            // If Expected-Success: false, this failure is expected
            if (expectFailure) {
                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'Query failed as expected',
                    type: sqlType,
                    detail: execError.message
                }
            }

            const errorMsg = execError.message.toLowerCase()

            // Context errors (missing table/column) - syntax is OK, table created at runtime
            if (this.isContextError(errorMsg)) {
                return {
                    status: VALIDATION_STATUS.SUCCESS,
                    message: 'Query validated (tables created at runtime)',
                    type: sqlType
                }
            }

            // If has expected results, try auto-completion
            if (this.hasExpectedResults(expectedResults)) {
                return await this.tryExecuteWithAutoComplete(sql, sqlType, execError, expectedResults)
            }

            // Real error
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `Query execution failed: ${this.formatError(execError.message)}`,
                type: sqlType,
                detail: execError.message
            }
        }
    }

    /**
     * Phase 2 & 3: Try to execute with auto-completion based on expected results
     * When execution fails due to missing tables/columns, generate data from expected results
     */
    async tryExecuteWithAutoComplete(sql, sqlType, originalError, expectedResults) {
        const errorMsg = originalError.message.toLowerCase()

        // First check if it's a syntax error (not recoverable)
        if (errorMsg.includes('syntax error') || errorMsg.includes('sql syntax')) {
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `SQL syntax error: ${originalError.message}`,
                type: sqlType,
                detail: originalError.message
            }
        }

        // Check if it's a context error (missing table/column)
        if (!this.isContextError(errorMsg)) {
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `Execution failed: ${originalError.message}`,
                type: sqlType,
                detail: originalError.message
            }
        }

        // Try to auto-complete: create tables and generate data based on expected results
        try {
            // 1. Extract table and column info from SQL
            const tableInfo = this.extractTableInfo(sql)

            if (!tableInfo || !tableInfo.tables || tableInfo.tables.length === 0) {
                return {
                    status: VALIDATION_STATUS.ERROR,
                    message: 'Cannot auto-complete: no tables found in SQL',
                    type: sqlType,
                    detail: originalError.message
                }
            }

            // 2. Extract WHERE conditions and JOIN conditions
            const whereConditions = this.extractWhereConditions(sql)
            const whereColumns = whereConditions.map(c => c.column)
            const joinConditions = this.extractJoinConditions(sql)

            // 3. Create tables with appropriate columns and ensure all columns exist
            if (tableInfo.tables.length > 1) {
                // For JOIN queries, create each table with its specific columns
                for (const table of tableInfo.tables) {
                    const tableColumns = this.getTableColumnsForJoin(table, tableInfo, joinConditions)
                    // Also add WHERE condition columns that might belong to this table
                    for (const wc of whereColumns) {
                        if (!wc.includes('.')) {
                            tableColumns.push(wc)
                        }
                    }
                    const uniqueColumns = [...new Set(tableColumns)]
                    await this.createOrUpdateTable(table, uniqueColumns.length > 0 ? uniqueColumns : ['id'])
                }
            } else {
                // For single table queries
                const allColumns = [...new Set([...tableInfo.columns, ...whereColumns])]
                for (const table of tableInfo.tables) {
                    await this.createOrUpdateTable(table, allColumns.length > 0 ? allColumns : ['id'])
                }
            }

            // 4. Generate and insert data based on expected results
            await this.generateDataFromExpectedResults(sql, tableInfo, expectedResults)

            // 4. Handle cross-database references
            let sqlToExecute = this.removeCrossDatabaseReferences(sql, tableInfo.tables)

            // 5. Try to execute with retries for missing columns
            const maxRetries = 3
            const addedColumns = []

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const result = await this.dbManager.query(sqlToExecute)

                    // Compare results with expected
                    const comparison = this.compareResults(result, expectedResults, sqlType)
                    if (!comparison.matched) {
                        return {
                            status: VALIDATION_STATUS.ERROR,
                            message: `Result validation failed: ${comparison.reason}`,
                            type: sqlType,
                            detail: comparison.reason
                        }
                    }

                    return {
                        status: VALIDATION_STATUS.SUCCESS,
                        message: 'Auto-completed and executed successfully',
                        type: sqlType,
                        detail: addedColumns.length > 0 ? `Added columns: ${addedColumns.join(', ')}` : 'Tables auto-created'
                    }

                } catch (retryError) {
                    // Extract missing columns from error
                    const missingColumns = this.extractMissingColumnsFromError(retryError)

                    if (missingColumns.length === 0) {
                        return {
                            status: VALIDATION_STATUS.ERROR,
                            message: `Execution failed after auto-complete: ${retryError.message}`,
                            type: sqlType,
                            detail: retryError.message
                        }
                    }

                    // Add missing columns
                    let anyAdded = false
                    for (const col of missingColumns) {
                        if (!addedColumns.includes(col)) {
                            for (const table of tableInfo.tables) {
                                const added = await this.addColumnToTable(table, col)
                                if (added) {
                                    anyAdded = true
                                    addedColumns.push(col)
                                    break
                                }
                            }
                        }
                    }

                    if (!anyAdded) {
                        return {
                            status: VALIDATION_STATUS.ERROR,
                            message: `Cannot add missing columns: ${retryError.message}`,
                            type: sqlType,
                            detail: retryError.message
                        }
                    }
                }
            }

            return {
                status: VALIDATION_STATUS.ERROR,
                message: 'Max retries reached for auto-completion',
                type: sqlType,
                detail: `Added columns: ${addedColumns.join(', ')}`
            }

        } catch (autoCompleteError) {
            return {
                status: VALIDATION_STATUS.ERROR,
                message: `Auto-completion failed: ${autoCompleteError.message}`,
                type: sqlType,
                detail: autoCompleteError.message
            }
        }
    }

    /**
     * Phase 2: Generate and insert data based on expected results
     *
     * Strategies:
     * - Expected-Rows: N → Generate N rows that satisfy WHERE conditions
     * - Expected-Value: V → Generate data that produces value V (for COUNT, SUM, etc.)
     * - Expected-Values: [v1, v2, ...] → Generate 1 row with these specific values
     * - output (table format) → Parse table and insert exact data
     */
    async generateDataFromExpectedResults(sql, tableInfo, expectedResults) {
        if (!expectedResults || Object.keys(expectedResults).length === 0) {
            return
        }

        const mainTable = tableInfo.tables[0]

        // IMPORTANT: Ensure we have columns from WHERE conditions for data generation
        const whereConditions = this.extractWhereConditions(sql)
        const whereColumns = whereConditions.map(c => c.column)

        // Merge tableInfo.columns with WHERE condition columns
        let columns = [...new Set([...tableInfo.columns, ...whereColumns])]
        if (columns.length === 0) {
            columns = ['id']
        }

        // Phase 3: If output (table format) exists, parse and insert exact data
        if (expectedResults.output) {
            await this.generateDataFromTableOutput(mainTable, expectedResults.output, columns)
            return
        }

        // Phase 2: Handle Expected-Values (specific values for single row)
        if (expectedResults.values && Array.isArray(expectedResults.values)) {
            await this.generateDataForExpectedValues(mainTable, columns, expectedResults.values, sql)
            return
        }

        // Phase 2: Handle Expected-Value (single value, typically for aggregates)
        if (expectedResults.value !== undefined) {
            await this.generateDataForExpectedValue(mainTable, columns, expectedResults.value, sql, whereConditions)
            return
        }

        // Phase 2: Handle Expected-Rows (generate N rows)
        if (expectedResults.rows !== undefined) {
            await this.generateDataForExpectedRows(mainTable, columns, expectedResults.rows, sql, tableInfo)
            return
        }
    }

    /**
     * Generate data for Expected-Rows: N
     * Creates N rows that satisfy the WHERE conditions in the SQL
     */
    async generateDataForExpectedRows(tableName, columns, rowCount, sql, tableInfo) {
        if (rowCount === 0) {
            // Expected 0 rows - don't insert any data
            return
        }

        // Extract WHERE conditions to generate appropriate data
        const whereConditions = this.extractWhereConditions(sql)

        // For JOIN queries, we need to handle multiple tables
        if (tableInfo.tables.length > 1) {
            await this.generateDataForJoinQuery(tableInfo, rowCount, whereConditions, sql)
            return
        }

        // Generate rows for single table
        for (let i = 0; i < rowCount; i++) {
            const values = columns.map((col, idx) => {
                // Check if there's a condition for this column
                const condition = whereConditions.find(c => c.column.toLowerCase() === col.toLowerCase())
                if (condition) {
                    return this.generateValueForCondition(condition, i)
                }
                // Generate default value based on column type
                return this.generateDefaultValue(col, i)
            })

            const escapedValues = values.map(v => this.escapeValue(v))
            const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${escapedValues.join(', ')})`

            try {
                await this.dbManager.query(insertSql)
            } catch (error) {
                // Ignore insert errors (column might not exist yet)
            }
        }
    }

    /**
     * Generate data for Expected-Value: V (typically for COUNT, SUM, etc.)
     */
    async generateDataForExpectedValue(tableName, columns, expectedValue, sql, whereConditions = []) {
        // Check if it's a COUNT query
        if (/COUNT\s*\(/i.test(sql)) {
            const count = parseInt(expectedValue, 10)
            if (!isNaN(count) && count > 0) {
                // Use provided whereConditions or extract from SQL
                const conditions = whereConditions.length > 0 ? whereConditions : this.extractWhereConditions(sql)

                for (let i = 0; i < count; i++) {
                    const values = columns.map((col) => {
                        const condition = conditions.find(c => c.column.toLowerCase() === col.toLowerCase())
                        if (condition) {
                            return this.generateValueForCondition(condition, i)
                        }
                        return this.generateDefaultValue(col, i)
                    })

                    const escapedValues = values.map(v => this.escapeValue(v))
                    const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${escapedValues.join(', ')})`

                    try {
                        await this.dbManager.query(insertSql)
                    } catch (error) {
                        // Ignore insert errors
                    }
                }
            }
            return
        }

        // For other single-value queries, insert one row with the expected value
        const firstCol = columns[0] || 'value'
        const insertSql = `INSERT INTO \`${tableName}\` (\`${firstCol}\`) VALUES (${this.escapeValue(expectedValue)})`
        try {
            await this.dbManager.query(insertSql)
        } catch (error) {
            // Ignore
        }
    }

    /**
     * Generate data for Expected-Values: [v1, v2, v3]
     * Creates one row with the specified values
     */
    async generateDataForExpectedValues(tableName, columns, expectedValues, sql) {
        // Extract column names from SELECT clause for proper mapping
        const selectColumns = this.extractSelectColumns(sql)
        const targetColumns = selectColumns.length > 0 ? selectColumns : columns

        // Also extract WHERE conditions to satisfy them
        const whereConditions = this.extractWhereConditions(sql)

        // Build column list including WHERE condition columns
        const allColumns = [...new Set([...targetColumns, ...whereConditions.map(c => c.column)])]

        const values = allColumns.map((col, idx) => {
            // If this column has an expected value, use it
            const selectIdx = targetColumns.indexOf(col)
            if (selectIdx !== -1 && selectIdx < expectedValues.length) {
                return expectedValues[selectIdx]
            }

            // Check if there's a WHERE condition for this column
            const condition = whereConditions.find(c => c.column.toLowerCase() === col.toLowerCase())
            if (condition) {
                return this.generateValueForCondition(condition, 0)
            }

            return this.generateDefaultValue(col, 0)
        })

        const escapedValues = values.map(v => this.escapeValue(v))
        const insertSql = `INSERT INTO \`${tableName}\` (\`${allColumns.join('`, `')}\`) VALUES (${escapedValues.join(', ')})`

        try {
            await this.dbManager.query(insertSql)
        } catch (error) {
            // Ignore
        }
    }

    /**
     * Phase 3: Generate data from table output format
     * Parses MySQL-style table output and inserts the exact data
     */
    async generateDataFromTableOutput(tableName, tableOutput, fallbackColumns) {
        const parsed = this.parseTableOutput(tableOutput)

        if (!parsed || parsed.data.length === 0) {
            return
        }

        const columns = parsed.columns.length > 0 ? parsed.columns : fallbackColumns

        for (const row of parsed.data) {
            const values = row.map(v => this.escapeValue(v))
            const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')})`

            try {
                await this.dbManager.query(insertSql)
            } catch (error) {
                // Ignore insert errors
            }
        }
    }

    /** Parse MySQL-style table output, returns { columns, rows, data } */
    parseTableOutput(tableStr) {
        const result = { columns: [], rows: [], data: [] }
        const lines = tableStr.split('\n').filter(l => l.trim())

        // Filter out border lines and metadata
        const contentLines = lines.filter(l =>
            !l.match(/^\s*\+[-+]+\+\s*$/) &&
            !l.match(/^\d+\s+rows?\s+in\s+set/i) &&
            !l.match(/^Empty\s+set/i)
        )
        if (contentLines.length === 0) return result

        // Handle multi-line cell values (e.g., SHOW CREATE TABLE output)
        // A complete row starts with | and ends with |
        // Lines that don't match this pattern are continuations of the previous row
        const mergedLines = []
        let currentLine = ''

        for (let i = 0; i < contentLines.length; i++) {
            const line = contentLines[i]
            const trimmed = line.trim()
            const startsWithPipe = trimmed.startsWith('|')
            const endsWithPipe = trimmed.endsWith('|')

            if (startsWithPipe && endsWithPipe) {
                // Complete row - save previous if exists, then start fresh
                if (currentLine) {
                    mergedLines.push(currentLine)
                }
                mergedLines.push(line)
                currentLine = ''
            } else if (startsWithPipe && !endsWithPipe) {
                // Start of a multi-line row
                if (currentLine) {
                    mergedLines.push(currentLine)
                }
                currentLine = line
            } else if (!startsWithPipe && endsWithPipe) {
                // End of a multi-line row
                currentLine += '\n' + line
                mergedLines.push(currentLine)
                currentLine = ''
            } else {
                // Middle of a multi-line row
                currentLine += '\n' + line
            }
        }

        // Don't forget the last line if it's incomplete
        if (currentLine) {
            mergedLines.push(currentLine)
        }

        if (mergedLines.length === 0) return result

        // Parse header (first complete row)
        result.columns = this.parseTableRow(mergedLines[0])

        // Parse data rows
        for (let i = 1; i < mergedLines.length; i++) {
            const values = this.parseTableRow(mergedLines[i])
            if (values.length === result.columns.length) {
                result.data.push(values)
                const row = {}
                result.columns.forEach((col, idx) => row[col] = values[idx])
                result.rows.push(row)
            }
        }
        return result
    }

    /** Generate data for JOIN queries */
    async generateDataForJoinQuery(tableInfo, rowCount, whereConditions, sql) {
        const joinConditions = this.extractJoinConditions(sql)
        for (let i = 0; i < rowCount; i++) {
            const joinId = i + 1
            for (const table of tableInfo.tables) {
                const tableColumns = this.getTableColumnsForJoin(table, tableInfo, joinConditions)
                const values = tableColumns.map(col => {
                    const colLower = col.toLowerCase()
                    if (colLower === 'id' || colLower.endsWith('_id')) return joinId
                    const condition = whereConditions.find(c => c.column.toLowerCase() === colLower || c.column.toLowerCase().endsWith('.' + colLower))
                    return condition ? this.generateValueForCondition(condition, i) : this.generateDefaultValue(col, i)
                })
                try { await this.dbManager.query(`INSERT INTO \`${table}\` (\`${tableColumns.join('`, `')}\`) VALUES (${values.map(v => this.escapeValue(v)).join(', ')})`) } catch {}
            }
        }
    }

    /** Extract JOIN conditions from SQL (e.g., ON u.id = o.user_id) */
    extractJoinConditions(sql) {
        return [...sql.matchAll(/ON\s+(?:(\w+)\.)?(\w+)\s*=\s*(?:(\w+)\.)?(\w+)/gi)]
            .map(m => ({ leftTable: m[1] || null, leftColumn: m[2], rightTable: m[3] || null, rightColumn: m[4] }))
    }

    /** Get columns for a specific table in a JOIN query */
    getTableColumnsForJoin(tableName, tableInfo, joinConditions) {
        const columns = new Set(['id'])
        const tblLower = tableName.toLowerCase(), tblAlias = tableName.charAt(0).toLowerCase()

        // Add columns from tableInfo (skip prefixed columns)
        tableInfo.columns.filter(c => !c.includes('.')).forEach(c => columns.add(c))

        // Add join columns for this table
        for (const jc of joinConditions) {
            if (jc.leftTable && [tblLower, tblAlias].includes(jc.leftTable.toLowerCase())) columns.add(jc.leftColumn)
            if (jc.rightTable && [tblLower, tblAlias].includes(jc.rightTable.toLowerCase())) columns.add(jc.rightColumn)
            if (jc.rightColumn.toLowerCase().endsWith('_id')) {
                const fkTable = jc.rightColumn.toLowerCase().replace('_id', '')
                columns.add(tblLower.startsWith(fkTable) || tblLower === fkTable + 's' ? 'id' : jc.rightColumn)
            }
        }
        return Array.from(columns)
    }

    /** Extract WHERE conditions from SQL */
    extractWhereConditions(sql) {
        const conditions = []
        const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|UNION|;|$)/i)
        if (!whereMatch) return conditions

        const whereClause = whereMatch[1]
        const operators = [['=', /(?:\w+\.)?(\w+)\s*=\s*(?:'([^']*)'|"([^"]*)"|(\w+))/gi],
                          ['>', /(?:\w+\.)?(\w+)\s*>\s*(?:'([^']*)'|"([^"]*)"|(\d+(?:\.\d+)?))/gi],
                          ['<', /(?:\w+\.)?(\w+)\s*<\s*(?:'([^']*)'|"([^"]*)"|(\d+(?:\.\d+)?))/gi]]

        for (const [op, regex] of operators) {
            for (const match of whereClause.matchAll(regex)) {
                conditions.push({ column: match[1], operator: op, value: match[2] || match[3] || match[4] })
            }
        }
        return conditions
    }

    /** Generate a value that satisfies a WHERE condition */
    generateValueForCondition(condition, index) {
        const { operator, value } = condition
        if (operator === '=') return value
        const num = parseFloat(value)
        if (isNaN(num)) return value
        if (operator === '>') return num + index + 1
        if (operator === '<') return Math.max(0, num - index - 1)
        if (operator === '>=') return num + index
        if (operator === '<=') return Math.max(0, num - index)
        return value
    }

    /** Generate a default value based on column name */
    generateDefaultValue(columnName, index) {
        const name = columnName.toLowerCase(), i = index + 1
        if (name === 'id' || name.endsWith('_id')) return i
        if (name.includes('name')) return `Name_${i}`
        if (name.includes('email')) return `user${i}@example.com`
        if (name.includes('status')) return 'active'
        if (/price|amount|total|salary/.test(name)) return 100 + (i * 10)
        if (name.includes('age')) return 20 + i
        if (name.includes('date') || name.includes('_at')) return '2024-01-01'
        return `value_${i}`
    }

    /** Extract column names from SELECT clause */
    extractSelectColumns(sql) {
        const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i)
        if (!selectMatch || selectMatch[1].trim() === '*') return []

        return selectMatch[1].split(',').map(part => {
            const trimmed = part.trim()
            const aliasMatch = trimmed.match(/(?:\w+\.)?(\w+)\s+(?:AS\s+)?(\w+)$/i)
            if (aliasMatch) return aliasMatch[2]
            const qualifiedMatch = trimmed.match(/(?:\w+\.)?(\w+)$/)
            return qualifiedMatch ? qualifiedMatch[1] : null
        }).filter(Boolean)
    }

    /** Escape a value for SQL insertion */
    escapeValue(value) {
        if (value === null || value === 'NULL') return 'NULL'
        if (typeof value === 'number') return value
        const strVal = String(value)
        return /^-?\d+(\.\d+)?$/.test(strVal) ? strVal : `'${strVal.replace(/'/g, "''")}'`
    }

    /** Extract table names and column information from SQL */
    extractTableInfo(sql) {
        const info = { tables: [], columns: [] }

        // Tables from FROM/JOIN/INSERT/UPDATE/DELETE
        for (const match of sql.matchAll(/FROM\s+(?:(\w+)\.)?(\w+)/gi)) info.tables.push(match[2])
        for (const match of sql.matchAll(/JOIN\s+(?:(\w+)\.)?(\w+)/gi)) info.tables.push(match[2])
        const insertMatch = sql.match(/INSERT\s+INTO\s+(?:(\w+)\.)?(\w+)/i)
        if (insertMatch) info.tables.push(insertMatch[2])
        const updateMatch = sql.match(/UPDATE\s+(?:(\w+)\.)?(\w+)/i)
        if (updateMatch) info.tables.push(updateMatch[2])
        const deleteMatch = sql.match(/DELETE\s+FROM\s+(?:(\w+)\.)?(\w+)/i)
        if (deleteMatch) info.tables.push(deleteMatch[2])

        // Subqueries
        for (const match of sql.matchAll(/\(\s*SELECT\s+.*?\s+FROM\s+(\w+)/gi)) info.tables.push(match[1])

        // Columns from SELECT/WHERE/GROUP BY/ORDER BY/HAVING
        const selectMatch = sql.match(/SELECT\s+([\s\S]+?)\s+FROM/i)
        if (selectMatch && selectMatch[1] !== '*') info.columns.push(...this.extractColumnsFromList(selectMatch[1]))

        const whereMatch = sql.match(/WHERE\s+([\s\S]+?)(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|UNION|$)/i)
        if (whereMatch) info.columns.push(...this.extractColumnsFromCondition(whereMatch[1]))

        const groupByMatch = sql.match(/GROUP\s+BY\s+([\s\S]+?)(?:HAVING|ORDER\s+BY|LIMIT|UNION|$)/i)
        if (groupByMatch) info.columns.push(...this.extractColumnsFromList(groupByMatch[1]))

        const orderByMatch = sql.match(/ORDER\s+BY\s+([\s\S]+?)(?:LIMIT|UNION|$)/i)
        if (orderByMatch) info.columns.push(...this.extractColumnsFromList(orderByMatch[1]))

        const havingMatch = sql.match(/HAVING\s+([\s\S]+?)(?:ORDER\s+BY|LIMIT|UNION|$)/i)
        if (havingMatch) info.columns.push(...this.extractColumnsFromCondition(havingMatch[1]))

        // INSERT columns
        const insertColsMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i)
        if (insertColsMatch) info.columns.push(...insertColsMatch[1].split(',').map(c => c.trim().replace(/[`"'\[\]]/g, '')))

        // UPDATE SET columns
        const setMatch = sql.match(/SET\s+([\s\S]+?)(?:WHERE|$)/i)
        if (setMatch) {
            const setColumns = setMatch[1].match(/(\w+)\s*=/g)
            if (setColumns) info.columns.push(...setColumns.map(c => c.replace(/\s*=$/, '')))
        }

        // JOIN ON columns
        for (const match of sql.matchAll(/ON\s+(?:\w+\.)?(\w+)\s*=\s*(?:\w+\.)?(\w+)/gi)) {
            info.columns.push(match[1], match[2])
        }

        // Deduplicate and filter
        info.tables = [...new Set(info.tables)].filter(t => t && t.length > 0)
        info.columns = [...new Set(info.columns)].filter(c =>
            c && c.length > 0 && !c.match(/^\d+$/) && !c.match(/^['"]/) &&
            !['NULL', 'TRUE', 'FALSE'].includes(c)
        )
        return info
    }

    /** Extract column names from column list */
    extractColumnsFromList(listStr) {
        const columns = []
        for (const part of listStr.split(',')) {
            const trimmed = part.trim()
            if (/^(COUNT|SUM|AVG|MAX|MIN|RANK|ROW_NUMBER|DENSE_RANK)\s*\(/i.test(trimmed)) {
                const innerMatch = trimmed.match(/\((?:\w+\.)?(\w+)\)/)
                if (innerMatch && innerMatch[1] !== '*') columns.push(innerMatch[1])
                continue
            }
            const qualifiedMatch = trimmed.match(/^(?:\w+\.)?(\w+)/)
            if (qualifiedMatch && !['AS', 'FROM', 'WHERE', 'OVER', 'PARTITION'].includes(qualifiedMatch[1].toUpperCase())) {
                columns.push(qualifiedMatch[1])
            }
        }
        return columns
    }

    /** Extract column names from condition expressions */
    extractColumnsFromCondition(conditionStr) {
        const columns = []
        for (const match of conditionStr.matchAll(/(?:\w+\.)?(\w+)\s*(?:[=<>!]+|IN|LIKE|BETWEEN)/gi)) {
            columns.push(match[1])
        }
        return columns
    }

    /**
     * Create table if not exists, or add missing columns if it does exist
     */
    async createOrUpdateTable(tableName, columns = []) {
        if (columns.length === 0 || columns.includes('*')) {
            columns = ['id']
        }

        // First, try to create the table
        const columnDefs = columns.map(col => {
            const type = this.inferColumnType(col)
            return `\`${col}\` ${type}`
        }).join(', ')

        try {
            const createSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefs})`
            await this.dbManager.query(createSql)
        } catch (error) {
            // Ignore create errors
        }

        // Then, ensure all columns exist (add missing ones)
        for (const col of columns) {
            await this.addColumnToTable(tableName, col)
        }
    }

    /** Infer column type based on column name patterns */
    inferColumnType(columnName) {
        const name = columnName.toLowerCase()
        // ID types
        if (/^(uuid|guid|.*_uuid|.*_guid)$/.test(name)) return 'VARCHAR(36)'
        if (/^(id|.*_id)$/.test(name)) return 'INT'
        if (/^(code|number|no|.*_code|.*_number|.*_no)$/.test(name)) return 'VARCHAR(50)'
        // Date/Time types
        if (/(^|_)(date|day)(_|$)/.test(name) && !name.includes('update') && !name.includes('create')) return 'DATE'
        if (/(created|updated|modified|deleted)_(at|time|date)/.test(name)) return 'DATETIME'
        if (/(timestamp|.*_time|.*_at)$/.test(name)) return 'DATETIME'
        if (/(^|_)year(_|$)/.test(name)) return 'INT'
        // Numeric types
        if (/(price|amount|salary|cost|fee|total|subtotal|revenue|profit)/.test(name)) return 'DECIMAL(10,2)'
        if (/(count|quantity|num|number|qty|stock)/.test(name) && !name.includes('phone')) return 'INT'
        if (/(rate|ratio|percent|percentage|score|rating|point|rank)/.test(name)) return 'DECIMAL(5,2)'
        // Boolean
        if (/^(is_|has_|can_|should_|enabled|disabled|active|deleted)/.test(name)) return 'BOOLEAN'
        // Contact info
        if (/(email|mail)/.test(name)) return 'VARCHAR(255)'
        if (/(phone|mobile|tel|fax)/.test(name)) return 'VARCHAR(20)'
        if (/(url|link|website|domain|address|addr)/.test(name)) return 'VARCHAR(500)'
        if (/(zip|postal|postcode)/.test(name)) return 'VARCHAR(10)'
        // Identifiers
        if (/(username|login|account)/.test(name)) return 'VARCHAR(50)'
        if (/(password|pwd|hash|token|key|secret)/.test(name)) return 'VARCHAR(255)'
        // Names
        if (/(name|title|label)$/.test(name)) return 'VARCHAR(100)'
        if (/(first_name|last_name|full_name)/.test(name)) return 'VARCHAR(50)'
        // Text content
        if (/(description|desc|comment|remark|note|content|text|body|message)/.test(name)) return 'TEXT'
        if (/(summary|abstract|intro)/.test(name)) return 'VARCHAR(500)'
        // Status/Enum
        if (/(status|state|type|kind|category|level|priority|gender)/.test(name)) return 'VARCHAR(50)'
        // IP Address
        if (/(ip|ip_address|ipaddr)/.test(name)) return 'VARCHAR(45)'
        // Default
        return name.length <= 10 ? 'VARCHAR(100)' : 'VARCHAR(255)'
    }

    /** Detect SQL statement type */
    detectSqlType(sql) {
        const trimmed = sql.trim().toUpperCase()
        // ADMIN commands must be checked BEFORE generic DDL (since CREATE ACCOUNT starts with CREATE)
        if (/^(GRANT|REVOKE)\s+/i.test(trimmed)) return SQL_TYPES.ADMIN
        // Note: SNAPSHOT is excluded from ADMIN - it should be executed as DDL to create test context
        if (/^(CREATE|DROP|ALTER)\s+(USER|ACCOUNT|ROLE|PITR|PUBLICATION|SUBSCRIPTION)\s+/i.test(trimmed)) return SQL_TYPES.ADMIN
        if (/^SHOW\s+(PUBLICATIONS|SUBSCRIPTIONS|SNAPSHOTS|PITR|GRANTS)\b/i.test(trimmed)) return SQL_TYPES.ADMIN
        // SESSION commands (SET statements) - cannot be PREPAREd in MO
        if (/^SET\s+/i.test(trimmed)) return SQL_TYPES.SESSION
        // DDL (including SNAPSHOT - must be executed to create test context)
        // Also includes DATA BRANCH statements which cannot be PREPAREd
        if (/^(CREATE|DROP|ALTER|TRUNCATE|RENAME)\s+/i.test(trimmed)) return SQL_TYPES.DDL
        if (/^DATA\s+BRANCH\s+/i.test(trimmed)) return SQL_TYPES.DDL
        if (/^USE\s+/i.test(trimmed)) return SQL_TYPES.DDL
        if (/^(BEGIN|START\s+TRANSACTION|COMMIT|ROLLBACK|SAVEPOINT)\s*;?$/i.test(trimmed)) return SQL_TYPES.DDL
        // DML
        if (/^(INSERT|UPDATE|DELETE|REPLACE|LOAD\s+DATA)\s+/i.test(trimmed)) return SQL_TYPES.DML
        // QUERY
        if (/^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN)\s+/i.test(trimmed)) return SQL_TYPES.QUERY
        return SQL_TYPES.UNKNOWN
    }

    /** Check if error is a context error (missing table/column/database) */
    isContextError(errorMessage) {
        const msg = errorMessage.toLowerCase()
        // Syntax errors are NOT context errors
        if (/syntax error|sql syntax|parse error|unexpected token|invalid syntax/i.test(msg)) return false
        // Context error patterns
        return /(table|column|database|object|relation).*(doesn't exist|does not exist|not exist|unknown|not found)/i.test(msg)
    }

    /** Extract missing column names from error message */
    extractMissingColumnsFromError(error) {
        const columns = []
        const msg = error.message || String(error)
        const patterns = [/column ['"]?(\w+)['"]? not found/gi, /column (\w+) does not exist/gi, /unknown column ['"]?(\w+)['"]?/gi]
        for (const pattern of patterns) {
            for (const match of msg.matchAll(pattern)) {
                if (match[1] && !columns.includes(match[1])) columns.push(match[1])
            }
        }
        return columns
    }

    /** Add column to table */
    async addColumnToTable(tableName, columnName) {
        try {
            await this.dbManager.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${this.inferColumnType(columnName)}`)
            return true
        } catch { return false }
    }

    /** Remove cross-database references (db.table → table) */
    removeCrossDatabaseReferences(sql, tables) {
        let result = sql
        for (const table of tables) {
            result = result.replace(new RegExp(`\\w+\\.${table}\\b`, 'gi'), table)
            result = result.replace(new RegExp(`\`\\w+\`\\.\`${table}\``, 'gi'), table)
        }
        return result
    }

    /** Validate administrative commands (check syntax/semantics, then SKIP execution) */
    async validateAdminCommand(sql, sqlType) {
        try {
            await this.dbManager.query(`PREPARE stmt FROM '${sql.replace(/'/g, "''")}'`)
            await this.dbManager.query('DEALLOCATE PREPARE stmt')
            return { status: VALIDATION_STATUS.SKIP, message: 'Administrative command, syntax is correct but execution skipped', type: sqlType }
        } catch (error) {
            const errorMsg = error.message.toLowerCase()

            // Syntax errors are real errors
            if (errorMsg.includes('syntax error') || errorMsg.includes('sql syntax')) {
                return { status: VALIDATION_STATUS.ERROR, message: `Administrative command syntax error: ${error.message}`, type: sqlType, detail: error.message }
            }

            // Other errors (internal error, account exists/not exists, etc.) - syntax is OK, just SKIP
            return { status: VALIDATION_STATUS.SKIP, message: 'Administrative command, syntax validated but execution skipped', type: sqlType }
        }
    }

    /** Validate SESSION commands (SET statements) - execute directly since MO cannot PREPARE them */
    async validateSessionCommand(sql, sqlType) {
        try {
            await this.dbManager.query(sql)
            return { status: VALIDATION_STATUS.SUCCESS, message: 'SET command executed successfully', type: sqlType }
        } catch (error) {
            const errorMsg = error.message.toLowerCase()

            // Syntax errors
            if (errorMsg.includes('syntax error') || errorMsg.includes('sql syntax')) {
                return { status: VALIDATION_STATUS.ERROR, message: `SET command syntax error: ${error.message}`, type: sqlType, detail: error.message }
            }

            // Unknown variable errors - syntax is OK, just the variable doesn't exist
            if (errorMsg.includes('unknown system variable') || errorMsg.includes('variable') || errorMsg.includes('not found')) {
                return { status: VALIDATION_STATUS.SUCCESS, message: 'SET command validated (variable may not exist in this version)', type: sqlType }
            }

            // Other errors - treat as success since SET syntax is likely correct
            return { status: VALIDATION_STATUS.SUCCESS, message: 'SET command validated', type: sqlType }
        }
    }

    isComment(sql) {
        const t = sql.trim()
        return t.startsWith('--') || t.startsWith('#') || t.startsWith('/*')
    }

    /**
     * Determine if the SQL is a syntax template (not real SQL)
     * Syntax templates contain placeholders like <table_name>, col1, col2, ..., [optional], etc.
     * @param {string} sql - SQL statement
     * @returns {boolean} Whether it's a syntax template
     */
    isSyntaxTemplate(sql) {
        const trimmed = sql.trim()

        // Pattern 1: Angle bracket placeholders like <table_name>, <column_name>, <index_name>
        // Match <word> pattern (but not <= or >= operators)
        if (/<[a-zA-Z_][a-zA-Z0-9_]*>/.test(trimmed)) {
            return true
        }

        // Pattern 2: Ellipsis indicating continuation (col1, col2, ...)
        if (/\.\.\./.test(trimmed)) {
            return true
        }

        // Pattern 3: Square bracket optional syntax like [WITH PARSER ...]
        // But exclude array indexing like arr[0]
        if (/\[[A-Z][A-Z\s|]+\]/.test(trimmed)) {
            return true
        }

        // Pattern 4: Placeholder patterns like {expr} or ${var}
        if (/\{[a-zA-Z_][a-zA-Z0-9_]*\}/.test(trimmed)) {
            return true
        }

        // Pattern 5: Generic placeholder words commonly used in syntax docs
        // Match patterns like "column_name", "table_name" as standalone identifiers in specific contexts
        // Only match if it looks like a template (e.g., starts with common DDL/DML keywords and has placeholder-like structure)
        if (/^(CREATE|ALTER|DROP|SELECT|INSERT|UPDATE|DELETE|MATCH)\\s+/i.test(trimmed)) {
            // Check for common placeholder patterns
            if (/\\b(expr|expression|condition|search_modifier)\\b/i.test(trimmed)) {
                // Additional check: if combined with other template indicators
                if (/\\(.*,.*,.*\\.\\.\\.\\)/.test(trimmed) || /\\[[^\\]]+\\]/.test(trimmed)) {
                    return true
                }
            }
        }

        return false
    }

    /** Compare actual query results with expected results */
    compareResults(actualResult, expectedResults, sqlType) {
        const fail = (reason) => ({ matched: false, reason })
        if (!expectedResults || Object.keys(expectedResults).length === 0) return { matched: true }

        // DML operations
        if (sqlType === SQL_TYPES.DML) {
            if (expectedResults.affectedRows !== undefined) {
                const actual = actualResult.affectedRows || 0
                if (actual !== expectedResults.affectedRows) return fail(`Expected ${expectedResults.affectedRows} affected rows, but got ${actual}`)
            }
            return { matched: true }
        }

        // SELECT queries
        if (sqlType === SQL_TYPES.QUERY) {
            const rows = Array.isArray(actualResult) ? actualResult : []
            const er = expectedResults

            if (er.rows !== undefined && rows.length !== er.rows)
                return fail(`Expected ${er.rows} rows, but got ${rows.length}`)

            if (er.value !== undefined) {
                if (rows.length === 0) return fail(`Expected value ${er.value}, but got no rows`)
                const firstValue = Object.values(rows[0])[0]
                if (!this.valuesMatch(firstValue, er.value, er.precision))
                    return fail(`Expected value ${er.value}, but got ${firstValue}`)
            }

            if (er.values?.length) {
                if (rows.length === 0) return fail(`Expected values ${er.values.join(', ')}, but got no rows`)
                const actualValues = Object.values(rows[0])
                if (actualValues.length !== er.values.length)
                    return fail(`Expected ${er.values.length} columns, but got ${actualValues.length}`)
                for (let i = 0; i < er.values.length; i++) {
                    if (!this.valuesMatch(actualValues[i], er.values[i], er.precision))
                        return fail(`Column ${i}: expected ${er.values[i]}, but got ${actualValues[i]}`)
                }
            }

            if (er.contains?.length) {
                const allValues = rows.flatMap(row => Object.values(row).map(String))
                for (const ev of er.contains) {
                    if (!allValues.some(v => v.includes(ev))) return fail(`Expected result to contain "${ev}", but it was not found`)
                }
            }

            if (er.output !== undefined) {
                const comparison = this.compareTableOutput(rows, er.output)
                if (!comparison.matched) return comparison
            }
        }
        return { matched: true }
    }

    /** Compare two values with optional precision for floating point */
    valuesMatch(actual, expected, precision = 0.0001) {
        // Handle null comparison (case-insensitive for string 'null'/'NULL')
        if (actual === null && (expected === null || (typeof expected === 'string' && expected.toLowerCase() === 'null'))) return true
        if (expected === null && (actual === null || (typeof actual === 'string' && actual.toLowerCase() === 'null'))) return true
        if (actual === null || expected === null) return false

        // Handle JSON objects - serialize to string for comparison
        let actualStr
        if (typeof actual === 'object' && actual !== null) {
            actualStr = JSON.stringify(actual)
        } else {
            actualStr = String(actual).trim()
        }

        let expectedStr = String(expected).trim()

        // Direct match
        if (actualStr === expectedStr || actualStr.toLowerCase() === expectedStr.toLowerCase()) return true

        // Try JSON normalization - compare parsed JSON if both are valid JSON
        try {
            const actualJson = typeof actual === 'object' ? actual : JSON.parse(actualStr)
            const expectedJson = JSON.parse(expectedStr)
            if (JSON.stringify(actualJson) === JSON.stringify(expectedJson)) return true
        } catch {
            // Not valid JSON, continue with other comparisons
        }

        const actualNum = parseFloat(actual)
        if (expectedStr.startsWith('~')) expectedStr = expectedStr.substring(1)
        const expectedNum = parseFloat(expectedStr)

        return !isNaN(actualNum) && !isNaN(expectedNum) && Math.abs(actualNum - expectedNum) <= precision
    }

    /** Parse a single table row: "| a | b |" -> ["a", "b"] */
    parseTableRow(line) {
        return line.split('|').slice(1, -1).map(p => p.trim())
    }

    /** Compare table output with actual query results */
    compareTableOutput(actualRows, expectedTableStr) {
        if (/^\s*Empty\s+set/i.test(expectedTableStr.trim())) {
            return actualRows.length === 0
                ? { matched: true }
                : { matched: false, reason: `Expected empty result set, but got ${actualRows.length} rows` }
        }

        const expected = this.parseTableOutput(expectedTableStr)
        if (expected.rows.length === 0) {
            return actualRows.length === 0
                ? { matched: true, reason: 'Both expected and actual are empty' }
                : { matched: false, reason: 'Could not parse expected table output' }
        }

        if (actualRows.length !== expected.rows.length) {
            return { matched: false, reason: `Expected ${expected.rows.length} rows, but got ${actualRows.length}` }
        }

        if (actualRows.length > 0 && Object.keys(actualRows[0]).length !== expected.columns.length) {
            return { matched: false, reason: `Expected ${expected.columns.length} columns, but got ${Object.keys(actualRows[0]).length}` }
        }

        for (let i = 0; i < expected.rows.length; i++) {
            for (const col of expected.columns) {
                if (!this.valuesMatch(actualRows[i][col], expected.rows[i][col])) {
                    // Serialize objects for display in error message
                    const actualVal = typeof actualRows[i][col] === 'object' && actualRows[i][col] !== null
                        ? JSON.stringify(actualRows[i][col])
                        : actualRows[i][col]
                    return { matched: false, reason: `Row ${i + 1}, column '${col}': expected '${expected.rows[i][col]}', but got '${actualVal}'` }
                }
            }
        }
        return { matched: true }
    }

    /** Check if expected results exist */
    hasExpectedResults(er) {
        if (!er || typeof er !== 'object') return false
        return er.rows !== undefined || er.value !== undefined ||
            (er.values?.length > 0) || (er.contains?.length > 0) ||
            (er.output?.trim()) || er.affectedRows !== undefined
    }

    /**
     * Format error message to be more concise
     * Removes verbose prefix and extracts key information
     */
    formatError(message) {
        if (!message) return 'Unknown error'

        // Extract "syntax error at line X column Y near "..."" from verbose MO error
        if (message.includes('syntax error')) {
            const match = message.match(/syntax error at line \d+ column \d+ near "[^"]*"/)
            if (match) {
                return match[0]
            }
        }

        // Remove "SQL parser error: " prefix if present
        message = message.replace(/^SQL parser error:\s*/i, '')

        // Remove verbose MO syntax error prefix
        message = message.replace(/^You have an error in your SQL syntax;[^.]+\.\s*/i, '')

        return message
    }
}

export default SqlRunner