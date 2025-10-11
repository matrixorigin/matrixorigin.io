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

**MatrixOne** is a future-oriented **hyperconverged cloud & edge native DBMS** that supports:
- 🔄 **Transactional workloads** (OLTP)
- 📊 **Analytical workloads** (OLAP)  
- 🌊 **Streaming workloads**

Built with a simplified and distributed database engine, MatrixOne works seamlessly across multiple datacenters, clouds, edges, and heterogeneous infrastructures.

### 🌐 Live Documentation

Visit our documentation at: **[docs.matrixorigin.cn](https://docs.matrixorigin.cn/en/)**

### 🐛 Found an Issue?

We appreciate your feedback! If you find any documentation issues:
- 📝 [Create an Issue](https://github.com/matrixorigin/matrixorigin.io/issues/new) to let us know
- 🔧 [Submit a Pull Request](https://github.com/matrixorigin/matrixorigin.io/pulls) to help fix it directly

## 🚀 Quick Start

### ⚡ Using Makefile (Recommended)

We provide a convenient Makefile for all common tasks. Get started in seconds:

```bash
# 📖 Show all available commands
make help

# 📦 Install all dependencies (Python + Node.js)
make install

# 🌐 Start local preview server
make serve
```

Then open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser to see the documentation!

#### 🔥 Most Common Commands

```bash
make serve      # 🌐 Start dev server with live reload
make build      # 🏗️  Build static site  
make lint       # ✅ Check code style
make lint-fix   # 🔧 Auto-fix issues
make clean      # 🧹 Clean build files
make check      # 🚦 Pre-commit check (lint + build)
```

### 🛠️ Manual Setup (Alternative)

If you prefer to run commands manually:

```bash
# 1️⃣ Install Python dependencies
pip3 install -r requirements.txt

# 2️⃣ Install Node.js dependencies  
npm install

# 3️⃣ Start local server
mkdocs serve

# Or use your conda environment
/path/to/your/python -m mkdocs serve
```

## 📋 Available Commands

### 🎯 Development Commands

| Command | Description |
|---------|-------------|
| `make serve` | 🌐 Start development server with auto-reload |
| `make serve-custom ADDR=0.0.0.0:8080` | 🌐 Start server on custom address |
| `make build` | 🏗️ Build static documentation site |
| `make build-strict` | 🔒 Build with strict mode (warnings = errors) |
| `make clean` | 🧹 Remove build artifacts and caches |
| `make watch` | 👀 Watch files and rebuild on changes |

### ✅ Quality Assurance

| Command | Description |
|---------|-------------|
| `make lint` | ✅ Run all linting checks |
| `make lint-fix` | 🔧 Auto-fix linting issues |
| `make test` | 🧪 Run tests (lint checks) |
| `make check` | 🚦 Quick check (lint + build) |
| `make validate` | ✔️ Validate mkdocs.yml syntax |

### 📦 Dependency Management

| Command | Description |
|---------|-------------|
| `make install` | 📦 Install all dependencies |
| `make install-python` | 🐍 Install Python dependencies only |
| `make install-node` | 📗 Install Node.js dependencies only |
| `make upgrade` | ⬆️ Upgrade all dependencies |

### 🔍 Utilities

| Command | Description |
|---------|-------------|
| `make version` | 📌 Show installed tool versions |
| `make count-pages` | 🔢 Count total documentation pages |
| `make list-files` | 📄 List all markdown files |
| `make new-page PAGE=path/to/page.md` | ➕ Create new documentation page |

### ⚡ Quick Aliases

| Alias | Full Command | Description |
|-------|--------------|-------------|
| `make s` | `make serve` | 🌐 Start server |
| `make b` | `make build` | 🏗️ Build docs |
| `make c` | `make clean` | 🧹 Clean up |
| `make l` | `make lint` | ✅ Run lint |
| `make lf` | `make lint-fix` | 🔧 Fix issues |

## 🏗️ Project Structure

```
matrixorigin.io/
├── docs/                    # Documentation source files
│   ├── MatrixOne/          # Main documentation content
│   │   ├── Tutorial/       # Tutorials and demos
│   │   ├── Get-Started/    # Getting started guides
│   │   ├── Develop/        # Development guides
│   │   ├── Deploy/         # Deployment guides
│   │   ├── Reference/      # API and SQL reference
│   │   └── ...
│   ├── assets/             # Images and static files
│   ├── stylesheets/        # Custom CSS
│   └── javascripts/        # Custom JavaScript
├── mkdocs.yml              # MkDocs configuration
├── Makefile                # Build automation
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
└── scripts/                # Build scripts
```

## 🛠️ Tech Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **MkDocs** | Static site generator | 9.1.21 |
| **Material for MkDocs** | Documentation theme | Latest |
| **Python** | Runtime environment | 3.7+ |
| **Node.js** | JavaScript tooling | 14+ |
| **mike** | Documentation versioning | 1.1.2 |

## 📝 Typical Workflow

### 1️⃣ **Setup Environment** (First Time)

```bash
# Clone the repository
git clone https://github.com/matrixorigin/matrixorigin.io.git
cd matrixorigin.io

# Install dependencies
make install
```

### 2️⃣ **Preview Changes** (While Editing)

```bash
# Start local server
make serve

# Server will auto-reload when you save changes
# Access at http://127.0.0.1:8000
```

### 3️⃣ **Before Committing**

```bash
# Run quality checks
make check

# Or run individual checks
make lint        # Check style
make lint-fix    # Auto-fix issues
make validate    # Validate config
make build       # Test build
```

### 4️⃣ **Submit Changes**

```bash
# Commit your changes
git add .
git commit -m "Your descriptive message"
git push origin your-branch

# Create Pull Request on GitHub
```

## 📖 Documentation Guidelines

### Writing Style

- ✅ Use clear, concise language
- ✅ Include code examples
- ✅ Add screenshots where helpful
- ✅ Link to related documents
- ❌ Avoid jargon without explanation
- ❌ Don't assume prior knowledge

### File Naming

- Use lowercase with hyphens: `my-new-feature.md`
- Be descriptive: `connect-to-matrixone.md` not `connect.md`
- Group related files in directories

### Adding New Pages

1. Create markdown file in appropriate directory
2. Add entry to `mkdocs.yml` navigation
3. Test locally with `make serve`
4. Run `make check` before committing

Example:

```bash
# Create new page
make new-page PAGE=docs/MatrixOne/Tutorial/my-tutorial.md

# Add to mkdocs.yml under nav section
# Then preview
make serve
```

## 🔧 Troubleshooting

### Server won't start

**Issue:** Port 8000 already in use

**Solution:** Use custom port
```bash
make serve-custom ADDR=127.0.0.1:8001
```

### Build fails

**Issue:** Missing dependencies

**Solution:** Reinstall dependencies
```bash
make clean
make install
make build
```

### Linting errors

**Issue:** Markdown formatting issues

**Solution:** Auto-fix most issues
```bash
make lint-fix
```

## 📊 Repository Statistics

- 📄 **Total Pages:** 629+
- 🌍 **Languages:** English, 中文
- 📚 **Categories:** Tutorial, Reference, Guides, FAQs
- 🔄 **Updates:** Continuous integration with main MatrixOne repository

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 📝 **Improve existing docs** - Fix typos, clarify explanations
- ➕ **Add new content** - Tutorials, examples, use cases
- 🐛 **Report issues** - Found a problem? Let us know
- 🌐 **Translate** - Help with localization
- ⭐ **Star the repo** - Show your support!

**Read our full [Contributing Guide](CONTRIBUTING.md) for details.**

## 📬 Get Help

- 💬 [GitHub Discussions](https://github.com/matrixorigin/matrixone/discussions) - Ask questions
- 🐛 [Issue Tracker](https://github.com/matrixorigin/matrixorigin.io/issues) - Report bugs
- 📧 [Community](https://matrixorigin.io/community) - Join our community
- 📖 [Documentation](https://docs.matrixorigin.cn/en/) - Full docs

## 📜 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
  **Built with ❤️ by the MatrixOne Team**
  
  ⭐ **Star us on GitHub!** ⭐
  
  [Website](https://www.matrixorigin.io) • [Documentation](https://docs.matrixorigin.cn/en/) • [GitHub](https://github.com/matrixorigin/matrixone) • [Community](https://matrixorigin.io/community)
  
</div>