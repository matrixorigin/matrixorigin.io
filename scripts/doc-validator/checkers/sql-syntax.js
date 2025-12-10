/**
 * SQL Syntax Checker
 */

import NodeSqlParser from 'node-sql-parser'
import { extractSqlFromFile, splitSqlStatements } from '../utils/sql-extractor.js'
import { config } from '../config.js'

const { Parser } = NodeSqlParser

/**
 * SQL Syntax Checker Class
 */
export class SqlSyntaxChecker {
    constructor() {
        // Initialize SQL parser with MySQL dialect
        this.parser = new Parser()
        this.dialect = 'mysql'
    }

    /**
     * Check SQL syntax in a single file
     * @param {string} filePath - File path
     * @returns {Promise<object>} Check result
     */
    async checkFile(filePath) {
        const errors = []
        let totalStatements = 0
        let successes = 0

        try {
            // Extract SQL code blocks
            const sqlBlocks = extractSqlFromFile(filePath)

            if (sqlBlocks.length === 0) {
                return {
                    passed: true,
                    errors: [],
                    sqlCount: 0,
                    totalStatements: 0,
                    successes: 0
                }
            }

            // Check each SQL code block
            for (const block of sqlBlocks) {
                const blockResult = await this.checkSqlBlock(block)
                errors.push(...blockResult.errors)
                totalStatements += blockResult.totalStatements
                successes += blockResult.successes
            }

            return {
                passed: errors.length === 0,
                errors,
                sqlCount: sqlBlocks.length,
                totalStatements,
                successes
            }
        } catch (error) {
            return {
                passed: false,
                errors: [{
                    line: 0,
                    message: `File processing error: ${error.message}`,
                    type: 'file_error'
                }],
                sqlCount: 0,
                totalStatements: 0,
                successes: 0
            }
        }
    }

    /**
     * Check a single SQL code block
     * @param {object} block - SQL code block
     * @returns {Promise<object>} Result with errors, totalStatements, and successes
     */
    async checkSqlBlock(block) {
        const errors = []
        const statements = splitSqlStatements(block.sql)
        let totalStatements = 0
        let successes = 0

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i]

            // Skip empty statements
            if (!statement.trim()) {
                continue
            }

            // Skip comments
            if (this.isComment(statement)) {
                continue
            }

            totalStatements++

            // Check syntax
            const error = await this.checkSqlStatement(statement, block.startLine + i)
            if (error) {
                errors.push({
                    ...error,
                    line: block.startLine,
                    sql: statement,
                    version: block.version
                })
            } else {
                successes++
            }
        }

        return {
            errors,
            totalStatements,
            successes
        }
    }

    /**
     * Check a single SQL statement
     * @param {string} sql - SQL statement
     * @param {number} line - Line number
     * @returns {Promise<object|null>} Error object or null
     */
    async checkSqlStatement(sql, line) {
        // First check if it's in MatrixOne whitelist
        if (this.isInMatrixOneWhitelist(sql)) {
            // In whitelist, skip syntax check
            return null
        }

        try {
            // Parse SQL using node-sql-parser
            const ast = this.parser.astify(sql, { database: this.dialect })

            // If parsing succeeds, syntax is correct
            return null
        } catch (error) {
            // Parsing failed, syntax error exists
            return {
                line,
                message: `SQL syntax error: ${this.formatError(error.message)}`,
                type: 'syntax_error',
                detail: error.message
            }
        }
    }

    /**
     * Check if SQL is in MatrixOne whitelist
     * @param {string} sql - SQL statement
     * @returns {boolean} Whether it's in the whitelist
     */
    isInMatrixOneWhitelist(sql) {
        const whitelist = config.syntaxCheck.matrixoneWhitelist || []

        for (const pattern of whitelist) {
            if (pattern.test(sql)) {
                return true
            }
        }

        return false
    }

    /**
     * Determine if the text is a comment
     * @param {string} sql - SQL text
     * @returns {boolean} Whether it's a comment
     */
    isComment(sql) {
        const trimmed = sql.trim()
        return trimmed.startsWith('--') ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('/*')
    }

    /**
     * Format error message
     * @param {string} message - Original error message
     * @returns {string} Formatted error message
     */
    formatError(message) {
        // Simplify error message for better readability
        if (message.includes('Expected')) {
            return message.split('\n')[0]
        }
        return message
    }
}

/**
 * Check multiple files
 * @param {Array<string>} files - List of file paths
 * @returns {Promise<Map>} Mapping from file path to check result
 */
export async function checkFiles(files) {
    const checker = new SqlSyntaxChecker()
    const results = new Map()

    for (const file of files) {
        const result = await checker.checkFile(file)
        results.set(file, result)
    }

    return results
}

export default SqlSyntaxChecker