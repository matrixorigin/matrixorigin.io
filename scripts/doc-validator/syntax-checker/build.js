#!/usr/bin/env node
/**
 * Build script for syntax-checker
 * Checks for Go environment and compiles the syntax checker if available
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const STATUS_FILE = join(__dirname, '.build-status.json')

function checkGoEnvironment() {
    try {
        const version = execSync('go version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
        return { available: true, version: version.trim() }
    } catch {
        return { available: false, version: null }
    }
}

function buildSyntaxChecker() {
    try {
        console.log('🔨 Building syntax-checker...')
        execSync('go build -o syntax-checker .', {
            cwd: __dirname,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        })
        return { success: true, error: null }
    } catch (err) {
        return { success: false, error: err.message }
    }
}

function main() {
    console.log('📦 Syntax Checker Build Script')
    console.log('================================')

    // Check Go environment
    const goEnv = checkGoEnvironment()

    if (!goEnv.available) {
        console.log('⚠️  Go environment not found')
        console.log('   Will use fallback mode (node-sql-parser + whitelist)')
        console.log('')

        writeFileSync(STATUS_FILE, JSON.stringify({
            mode: 'fallback',
            reason: 'Go environment not available',
            timestamp: new Date().toISOString()
        }, null, 2))

        return
    }

    console.log(`✅ Go environment found: ${goEnv.version}`)

    // Build syntax checker
    const buildResult = buildSyntaxChecker()

    if (!buildResult.success) {
        console.log('⚠️  Build failed:', buildResult.error)
        console.log('   Will use fallback mode (node-sql-parser + whitelist)')
        console.log('')

        writeFileSync(STATUS_FILE, JSON.stringify({
            mode: 'fallback',
            reason: `Build failed: ${buildResult.error}`,
            goVersion: goEnv.version,
            timestamp: new Date().toISOString()
        }, null, 2))

        return
    }

    // Verify binary exists
    const binaryPath = join(__dirname, 'syntax-checker')
    if (!existsSync(binaryPath)) {
        console.log('⚠️  Binary not found after build')
        console.log('   Will use fallback mode (node-sql-parser + whitelist)')

        writeFileSync(STATUS_FILE, JSON.stringify({
            mode: 'fallback',
            reason: 'Binary not found after build',
            goVersion: goEnv.version,
            timestamp: new Date().toISOString()
        }, null, 2))

        return
    }

    console.log('✅ Build successful!')
    console.log('   Will use MatrixOne official parser for syntax checking')
    console.log('')

    writeFileSync(STATUS_FILE, JSON.stringify({
        mode: 'native',
        goVersion: goEnv.version,
        binaryPath: binaryPath,
        timestamp: new Date().toISOString()
    }, null, 2))
}

main()
