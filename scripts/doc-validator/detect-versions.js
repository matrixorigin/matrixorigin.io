#!/usr/bin/env node

/**
 * Version Detection Script
 *
 * Scans markdown files and detects required MatrixOne versions
 * Used by CI to determine which database versions to test against
 *
 * Output format:
 * {
 *   "versions": ["latest", "v1.2.0"],
 *   "filesByVersion": {
 *     "latest": ["file1.md", "file2.md"],
 *     "v1.2.0": ["file3.md"]
 *   }
 * }
 */

import { readFileSync } from 'node:fs'
import { Command } from 'commander'
import glob from 'fast-glob'
import { config } from './config.js'
import { getChangedFiles, isGitRepository } from './utils/git.js'

/**
 * Extract version from a markdown file
 * @param {string} filePath - File path
 * @returns {string|null} Version string or null
 */
function extractVersionFromFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')

        // Look for version markers in first 20 lines
        for (let i = 0; i < Math.min(20, lines.length); i++) {
            const line = lines[i]

            // Match version markers:
            // <!-- version: v1.2 -->
            // <!-- mo-version: v1.2 -->
            // **Version**: v1.2
            const versionMatch = line.match(/(?:version|mo-version).*?:\s*(v?[\d.]+)/i)
            if (versionMatch) {
                return versionMatch[1]
            }
        }

        return null
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message)
        return null
    }
}

/**
 * Detect versions from multiple files
 * @param {Array<string>} files - List of file paths
 * @returns {object} Version detection result
 */
function detectVersions(files) {
    const filesByVersion = {}
    const versions = new Set()

    for (const file of files) {
        const version = extractVersionFromFile(file) || 'latest'

        versions.add(version)

        if (!filesByVersion[version]) {
            filesByVersion[version] = []
        }
        filesByVersion[version].push(file)
    }

    return {
        versions: Array.from(versions).sort((a, b) => {
            // Sort: latest first, then by version number descending
            if (a === 'latest') return -1
            if (b === 'latest') return 1
            return b.localeCompare(a)
        }),
        filesByVersion
    }
}

/**
 * Main entry
 */
async function main() {
    const program = new Command()

    program
        .name('detect-versions')
        .description('Detect required MatrixOne versions from documentation')
        .version('1.0.0')
        .argument('[files...]', 'File paths to check (optional)')
        .option('-c, --changed-only', 'Only check changed files', false)
        .option('--json', 'Output as JSON (default)', true)
        .option('--simple', 'Output only version list (space-separated)')
        .parse(process.argv)

    const options = program.opts()
    const specifiedFiles = program.args

    // Determine files to check
    let filesToCheck = []

    if (specifiedFiles.length > 0) {
        // Use specified files
        filesToCheck = specifiedFiles
    } else if (options.changedOnly) {
        if (!isGitRepository()) {
            console.error('Error: Not in a Git repository')
            process.exit(1)
        }
        filesToCheck = getChangedFiles('main')
    } else {
        // Check all docs
        filesToCheck = await glob(config.docsPattern)
    }

    if (filesToCheck.length === 0) {
        // No files to check, default to latest
        if (options.simple) {
            console.log('latest')
        } else {
            console.log(JSON.stringify({
                versions: ['latest'],
                filesByVersion: {
                    latest: []
                }
            }))
        }
        process.exit(0)
    }

    // Detect versions
    const result = detectVersions(filesToCheck)

    // Output result
    if (options.simple) {
        console.log(result.versions.join(' '))
    } else {
        console.log(JSON.stringify(result, null, 2))
    }
}

main().catch(error => {
    console.error('Error:', error.message)
    process.exit(1)
})
