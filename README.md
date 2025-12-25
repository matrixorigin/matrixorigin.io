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

This repository includes a documentation validation tool that automatically checks SQL syntax and execution in documentation files.

### Quick Usage

  ```bash
  # Multi-version SQL execution test
  npm run validate-multi -- --changed-only

  # Test specific file with specific branch
  npm run validate-multi -- --branch main docs/MatrixOne/xxx.md
```
  Important: Branch Naming Requirement

  The tool fetches images from the https://github.com/matrixorigin/matrixone based on branch/tag names.

  To use SQL execution testing, you must ensure:

  1. Your local branch name matches a branch/tag name in the matrixone repository, OR
  2. Use --branch <name> parameter to specify a valid matrixone branch/tag name
```
  # Example: Your local branch is "my-feature", but you want to test against MO's main branch
  npm run validate-multi -- --branch main --changed-only

  # Example: Test against a specific MO version tag
  npm run validate-multi -- --branch v1.2.0 docs/MatrixOne/xxx.md
```
  ⚠️ Note: Branch names between the documentation repository and matrixone repository are not automatically mapped. If your local branch name doesn't exist in the matrixone repository, you must specify --branch 
  explicitly.

  How It Works

  1. Branch Detection: Uses current git branch name or --branch parameter
  2. Fetch Commits: Gets recent commits from matrixone repository for that branch
  3. Find Images: Checks Docker image availability (Docker Hub first, Tencent Cloud TCR as fallback)
  4. Run Tests: Starts MatrixOne container and validates SQL execution
  5. Report: Any version passes = overall pass

  Common Options

  | Option             | Description                                                     |
  |--------------------|-----------------------------------------------------------------|
  | --branch <name>    | Specify matrixone branch/tag name (default: current git branch) |
  | --changed-only     | Only test changed files                                         |
  | --max-versions <n> | Maximum versions to test (default: 5)                           |
  | --verbose          | Show detailed output                                            |

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

# 5. Install npm dependencies (required for link/SQL checks)
npm install

# 6. Check for dead links
npm run check:links:changed          

# 7. Check SQL syntax
npm run validate-docs:changed        

# 8. (Optional) Run SQL execution tests

npm run validate-multi -- --changed-only                   

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