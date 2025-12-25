/**
 * Image Resolver
 * Determines which Docker image to use based on branch name
 *
 * Logic:
 * 1. Extract version from branch name (e.g., "3.0.4" from "3.0.4-docs")
 * 2. If version found, try release image first, fallback to nightly
 * 3. If no version found, use nightly directly
 */

import { execSync } from 'node:child_process'

// Image registry configurations
export const DOCKER_HUB_PREFIX = 'matrixorigin/matrixone'

/**
 * Extract version number from branch name
 * Examples:
 *   "3.0.4-docs" -> "3.0.4"
 *   "3.0.4" -> "3.0.4"
 *   "v3.0.4-docs" -> "3.0.4"
 *   "main" -> null
 *   "feature/xxx" -> null
 *
 * @param {string} branch - Branch name
 * @returns {string|null} Version number or null
 */
export function extractVersionFromBranch(branch) {
    if (!branch) return null

    // Match patterns like: 3.0.4, v3.0.4, 3.0.4-docs, v3.0.4-docs, 3.0.4-xxx
    const match = branch.match(/^v?(\d+\.\d+\.\d+)/)
    return match ? match[1] : null
}

/**
 * Check if a Docker image exists
 * @param {string} image - Full image name with tag
 * @returns {Promise<boolean>} True if image exists
 */
export async function imageExists(image) {
    try {
        execSync(`docker manifest inspect ${image}`, {
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 30000
        })
        return true
    } catch {
        return false
    }
}

/**
 * Resolve Docker image based on branch name
 *
 * @param {string} branch - Branch name
 * @param {Object} [options] - Options
 * @param {boolean} [options.verbose=false] - Show detailed progress
 * @returns {Promise<{image: string, source: 'release' | 'nightly', version: string|null}>}
 */
export async function resolveImage(branch, options = {}) {
    const { verbose = false } = options

    const version = extractVersionFromBranch(branch)

    if (verbose) {
        console.log(`   Branch: ${branch}`)
        console.log(`   Detected version: ${version || '(none)'}`)
    }

    // If version found, try release image first
    if (version) {
        const releaseImage = `${DOCKER_HUB_PREFIX}:${version}`

        if (verbose) {
            process.stdout.write(`   Checking release image ${releaseImage}... `)
        }

        const releaseExists = await imageExists(releaseImage)

        if (releaseExists) {
            if (verbose) {
                console.log('✓ found')
            }
            return {
                image: releaseImage,
                source: 'release',
                version
            }
        }

        if (verbose) {
            console.log('✗ not found, falling back to nightly')
        }
    }

    // Use nightly image
    const nightlyImage = `${DOCKER_HUB_PREFIX}:nightly-commitnewdeal`

    if (verbose) {
        console.log(`   Using nightly image: ${nightlyImage}`)
    }

    return {
        image: nightlyImage,
        source: 'nightly',
        version
    }
}

/**
 * Check if Docker is available and running
 * @returns {Promise<boolean>}
 */
export async function isDockerAvailable() {
    try {
        execSync('docker info', {
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 10000
        })
        return true
    } catch {
        return false
    }
}

export default {
    extractVersionFromBranch,
    imageExists,
    resolveImage,
    isDockerAvailable,
    DOCKER_HUB_PREFIX
}
