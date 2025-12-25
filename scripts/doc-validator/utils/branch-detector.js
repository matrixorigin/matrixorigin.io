/**
 * Branch Detector
 * Detects the target branch for multi-version testing
 */

import { execSync } from 'node:child_process'

/**
 * Get the target branch for testing
 * Priority: command line option > CI environment variable (source branch) > local git branch
 *
 * For CI PR scenarios, we use the SOURCE branch (GITHUB_HEAD_REF), not the target branch.
 * This ensures that a PR for "3.0.2-docs" branch tests against MO's "3.0.2-docs" branch,
 * not the PR's target branch (e.g., "main").
 *
 * @param {Object} options - Options object
 * @param {string} [options.branch] - Explicitly specified branch name
 * @returns {string} Target branch name
 */
export function getTargetBranch(options = {}) {
    // Priority 1: Command line parameter
    if (options.branch) {
        return options.branch
    }

    // Priority 2: CI environment variables
    // GitHub Actions PR: use GITHUB_HEAD_REF (source branch of the PR)
    // This is the branch that contains the changes, e.g., "3.0.2-docs"
    if (process.env.GITHUB_HEAD_REF) {
        return process.env.GITHUB_HEAD_REF
    }

    // For push events, extract branch from GITHUB_REF
    if (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/')) {
        return process.env.GITHUB_REF.replace('refs/heads/', '')
    }

    if (process.env.GITHUB_REF_NAME) {
        return process.env.GITHUB_REF_NAME
    }

    // Priority 3: Local git branch
    return getLocalBranch()
}

/**
 * Get current local git branch name
 * @returns {string} Current branch name or 'main' as fallback
 */
export function getLocalBranch() {
    try {
        const branch = execSync('git branch --show-current', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim()

        if (branch) {
            return branch
        }

        // Fallback: try rev-parse for detached HEAD
        const ref = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim()

        return ref !== 'HEAD' ? ref : 'main'
    } catch (error) {
        console.warn('Warning: Could not detect git branch, using "main" as default')
        return 'main'
    }
}

/**
 * Check if running in CI environment
 * @returns {boolean} True if running in CI
 */
export function isCI() {
    return !!(
        process.env.CI ||
        process.env.GITHUB_ACTIONS ||
        process.env.GITLAB_CI ||
        process.env.JENKINS_URL ||
        process.env.TRAVIS
    )
}

/**
 * Get CI environment information
 * @returns {Object} CI environment details
 */
export function getCIInfo() {
    if (process.env.GITHUB_ACTIONS) {
        return {
            provider: 'github',
            event: process.env.GITHUB_EVENT_NAME,
            ref: process.env.GITHUB_REF,
            baseRef: process.env.GITHUB_BASE_REF,
            headRef: process.env.GITHUB_HEAD_REF,
            repository: process.env.GITHUB_REPOSITORY,
            runId: process.env.GITHUB_RUN_ID
        }
    }

    return {
        provider: 'unknown',
        isCI: isCI()
    }
}

export default {
    getTargetBranch,
    getLocalBranch,
    isCI,
    getCIInfo
}
