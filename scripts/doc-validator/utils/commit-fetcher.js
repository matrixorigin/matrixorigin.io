/**
 * Commit Fetcher
 * Fetches recent commits from matrixone repository via GitHub API
 */

const GITHUB_API_BASE = 'https://api.github.com'
const MATRIXONE_REPO = 'matrixorigin/matrixone'
const DEFAULT_COMMIT_COUNT = 5
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

/**
 * Fetch recent commits from matrixone repository
 * @param {string} branch - Branch name to fetch commits from
 * @param {number} [count=5] - Number of commits to fetch
 * @param {Object} [options] - Additional options
 * @param {string} [options.token] - GitHub token for authentication (optional, increases rate limit)
 * @returns {Promise<Array<{sha: string, fullSha: string, message: string, date: string}>>}
 */
export async function getRecentCommits(branch, count = DEFAULT_COMMIT_COUNT, options = {}) {
    const url = `${GITHUB_API_BASE}/repos/${MATRIXONE_REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=${count}`

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'matrixorigin-doc-validator'
    }

    // Add auth token if provided (increases rate limit from 60 to 5000 requests/hour)
    const token = options.token || process.env.GITHUB_TOKEN
    if (token) {
        headers['Authorization'] = `token ${token}`
    }

    let lastError = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, { headers })

            if (!response.ok) {
                const errorBody = await response.text()

                if (response.status === 404) {
                    throw new Error(`Branch '${branch}' not found in ${MATRIXONE_REPO}`)
                }

                if (response.status === 403) {
                    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
                    if (rateLimitRemaining === '0') {
                        const resetTime = response.headers.get('X-RateLimit-Reset')
                        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null
                        throw new Error(
                            `GitHub API rate limit exceeded. ` +
                            `Resets at: ${resetDate ? resetDate.toISOString() : 'unknown'}. ` +
                            `Consider setting GITHUB_TOKEN environment variable.`
                        )
                    }
                }

                throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            const commits = await response.json()

            return commits.map(commit => ({
                sha: commit.sha.substring(0, 7),
                fullSha: commit.sha,
                message: commit.commit.message.split('\n')[0], // First line only
                date: commit.commit.committer.date,
                author: commit.commit.author.name
            }))

        } catch (error) {
            lastError = error

            // Don't retry for certain errors
            if (error.message.includes('not found') ||
                error.message.includes('rate limit exceeded')) {
                throw error
            }

            // Retry for network errors
            if (attempt < MAX_RETRIES) {
                console.warn(`Attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`)
                await sleep(RETRY_DELAY_MS * attempt) // Exponential backoff
            }
        }
    }

    throw new Error(`Failed to fetch commits after ${MAX_RETRIES} attempts: ${lastError?.message}`)
}

/**
 * Get rate limit status
 * @param {Object} [options] - Options
 * @param {string} [options.token] - GitHub token
 * @returns {Promise<{limit: number, remaining: number, reset: Date}>}
 */
export async function getRateLimitStatus(options = {}) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'matrixorigin-doc-validator'
    }

    const token = options.token || process.env.GITHUB_TOKEN
    if (token) {
        headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, { headers })
    const data = await response.json()

    return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000)
    }
}

/**
 * Format commits for display
 * @param {Array} commits - Array of commit objects
 * @returns {string} Formatted string
 */
export function formatCommits(commits) {
    return commits.map((c, i) =>
        `  ${i + 1}. ${c.sha} (${new Date(c.date).toLocaleDateString()}) ${c.message}`
    ).join('\n')
}

/**
 * Sleep helper
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
    getRecentCommits,
    getRateLimitStatus,
    formatCommits
}
