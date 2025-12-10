#!/usr/bin/env node

/**
 * MatrixOne Documentation Validation Tool
 *
 * Features:
 * - SQL syntax checking
 * - SQL execution testing (optional)
 * - Dead link checking (using existing markdown-link-check)
 */

import { Command } from 'commander'
import glob from 'fast-glob'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from './config.js'
import { SqlSyntaxChecker } from './checkers/sql-syntax.js'
import { SqlRunner } from './checkers/sql-runner.js'
import { getChangedFiles, isGitRepository } from './utils/git.js'
import { Reporter } from './utils/reporter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Main entry.
 */
async function main() {
  const program = new Command()
  
  program
    .name('validate-docs')
    .description('MatrixOne Documentation Validation Tool')
    .version('1.0.0')
    .argument('[files...]', 'File paths to check (optional)')
    .option('-c, --changed-only', 'Only check changed files', false)
    .option('-l, --limit <number>', 'Limit the number of files to check (for quick testing)', parseInt)
    .option('--check <type>', 'Check type: syntax|execution|all', 'syntax')
    .option('--db-host <host>', 'Database host', config.defaultDbConfig.host)
    .option('--db-port <port>', 'Database port', config.defaultDbConfig.port)
    .option('--db-user <user>', 'Database user', config.defaultDbConfig.user)
    .option('--db-password <password>', 'Database password', config.defaultDbConfig.password)
    .option('--verbose', 'Show detailed information', false)
    .parse(process.argv)

  const options = program.opts()
  const specifiedFiles = program.args

  // Initialize reporter
  const reporter = new Reporter()

  console.log('🚀 MatrixOne Documentation Validation Tool')
  console.log('='.repeat(60))

  // Determine files to check
  let filesToCheck = []

  if (specifiedFiles.length > 0) {
    // Use files specified from command line
    console.log('📝 Check mode: Specified files')
    filesToCheck = specifiedFiles
    console.log(`📄 Found ${filesToCheck.length} file(s)\n`)
  } else if (options.changedOnly) {
    if (!isGitRepository()) {
      console.error('❌ Error: Not in a Git repository, cannot use --changed-only option')
      process.exit(1)
    }

    console.log('📝 Check mode: Changed files only')
    filesToCheck = getChangedFiles('main')

    if (filesToCheck.length === 0) {
      console.log('✅ No changed Markdown files')
      process.exit(0)
    }

    console.log(`📄 Found ${filesToCheck.length} changed file(s)\n`)
  } else {
    console.log('📝 Check mode: All files')
    filesToCheck = await glob(config.docsPattern)
    console.log(`📄 Found ${filesToCheck.length} file(s)`)
  }

  // Apply limit restriction
  if (options.limit && options.limit > 0) {
    const originalCount = filesToCheck.length
    filesToCheck = filesToCheck.slice(0, options.limit)
    console.log(`⚡ Limiting check: ${filesToCheck.length} file(s) (total: ${originalCount})`)
  }

  console.log()
  reporter.setTotalFiles(filesToCheck.length)

  // Run checks
  console.log('🔍 Starting checks...\n')

  // 1. SQL syntax checking
  if (options.check === 'syntax' || options.check === 'all') {
    console.log('📋 SQL Syntax Check:')
    console.log('-'.repeat(60))

    const syntaxChecker = new SqlSyntaxChecker()

    for (const file of filesToCheck) {
      const result = await syntaxChecker.checkFile(file)

      if (options.verbose) {
        console.log(`   Checking: ${file} (SQL: ${result.sqlCount})`)
      }

      if (result.sqlCount === 0) {
        // No SQL in file, skip reporting
        continue
      }

      // Prepare statistics for syntax check
      const stats = {
        totalStatements: result.totalStatements || 0,
        successes: result.successes || 0
      }

      reporter.addFileResult(file, result.passed, result.errors, stats)
    }

    console.log()
  }

  // 2. SQL execution testing (Phase 4.1 feature)
  if (options.check === 'execution' || options.check === 'all') {
    console.log('🏃 SQL Execution Test:')
    console.log('-'.repeat(60))
    
    const dbConfig = {
      host: options.dbHost,
      port: options.dbPort,
      user: options.dbUser,
      password: options.dbPassword
    }
    
    const sqlRunner = new SqlRunner(dbConfig)
    sqlRunner.enable()
    
    try {
      const connected = await sqlRunner.connect()
      if (!connected) {
        reporter.addWarning('Unable to connect to MatrixOne database, skipping execution tests')
        reporter.addWarning(`Please ensure database is running at ${dbConfig.host}:${dbConfig.port}`)
        console.log()
      } else {
        console.log(`✓ Connected to MatrixOne (${dbConfig.host}:${dbConfig.port})`)
        console.log()

        for (const file of filesToCheck) {
          const result = await sqlRunner.checkFile(file)

          if (options.verbose) {
            console.log(`   Checking: ${file} (SQL: ${result.sqlCount}, Statements: ${result.totalStatements || 0})`)
          }

          if (result.sqlCount === 0) continue

          // Prepare statistics
          const stats = {
            successes: result.successes ? result.successes.length : 0,
            warningDetails: result.warnings || [],  // Pass full warning details (including status)
            totalStatements: result.totalStatements || 0
          }

          // Only pass real errors to reporter, WARNINGs don't affect pass status
          reporter.addFileResult(file, result.passed, result.errors || [], stats)

          if (result.successes && result.successes.length > 0 && options.verbose) {
            console.log(`      ✓ Success: ${result.successes.length}`)
          }
          if (result.warnings && result.warnings.length > 0) {
            console.log(`      ⚠ Warnings: ${result.warnings.length}`)
            // Show detailed WARNINGs
            if (options.verbose) {
              result.warnings.forEach(w => {
                console.log(`         - ${w.message}`)
                // Show WARNING_FAIL details
                if (w.status === 'WARNING_FAIL' && w.detail) {
                  console.log(`           Reason: ${w.detail}`)
                }
                if (w.sql) {
                  console.log(`           SQL: ${w.sql.substring(0, 60)}...`)
                }
              })
            }
          }
        }

        console.log()
      }
    } catch (error) {
      reporter.addWarning(`SQL execution test error: ${error.message}`)
      console.log()
    } finally {
      await sqlRunner.disconnect()
    }
  }

  // Generate report
  const results = reporter.generateReport()

  // Exit
  process.exit(reporter.getExitCode())
}

// Run main program
main().catch(error => {
  console.error('❌ Error occurred:', error)
  process.exit(1)
})

