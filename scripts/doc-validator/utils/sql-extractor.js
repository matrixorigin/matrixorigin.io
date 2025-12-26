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
 * Supports three formats:
 * 1. MySQL inline format (mysql> with table output in same block)
 * 2. Separated format (SQL in one block, output in next block)
 * 3. Pure SQL (no output)
 *
 * @param {string} content - Markdown content
 * @param {string} filePath - File path (for reporting)
 * @returns {Array} Array of SQL code blocks
 */
export function extractSqlFromContent(content, filePath = '') {
    const sqlBlocks = []
    const lines = content.split('\n')

    // First pass: collect all code blocks with metadata
    const allCodeBlocks = collectAllCodeBlocks(lines, filePath)

    // Second pass: process SQL blocks and handle separated format
    for (let i = 0; i < allCodeBlocks.length; i++) {
        const block = allCodeBlocks[i]

        if (!block.isSql) continue

        // Skip blocks marked with validator-ignore
        if (block.ignored) continue

        // Check if it's a genuine SQL code block (not mixed with Shell commands)
        if (!isPureSqlBlock(block.content)) continue

        // Detect format type
        const formatType = detectSqlFormat(block.content)

        if (formatType === 'mysql-inline') {
            // Format 1: MySQL inline format - parse SQL and output together
            const parsed = parseMysqlInlineFormat(block.content)
            for (const item of parsed) {
                sqlBlocks.push({
                    sql: item.sql,
                    startLine: block.startLine,
                    endLine: block.endLine,
                    version: block.version,
                    validationMode: block.validationMode,
                    expectedResults: item.expectedOutput ? { output: item.expectedOutput } : {},
                    filePath: block.filePath,
                    format: 'mysql-inline'
                })
            }
        } else if (formatType === 'separated-sql') {
            // Format 2: Separated format - check if next block is output
            const nextBlock = allCodeBlocks[i + 1]
            if (nextBlock && isSeparatedOutputBlock(block, nextBlock, lines)) {
                // Found matching output block
                const extracted = extractExpectedResultsFromSql(block.content)
                sqlBlocks.push({
                    sql: block.content,
                    startLine: block.startLine,
                    endLine: block.endLine,
                    version: block.version,
                    validationMode: extracted.validationMode || block.validationMode,
                    expectedResults: {
                        ...extracted.expectedResults,
                        output: nextBlock.content
                    },
                    filePath: block.filePath,
                    format: 'separated'
                })
                i++ // Skip next block as it's been processed
            } else {
                // No output block found, treat as pure SQL
                const extracted = extractExpectedResultsFromSql(block.content)
                sqlBlocks.push({
                    sql: block.content,
                    startLine: block.startLine,
                    endLine: block.endLine,
                    version: block.version,
                    validationMode: extracted.validationMode || block.validationMode,
                    expectedResults: extracted.expectedResults,
                    filePath: block.filePath,
                    format: 'pure-sql'
                })
            }
        } else {
            // Format 3: Pure SQL (no mysql> prefix, no output)
            const extracted = extractExpectedResultsFromSql(block.content)
            sqlBlocks.push({
                sql: block.content,
                startLine: block.startLine,
                endLine: block.endLine,
                version: block.version,
                validationMode: extracted.validationMode || block.validationMode,
                expectedResults: extracted.expectedResults,
                filePath: block.filePath,
                format: 'pure-sql'
            })
        }
    }

    return sqlBlocks
}

/**
 * Collect all code blocks from markdown with metadata
 * @param {Array} lines - All lines
 * @param {string} filePath - File path
 * @returns {Array} Array of code blocks with metadata
 */
function collectAllCodeBlocks(lines, filePath) {
    const blocks = []
    let inCodeBlock = false
    let currentBlock = null

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNumber = i + 1

        // Detect code block start
        const codeBlockStart = line.match(/^(\s*)```(\w+)?(?::(\w+(?:-\w+)*))?/)
        if (codeBlockStart && !inCodeBlock) {
            const language = codeBlockStart[2] || ''
            const mode = codeBlockStart[3] || null

            // Check for validator-ignore comment on the same line or previous line
            const shouldIgnore = checkValidatorIgnore(line, lines, i)

            inCodeBlock = true
            currentBlock = {
                content: '',
                startLine: lineNumber + 1,
                endLine: 0,
                language: language.toLowerCase(),
                isSql: config.sqlCodeBlockLanguages.some(lang =>
                    language.toLowerCase() === lang.toLowerCase()
                ),
                version: extractVersionFromContext(lines, i),
                validationMode: mode,
                filePath,
                ignored: shouldIgnore
            }
            continue
        }

        // Detect code block end
        if (line.match(/^\s*```/) && inCodeBlock) {
            if (currentBlock) {
                currentBlock.endLine = lineNumber - 1
                blocks.push(currentBlock)
            }
            inCodeBlock = false
            currentBlock = null
            continue
        }

        // Collect content
        if (inCodeBlock && currentBlock) {
            currentBlock.content += line + '\n'
        }
    }

    return blocks
}

/**
 * Check if a code block should be ignored by the validator
 * Supports formats:
 * - <!-- validator-ignore --> on the line before the code block
 * - ```sql <!-- validator-ignore --> on the same line
 * @param {string} currentLine - Current line (code block start)
 * @param {Array} lines - All lines
 * @param {number} currentIndex - Current line index
 * @returns {boolean} Whether to ignore this block
 */
function checkValidatorIgnore(currentLine, lines, currentIndex) {
    // Check same line: ```sql <!-- validator-ignore -->
    if (/<!--\s*validator-ignore\s*-->/.test(currentLine)) {
        return true
    }

    // Check previous line: <!-- validator-ignore -->
    if (currentIndex > 0) {
        const prevLine = lines[currentIndex - 1].trim()
        if (/^<!--\s*validator-ignore\s*-->$/.test(prevLine)) {
            return true
        }
    }

    return false
}

/**
 * Detect SQL format type
 * @param {string} sqlText - SQL text content
 * @returns {string} Format type: 'mysql-inline', 'separated-sql', or 'pure-sql'
 */
function detectSqlFormat(sqlText) {
    const lines = sqlText.trim().split('\n')
    let hasMysqlPrompt = false
    let hasOutput = false

    for (const line of lines) {
        const trimmed = line.trim()

        // Check for mysql> prompt
        if (/^(mysql>|>)\s*/.test(trimmed)) {
            hasMysqlPrompt = true
        }

        // Check for any kind of output:
        // 1. Table borders or pipes
        if (/^[+\-]+$/.test(trimmed) || /^\|.*\|$/.test(trimmed)) {
            hasOutput = true
        }
        // 2. Result statistics (rows in set)
        if (/^\d+\s+(row|rows)\s+in\s+set/i.test(trimmed)) {
            hasOutput = true
        }
        // 3. Query OK responses
        if (/^Query\s+OK/i.test(trimmed)) {
            hasOutput = true
        }
        // 4. Empty set responses
        if (/^Empty\s+set/i.test(trimmed)) {
            hasOutput = true
        }
        // 5. Records/Warnings stats (from LOAD DATA, etc)
        if (/^Records:\s+\d+/i.test(trimmed) || /^Rows\s+matched:/i.test(trimmed)) {
            hasOutput = true
        }
    }

    if (hasMysqlPrompt && hasOutput) {
        return 'mysql-inline'
    } else if (hasMysqlPrompt && !hasOutput) {
        return 'separated-sql'
    } else {
        return 'pure-sql'
    }
}

/**
 * Parse MySQL inline format (mysql> with output in same block)
 * Handles:
 * - Single line SQL: mysql> SELECT * FROM t1;
 * - Multi-line with continuation: mysql> SELECT\n    -> a, b\n    -> FROM t1;
 * - Multi-line without continuation: mysql> WITH cte AS (\n    SELECT ...\n)\nSELECT ...;
 * - Mixed format: CREATE TABLE ...; INSERT ...; mysql> SELECT ...;
 *
 * @param {string} sqlText - SQL text content
 * @returns {Array} Array of {sql, expectedOutput}
 */
function parseMysqlInlineFormat(sqlText) {
    const statements = []
    const lines = sqlText.split('\n')

    let setupSql = []  // Collect setup statements (CREATE, INSERT, etc.)
    let currentStatement = null
    let currentOutput = []
    let inOutput = false
    let inMultiLineSQL = false
    let isQueryWithOutput = false

    for (const line of lines) {
        const trimmed = line.trim()

        // Skip empty lines when not in statement or output
        if (!trimmed && currentStatement === null && !inOutput) {
            continue
        }

        // Identify SQL statements without prompts (CREATE, INSERT, UPDATE, etc.)
        // These are usually setup statements before the actual query
        if (!inOutput && currentStatement === null &&
            /^(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|USE)\s+/i.test(trimmed)) {
            // Start collecting a new statement
            currentStatement = trimmed
            inMultiLineSQL = true
            isQueryWithOutput = false
            continue
        }

        // Identify new SQL statement starting with mysql> or >
        if (/^(mysql>|>)\s*/.test(trimmed)) {
            // Save previous statement
            if (currentStatement !== null) {
                if (isQueryWithOutput) {
                    // Previous query with output - emit it with setup
                    const fullSql = setupSql.length > 0
                        ? setupSql.join('\n') + '\n' + currentStatement.trim()
                        : currentStatement.trim()
                    statements.push({
                        sql: fullSql,
                        expectedOutput: currentOutput.length > 0 ? currentOutput.join('\n') : null
                    })
                    // Reset setup for next query
                    setupSql = []
                    currentOutput = []
                } else {
                    // Setup statement - add to setupSql
                    setupSql.push(currentStatement.trim())
                }
                currentStatement = null
            }

            // Start new statement with prompt
            const sqlPart = trimmed.replace(/^(mysql>|>)\s*/, '')
            currentStatement = sqlPart
            currentOutput = []
            inOutput = false
            inMultiLineSQL = true
            isQueryWithOutput = true  // This query expects output
            continue
        }

        // Continuation prompt (->)
        if (/^\s*->\s*/.test(trimmed) && currentStatement !== null && !inOutput) {
            const sqlPart = trimmed.replace(/^\s*->\s*/, '')
            currentStatement += ' ' + sqlPart
            continue
        }

        // If we have a current statement and haven't started output yet
        if (currentStatement !== null && !inOutput) {
            // Check if this line starts output (table border, pipe, or result stats)
            if (/^[+\-]+$/.test(trimmed) ||
                /^\|.*\|$/.test(trimmed) ||
                /^\d+\s+(row|rows)\s+in\s+set/i.test(trimmed) ||
                /^Query\s+OK/i.test(trimmed) ||
                /^Empty\s+set/i.test(trimmed) ||
                /^Records:/i.test(trimmed)) {
                // This is output
                inOutput = true
                inMultiLineSQL = false
                currentOutput.push(line)
                continue
            }

            // Check if line ends with semicolon (statement complete)
            if (trimmed.endsWith(';') && !isQueryWithOutput) {
                currentStatement += '\n' + line
                setupSql.push(currentStatement.trim())
                currentStatement = null
                inMultiLineSQL = false
                continue
            }

            // Skip empty lines between SQL and output
            if (!trimmed) {
                continue
            }

            // Otherwise, it's continuation of multi-line SQL (no -> prefix)
            if (inMultiLineSQL) {
                currentStatement += '\n' + line
                continue
            }
        }

        // Accumulate output if we're in output mode
        if (inOutput) {
            currentOutput.push(line)
        }
    }

    // Save last statement if exists
    if (currentStatement !== null) {
        if (isQueryWithOutput) {
            // Last query with output
            const fullSql = setupSql.length > 0
                ? setupSql.join('\n') + '\n' + currentStatement.trim()
                : currentStatement.trim()
            statements.push({
                sql: fullSql,
                expectedOutput: currentOutput.length > 0 ? currentOutput.join('\n') : null
            })
        } else {
            // Last setup statement
            setupSql.push(currentStatement.trim())
        }
    }

    return statements
}

/**
 * Check if next block is a separated output block
 * @param {object} sqlBlock - SQL code block
 * @param {object} nextBlock - Next code block
 * @param {Array} lines - All lines (to check text between blocks)
 * @returns {boolean} Whether next block is output for this SQL
 */
function isSeparatedOutputBlock(sqlBlock, nextBlock, lines) {
    // Next block should not be an SQL block
    if (nextBlock.isSql) return false

    // Next block should contain table-like output
    const hasTableOutput = /^[+\-|]+$/m.test(nextBlock.content) ||
                          /^\|.*\|$/m.test(nextBlock.content)
    if (!hasTableOutput) return false

    // Check text between blocks for result indicators
    const textBetween = getTextBetween(sqlBlock.endLine, nextBlock.startLine - 1, lines)
    return isResultIndicator(textBetween)
}

/**
 * Get text between two line numbers
 * @param {number} startLine - Start line (inclusive)
 * @param {number} endLine - End line (inclusive)
 * @param {Array} lines - All lines
 * @returns {string} Text between lines
 */
function getTextBetween(startLine, endLine, lines) {
    if (startLine >= lines.length || endLine >= lines.length) return ''
    return lines.slice(startLine, endLine + 1).join('\n')
}

/**
 * Check if text contains result indicator phrases
 * @param {string} text - Text to check
 * @returns {boolean} Whether text indicates a result follows
 */
function isResultIndicator(text) {
    const indicators = [
        /result\s+is\s+as\s+below/i,
        /expected\s+result/i,
        /output/i,
        /结果如下/,
        /预期结果/,
        /执行结果/
    ]
    return indicators.some(pattern => pattern.test(text))
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
        const versionMatch = line.match(/(?:version|mo-version).*?:\s*(v?[\d.]+)/i)
        if (versionMatch) {
            return versionMatch[1]
        }
    }

    return null
}

/**
 * Split SQL text into individual statements
 * Note: For MySQL inline format, SQL should already be extracted by parseMysqlInlineFormat()
 * This function handles pure SQL statements that may not have semicolons or mysql> prefixes
 *
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

        // Skip lines starting with MySQL command line prompt (should already be handled, but keep for safety)
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

    // Check if block contains mysql> prompt - if yes, it's OK to have table output
    const hasMysqlPrompt = lines.some(l => /^(mysql>|>)\s*/.test(l.trim()))

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
    // BUT: If block has mysql> prompt, table output is expected and OK
    if (!hasMysqlPrompt) {
        const tableLines = lines.filter(l => /^[+\-|]+$/.test(l.trim())).length
        const contentLines = lines.filter(l => l.trim()).length
        if (contentLines > 0 && tableLines / contentLines > 0.3) {
            return false
        }
    }

    return true
}

/**
 * Extract expected results and validation mode from SQL comments
 * @param {string} sqlText - SQL text
 * @returns {object} Extracted validation mode and expected results
 */
function extractExpectedResultsFromSql(sqlText) {
    const result = {
        validationMode: null,
        expectedResults: {}
    }

    const lines = sqlText.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()

        // Skip non-comment lines
        if (!trimmed.startsWith('--') && !trimmed.startsWith('/*')) {
            continue
        }

        // Extract validation mode
        // Format: -- @validator-mode: strict
        const modeMatch = trimmed.match(/--\s*@validator-mode:\s*(strict|syntax-only)/i)
        if (modeMatch) {
            result.validationMode = modeMatch[1].toLowerCase()
        }

        // Extract Expected-Rows
        // Format: -- Expected-Rows: 3
        const rowsMatch = trimmed.match(/--\s*Expected-Rows:\s*(\d+)/i)
        if (rowsMatch) {
            result.expectedResults.rows = parseInt(rowsMatch[1], 10)
        }

        // Extract Expected-Value (single value)
        // Format: -- Expected-Value: 5 or -- Expected-Value: NULL
        const valueMatch = trimmed.match(/--\s*Expected-Value:\s*(.+)/i)
        if (valueMatch) {
            const value = valueMatch[1].trim()
            result.expectedResults.value = value === 'NULL' ? null : value
        }

        // Extract Expected-Values (multiple values)
        // Format: -- Expected-Values: 1, Alice, 25
        const valuesMatch = trimmed.match(/--\s*Expected-Values:\s*(.+)/i)
        if (valuesMatch) {
            result.expectedResults.values = valuesMatch[1]
                .split(',')
                .map(v => v.trim())
        }

        // Extract Expected-Contains
        // Format: -- Expected-Contains: Alice
        const containsMatch = trimmed.match(/--\s*Expected-Contains:\s*(.+)/i)
        if (containsMatch) {
            if (!result.expectedResults.contains) {
                result.expectedResults.contains = []
            }
            result.expectedResults.contains.push(containsMatch[1].trim())
        }

        // Extract Expected-AffectedRows
        // Format: -- Expected-AffectedRows: 1
        const affectedMatch = trimmed.match(/--\s*Expected-AffectedRows:\s*(\d+)/i)
        if (affectedMatch) {
            result.expectedResults.affectedRows = parseInt(affectedMatch[1], 10)
        }

        // Extract Expected-Success
        // Format: -- Expected-Success: true
        const successMatch = trimmed.match(/--\s*Expected-Success:\s*(true|false)/i)
        if (successMatch) {
            result.expectedResults.success = successMatch[1].toLowerCase() === 'true'
        }

        // Extract Expected-Precision (for floating point comparison)
        // Format: -- Expected-Precision: 0.01
        const precisionMatch = trimmed.match(/--\s*Expected-Precision:\s*([\d.]+)/i)
        if (precisionMatch) {
            result.expectedResults.precision = parseFloat(precisionMatch[1])
        }
    }

    // Extract Expected-Output (multi-line block comment format)
    // Format: /* Expected-Output: ... */
    const outputBlockMatch = sqlText.match(/\/\*\s*Expected-Output:\s*([\s\S]*?)\*\//i)
    if (outputBlockMatch) {
        result.expectedResults.output = outputBlockMatch[1].trim()
    }

    return result
}

export default {
    extractSqlFromFile,
    extractSqlFromContent,
    splitSqlStatements
}