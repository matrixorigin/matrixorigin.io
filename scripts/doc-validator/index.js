#!/usr/bin/env node

/**
 * MatrixOne 文档验证工具
 * 
 * 功能：
 * - SQL 语法检查
 * - SQL 执行测试（可选）
 * - Dead Link 检查（使用已有的 markdown-link-check）
 */

import { Command } from 'commander'
import glob from 'fast-glob'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from './config.js'
import { SqlSyntaxChecker } from './checkers/sql-syntax.js'
import { SqlRunner } from './checkers/sql-runner.js'
import { getChangedFiles, isGitRepository } from './utils/git.js'
import { Reporter } from './utils/reporter.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 主程序
 */
async function main() {
  const program = new Command()
  
  program
    .name('validate-docs')
    .description('MatrixOne 文档验证工具')
    .version('1.0.0')
    .option('-c, --changed-only', '只检查变更的文件', false)
    .option('-l, --limit <number>', '限制检查的文件数量（用于快速测试）', parseInt)
    .option('--check <type>', '检查类型: syntax|all', 'syntax')
    .option('--db-host <host>', '数据库主机', config.defaultDbConfig.host)
    .option('--db-port <port>', '数据库端口', config.defaultDbConfig.port)
    .option('--db-user <user>', '数据库用户', config.defaultDbConfig.user)
    .option('--db-password <password>', '数据库密码', config.defaultDbConfig.password)
    .option('--verbose', '显示详细信息', false)
    .parse(process.argv)

  const options = program.opts()
  
  // 初始化报告器
  const reporter = new Reporter()
  
  console.log('🚀 MatrixOne 文档验证工具')
  console.log('='.repeat(60))
  
  // 确定要检查的文件
  let filesToCheck = []
  
  if (options.changedOnly) {
    if (!isGitRepository()) {
      console.error('❌ 错误: 不在 Git 仓库中，无法使用 --changed-only 选项')
      process.exit(1)
    }
    
    console.log('📝 检查模式: 仅变更文件')
    filesToCheck = getChangedFiles('main')
    
    if (filesToCheck.length === 0) {
      console.log('✅ 没有变更的 Markdown 文件')
      process.exit(0)
    }
    
    console.log(`📄 找到 ${filesToCheck.length} 个变更的文件\n`)
  } else {
    console.log('📝 检查模式: 全部文件')
    filesToCheck = await glob(config.docsPattern)
    console.log(`📄 找到 ${filesToCheck.length} 个文件`)
  }
  
  // 应用 limit 限制
  if (options.limit && options.limit > 0) {
    const originalCount = filesToCheck.length
    filesToCheck = filesToCheck.slice(0, options.limit)
    console.log(`⚡ 限制检查数量: ${filesToCheck.length} 个文件（总共 ${originalCount} 个）`)
  }
  
  console.log()
  reporter.setTotalFiles(filesToCheck.length)
  
  // 执行检查
  console.log('🔍 开始检查...\n')
  
  // 1. SQL 语法检查
  if (options.check === 'syntax' || options.check === 'all') {
    console.log('📋 SQL 语法检查:')
    console.log('-'.repeat(60))
    
    const syntaxChecker = new SqlSyntaxChecker()
    
    for (const file of filesToCheck) {
      const result = await syntaxChecker.checkFile(file)
      
      if (options.verbose) {
        console.log(`   检查: ${file} (SQL: ${result.sqlCount})`)
      }
      
      if (result.sqlCount === 0) {
        // 文件中没有 SQL，跳过报告
        continue
      }
      
      reporter.addFileResult(file, result.passed, result.errors)
    }
    
    console.log()
  }
  
  // 2. SQL 执行测试（Phase 4 功能）
  if (options.check === 'all') {
    console.log('🏃 SQL 执行测试:')
    console.log('-'.repeat(60))
    
    const dbConfig = {
      host: options.dbHost,
      port: options.dbPort,
      user: options.dbUser,
      password: options.dbPassword
    }
    
    const sqlRunner = new SqlRunner(dbConfig)
    // sqlRunner.enable()  // 暂不启用
    
    reporter.addWarning('SQL 执行测试功能暂未实现（Phase 4）')
    console.log()
  }
  
  // 生成报告
  const results = reporter.generateReport()
  
  // 退出
  process.exit(reporter.getExitCode())
}

// 运行主程序
main().catch(error => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})

