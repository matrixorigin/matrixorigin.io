/**
 * SQL 语法检查器
 */

import NodeSqlParser from 'node-sql-parser'
import { extractSqlFromFile, splitSqlStatements } from '../utils/sql-extractor.js'
import { config } from '../config.js'

const { Parser } = NodeSqlParser

/**
 * SQL 语法检查器类
 */
export class SqlSyntaxChecker {
  constructor() {
    // 初始化 SQL 解析器，使用 MySQL 方言
    this.parser = new Parser()
    this.dialect = 'mysql'
  }

  /**
   * 检查单个文件中的 SQL 语法
   * @param {string} filePath - 文件路径
   * @returns {Promise<object>} 检查结果
   */
  async checkFile(filePath) {
    const errors = []
    
    try {
      // 提取 SQL 代码块
      const sqlBlocks = extractSqlFromFile(filePath)
      
      if (sqlBlocks.length === 0) {
        return {
          passed: true,
          errors: [],
          sqlCount: 0
        }
      }
      
      // 检查每个 SQL 代码块
      for (const block of sqlBlocks) {
        const blockErrors = await this.checkSqlBlock(block)
        errors.push(...blockErrors)
      }
      
      return {
        passed: errors.length === 0,
        errors,
        sqlCount: sqlBlocks.length
      }
    } catch (error) {
      return {
        passed: false,
        errors: [{
          line: 0,
          message: `文件处理错误: ${error.message}`,
          type: 'file_error'
        }],
        sqlCount: 0
      }
    }
  }

  /**
   * 检查单个 SQL 代码块
   * @param {object} block - SQL 代码块
   * @returns {Promise<Array>} 错误列表
   */
  async checkSqlBlock(block) {
    const errors = []
    const statements = splitSqlStatements(block.sql)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // 跳过空语句
      if (!statement.trim()) {
        continue
      }
      
      // 跳过注释
      if (this.isComment(statement)) {
        continue
      }
      
      // 检查语法
      const error = await this.checkSqlStatement(statement, block.startLine + i)
      if (error) {
        errors.push({
          ...error,
          line: block.startLine,
          sql: statement,
          version: block.version
        })
      }
    }
    
    return errors
  }

  /**
   * 检查单个 SQL 语句
   * @param {string} sql - SQL 语句
   * @param {number} line - 行号
   * @returns {Promise<object|null>} 错误对象或 null
   */
  async checkSqlStatement(sql, line) {
    // 先检查是否在 MatrixOne 白名单中
    if (this.isInMatrixOneWhitelist(sql)) {
      // 在白名单中，跳过语法检查
      return null
    }
    
    try {
      // 使用 node-sql-parser 解析 SQL
      const ast = this.parser.astify(sql, { database: this.dialect })
      
      // 如果能成功解析，说明语法正确
      return null
    } catch (error) {
      // 解析失败，说明有语法错误
      return {
        line,
        message: `SQL 语法错误: ${this.formatError(error.message)}`,
        type: 'syntax_error',
        detail: error.message
      }
    }
  }

  /**
   * 检查 SQL 是否在 MatrixOne 白名单中
   * @param {string} sql - SQL 语句
   * @returns {boolean} 是否在白名单中
   */
  isInMatrixOneWhitelist(sql) {
    const whitelist = config.syntaxCheck.matrixoneWhitelist || []
    
    for (const pattern of whitelist) {
      if (pattern.test(sql)) {
        return true
      }
    }
    
    return false
  }

  /**
   * 判断是否是注释
   * @param {string} sql - SQL 文本
   * @returns {boolean} 是否是注释
   */
  isComment(sql) {
    const trimmed = sql.trim()
    return trimmed.startsWith('--') || 
           trimmed.startsWith('#') || 
           trimmed.startsWith('/*')
  }

  /**
   * 格式化错误消息
   * @param {string} message - 原始错误消息
   * @returns {string} 格式化后的错误消息
   */
  formatError(message) {
    // 简化错误消息，使其更易读
    if (message.includes('Expected')) {
      return message.split('\n')[0]
    }
    return message
  }
}

/**
 * 检查多个文件
 * @param {Array<string>} files - 文件路径列表
 * @returns {Promise<Map>} 文件路径到检查结果的映射
 */
export async function checkFiles(files) {
  const checker = new SqlSyntaxChecker()
  const results = new Map()
  
  for (const file of files) {
    const result = await checker.checkFile(file)
    results.set(file, result)
  }
  
  return results
}

export default SqlSyntaxChecker

