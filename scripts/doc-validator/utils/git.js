/**
 * Git Utility Functions
 */

import { execSync } from 'node:child_process'

/**
 * Get list of changed files relative to a specified branch
 * @param {string} baseBranch - Base branch name (default 'main')
 * @param {string} pattern - File pattern filter (default '*.md')
 * @returns {Array<string>} List of changed file paths
 */
export function getChangedFiles(baseBranch = 'main', pattern = '*.md') {
    try {
        // Ensure getting the latest remote branch information
        try {
            execSync(`git fetch origin ${baseBranch}`, { stdio: 'pipe' })
        } catch (e) {
            // If fetch fails, continue using local branch
            console.warn(`Warning: Could not fetch origin/${baseBranch}, using local branch`)
        }

        // Get changed files
        const command = `git diff --name-only origin/${baseBranch}...HEAD`
        const output = execSync(command, { encoding: 'utf-8' })

        // Filter files
        const files = output
            .split('\n')
            .filter(file => file.trim())
            .filter(file => file.endsWith('.md'))

        return files
    } catch (error) {
        console.error('Error getting changed files:', error.message)
        return []
    }
}

/**
 * Get current branch name
 * @returns {string} Current branch name
 */
export function getCurrentBranch() {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8'
        }).trim()
        return branch
    } catch (error) {
        console.error('Error getting current branch:', error.message)
        return 'unknown'
    }
}

/**
 * Check if inside a git repository
 * @returns {boolean} Whether inside a git repository
 */
export function isGitRepository() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'pipe' })
        return true
    } catch (error) {
        return false
    }
}

/**
 * Get git diff content of a file
 * @param {string} filePath - File path
 * @param {string} baseBranch - Base branch
 * @returns {string} diff content
 */
export function getFileDiff(filePath, baseBranch = 'main') {
    try {
        const command = `git diff origin/${baseBranch}...HEAD -- ${filePath}`
        const diff = execSync(command, { encoding: 'utf-8' })
        return diff
    } catch (error) {
        console.error(`Error getting diff for ${filePath}:`, error.message)
        return ''
    }
}

export default {
    getChangedFiles,
    getCurrentBranch,
    isGitRepository,
    getFileDiff
}