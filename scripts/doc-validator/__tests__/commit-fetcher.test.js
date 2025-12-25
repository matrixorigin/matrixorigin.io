/**
 * Tests for commit-fetcher.js
 * Run with: node --test scripts/doc-validator/__tests__/commit-fetcher.test.js
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { getRecentCommits, formatCommits } from '../utils/commit-fetcher.js'

describe('commit-fetcher', () => {
    describe('getRecentCommits', () => {
        it('should fetch commits from main branch', async () => {
            // This is an integration test that hits the real GitHub API
            // Skip if no network or rate limited
            try {
                const commits = await getRecentCommits('main', 3)

                assert.ok(Array.isArray(commits), 'Should return an array')
                assert.ok(commits.length > 0, 'Should return at least one commit')
                assert.ok(commits.length <= 3, 'Should return at most 3 commits')

                // Check commit structure
                const commit = commits[0]
                assert.ok(commit.sha, 'Commit should have sha')
                assert.strictEqual(commit.sha.length, 7, 'SHA should be 7 characters')
                assert.ok(commit.fullSha, 'Commit should have fullSha')
                assert.strictEqual(commit.fullSha.length, 40, 'Full SHA should be 40 characters')
                assert.ok(commit.message, 'Commit should have message')
                assert.ok(commit.date, 'Commit should have date')
            } catch (error) {
                if (error.message.includes('rate limit')) {
                    console.log('Skipping test: GitHub API rate limit exceeded')
                    return
                }
                throw error
            }
        })

        it('should throw error for non-existent branch', async () => {
            try {
                await getRecentCommits('this-branch-definitely-does-not-exist-12345', 1)
                assert.fail('Should have thrown an error')
            } catch (error) {
                assert.ok(
                    error.message.includes('not found') || error.message.includes('rate limit'),
                    `Expected 'not found' error, got: ${error.message}`
                )
            }
        })

        it('should respect count parameter', async () => {
            try {
                const commits = await getRecentCommits('main', 2)
                assert.ok(commits.length <= 2, 'Should return at most 2 commits')
            } catch (error) {
                if (error.message.includes('rate limit')) {
                    console.log('Skipping test: GitHub API rate limit exceeded')
                    return
                }
                throw error
            }
        })
    })

    describe('formatCommits', () => {
        it('should format commits for display', () => {
            const commits = [
                {
                    sha: 'abc1234',
                    fullSha: 'abc1234567890',
                    message: 'feat: add new feature',
                    date: '2024-12-15T10:00:00Z'
                },
                {
                    sha: 'def5678',
                    fullSha: 'def5678901234',
                    message: 'fix: bug fix',
                    date: '2024-12-14T10:00:00Z'
                }
            ]

            const formatted = formatCommits(commits)

            assert.ok(formatted.includes('abc1234'), 'Should include first SHA')
            assert.ok(formatted.includes('def5678'), 'Should include second SHA')
            assert.ok(formatted.includes('feat: add new feature'), 'Should include first message')
            assert.ok(formatted.includes('fix: bug fix'), 'Should include second message')
        })

        it('should handle empty array', () => {
            const formatted = formatCommits([])
            assert.strictEqual(formatted, '', 'Should return empty string for empty array')
        })
    })
})

console.log('Running commit-fetcher tests...')
