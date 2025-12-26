<div align="center">
  <img src="docs/assets/new-logo.png" alt="MatrixOne Logo" width="200"/>
  
  # MatrixOne Documentation
  
  [![Website](https://img.shields.io/badge/Website-docs.matrixorigin.cn-blue)](https://docs.matrixorigin.cn/en/)
  [![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/matrixorigin/matrixone)](https://github.com/matrixorigin/matrixone)
  
  **Official documentation repository for MatrixOne Database**
  
  [📖 Documentation](https://docs.matrixorigin.cn/en/) | [🚀 Quick Start](#quick-start) | [🤝 Contributing](CONTRIBUTING.md) | [💬 Discussions](https://github.com/matrixorigin/matrixone/discussions)
  
</div>

---

## 📚 About

This repository contains all the source files for the **MatrixOne documentation website**. 

### What is MatrixOne?

**MatrixOne** is a **hyperconverged cloud-edge native database** designed to consolidate transactional (TP), analytical (AP), and streaming workloads into a single system. It features:

#### 🎯 Core Capabilities

- **🔄 Hyper-Converged Engine**: Single database supporting OLTP, OLAP, time-series, and machine learning workloads
- **☁️ Cloud-Edge Native**: Deploy across public clouds, private clouds, edge, and on-premises with seamless scalability
- **⚡ Extreme Performance**: Vectorized execution engine with high-performance distributed transactions
- **🌍 Multi-Tenancy**: Complete tenant isolation with independent resource management
- **📊 Real-time HTAP**: Handle mixed transactional and analytical workloads with real-time consistency
- **🔌 MySQL Compatibility**: Compatible with MySQL protocol and syntax for easy migration

#### 💡 Key Benefits

- **Simplify Architecture**: Replace multiple databases (MySQL, PostgreSQL, ClickHouse, etc.) with one unified system
- **Reduce Costs**: Lower infrastructure and operational costs through consolidation
- **Accelerate Development**: Faster development with unified data platform
- **Ensure Consistency**: Global distributed transactions guarantee data consistency
- **Scale Effortlessly**: Separate storage and compute for elastic scaling

MatrixOne is ideal for scenarios requiring real-time data processing, large-scale analytics, multi-cloud deployment, and mixed workloads.

### 🌐 Live Documentation

Visit our documentation at: **[docs.matrixorigin.cn](https://docs.matrixorigin.cn/en/)**

### 🐛 Found an Issue?

We appreciate your feedback! If you find any documentation issues:
- 📝 [Create an Issue](https://github.com/matrixorigin/matrixorigin.io/issues/new) to let us know
- 🔧 [Submit a Pull Request](https://github.com/matrixorigin/matrixorigin.io/pulls) to help fix it directly

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+ and pnpm

### Get Started

```bash
# Install dependencies
make install

# Start development server
make serve
```

Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** to preview the documentation.

### Common Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make serve` | Start local server |
| `make build` | Build static site |
| `make lint` | Check code style |
| `make lint-fix` | Auto-fix style issues |
| `make clean` | Clean build artifacts |

Run `make help` to see all available commands.

## 🔍 Documentation Validation Tool

This repository includes a documentation validation tool for Dead Link, SQL syntax, and SQL execution checking.

### Quick Usage

```bash
# 🔗 Dead Link 检测
pnpm run check:links:file docs/MatrixOne/xxx.md      # 单文件
pnpm run check:links:changed                          # 变更文件

# 🧾 SQL 语法检测
pnpm run check:sql-syntax:file docs/MatrixOne/xxx.md # 单文件
pnpm run check:sql-syntax:changed                     # 变更文件

# ▶️ SQL 执行检测
pnpm run db:start                                     # 启动数据库
pnpm run db:start 3.0.4                               # 启动指定版本
pnpm run check:sql-exec:file docs/MatrixOne/xxx.md   # 单文件
pnpm run check:sql-exec:changed                       # 变更文件
pnpm run db:stop                                      # 停止数据库
```

💡 For more details, see [Documentation Validation Tool Guide](scripts/doc-validator/README.md)

## 📝 Development Workflow

```bash
# 1. Make changes to documentation files

# 2. Preview your changes locally
make serve

# 3. Before committing, run checks
make lint-fix   # Auto-fix style issues
make check      # Lint + build test

# 4. Commit your changes
git add .
git commit -m "Your message"

# 5. Install dependencies (required for link/SQL checks)
make install

# 6. Check for dead links
pnpm run check:links:changed

# 7. Check SQL syntax
pnpm run check:sql-syntax:changed

# 8. (Optional) Run SQL execution tests
pnpm run db:start
pnpm run check:sql-exec:changed
pnpm run db:stop

# 9. Push to remote
git push
```

> 💡 **Tip**: For more detailed usage and advanced options, see [Documentation Validation Tool Guide](scripts/doc-validator/README.md).

## 🤝 Contributing

We welcome contributions! See [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

<div align="center">
  
  **Built with ❤️ by the MatrixOne Team**
  
  ⭐ **Star us on GitHub!** ⭐
  
  [Website](https://www.matrixorigin.io) • [Documentation](https://docs.matrixorigin.cn/en/) • [GitHub](https://github.com/matrixorigin/matrixone) • [Community](https://matrixorigin.io/community)
  
</div>