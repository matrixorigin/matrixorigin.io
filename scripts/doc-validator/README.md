# MatrixOne Documentation Validation Tool

## 📖 Introduction

This is an automated validation tool designed specifically for MatrixOne documentation, helping contributors identify and fix issues in documents before submitting PRs.

### Core Features

- 🔗 **Dead Link Checking** - Automatically detect broken links in documents
- 📝 **SQL Syntax Checking** - Validate the syntax correctness of SQL code blocks in documents (using node-sql-parser)
- 🚀 **SQL Execution Validation** - Automatically fetch MatrixOne images and validate SQL execution against real database
- 🎯 **Punctuation Checking** - Unify punctuation standards in documents
- 
### Prerequisites

- **Node.js** (required) - v20 or higher
- **Go** (optional) - For enhanced SQL syntax checking with MatrixOne official parser

### Installation

```bash
# Clone the repository
git clone https://github.com/matrixorigin/matrixorigin.io.git
cd matrixorigin.io

# Install dependencies (this will also build the syntax checker if Go is available)
npm install
```

During `npm install`, you will see one of the following:

```
# If Go is installed:
✅ Go environment found: go version go1.25.4 darwin/amd64
🔨 Building syntax-checker...
✅ Build successful!
   Will use MatrixOne official parser for syntax checking

# If Go is NOT installed:
⚠️  Go environment not found
   Will use fallback mode (node-sql-parser + whitelist)
```

Both modes work correctly - Go is optional but recommended for more accurate syntax checking.

[//]: # (### Quick Start)

[//]: # ()
[//]: # (---)

**Detailed Command Reference** - All available commands

---

## 🔗 Dead Link Checking

### Basic Commands

```bash
# Check links in specific files
npm run check:links:files -- <file-path>

# Check links in multiple files
npm run check:links:files -- <file1> <file2> <file3>

# Check links in all documents (slow, complete)
npm run check:links

# Only show errors, not successes (recommended)
npm run check:links:quiet

# Quick test - only check first 10 documents
npm run check:links:sample

# Only check files you modified (use before submission)
npm run check:links:changed
```

### Recommended Usage

```bash
# Daily development - check a single file
npm run check:links:files -- docs/MatrixOne/Overview/matrixone-introduction.md

# Daily development - check your modifications
npm run check:links:changed
```

---

## 📝 SQL Syntax Checking

### Basic Commands

```bash
# Check SQL syntax in specific files
npm run validate-docs:files -- <file-path>

# Check SQL syntax in multiple files
npm run validate-docs:files -- <file1> <file2> <file3>

# Check SQL syntax in all documents (slow, complete)
npm run validate-docs

# Only check files you modified (fast, recommended)
npm run validate-docs:changed

# Check first 50 documents (medium speed)
npm run validate-docs:sample

# Check first 10 documents (ultra-fast)
npm run validate-docs:quick

# Customize number of files to check
npm run validate-docs -- --limit 20

# Custom limit + verbose mode
npm run validate-docs -- --limit 20 --verbose

# View help documentation
npm run validate-docs -- --help
```

### Recommended Usage

```bash
# Daily development - check a single file
npm run validate-docs -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md

# Daily development - check your modifications
npm run validate-docs:changed

# Quick test - verify if the tool works normally
npm run validate-docs:sample
```

---

## 🚀 Multi-Version SQL Execution Test

This feature automatically tests SQL code blocks in documentation against multiple MatrixOne versions to ensure compatibility.

### Important: Branch Naming Convention

**Your documentation branch name must match the MatrixOne repository branch name.**

For example:
- If you're working on `3.0.2-docs` branch in matrixorigin.io
- The tool will look for commits from `3.0.2-docs` branch in matrixorigin/matrixone
- Docker images are built from matrixone commits (e.g., `matrixorigin/matrixone:commit-abc1234`)

This tool supports most official tag images from the MatrixOne GitHub repository.

### Basic Commands

```bash
# Test with auto-detected branch (recommended)
npm run validate-multi

# Test only changed files
npm run validate-multi:changed

# Dry run - show what would be tested without executing
npm run validate-multi:dry-run

# Test specific files
npm run validate-multi -- <file-path>

# Specify branch manually
npm run validate-multi -- --branch main

# Limit number of versions to test
npm run validate-multi -- --max-versions 3

# Stop after first successful version
npm run validate-multi -- --stop-on-success

# Verbose output (recommended for detailed information)
npm run validate-multi -- --verbose
```

### Recommended Usage

```bash
# Daily development - test your modified files
npm run validate-multi:changed

# Test a specific document with verbose output
npm run validate-multi -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md --verbose

# Quick validation
npm run validate-multi -- --max-versions 1 --verbose --stop-on-success
```

### Explanation of Execution Results

After execution validation, the report will display the following statistics:

```
📊 SQL Validation Statistics:
  ├─ ✅ Passed: N
  ├─ ❌ Failed: N
  └─ 📈 Total: N SQL statements

📁 File Check Results:
  ├─ ✅ Passed: N
  └─ ❌ Failed: N
```

**Error Types**:
- **SQL syntax error**: SQL parser detected syntax errors (e.g., typos, missing keywords)
- **Semantic error**: SQL syntax is correct but execution failed (e.g., unknown database, ambiguous column)
- **DML execution failed**: Data manipulation failed (e.g., type mismatch, constraint violation)
- **Result validation failed**: SQL executed but results don't match expected output

### How It Works

1. **Branch Detection**: Automatically detects the current branch (local git or CI environment)
2. **Commit Fetching**: Fetches recent commits from the corresponding branch in `matrixorigin/matrixone` repository
3. **Image Checking**: Checks Docker image availability (Docker Hub first, Tencent Cloud TCR as fallback)
4. **Execution Testing**: Runs SQL execution tests against available images
5. **Result Reporting**: Any version passes = overall pass

---
