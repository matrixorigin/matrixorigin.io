/**
 * SQL Syntax Checker
 * Supports two modes:
 * 1. Native mode: Uses MatrixOne official SQL parser (requires Go environment)
 * 2. Fallback mode: Uses node-sql-parser + whitelist (no Go required)
 */

import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import NodeSqlParser from 'node-sql-parser'
import { extractSqlFromFile, splitSqlStatements } from '../utils/sql-extractor.js'
import { config } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const SYNTAX_CHECKER_DIR = path.join(__dirname, '..', 'syntax-checker')
const SYNTAX_CHECKER_BINARY = path.join(SYNTAX_CHECKER_DIR, 'syntax-checker')
const BUILD_STATUS_FILE = path.join(SYNTAX_CHECKER_DIR, '.build-status.json')

/**
 * Detect which mode to use
 */
function detectMode() {
    // Check build status file
    if (existsSync(BUILD_STATUS_FILE)) {
        try {
            const status = JSON.parse(readFileSync(BUILD_STATUS_FILE, 'utf-8'))
            if (status.mode === 'native' && existsSync(SYNTAX_CHECKER_BINARY)) {
                return { mode: 'native', info: status }
            }
            return { mode: 'fallback', info: status }
        } catch {
            // Fall through to binary check
        }
    }

    // Direct binary check
    if (existsSync(SYNTAX_CHECKER_BINARY)) {
        return { mode: 'native', info: { mode: 'native', reason: 'Binary exists' } }
    }

    return { mode: 'fallback', info: { mode: 'fallback', reason: 'No build status or binary' } }
}

/**
 * SQL Syntax Checker Class
 * Automatically selects the best available mode
 */
export class SqlSyntaxChecker {
    constructor() {
        const detection = detectMode()
        this.mode = detection.mode
        this.modeInfo = detection.info

        if (this.mode === 'native') {
            this.checkerPath = SYNTAX_CHECKER_BINARY
        } else {
            // Fallback: use node-sql-parser
            const { Parser } = NodeSqlParser
            this.parser = new Parser()
            this.dialect = 'mysql'
        }
    }

    /**
     * Get current mode description for reporting
     */
    getModeDescription() {
        if (this.mode === 'native') {
            return '🚀 Using MatrixOne official parser (native mode)'
        }
        return '📦 Using node-sql-parser + whitelist (fallback mode)'
    }

    /**
     * Check SQL syntax using MatrixOne official parser (native mode)
     */
    async checkWithNativeParser(statements) {
        return new Promise((resolve, reject) => {
            const child = spawn(this.checkerPath, [], {
                stdio: ['pipe', 'pipe', 'pipe']
            })

            let stdout = ''
            let stderr = ''

            child.stdout.on('data', (data) => {
                stdout += data.toString()
            })

            child.stderr.on('data', (data) => {
                stderr += data.toString()
            })

            child.on('close', (code) => {
                if (stderr && code !== 0) {
                    reject(new Error(`syntax-checker error: ${stderr}`))
                    return
                }

                try {
                    const response = JSON.parse(stdout)
                    resolve(response.results || [])
                } catch (e) {
                    reject(new Error(`Failed to parse syntax-checker output: ${stdout}`))
                }
            })

            child.on('error', (err) => {
                reject(new Error(`Failed to spawn syntax-checker: ${err.message}`))
            })

            const request = JSON.stringify({ statements })
            child.stdin.write(request)
            child.stdin.end()
        })
    }

    /**
     * Check SQL syntax using node-sql-parser + whitelist (fallback mode)
     */
    checkWithFallbackParser(sql) {
        // First check whitelist
        if (this.isInMatrixOneWhitelist(sql)) {
            return { valid: true, sql }
        }

        try {
            this.parser.astify(sql, { database: this.dialect })
            return { valid: true, sql }
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                sql
            }
        }
    }

    /**
     * Check if SQL is in MatrixOne whitelist (for fallback mode)
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
     * Check SQL syntax in a single file
     */
    async checkFile(filePath) {
        const errors = []
        let totalStatements = 0
        let successes = 0

        try {
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
     */
    async checkSqlBlock(block) {
        const errors = []
        const rawStatements = splitSqlStatements(block.sql)

        const statements = []
        const statementLines = []

        for (let i = 0; i < rawStatements.length; i++) {
            const statement = rawStatements[i]
            if (!statement.trim() || this.isComment(statement)) {
                continue
            }
            // Skip syntax templates (e.g., <table_name>, col1, col2, ..., [optional])
            if (this.isSyntaxTemplate(statement)) {
                continue
            }
            statements.push(statement)
            statementLines.push(block.startLine + i)
        }

        if (statements.length === 0) {
            return { errors: [], totalStatements: 0, successes: 0 }
        }

        let results

        if (this.mode === 'native') {
            // Native mode: batch check with MatrixOne parser
            try {
                results = await this.checkWithNativeParser(statements)
            } catch (error) {
                return {
                    errors: statements.map((sql, i) => ({
                        line: statementLines[i],
                        message: `Parser error: ${error.message}`,
                        type: 'parser_error',
                        sql,
                        version: block.version
                    })),
                    totalStatements: statements.length,
                    successes: 0
                }
            }
        } else {
            // Fallback mode: check one by one with node-sql-parser
            results = statements.map(sql => this.checkWithFallbackParser(sql))
        }

        let successes = 0
        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            if (result.valid) {
                successes++
            } else {
                errors.push({
                    line: statementLines[i],
                    message: `SQL syntax error: ${this.formatError(result.error)}`,
                    type: 'syntax_error',
                    detail: result.error,
                    sql: result.sql,
                    version: block.version
                })
            }
        }

        return {
            errors,
            totalStatements: statements.length,
            successes
        }
    }

    /**
     * Check a single SQL statement
     */
    async checkSqlStatement(sql, line) {
        let result

        if (this.mode === 'native') {
            try {
                const results = await this.checkWithNativeParser([sql])
                result = results[0]
            } catch (error) {
                return {
                    line,
                    message: `Parser error: ${error.message}`,
                    type: 'parser_error'
                }
            }
        } else {
            result = this.checkWithFallbackParser(sql)
        }

        if (result && !result.valid) {
            return {
                line,
                message: `SQL syntax error: ${this.formatError(result.error)}`,
                type: 'syntax_error',
                detail: result.error
            }
        }

        return null
    }

    /**
     * Determine if the text is a comment
     */
    isComment(sql) {
        const trimmed = sql.trim()
        return trimmed.startsWith('--') ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('/*')
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
        if (/\.\.\.\s*\)?[;]?$/.test(trimmed) || /,\s*\.\.\./.test(trimmed)) {
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
        if (/^(CREATE|ALTER|DROP|SELECT|INSERT|UPDATE|DELETE|MATCH)\s+/i.test(trimmed)) {
            // Check for common placeholder patterns
            if (/\b(expr|expression|condition|search_modifier)\b/i.test(trimmed)) {
                // Additional check: if combined with other template indicators
                if (/\(.*,.*,.*\.\.\.\)/.test(trimmed) || /\[[^\]]+\]/.test(trimmed)) {
                    return true
                }
            }
        }

        return false
    }

    /**
     * Format error message
     */
    formatError(message) {
        if (message && message.includes('syntax error')) {
            // Extract "syntax error at line X column Y near "..."" part
            const match = message.match(/syntax error at line \d+ column \d+ near "[^"]*"/)
            if (match) {
                return match[0]
            }
        }
        return message || 'Unknown error'
    }
}

/**
 * Check multiple files
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
