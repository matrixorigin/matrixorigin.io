/**
 * Reporter - Generate check result reports
 */

/**
 * Reporter Class
 */
export class Reporter {
    constructor() {
        this.results = {
            totalFiles: 0,
            checkedFiles: 0,
            passedFiles: 0,
            failedFiles: 0,
            errors: [],
            warnings: [],
            successes: 0,  // Number of successfully executed/validated SQL statements
            totalStatements: 0  // Total number of SQL statements
        }
        this.startTime = Date.now()
        this.isExecutionValidation = false  // Track if this is execution validation
    }

    /**
     * Add file check result
     * @param {string} filePath - File path
     * @param {boolean} passed - Whether passed the check
     * @param {Array} errors - Error list
     * @param {Object} stats - Statistics {successes, totalStatements}
     */
    addFileResult(filePath, passed, errors = [], stats = {}) {
        this.results.checkedFiles++

        // Accumulate statistics
        if (stats.successes) this.results.successes += stats.successes
        if (stats.totalStatements) this.results.totalStatements += stats.totalStatements
        if (stats.totalStatements) this.isExecutionValidation = true

        if (passed) {
            this.results.passedFiles++
            const stmtCount = stats.totalStatements || 0
            console.log(`✅ ${filePath} (${stmtCount} statements)`)
        } else {
            this.results.failedFiles++
            const passedCount = stats.successes || 0
            const errorCount = errors.length
            console.log(`❌ ${filePath} (${passedCount} passed, ${errorCount} errors)`)

            errors.forEach(error => {
                this.results.errors.push({
                    filePath,
                    ...error
                })

                // Display line number and SQL
                const lineNum = error.line ? `:${error.line}` : ''
                const sql = error.sql
                    ? error.sql.replace(/\n/g, ' ').substring(0, 80) + (error.sql.length > 80 ? '...' : '')
                    : ''
                console.log(`   ${lineNum}  ${sql}`)

                // Display error message on next line with indent
                if (error.message) {
                    const errMsg = error.message.replace(/^SQL syntax error: /, '')
                    console.log(`        ${errMsg}`)
                }
            })
        }
    }

    /**
     * Add warning
     * @param {string} message - Warning message
     */
    addWarning(message) {
        this.results.warnings.push(message)
        console.warn(`⚠️  ${message}`)
    }

    /**
     * Set total number of files
     * @param {number} total - Total number of files
     */
    setTotalFiles(total) {
        this.results.totalFiles = total
    }

    /**
     * Generate final report
     * @returns {object} Report results
     */
    generateReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2)

        console.log('\n' + '='.repeat(60))
        console.log('📊 Documentation Validation Report')
        console.log('='.repeat(60))
        console.log(`Files scanned:  ${this.results.totalFiles}`)
        console.log(`Files with SQL: ${this.results.checkedFiles}`)
        console.log(`  ├─ ✅ Passed: ${this.results.passedFiles}`)
        console.log(`  └─ ❌ Failed: ${this.results.failedFiles}`)

        // Show SQL statement statistics
        if (this.results.totalStatements > 0) {
            console.log()
            console.log(`SQL statements: ${this.results.totalStatements}`)
            console.log(`  ├─ ✅ Passed: ${this.results.successes}`)
            console.log(`  └─ ❌ Failed: ${this.results.errors.length}`)
        }

        if (this.results.warnings.length > 0) {
            console.log()
            console.log(`⚠️  Warnings: ${this.results.warnings.length}`)
            this.results.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`)
            })
        }

        console.log()
        console.log(`🕐 Duration: ${duration}s`)
        console.log('='.repeat(60))

        return this.results
    }

    /**
     * Check if there are any errors
     * @returns {boolean} Whether there are errors
     */
    hasErrors() {
        return this.results.failedFiles > 0
    }

    /**
     * Get exit code
     * @returns {number} Exit code (0 for success, 1 for failure)
     */
    getExitCode() {
        return this.hasErrors() ? 1 : 0
    }
}

export default Reporter