/**
 * Reporter - 生成检查结果报告
 */

/**
 * 报告类
 */
export class Reporter {
  constructor() {
    this.results = {
      totalFiles: 0,
      checkedFiles: 0,
      passedFiles: 0,
      failedFiles: 0,
      errors: [],
      warnings: []
    }
    this.startTime = Date.now()
  }

  /**
   * 添加文件检查结果
   * @param {string} filePath - 文件路径
   * @param {boolean} passed - 是否通过
   * @param {Array} errors - 错误列表
   */
  addFileResult(filePath, passed, errors = []) {
    this.results.checkedFiles++
    
    if (passed) {
      this.results.passedFiles++
      console.log(`✅ ${filePath}`)
    } else {
      this.results.failedFiles++
      console.log(`❌ ${filePath}`)
      
      errors.forEach(error => {
        this.results.errors.push({
          filePath,
          ...error
        })
        
        const location = error.line 
          ? `${filePath}:${error.line}` 
          : filePath
        
        console.log(`   📌 ${location}`)
        console.log(`      ${error.message}`)
        if (error.sql) {
          console.log(`      SQL: ${error.sql.substring(0, 100)}${error.sql.length > 100 ? '...' : ''}`)
        }
      })
    }
  }

  /**
   * 添加警告
   * @param {string} message - 警告消息
   */
  addWarning(message) {
    this.results.warnings.push(message)
    console.warn(`⚠️  ${message}`)
  }

  /**
   * 设置总文件数
   * @param {number} total - 总文件数
   */
  setTotalFiles(total) {
    this.results.totalFiles = total
  }

  /**
   * 生成最终报告
   * @returns {object} 报告结果
   */
  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2)
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 文档验证报告')
    console.log('='.repeat(60))
    console.log(`扫描文件总数: ${this.results.totalFiles}`)
    console.log(`包含SQL的文件: ${this.results.checkedFiles}`)
    console.log(`  ├─ ✅ 通过: ${this.results.passedFiles}`)
    console.log(`  └─ ❌ 失败: ${this.results.failedFiles}`)
    const noSqlFiles = this.results.totalFiles - this.results.checkedFiles
    if (noSqlFiles > 0) {
      console.log(`无SQL的文件: ${noSqlFiles}`)
    }
    console.log(`⚠️  警告: ${this.results.warnings.length}`)
    console.log(`🕐 耗时: ${duration}s`)
    console.log('='.repeat(60))
    
    if (this.results.errors.length > 0) {
      console.log(`\n发现 ${this.results.errors.length} 个错误:\n`)
      
      // 按文件分组错误
      const errorsByFile = {}
      this.results.errors.forEach(error => {
        if (!errorsByFile[error.filePath]) {
          errorsByFile[error.filePath] = []
        }
        errorsByFile[error.filePath].push(error)
      })
      
      // 输出每个文件的错误
      Object.entries(errorsByFile).forEach(([filePath, errors]) => {
        console.log(`📄 ${filePath} (${errors.length} 个错误)`)
        errors.forEach((error, index) => {
          const location = error.line ? `:${error.line}` : ''
          console.log(`   ${index + 1}. ${error.message}`)
          if (error.sql) {
            console.log(`      SQL: ${error.sql.substring(0, 80)}...`)
          }
        })
        console.log()
      })
    }
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  ${this.results.warnings.length} 个警告:\n`)
      this.results.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`)
      })
      console.log()
    }
    
    return this.results
  }

  /**
   * 判断是否有错误
   * @returns {boolean} 是否有错误
   */
  hasErrors() {
    return this.results.failedFiles > 0
  }

  /**
   * 获取退出码
   * @returns {number} 退出码（0 表示成功，1 表示失败）
   */
  getExitCode() {
    return this.hasErrors() ? 1 : 0
  }
}

export default Reporter

