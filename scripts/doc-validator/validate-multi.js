#!/usr/bin/env node

/**
 * SQL Execution Test Runner
 *
 * Automatically tests documentation against MatrixOne by:
 * 1. Detecting target branch and extracting version number
 * 2. Using release image if version found, otherwise nightly
 * 3. Running SQL execution tests against the container
 */

import { execSync } from 'node:child_process'
import { Command } from 'commander'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getTargetBranch, isCI, getCIInfo } from './utils/branch-detector.js'
import { resolveImage, isDockerAvailable } from './utils/image-resolver.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')

/**
 * Main entry point
 */
async function main() {
    const program = new Command()

    program
        .name('validate-multi')
        .description('SQL execution test for MatrixOne documentation')
        .version('2.0.0')
        .argument('[files...]', 'File paths to check (optional)')
        .option('-b, --branch <name>', 'Target branch name (default: auto-detect)')
        .option('-c, --changed-only', 'Only check changed files', false)
        .option('--verbose', 'Show detailed information', false)
        .option('--dry-run', 'Show what would be done without executing', false)
        .parse(process.argv)

    const options = program.opts()
    const specifiedFiles = program.args

    console.log('============================================================')
    console.log('🚀 SQL Execution Test')
    console.log('============================================================')

    // Check Docker availability
    if (!options.dryRun) {
        const dockerAvailable = await isDockerAvailable()
        if (!dockerAvailable) {
            console.error('❌ Docker is not available or not running')
            console.error('   Please start Docker and try again')
            process.exit(1)
        }
        console.log('✓ Docker is available')
    }

    // Step 1: Detect target branch
    console.log('\n📌 Step 1: Detecting target branch...')
    const targetBranch = getTargetBranch({ branch: options.branch })
    console.log(`   Target branch: ${targetBranch}`)

    if (isCI()) {
        const ciInfo = getCIInfo()
        console.log(`   CI Environment: ${ciInfo.provider}`)
        if (ciInfo.event) {
            console.log(`   Event: ${ciInfo.event}`)
        }
    }

    // Step 2: Resolve Docker image
    console.log('\n🐳 Step 2: Resolving Docker image...')
    const imageInfo = await resolveImage(targetBranch, { verbose: options.verbose })

    console.log(`   Image: ${imageInfo.image}`)
    console.log(`   Source: ${imageInfo.source}`)
    if (imageInfo.version) {
        console.log(`   Version: ${imageInfo.version}`)
    }

    // Dry run - just show what would be done
    if (options.dryRun) {
        console.log('\n🔍 Dry run mode - showing what would be executed:')
        console.log(`\n   Would test with: ${imageInfo.image}`)
        console.log('   Commands:')
        console.log(`     1. npm run mo:start -- --image ${imageInfo.image}`)
        console.log(`     2. npm run validate-docs-execution -- ${buildValidateArgs(specifiedFiles, options)}`)
        console.log('     3. npm run mo:stop')
        console.log('\n✓ Dry run complete')
        process.exit(0)
    }

    // Step 3: Run test
    console.log('\n🧪 Step 3: Running tests...')
    console.log('------------------------------------------------------------')

    const result = await testWithImage(imageInfo, specifiedFiles, options)

    // Step 4: Generate report
    console.log('\n============================================================')
    console.log('📊 Test Report')
    console.log('============================================================')

    const status = result.success ? '✅' : '❌'
    const statusText = result.success ? 'PASSED' : 'FAILED'
    console.log(`${status} Image: ${imageInfo.image} (${imageInfo.source}): ${statusText}`)

    if (!result.success && result.error) {
        console.log(`   └─ Error: ${result.error.substring(0, 200)}${result.error.length > 200 ? '...' : ''}`)
    }

    console.log('------------------------------------------------------------')

    if (result.success) {
        console.log(`✅ OVERALL: PASSED`)
    } else {
        console.log(`❌ OVERALL: FAILED`)
    }

    console.log(`\nTested with: ${imageInfo.image}`)
    if (imageInfo.version) {
        console.log(`Version: ${imageInfo.version}`)
    }
    console.log('============================================================')

    process.exit(result.success ? 0 : 1)
}

/**
 * Test documentation with a specific Docker image
 * @param {Object} imageInfo - Image information
 * @param {Array} files - Files to test
 * @param {Object} options - Command options
 * @returns {Promise<Object>} Test result
 */
async function testWithImage(imageInfo, files, options) {
    const { image } = imageInfo
    const result = {
        success: false,
        error: null
    }

    try {
        // Start MatrixOne
        console.log(`   Starting MatrixOne with ${image}...`)
        execSync(`npm run mo:start -- --image ${image}`, {
            cwd: PROJECT_ROOT,
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: 300000 // 5 minutes for startup
        })

        // Run validation
        console.log('   Running validation...')

        const validateArgs = buildValidateArgs(files, options)
        execSync(`npm run validate-docs-execution -- ${validateArgs}`, {
            cwd: PROJECT_ROOT,
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: 600000 // 10 minutes for validation
        })

        result.success = true
        console.log('   ✅ Tests passed')

    } catch (error) {
        result.success = false
        result.error = error.message || 'Unknown error'
        console.log(`   ❌ Tests failed: ${result.error.substring(0, 100)}...`)
    } finally {
        // Always stop MatrixOne
        try {
            console.log('   Stopping MatrixOne...')
            execSync('npm run mo:stop', {
                cwd: PROJECT_ROOT,
                stdio: 'pipe',
                timeout: 60000
            })
        } catch (stopError) {
            if (options.verbose) {
                console.log(`   Warning: Failed to stop MatrixOne: ${stopError.message}`)
            }
        }
    }

    return result
}

/**
 * Build arguments for validate-docs-execution command
 * @param {Array} files - Files to test
 * @param {Object} options - Command options
 * @returns {string} Arguments string
 */
function buildValidateArgs(files, options) {
    const args = []

    if (options.changedOnly) {
        args.push('--changed-only')
    }

    if (options.verbose) {
        args.push('--verbose')
    }

    if (files && files.length > 0) {
        args.push(...files)
    }

    return args.join(' ')
}

// Run main program
main().catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
})
