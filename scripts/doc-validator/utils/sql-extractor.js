/**
 * SQL Extractor - 从 Markdown 文档中提取 SQL 代码块
 */

import { readFileSync } from 'node:fs'
import { config } from '../config.js'

/**
 * 从 Markdown 文件中提取 SQL 代码块
 * @param {string} filePath - Markdown 文件路径
 * @returns {Array} SQL 代码块数组
 */
export function extractSqlFromFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return extractSqlFromContent(content, filePath)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return []
  }
}

/**
 * 从 Markdown 内容中提取 SQL 代码块
 * @param {string} content - Markdown 内容
 * @param {string} filePath - 文件路径（用于报告）
 * @returns {Array} SQL 代码块数组
 */
export function extractSqlFromContent(content, filePath = '') {
  const sqlBlocks = []
  const lines = content.split('\n')
  
  let inCodeBlock = false
  let isCodeBlockSql = false
  let currentBlock = {
    sql: '',
    startLine: 0,
    endLine: 0,
    version: null,
    filePath
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    
    // 检测代码块开始（支持缩进）
    const codeBlockStart = line.match(/^\s*```(\w+)?/)
    if (codeBlockStart && !inCodeBlock) {
      const language = codeBlockStart[1] || ''
      
      // 检查是否是 SQL 代码块
      if (config.sqlCodeBlockLanguages.some(lang => 
        language.toLowerCase() === lang.toLowerCase()
      )) {
        inCodeBlock = true
        isCodeBlockSql = true
        currentBlock = {
          sql: '',
          startLine: lineNumber + 1,
          endLine: 0,
          version: extractVersionFromContext(lines, i),
          filePath
        }
      } else {
        inCodeBlock = true
        isCodeBlockSql = false
      }
      continue
    }
    
    // 检测代码块结束（支持缩进）
    if (line.match(/^\s*```/) && inCodeBlock) {
      if (isCodeBlockSql && currentBlock.sql.trim()) {
        // 检查是否是真正的 SQL 代码块（不是混合了 Shell 命令的）
        if (isPureSqlBlock(currentBlock.sql)) {
          currentBlock.endLine = lineNumber - 1
          sqlBlocks.push({ ...currentBlock })
        }
      }
      inCodeBlock = false
      isCodeBlockSql = false
      continue
    }
    
    // 收集 SQL 内容
    if (inCodeBlock && isCodeBlockSql) {
      currentBlock.sql += line + '\n'
    }
  }
  
  return sqlBlocks
}

/**
 * 从上下文中提取版本信息
 * @param {Array} lines - 所有行
 * @param {number} currentIndex - 当前行索引
 * @returns {string|null} 版本号或 null
 */
function extractVersionFromContext(lines, currentIndex) {
  // 向上查找最近的 10 行，寻找版本标记
  const lookbackLines = 10
  const startIndex = Math.max(0, currentIndex - lookbackLines)
  
  for (let i = currentIndex; i >= startIndex; i--) {
    const line = lines[i]
    
    // 匹配版本标记，例如：
    // <!-- version: v1.2 -->
    // <!-- mo-version: v1.2 -->
    // **版本**: v1.2
    const versionMatch = line.match(/(?:version|mo-version):\s*(v?[\d.]+)/i)
    if (versionMatch) {
      return versionMatch[1]
    }
  }
  
  return null
}

/**
 * 将 SQL 语句分割成单独的语句
 * @param {string} sql - SQL 文本
 * @returns {Array} 单独的 SQL 语句数组
 */
export function splitSqlStatements(sql) {
  // 简单的分割逻辑，按分号分割
  // 注意：这是一个简化版本，可能需要更复杂的解析来处理字符串中的分号
  const statements = []
  const lines = sql.split('\n')
  let currentStatement = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 跳过空行和注释
    if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('#')) {
      continue
    }
    
    // 跳过 MySQL 命令行提示符开头的行
    if (trimmedLine.startsWith('mysql>') || trimmedLine.startsWith('>')) {
      // 提取提示符后的 SQL 语句
      const sqlPart = trimmedLine.replace(/^(mysql>|>)\s*/, '')
      if (sqlPart) {
        currentStatement += sqlPart + '\n'
      }
      continue
    }
    
    // 跳过输出结果（表格、查询结果等）
    if (shouldSkipLine(trimmedLine)) {
      continue
    }
    
    currentStatement += line + '\n'
    
    // 如果行以分号结尾，认为是一个完整的语句
    if (trimmedLine.endsWith(';')) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim())
      }
      currentStatement = ''
    }
  }
  
  // 添加最后一个语句（如果没有分号结尾）
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim())
  }
  
  return statements
}

/**
 * 判断是否应该跳过某一行（非 SQL 语句）
 * @param {string} line - 行内容
 * @returns {boolean} 是否跳过
 */
function shouldSkipLine(line) {
  // 跳过表格边框
  if (/^[+\-|]+$/.test(line)) {
    return true
  }
  
  // 跳过表格内容行（以 | 开始和结束）
  if (/^\|.*\|$/.test(line)) {
    return true
  }
  
  // 跳过查询结果统计（如 "1 row in set"）
  if (/^\d+\s+(row|rows)\s+in\s+set/i.test(line)) {
    return true
  }
  
  // 跳过 Query OK 等响应
  if (/^Query\s+OK/i.test(line)) {
    return true
  }
  
  // 跳过 Shell 命令（常见的如 mysql, mysqldump 等）
  if (/^(mysql|mysqldump|root@)\s+/.test(line)) {
    return true
  }
  
  // 跳过警告信息
  if (/^\[Warning\]/i.test(line) || /^Warning:/i.test(line)) {
    return true
  }
  
  return false
}

/**
 * 判断一个代码块是否是纯 SQL（不包含 Shell 命令、输出等）
 * @param {string} sqlText - SQL 文本
 * @returns {boolean} 是否是纯 SQL
 */
function isPureSqlBlock(sqlText) {
  const lines = sqlText.trim().split('\n')
  
  // 检查每一行
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('#')) {
      continue
    }
    
    // 如果包含 Shell 提示符（root@、user@），很可能是混合内容
    if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+.*[#$%]/.test(trimmed)) {
      return false
    }
    
    // 如果包含 "Welcome to"、"Copyright"、"Server version" 等，是连接输出
    if (/Welcome to|Copyright|Server version|Type 'help'/i.test(trimmed)) {
      return false
    }
    
    // 如果包含 "Your MySQL connection id"，是连接信息
    if (/connection id is/i.test(trimmed)) {
      return false
    }
    
    // 如果包含 Oracle trademark 相关，是版权信息
    if (/Oracle.*trademark|affiliates/i.test(trimmed)) {
      return false
    }
  }
  
  // 如果代码块中表格行（+---+）超过 30%，很可能是输出结果
  const tableLines = lines.filter(l => /^[+\-|]+$/.test(l.trim())).length
  const contentLines = lines.filter(l => l.trim()).length
  if (contentLines > 0 && tableLines / contentLines > 0.3) {
    return false
  }
  
  return true
}

export default {
  extractSqlFromFile,
  extractSqlFromContent,
  splitSqlStatements
}

