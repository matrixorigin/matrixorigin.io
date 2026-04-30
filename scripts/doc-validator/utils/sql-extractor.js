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

        // Skip blocks marked with <!-- validator-ignore --> (skips both syntax & exec)
        if (block.ignored) continue

        // Check if it's a genuine SQL code block (not mixed with Shell commands)
        if (!isPureSqlBlock(block.content)) continue

        // Detect format type
        const formatType = detectSqlFormat(block.content)

        // Common per-block flags propagated to every emitted sqlBlock. `executionIgnored`
        // comes from <!-- validator-ignore-exec --> and means: keep this block in the
        // syntax checker, but skip it in the execution checker (useful for examples that
        // depend on specific data/engine state but are syntactically valid).
        const commonFlags = {
            executionIgnored: !!block.executionIgnored
        }

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
                    format: 'mysql-inline',
                    ...commonFlags
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
                    format: 'separated',
                    ...commonFlags
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
                    format: 'pure-sql',
                    ...commonFlags
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
                format: 'pure-sql',
                ...commonFlags
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

            // Check for validator-ignore / validator-ignore-exec comments on the same
            // line or previous line. `ignored` skips syntax + execution; `executionIgnored`
            // skips execution only and keeps the block in the syntax checker.
            const ignoreFlags = checkValidatorIgnore(line, lines, i)

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
                ignored: ignoreFlags.ignored,
                executionIgnored: ignoreFlags.executionIgnored
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
 * Check if a code block should be ignored by the validator.
 *
 * Supported directives (HTML comments):
 *  - <!-- validator-ignore -->        Skip BOTH syntax and execution validation.
 *  - <!-- validator-ignore-exec -->   Skip execution validation ONLY; keep the block
 *                                     in syntax validation. Useful when the example is
 *                                     syntactically valid MatrixOne SQL but cannot run
 *                                     in the generic test environment (missing data,
 *                                     external files, feature flags, transaction mode,
 *                                     snapshot/stage/cluster state, etc.).
 *
 * The directive may appear on the line immediately before the ```sql fence, or inline
 * on the fence itself: ```sql <!-- validator-ignore-exec -->
 *
 * @param {string} currentLine - Current line (code block start)
 * @param {Array} lines - All lines
 * @param {number} currentIndex - Current line index
 * @returns {{ignored: boolean, executionIgnored: boolean}}
 */
function checkValidatorIgnore(currentLine, lines, currentIndex) {
    const result = { ignored: false, executionIgnored: false }

    // Same line: ```sql <!-- validator-ignore(-exec)? -->
    if (/<!--\s*validator-ignore-exec\s*-->/.test(currentLine)) {
        result.executionIgnored = true
    }
    if (/<!--\s*validator-ignore\s*-->/.test(currentLine)) {
        result.ignored = true
    }

    // Previous line: <!-- validator-ignore(-exec)? -->
    if (currentIndex > 0) {
        const prevLine = lines[currentIndex - 1].trim()
        if (/^<!--\s*validator-ignore-exec\s*-->$/.test(prevLine)) {
            result.executionIgnored = true
        }
        if (/^<!--\s*validator-ignore\s*-->$/.test(prevLine)) {
            result.ignored = true
        }
    }

    return result
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
    let skipUntilPrompt = false

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
            skipUntilPrompt = false
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
            if (shouldSkipLine(sqlPart.trim())) {
                currentStatement = null
                continue
            }
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
            // Check if this line is a single-line result (no table output follows)
            const isSingleLineResult = /^\d+\s+(row|rows)\s+in\s+set/i.test(trimmed) ||
                                       /^Query\s+OK/i.test(trimmed) ||
                                       /^Empty\s+set/i.test(trimmed)

            if (isSingleLineResult) {
                // Single-line result - collect and immediately end output
                currentOutput.push(line)
                inMultiLineSQL = false
                // Don't set inOutput=true since output is complete
                continue
            }

            // Check if this line starts table output (border or pipe)
            if (/^[+\-]+$/.test(trimmed) ||
                /^\|.*\|$/.test(trimmed) ||
                /^Records:/i.test(trimmed)) {
                // This is table output - start collecting
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

            // Skip ERROR output and client messages (not SQL)
            if (shouldSkipLine(trimmed)) {
                if (/^ERROR\s+\d+/i.test(trimmed)) {
                    skipUntilPrompt = true
                }
                inMultiLineSQL = false
                continue
            }

            // Skip continuation lines after ERROR until next prompt
            if (skipUntilPrompt) {
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
            // Check if this line is a result stats line (marks end of output)
            const isResultStatsLine = /^\d+\s+(row|rows)\s+in\s+set/i.test(trimmed) ||
                                      /^Query\s+OK/i.test(trimmed) ||
                                      /^Empty\s+set/i.test(trimmed)

            currentOutput.push(line)

            // If we hit a result stats line, end output collection
            if (isResultStatsLine) {
                inOutput = false
            }
            continue
        }

        // After output ends, check if this is a new SQL statement (without mysql> prefix)
        if (currentStatement !== null && isQueryWithOutput && !inOutput &&
            /^(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|USE|SET)\s+/i.test(trimmed)) {
            // Save current query with its output
            const fullSql = setupSql.length > 0
                ? setupSql.join('\n') + '\n' + currentStatement.trim()
                : currentStatement.trim()
            statements.push({
                sql: fullSql,
                expectedOutput: currentOutput.length > 0 ? currentOutput.join('\n') : null
            })
            // Reset and start new setup statement
            setupSql = []
            currentOutput = []
            currentStatement = trimmed
            inMultiLineSQL = true
            isQueryWithOutput = false
            continue
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
    // Split by semicolon, but respect BEGIN/END (and IF/LOOP/WHILE/CASE/REPEAT)
    // compound blocks — inner `;` separators inside such blocks must not
    // terminate the outer statement. MatrixOne's parser accepts the whole
    // compound as a single statement (e.g. CREATE TASK ... AS BEGIN ...; END).
    const statements = []
    const lines = sql.split('\n')
    let currentStatement = ''
    let blockDepth = 0

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
            if (sqlPart && !shouldSkipLine(sqlPart.trim())) {
                currentStatement += sqlPart + '\n'
                blockDepth = updateBlockDepth(sqlPart, blockDepth)
            }
            continue
        }

        // Skip output results (tables, query results, etc.)
        if (shouldSkipLine(trimmedLine)) {
            continue
        }

        currentStatement += line + '\n'
        blockDepth = updateBlockDepth(line, blockDepth)

        // Consider a statement complete if line ends with semicolon and we
        // are not inside a BEGIN/END (or IF/LOOP/...) compound block.
        if (trimmedLine.endsWith(';') && blockDepth === 0) {
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
 * Split SQL text into statements with their preceding annotations
 * Each statement includes the Expected-* annotations that apply to it
 * @param {string} sql - SQL text
 * @returns {Array<{sql: string, annotations: string[]}>} Array of statements with annotations
 */
export function splitSqlStatementsWithAnnotations(sql) {
    const results = []
    const lines = sql.split('\n')
    let currentStatement = ''
    let currentAnnotations = []
    let blockDepth = 0

    for (const rawLine of lines) {
        // Strip trailing inline comments (-- ..., # ..., // ...) outside string literals.
        // MatrixOne's parser can hit "parse hints bug" when statements end with a trailing
        // comment on the same line (e.g., `SELECT 1; -- foo`). Stripping them here keeps the
        // documented SQL executable without dropping standalone annotation comments, which
        // are already handled below before reaching this point.
        const line = stripTrailingInlineComment(rawLine)
        const trimmedLine = line.trim()

        // Skip empty lines
        if (!trimmedLine) {
            continue
        }

        // Collect annotation comments (-- Expected-*, -- @validator-mode, etc.)
        if (trimmedLine.startsWith('--') || trimmedLine.startsWith('#')) {
            // Check if this is an Expected-* or @validator-* annotation
            if (/--\s*(Expected-|@validator-)/i.test(trimmedLine)) {
                currentAnnotations.push(trimmedLine)
            }
            continue
        }

        // Skip lines starting with MySQL command line prompt
        if (trimmedLine.startsWith('mysql>') || trimmedLine.startsWith('>')) {
            const sqlPart = trimmedLine.replace(/^(mysql>|>)\s*/, '')
            if (sqlPart && !shouldSkipLine(sqlPart.trim())) {
                currentStatement += sqlPart + '\n'
                blockDepth = updateBlockDepth(sqlPart, blockDepth)
            }
            continue
        }

        // Skip output results (tables, query results, etc.)
        if (shouldSkipLine(trimmedLine)) {
            continue
        }

        currentStatement += line + '\n'
        blockDepth = updateBlockDepth(line, blockDepth)

        // Consider a statement complete if line ends with semicolon and we
        // are not inside a BEGIN/END (or IF/LOOP/...) compound block.
        if (trimmedLine.endsWith(';') && blockDepth === 0) {
            if (currentStatement.trim()) {
                results.push({
                    sql: currentStatement.trim(),
                    annotations: [...currentAnnotations]
                })
            }
            currentStatement = ''
            currentAnnotations = []  // Reset annotations for next statement
        }
    }

    // Add the last statement (if not ending with semicolon)
    if (currentStatement.trim()) {
        results.push({
            sql: currentStatement.trim(),
            annotations: [...currentAnnotations]
        })
    }

    return results
}

/**
 * Parse annotations to extract expected results for a single statement
 * @param {string[]} annotations - Array of annotation comment lines
 * @returns {object} Expected results object
 */
export function parseAnnotationsToExpectedResults(annotations) {
    const result = {
        validationMode: null,
        expectedResults: {}
    }

    for (const line of annotations) {
        const trimmed = line.trim()

        // Extract validation mode
        const modeMatch = trimmed.match(/--\s*@validator-mode:\s*(strict|syntax-only)/i)
        if (modeMatch) {
            result.validationMode = modeMatch[1].toLowerCase()
        }

        // Extract Expected-Rows
        const rowsMatch = trimmed.match(/--\s*Expected-Rows:\s*(\d+)/i)
        if (rowsMatch) {
            result.expectedResults.rows = parseInt(rowsMatch[1], 10)
        }

        // Extract Expected-Value
        const valueMatch = trimmed.match(/--\s*Expected-Value:\s*(.+)/i)
        if (valueMatch) {
            const value = valueMatch[1].trim()
            result.expectedResults.value = value === 'NULL' ? null : value
        }

        // Extract Expected-Values
        const valuesMatch = trimmed.match(/--\s*Expected-Values:\s*(.+)/i)
        if (valuesMatch) {
            result.expectedResults.values = valuesMatch[1].split(',').map(v => v.trim())
        }

        // Extract Expected-Contains
        const containsMatch = trimmed.match(/--\s*Expected-Contains:\s*(.+)/i)
        if (containsMatch) {
            result.expectedResults.contains = result.expectedResults.contains || []
            result.expectedResults.contains.push(containsMatch[1].trim())
        }

        // Extract Expected-AffectedRows
        const affectedMatch = trimmed.match(/--\s*Expected-AffectedRows:\s*(\d+)/i)
        if (affectedMatch) {
            result.expectedResults.affectedRows = parseInt(affectedMatch[1], 10)
        }

        // Extract Expected-Precision
        const precisionMatch = trimmed.match(/--\s*Expected-Precision:\s*([\d.]+)/i)
        if (precisionMatch) {
            result.expectedResults.precision = parseFloat(precisionMatch[1])
        }

        // Extract Expected-Success
        const successMatch = trimmed.match(/--\s*Expected-Success:\s*(true|false)/i)
        if (successMatch) {
            result.expectedResults.success = successMatch[1].toLowerCase() === 'true'
        }
    }

    return result
}

/**
 * Determine if a line should be skipped (non-SQL statement)
 * Strip a trailing inline comment (`-- …`, `# …`, `// …`) from a single SQL line
 * while preserving occurrences inside string literals. Used before appending a
 * line to the current statement, to work around MatrixOne's "parse hints bug"
 * when a statement ends with a trailing inline comment on the same line.
 *
 * If the entire line is a comment (only whitespace before the marker), the line
 * is returned unchanged so the caller's annotation/comment handling still sees it.
 * @param {string} line - Raw line content
 * @returns {string} Line with trailing comment removed (trailing whitespace trimmed)
 */
function stripTrailingInlineComment(line) {
    if (!line) return line

    let inSingle = false
    let inDouble = false
    let inBacktick = false

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        const next = line[i + 1]
        const prev = i > 0 ? line[i - 1] : ''

        if (!inDouble && !inBacktick && ch === "'" && prev !== '\\') {
            inSingle = !inSingle
            continue
        }
        if (!inSingle && !inBacktick && ch === '"' && prev !== '\\') {
            inDouble = !inDouble
            continue
        }
        if (!inSingle && !inDouble && ch === '`') {
            inBacktick = !inBacktick
            continue
        }
        if (inSingle || inDouble || inBacktick) continue

        const isLineCommentStart =
            (ch === '-' && next === '-') ||
            (ch === '#') ||
            (ch === '/' && next === '/')

        if (!isLineCommentStart) continue

        const before = line.slice(0, i)
        if (!before.trim()) return line

        return before.replace(/\s+$/, '')
    }

    return line
}

/**
 * Track BEGIN/END compound-statement nesting across lines so that callers can
 * defer statement termination until the outer block closes. Mirrors the MySQL
 * dialect grammar in MatrixOne:
 *   - `BEGIN` opens a compound block (SPBEGIN in the scanner), except in the
 *     transaction forms `BEGIN WORK`, `BEGIN TRANSACTION`, or a bare `BEGIN;`.
 *   - `END` closes a compound block, except when followed by a block qualifier
 *     (`END IF`, `END LOOP`, `END WHILE`, `END CASE`, `END REPEAT`) that closes
 *     a different construct which never opened via BEGIN to begin with.
 *   - `IF/LOOP/WHILE/CASE/REPEAT` themselves also open blocks whose only
 *     terminator is `END <keyword>`, so count them symmetrically.
 * String and comment contents are ignored.
 *
 * @param {string} line - One raw line of SQL.
 * @param {number} depth - Current block depth entering the line.
 * @returns {number} Updated block depth after processing the line.
 */
function updateBlockDepth(line, depth) {
    let i = 0
    let inSingle = false
    let inDouble = false
    let inBacktick = false
    let newDepth = depth
    const len = line.length
    const isWord = c => /[A-Za-z0-9_]/.test(c)
    const atWordStart = pos => pos === 0 || !isWord(line[pos - 1])

    while (i < len) {
        const ch = line[i]
        const prev = i > 0 ? line[i - 1] : ''

        if (!inDouble && !inBacktick && ch === "'" && prev !== '\\') {
            inSingle = !inSingle
            i++
            continue
        }
        if (!inSingle && !inBacktick && ch === '"' && prev !== '\\') {
            inDouble = !inDouble
            i++
            continue
        }
        if (!inSingle && !inDouble && ch === '`') {
            inBacktick = !inBacktick
            i++
            continue
        }
        if (inSingle || inDouble || inBacktick) {
            i++
            continue
        }

        // Line-comment markers end the scan (trailing comments were already
        // stripped upstream, but be defensive for direct callers).
        if (ch === '-' && line[i + 1] === '-') break
        if (ch === '#') break
        if (ch === '/' && line[i + 1] === '/') break
        if (ch === '/' && line[i + 1] === '*') {
            const end = line.indexOf('*/', i + 2)
            if (end < 0) break
            i = end + 2
            continue
        }

        if (isWord(ch) && atWordStart(i)) {
            let j = i
            while (j < len && isWord(line[j])) j++
            const word = line.slice(i, j).toUpperCase()

            if (word === 'BEGIN') {
                // MatrixOne's scanner emits the transactional BEGIN (not
                // SPBEGIN) only for `BEGIN WORK`, `BEGIN TRANSACTION`, or a
                // bare `BEGIN;`. If `BEGIN` sits at end-of-line we can't
                // decide from this line alone, but docs realistically write
                // the txn form on a single line — prefer the compound
                // interpretation in that ambiguous case so `AS BEGIN\n...\nEND`
                // is handled correctly. Only the clear single-line `BEGIN;`
                // shape is treated as the transactional form.
                let k = j
                while (k < len && /\s/.test(line[k])) k++
                const rest = line.slice(k).toUpperCase()
                const isTxn =
                    /^WORK\b/.test(rest) ||
                    /^TRANSACTION\b/.test(rest) ||
                    (k < len && line[k] === ';')
                if (!isTxn) {
                    newDepth++
                }
            } else if (word === 'END') {
                // `END IF/LOOP/WHILE/CASE/REPEAT` closes one of those blocks,
                // not a BEGIN block — but since we also increment depth for
                // those openers below, a single decrement here still balances.
                newDepth = Math.max(0, newDepth - 1)
            } else if (
                word === 'IF' ||
                word === 'LOOP' ||
                word === 'WHILE' ||
                word === 'CASE' ||
                word === 'REPEAT'
            ) {
                // Only count these as openers when they introduce a compound
                // block, not when used as expressions (`CASE WHEN ... END` as
                // a value, `IF(a,b,c)` function call, `WHERE x = CASE ...`).
                // Heuristic: treat as opener only if the token is at the
                // start of a trimmed line or preceded solely by whitespace +
                // label `ident:`. Expression uses stay inline within a
                // larger statement on the same physical line.
                const before = line.slice(0, i)
                const beforeTrim = before.replace(/\s+$/, '')
                const isAtLineStart =
                    beforeTrim === '' || /[A-Za-z0-9_]+:\s*$/.test(beforeTrim)
                // Function-call form IF(...) is never a block opener.
                const nextNonSpace = line.slice(j).match(/^\s*(.)/)
                const isFuncCall = word === 'IF' && nextNonSpace && nextNonSpace[1] === '('
                if (isAtLineStart && !isFuncCall) {
                    newDepth++
                }
            }

            i = j
            continue
        }

        i++
    }

    return newDepth
}

/**
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

    // Skip query result statistics (e.g., "1 row in set", "Empty set")
    if (/^\d+\s+(row|rows)\s+in\s+set/i.test(line)) {
        return true
    }
    if (/^Empty\s+set/i.test(line)) {
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

    // Skip MySQL error output (e.g., "ERROR 1105 (HY000): ...")
    if (/^ERROR\s+\d+/i.test(line)) {
        return true
    }

    // Skip MySQL client informational messages
    if (/^(Reading table information|You can turn off this feature|Database changed|No connection|Trying to reconnect|Connection id:)/i.test(line)) {
        return true
    }

    // Skip MySQL client exit command
    if (/^exit\s*;?\s*$/i.test(line)) {
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