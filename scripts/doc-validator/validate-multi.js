#!/usr/bin/env node

/**
 * Multi-Version SQL Execution Test Orchestrator
 *
 * Automatically tests documentation against multiple MatrixOne versions
 * by detecting the target branch, fetching recent commits, and running
 * tests against available Docker images.
 */

import { execSync, spawn } from 'node:child_process'
import { Command } from 'commander'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getTargetBranch, isCI, getCIInfo } from './utils/branch-detector.js'
import { getRecentCommits, formatCommits } from './utils/commit-fetcher.js'
import { findAvailableImages, isDockerAvailable, formatAvailableImages } from './utils/image-checker.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '../..')

const DEFAULT_MAX_VERSIONS = 5
const DEFAULT_COMMIT_COUNT = 5

/**
 * Main entry point
 */
async function main() {
    const program = new Command()

    program
        .name('validate-multi')
        .description('Multi-version SQL execution test for MatrixOne documentation')
        .version('1.0.0')
        .argument('[files...]', 'File paths to check (optional)')
        .option('-b, --branch <name>', 'Target branch name (default: auto-detect)')
        .option('-c, --changed-only', 'Only check changed files', false)
        .option('-m, --max-versions <n>', 'Maximum versions to test', parseInt, DEFAULT_MAX_VERSIONS)
        .option('-n, --commit-count <n>', 'Number of commits to fetch', parseInt, DEFAULT_COMMIT_COUNT)
        .option('--stop-on-success', 'Stop testing after first successful version', false)
        .option('--verbose', 'Show detailed information', false)
        .option('--dry-run', 'Show what would be done without executing', false)
        .parse(process.argv)

    const options = program.opts()
    const specifiedFiles = program.args

    console.log('============================================================')
    console.log('🚀 Multi-Version SQL Execution Test')
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

    // Step 2: Fetch recent commits
    console.log(`\n📋 Step 2: Fetching recent commits from matrixorigin/matrixone...`)
    let commits
    try {
        commits = await getRecentCommits(targetBranch, options.commitCount)
        console.log(`   Found ${commits.length} commits:`)
        console.log(formatCommits(commits))
    } catch (error) {
        console.error(`❌ Failed to fetch commits: ${error.message}`)
        if (error.message.includes('rate limit')) {
            console.error('   Tip: Set GITHUB_TOKEN environment variable to increase rate limit')
        }
        process.exit(1)
    }

    // Step 3: Check image availability
    console.log(`\n🐳 Step 3: Checking Docker image availability...`)
    const availableImages = await findAvailableImages(commits, { verbose: options.verbose })

    if (availableImages.length === 0) {
        console.error('❌ No available Docker images found for any commit')
        console.error('   This may happen if:')
        console.error('   - The commits are too recent and images haven\'t been built yet')
        console.error('   - The images have been cleaned up (TCR keeps ~100 recent images)')
        process.exit(1)
    }

    console.log(`   Found ${availableImages.length} available image(s):`)
    console.log(formatAvailableImages(availableImages))

    // Limit to max versions
    const imagesToTest = availableImages.slice(0, options.maxVersions)
    if (imagesToTest.length < availableImages.length) {
        console.log(`\n   (Limited to ${options.maxVersions} versions)`)
    }

    // Dry run - just show what would be done
    if (options.dryRun) {
        console.log('\n🔍 Dry run mode - showing what would be executed:')
        for (const imageInfo of imagesToTest) {
            console.log(`\n   Would test with: ${imageInfo.image}`)
            console.log(`   Commands:`)
            console.log(`     1. npm run mo:start -- --image ${imageInfo.image}`)
            console.log(`     2. npm run validate-docs-execution -- ${buildValidateArgs(specifiedFiles, options)}`)
            console.log(`     3. npm run mo:stop`)
        }
        console.log('\n✓ Dry run complete')
        process.exit(0)
    }

    // Step 4: Run tests for each version
    console.log('\n🧪 Step 4: Running tests...')
    console.log('------------------------------------------------------------')

    const results = []

    for (let i = 0; i < imagesToTest.length; i++) {
        const imageInfo = imagesToTest[i]
        console.log(`\n[${i + 1}/${imagesToTest.length}] Testing commit-${imageInfo.commitSha}`)
        console.log(`    Image: ${imageInfo.image}`)
        console.log(`    Message: ${imageInfo.commit.message}`)

        const result = await testWithImage(imageInfo, specifiedFiles, options)
        results.push(result)

        if (result.success) {
            console.log(`    ✅ PASSED`)
            if (options.stopOnSuccess) {
                console.log(`    (Stopping early due to --stop-on-success)`)
                break
            }
        } else {
            console.log(`    ❌ FAILED`)
            if (options.verbose && result.error) {
                console.log(`    Error: ${result.error}`)
            }
        }
    }

    // Step 5: Generate report
    console.log('\n============================================================')
    console.log('📊 Multi-Version Test Report')
    console.log('============================================================')

    const passedCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    for (const result of results) {
        const status = result.success ? '✅' : '❌'
        const statusText = result.success ? 'PASSED' : 'FAILED'
        console.log(`${status} commit-${result.commitSha} (${result.source}): ${statusText}`)
        if (!result.success && result.error) {
            console.log(`   └─ Error: ${result.error.substring(0, 100)}${result.error.length > 100 ? '...' : ''}`)
        }
    }

    console.log('------------------------------------------------------------')

    // Determine overall result
    const overallSuccess = passedCount > 0

    if (overallSuccess) {
        console.log(`✅ OVERALL: PASSED (${passedCount}/${results.length} versions succeeded)`)
    } else {
        console.log(`❌ OVERALL: FAILED (0/${results.length} versions succeeded)`)
    }

    console.log('\nTested versions:')
    for (const result of results) {
        const date = new Date(result.commit.date).toLocaleDateString()
        console.log(`  - commit-${result.commitSha}: ${date} ${result.commit.message}`)
    }

    console.log('============================================================')

    process.exit(overallSuccess ? 0 : 1)
}

/**
 * Test documentation with a specific Docker image
 * @param {Object} imageInfo - Image information
 * @param {Array} files - Files to test
 * @param {Object} options - Command options
 * @returns {Promise<Object>} Test result
 */
async function testWithImage(imageInfo, files, options) {
    const { image, commitSha, source, commit } = imageInfo
    const result = {
        commitSha,
        source,
        commit,
        success: false,
        error: null
    }

    try {
        // Start MatrixOne
        if (options.verbose) {
            console.log(`    Starting MatrixOne...`)
        }
        execSync(`npm run mo:start -- --image ${image}`, {
            cwd: PROJECT_ROOT,
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: 300000 // 5 minutes for startup
        })

        // Run validation
        if (options.verbose) {
            console.log(`    Running validation...`)
        }

        const validateArgs = buildValidateArgs(files, options)
        execSync(`npm run validate-docs-execution -- ${validateArgs}`, {
            cwd: PROJECT_ROOT,
            stdio: options.verbose ? 'inherit' : 'pipe',
            timeout: 600000 // 10 minutes for validation
        })

        result.success = true

    } catch (error) {
        result.success = false
        result.error = error.message || 'Unknown error'
    } finally {
        // Always stop MatrixOne
        try {
            if (options.verbose) {
                console.log(`    Stopping MatrixOne...`)
            }
            execSync('npm run mo:stop', {
                cwd: PROJECT_ROOT,
                stdio: 'pipe',
                timeout: 60000
            })
        } catch (stopError) {
            // Ignore stop errors
            if (options.verbose) {
                console.log(`    Warning: Failed to stop MatrixOne: ${stopError.message}`)
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
