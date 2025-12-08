/**
 * Git 工具函数
 */

import { execSync } from 'node:child_process'

/**
 * 获取相对于指定分支变更的文件列表
 * @param {string} baseBranch - 基准分支名称（默认 'main'）
 * @param {string} pattern - 文件模式过滤（默认 '*.md'）
 * @returns {Array<string>} 变更的文件路径列表
 */
export function getChangedFiles(baseBranch = 'main', pattern = '*.md') {
  try {
    // 确保获取最新的远程分支信息
    try {
      execSync(`git fetch origin ${baseBranch}`, { stdio: 'pipe' })
    } catch (e) {
      // 如果 fetch 失败，继续使用本地分支
      console.warn(`Warning: Could not fetch origin/${baseBranch}, using local branch`)
    }
    
    // 获取变更的文件
    const command = `git diff --name-only origin/${baseBranch}...HEAD`
    const output = execSync(command, { encoding: 'utf-8' })
    
    // 过滤文件
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
 * 获取当前分支名
 * @returns {string} 当前分支名
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
 * 检查是否在 git 仓库中
 * @returns {boolean} 是否在 git 仓库中
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
 * 获取文件的 git diff 内容
 * @param {string} filePath - 文件路径
 * @param {string} baseBranch - 基准分支
 * @returns {string} diff 内容
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


