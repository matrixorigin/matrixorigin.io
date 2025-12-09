#!/usr/bin/env node

/**
 * Debug Test Script - Display detailed results for each SQL statement
 */

import { SqlRunner } from './checkers/sql-runner.js'
import { extractSqlFromFile, splitSqlStatements } from './utils/sql-extractor.js'
import { config } from './config.js'

const filePath = 'docs/MatrixOne/Test/context-completion-test.md'

async function main() {
    const sqlRunner = new SqlRunner(config.defaultDbConfig)
    sqlRunner.enable()

    await sqlRunner.connect()

    const sqlBlocks = extractSqlFromFile(filePath)
    const baseName = filePath.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
    const testDb = await sqlRunner.dbManager.createTestDatabase(baseName)

    let testNum = 0

    for (const block of sqlBlocks) {
        const statements = splitSqlStatements(block.sql)

        for (const stmt of statements) {
            if (!stmt.trim()) continue
            if (stmt.trim().startsWith('--')) continue

            testNum++
            const result = await sqlRunner.validateSql(stmt, block.startLine)

            console.log(`\n[${testNum}] Line ${block.startLine}`)
            console.log(`SQL: ${stmt.substring(0, 80)}...`)
            console.log(`Status: ${result.status}`)
            console.log(`Message: ${result.message}`)
            if (result.detail) {
                console.log(`Detail: ${result.detail}`)
            }
        }
    }

    await sqlRunner.dbManager.dropTestDatabase(testDb)
    await sqlRunner.disconnect()
}

main().catch(console.error)