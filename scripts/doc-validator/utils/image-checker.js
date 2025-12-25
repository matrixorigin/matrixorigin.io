/**
 * Image Checker
 * Checks Docker image availability on Docker Hub and Tencent Cloud TCR
 */

import { execSync } from 'node:child_process'

// Image registry configurations
export const DOCKER_HUB_IMAGE_PREFIX = 'matrixorigin/matrixone'
export const TCR_IMAGE_PREFIX = 'ccr.ccs.tencentyun.com/matrixone-dev/matrixone'

/**
 * Check if a Docker image exists
 * @param {string} image - Full image name with tag
 * @returns {Promise<boolean>} True if image exists
 */
export async function imageExists(image) {
    try {
        // Use docker manifest inspect to check image existence
        // This doesn't pull the image, just checks if it exists
        execSync(`docker manifest inspect ${image}`, {
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 30000 // 30 second timeout
        })
        return true
    } catch (error) {
        // Image doesn't exist or other error
        return false
    }
}

/**
 * Build image name for a commit
 * @param {string} sha - Short commit SHA (7 chars)
 * @param {'dockerhub' | 'tcr'} source - Image source
 * @returns {string} Full image name
 */
export function buildImageName(sha, source) {
    const prefix = source === 'tcr' ? TCR_IMAGE_PREFIX : DOCKER_HUB_IMAGE_PREFIX
    return `${prefix}:commit-${sha}`
}

/**
 * Find available images for a list of commits
 * Checks Docker Hub first, then falls back to TCR
 *
 * @param {Array<{sha: string, fullSha: string, message: string, date: string}>} commits
 * @param {Object} [options]
 * @param {boolean} [options.verbose=false] - Show detailed progress
 * @param {Function} [options.onProgress] - Progress callback (current, total, image, exists)
 * @returns {Promise<Array<{commitSha: string, image: string, source: string, commit: Object}>>}
 */
export async function findAvailableImages(commits, options = {}) {
    const { verbose = false, onProgress } = options
    const availableImages = []
    const total = commits.length

    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i]
        const sha = commit.sha

        // Check Docker Hub first
        const dockerHubImage = buildImageName(sha, 'dockerhub')
        if (verbose) {
            process.stdout.write(`  Checking ${dockerHubImage}... `)
        }

        const dockerHubExists = await imageExists(dockerHubImage)
        onProgress?.(i + 1, total * 2, dockerHubImage, dockerHubExists)

        if (dockerHubExists) {
            if (verbose) {
                console.log('✓ found')
            }
            availableImages.push({
                commitSha: sha,
                fullSha: commit.fullSha,
                image: dockerHubImage,
                source: 'dockerhub',
                commit
            })
            continue
        }

        if (verbose) {
            console.log('✗ not found')
        }

        // Fallback to TCR
        const tcrImage = buildImageName(sha, 'tcr')
        if (verbose) {
            process.stdout.write(`  Checking ${tcrImage}... `)
        }

        const tcrExists = await imageExists(tcrImage)
        onProgress?.(i + 1, total * 2 + 1, tcrImage, tcrExists)

        if (tcrExists) {
            if (verbose) {
                console.log('✓ found')
            }
            availableImages.push({
                commitSha: sha,
                fullSha: commit.fullSha,
                image: tcrImage,
                source: 'tcr',
                commit
            })
        } else if (verbose) {
            console.log('✗ not found')
        }
    }

    return availableImages
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
    } catch (error) {
        return false
    }
}

/**
 * Format available images for display
 * @param {Array} images - Array of image info objects
 * @returns {string} Formatted string
 */
export function formatAvailableImages(images) {
    if (images.length === 0) {
        return '  No available images found'
    }

    return images.map((img, i) =>
        `  ${i + 1}. commit-${img.commitSha} (${img.source})\n` +
        `     Image: ${img.image}\n` +
        `     Date: ${new Date(img.commit.date).toLocaleDateString()}\n` +
        `     Message: ${img.commit.message}`
    ).join('\n\n')
}

export default {
    imageExists,
    buildImageName,
    findAvailableImages,
    isDockerAvailable,
    formatAvailableImages,
    DOCKER_HUB_IMAGE_PREFIX,
    TCR_IMAGE_PREFIX
}
