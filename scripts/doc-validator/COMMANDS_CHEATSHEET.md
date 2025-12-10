# MatrixOne 文档验证工具 - 可用命令清单

**快速参考** - 所有可用的命令

---

## 🔍 版本检测

### 自动检测文档需要的 MO 版本

```bash
# 检测所有文档需要的版本
npm run detect-versions

# 只检测变更文件需要的版本（推荐）
npm run detect-versions:changed

# 检测指定文件的版本
npm run detect-versions -- <文件路径>

# 检测多个文件
npm run detect-versions -- <文件1> <文件2> <文件3>

# 简化输出（只显示版本列表，空格分隔）
npm run detect-versions -- --simple
```

### 在文档中标记版本

如果 SQL 需要特定版本的 MatrixOne，可以在文档开头添加版本标记：

```markdown
<!-- version: v1.2.0 -->
```

或

```markdown
<!-- mo-version: v1.2.0 -->
```

或

```markdown
**Version**: v1.2.0
```

**说明：**
- ✅ 如果不标记版本，CI 会使用 `latest` 版本测试
- ✅ 标记后，CI 会自动使用对应版本的 MatrixOne 进行测试
- ✅ 对贡献者完全透明，无需手动管理版本
- ✅ 支持在文档前 20 行内的任意位置标记

### 使用场景

```bash
# 场景1: 检查当前 PR 需要哪些版本
npm run detect-versions:changed

# 场景2: 检查特定文档需要什么版本
npm run detect-versions -- docs/MatrixOne/Develop/SQL/ddl.md

# 场景3: CI 自动检测（在 GitHub Actions 中自动运行）
# 无需手动操作，PR 提交后自动识别
```

---

## 🔗 Dead Link 检查

### 基础命令

```bash
# 检查所有文档的链接（慢，完整）
npm run check:links

# 只显示错误，不显示成功的（推荐）
npm run check:links:quiet

# 快速测试 - 只检查前10个文档
npm run check:links:sample

# 只检查你修改的文件（提交前使用）
npm run check:links:changed
```

### 推荐使用

```bash
# 日常开发 - 检查你的修改
npm run check:links:changed
```

---

## 📝 SQL 语法检测

### 基础命令

```bash
# 检查指定文件的 SQL 语法
npm run validate-docs -- <文件路径>

# 检查多个文件
npm run validate-docs -- <文件1> <文件2> <文件3>

# 检查所有文档的 SQL 语法（慢，完整）
npm run validate-docs

# 只检查你修改的文件（快速，推荐）
npm run validate-docs:changed

# 检查前50个文档（中等速度）
npm run validate-docs:sample

# 检查前10个文档（超快）
npm run validate-docs:quick

# 自定义检查数量
npm run validate-docs -- --limit 20

# 自定义数量 + 详细模式
npm run validate-docs -- --limit 20 --verbose

# 查看帮助文档
npm run validate-docs -- --help
```

### 推荐使用

```bash
# 日常开发 - 检查单个文件
npm run validate-docs -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md

# 日常开发 - 检查你的修改
npm run validate-docs:changed

# 快速测试 - 验证工具是否正常
npm run validate-docs:sample
```

---

## 🚀 SQL 执行验证

### 基础命令

```bash
# 验证指定文件的 SQL（需要 MatrixOne 数据库）
npm run validate-docs:execution -- <文件路径>

# 只检查变更的文件 ⭐ (最常用)
npm run validate-docs:execution:changed

# 全量检查（检查所有文档）
npm run validate-docs:all

# 详细输出模式（显示每条 SQL 的执行结果）
npm run validate-docs:execution -- <文件路径> --verbose
```

### 环境准备

```bash
# 方法1: 使用脚本启动 MatrixOne（推荐）
# 默认拉取最新版本
npm run mo:start

# 指定版本启动（支持任意版本号） ⭐
npm run mo:start -- v1.2.0
npm run mo:start -- 1.1.0
npm run mo:start -- nightly

# 或使用环境变量指定版本
MO_VERSION=v1.2.0 npm run mo:start

# 方法2: 手动启动 Docker
docker run -d -p 6001:6001 --name mo-test matrixorigin/matrixone:latest

# 方法3: 本地安装的 MatrixOne
# 确保运行在 127.0.0.1:6001，用户名 root，密码 111
```

### 数据库管理命令

```bash
# 启动 MatrixOne（默认最新版本）
npm run mo:start

# 启动指定版本的 MatrixOne ⭐
npm run mo:start -- v1.2.0
npm run mo:start -- 1.1.0
npm run mo:start -- nightly

# 停止 MatrixOne
npm run mo:stop

# 查看 MatrixOne 状态
npm run mo:status

# 测试 MatrixOne 连接
npm run mo:test

# 查看容器日志（如果启动失败）
docker logs mo-test

# 手动查看运行状态
docker ps | grep mo-test
```

### 高级用法

```bash
# 自定义数据库连接
npm run validate-docs:execution -- <文件> \
  --db-host 192.168.1.100 \
  --db-port 6001 \
  --db-user root \
  --db-password 111

# 查看帮助
npm run validate-docs:execution -- --help
```

### 执行结果说明

执行验证后，报告中会显示以下统计信息：

```
📈 SQL Execution Statistics:
  ├─ ✅ Successfully executed: N       # 语法和语义正确，执行成功
  ├─ ⚠️  Warnings (missing tables only, ignorable): N   # 语法正确，仅缺少表/列（工具会自动创建表验证）
  ├─ ⚠️  Warnings (need manual check): N   # 语法正确，但有其他语义问题（需人工检查）
  ├─ ❌ Errors: N                      # 真正的语法错误（必须修复）
  └─ 📊 Total: N SQL statements
```

**状态说明：**
- ✅ **Successfully executed**: SQL完全正确，执行成功
- ⚠️ **Warnings (missing tables only, ignorable)**: SQL语法正确，只是文档中没有建表语句，工具会自动创建空表来验证语法，可以忽略
- ⚠️ **Warnings (need manual check)**: SQL语法正确，但即使自动创建表后仍然执行失败，可能有权限、依赖或其他语义问题，需要人工检查
- ❌ **Errors**: 真正的SQL语法错误，必须修复

### 推荐使用

```bash
# 日常开发 - 验证你修改的 SQL
npm run validate-docs:execution -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md --verbose

# 验证测试文件
npm run validate-docs:execution -- docs/MatrixOne/Test/context-completion-test.md
```

---

## 🎯 标点符号检查

```bash
# 检查标点符号
npm run lint

# 自动修复标点符号
npm run lint:fix
```

---
