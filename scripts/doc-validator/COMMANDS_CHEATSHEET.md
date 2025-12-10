# MatrixOne 文档验证工具 - 可用命令清单

**快速参考** - 所有可用的命令

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

执行验证后会看到以下状态：

- ✅ **SUCCESS**: 语法和语义都正确，执行成功
- ⚠️ **WARNING_OK**: 语法正确，仅缺少上下文（可忽略）
- ⚠️ **WARNING_FAIL**: 语法正确，但有其他语义问题（需人工检查）
- ❌ **ERROR**: 真正的语法错误（必须修复）
- ⏭️ **SKIP**: 管理命令，跳过执行

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

## 💡 使用建议

### 日常开发（每天使用）

```bash
# 基础检查 - 修改文档后运行
npm run validate-docs:changed

# 深度检查 - 需要验证 SQL 执行时
# 1. 先启动 MatrixOne（默认最新版）
npm run mo:start

# 或指定版本启动
npm run mo:start -- v1.2.0

# 2. 然后运行 SQL 执行验证
npm run validate-docs:execution:changed

# 3. 用完后停止
npm run mo:stop
```

### 提交 PR 前（必须检查）

```bash
# 完整的提交前检查（不含 SQL 执行）
npm run lint && \
npm run check:links:changed && \
npm run validate-docs:changed

# 包含 SQL 执行验证（可选）
# 1. 启动数据库（默认最新版或指定版本）
npm run mo:start
# npm run mo:start -- v1.2.0

# 2. 运行完整检查
npm run lint && \
npm run check:links:changed && \
npm run validate-docs:execution:changed

# 3. 停止数据库
npm run mo:stop
```

### 快速验证工具（测试工具本身）

```bash
# 5秒快速测试
npm run validate-docs:quick
```

### 周末/定期（可选）

```bash
# 全量检查所有文档
npm run validate-docs
```

---

## 🎯 现在就试试！

### 最简单的测试

```bash
# 复制粘贴这个命令运行
npm run validate-docs:sample
```

### 看看你的修改

```bash
# 如果你已经修改了一些文档
npm run validate-docs:changed
```

---

**提示**: 所有命令都在项目根目录 `/Users/flypiggy/Documents/GitHub/moIO/matrixorigin.io` 下运行

