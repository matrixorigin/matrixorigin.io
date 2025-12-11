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
            console.log(`✅ ${filePath}`)

            // Show statistics
            if (stats.totalStatements) {
                console.log(`   ✅ Success: ${stats.successes || 0} | ❌ Errors: ${errors.length}`)
            }
        } else {
            this.results.failedFiles++
            console.log(`❌ ${filePath}`)

            // Show statistics
            if (stats.totalStatements) {
                console.log(`   ✅ Success: ${stats.successes || 0} | ❌ Errors: ${errors.length}`)
            }

            errors.forEach(error => {
                this.results.errors.push({
                    filePath,
                    ...error
                })

                const location = error.line
                    ? `${filePath}:${error.line}`
                    : filePath

                console.log(`   📌 ${location}`)
                console.log(`      ${error.message}`)
                if (error.sql) {
                    console.log(`      SQL: ${error.sql.substring(0, 100)}${error.sql.length > 100 ? '...' : ''}`)
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
        console.log(`Total files scanned: ${this.results.totalFiles}`)
        console.log(`Files with SQL: ${this.results.checkedFiles}`)

        // Show SQL execution statistics (only for execution validation)
        if (this.isExecutionValidation && this.results.totalStatements > 0) {
            console.log('\n📊 SQL Validation Statistics:')
            console.log(`  ├─ ✅ Passed: ${this.results.successes}`)
            console.log(`  ├─ ❌ Failed: ${this.results.errors.length}`)
            console.log(`  └─ 📈 Total: ${this.results.totalStatements} SQL statements`)
            console.log()
        }

        // Show file pass/fail status
        console.log('📁 File Check Results:')
        console.log(`  ├─ ✅ Passed: ${this.results.passedFiles}`)
        console.log(`  └─ ❌ Failed: ${this.results.failedFiles}`)

        const noSqlFiles = this.results.totalFiles - this.results.checkedFiles
        if (noSqlFiles > 0) {
            console.log(`  └─ 📄 Files without SQL: ${noSqlFiles}`)
        }

        if (this.results.warnings.length > 0) {
            console.log(`⚠️  System Warnings: ${this.results.warnings.length}`)
        }

        console.log(`🕐 Duration: ${duration}s`)
        console.log('='.repeat(60))

        if (this.results.errors.length > 0) {
            console.log(`\nFound ${this.results.errors.length} errors:\n`)

            // Group errors by file
            const errorsByFile = {}
            this.results.errors.forEach(error => {
                if (!errorsByFile[error.filePath]) {
                    errorsByFile[error.filePath] = []
                }
                errorsByFile[error.filePath].push(error)
            })

            // Output errors for each file
            Object.entries(errorsByFile).forEach(([filePath, errors]) => {
                console.log(`📄 ${filePath} (${errors.length} errors)`)
                errors.forEach((error, index) => {
                    const location = error.line ? `:${error.line}` : ''
                    console.log(`   ${index + 1}. ${error.message}`)
                    if (error.sql) {
                        console.log(`      SQL: ${error.sql.substring(0, 80)}...`)
                    }
                })
                console.log()
            })
        }

        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️  ${this.results.warnings.length} warnings:\n`)
            this.results.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`)
            })
            console.log()
        }

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