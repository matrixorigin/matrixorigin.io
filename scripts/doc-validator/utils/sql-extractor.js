/**
 * SQL Extractor - Extract SQL code blocks from Markdown documents
 */

import { readFileSync } from 'node:fs'
import { config } from '../config.js'

/**
 * Extract SQL code blocks from a Markdown file
 * @param {string} filePath - Markdown file path
 * @returns {Array} Array of SQL code blocks
 */
export function extractSqlFromFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8')
        return extractSqlFromContent(content, filePath)
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message)
        return []
    }
}

/**
 * Extract SQL code blocks from Markdown content
 * @param {string} content - Markdown content
 * @param {string} filePath - File path (for reporting)
 * @returns {Array} Array of SQL code blocks
 */
export function extractSqlFromContent(content, filePath = '') {
    const sqlBlocks = []
    const lines = content.split('\n')

    let inCodeBlock = false
    let isCodeBlockSql = false
    let currentBlock = {
        sql: '',
        startLine: 0,
        endLine: 0,
        version: null,
        filePath
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1

        // Detect code block start (supports indentation)
        const codeBlockStart = line.match(/^\s*```(\w+)?/)
        if (codeBlockStart && !inCodeBlock) {
            const language = codeBlockStart[1] || ''

            // Check if it's an SQL code block
            if (config.sqlCodeBlockLanguages.some(lang =>
                language.toLowerCase() === lang.toLowerCase()
            )) {
                inCodeBlock = true
                isCodeBlockSql = true
                currentBlock = {
                    sql: '',
                    startLine: lineNumber + 1,
                    endLine: 0,
                    version: extractVersionFromContext(lines, i),
                    filePath
                }
            } else {
                inCodeBlock = true
                isCodeBlockSql = false
            }
            continue
        }

        // Detect code block end (supports indentation)
        if (line.match(/^\s*```/) && inCodeBlock) {
            if (isCodeBlockSql && currentBlock.sql.trim()) {
                // Check if it's a genuine SQL code block (not mixed with Shell commands)
                if (isPureSqlBlock(currentBlock.sql)) {
                    currentBlock.endLine = lineNumber - 1
                    sqlBlocks.push({ ...currentBlock })
                }
            }
            inCodeBlock = false
            isCodeBlockSql = false
            continue
        }

        // Collect SQL content
        if (inCodeBlock && isCodeBlockSql) {
            currentBlock.sql += line + '\n'
        }
    }

    return sqlBlocks
}

/**
 * Extract version information from context
 * @param {Array} lines - All lines of content
 * @param {number} currentIndex - Current line index
 * @returns {string|null} Version number or null
 */
function extractVersionFromContext(lines, currentIndex) {
    // Look up the nearest 10 lines for version markers
    const lookbackLines = 10
    const startIndex = Math.max(0, currentIndex - lookbackLines)

    for (let i = currentIndex; i >= startIndex; i--) {
        const line = lines[i]

        // Match version markers, e.g.:
        // <!-- version: v1.2 -->
        // <!-- mo-version: v1.2 -->
        // **Version**: v1.2
        const versionMatch = line.match(/(?:version|mo-version):\s*(v?[\d.]+)/i)
        if (versionMatch) {
            return versionMatch[1]
        }
    }

    return null
}

/**
 * Split SQL text into individual statements
 * @param {string} sql - SQL text
 * @returns {Array} Array of individual SQL statements
 */
export function splitSqlStatements(sql) {
    // Simple splitting logic: split by semicolon
    // Note: This is a simplified version; more complex parsing may be needed to handle semicolons in strings
    const statements = []
    const lines = sql.split('\n')
    let currentStatement = ''

    for (const line of lines) {
        const trimmedLine = line.trim()

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('#')) {
            continue
        }

        // Skip lines starting with MySQL command line prompt
        if (trimmedLine.startsWith('mysql>') || trimmedLine.startsWith('>')) {
            // Extract SQL statement after the prompt
            const sqlPart = trimmedLine.replace(/^(mysql>|>)\s*/, '')
            if (sqlPart) {
                currentStatement += sqlPart + '\n'
            }
            continue
        }

        // Skip output results (tables, query results, etc.)
        if (shouldSkipLine(trimmedLine)) {
            continue
        }

        currentStatement += line + '\n'

        // Consider a statement complete if line ends with semicolon
        if (trimmedLine.endsWith(';')) {
            if (currentStatement.trim()) {
                statements.push(currentStatement.trim())
            }
            currentStatement = ''
        }
    }

    // Add the last statement (if not ending with semicolon)
    if (currentStatement.trim()) {
        statements.push(currentStatement.trim())
    }

    return statements
}

/**
 * Determine if a line should be skipped (non-SQL statement)
 * @param {string} line - Line content
 * @returns {boolean} Whether to skip the line
 */
function shouldSkipLine(line) {
    // Skip table borders
    if (/^[+\-|]+$/.test(line)) {
        return true
    }

    // Skip table content lines (starts and ends with |)
    if (/^\|.*\|$/.test(line)) {
        return true
    }

    // Skip query result statistics (e.g., "1 row in set")
    if (/^\d+\s+(row|rows)\s+in\s+set/i.test(line)) {
        return true
    }

    // Skip Query OK responses
    if (/^Query\s+OK/i.test(line)) {
        return true
    }

    // Skip Shell commands (common ones like mysql, mysqldump, etc.)
    if (/^(mysql|mysqldump|root@)\s+/.test(line)) {
        return true
    }

    // Skip warning messages
    if (/^\[Warning\]/i.test(line) || /^Warning:/i.test(line)) {
        return true
    }

    return false
}

/**
 * Determine if a code block contains pure SQL (no Shell commands, output, etc.)
 * @param {string} sqlText - SQL text
 * @returns {boolean} Whether it's pure SQL
 */
function isPureSqlBlock(sqlText) {
    const lines = sqlText.trim().split('\n')

    // Check each line
    for (const line of lines) {
        const trimmed = line.trim()

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('#')) {
            continue
        }

        // If contains Shell prompts (root@, user@), it's likely mixed content
        if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+.*[#$%]/.test(trimmed)) {
            return false
        }

        // If contains "Welcome to", "Copyright", "Server version", etc., it's connection output
        if (/Welcome to|Copyright|Server version|Type 'help'/i.test(trimmed)) {
            return false
        }

        // If contains "Your MySQL connection id", it's connection information
        if (/connection id is/i.test(trimmed)) {
            return false
        }

        // If contains Oracle trademark-related content, it's copyright information
        if (/Oracle.*trademark|affiliates/i.test(trimmed)) {
            return false
        }
    }

    // If table lines (+---+) account for more than 30% of content lines, it's likely output results
    const tableLines = lines.filter(l => /^[+\-|]+$/.test(l.trim())).length
    const contentLines = lines.filter(l => l.trim()).length
    if (contentLines > 0 && tableLines / contentLines > 0.3) {
        return false
    }

    return true
}

export default {
    extractSqlFromFile,
    extractSqlFromContent,
    splitSqlStatements
}