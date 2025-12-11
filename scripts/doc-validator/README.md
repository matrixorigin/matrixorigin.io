# MatrixOne Documentation Validation Tool

## 📖 Introduction

This is an automated validation tool designed specifically for MatrixOne documentation, helping contributors identify and fix issues in documents before submitting PRs.

### Core Features

- 🔗 **Dead Link Checking** - Automatically detect broken links in documents
- 📝 **SQL Syntax Checking** - Validate the syntax correctness of SQL code blocks in documents (using node-sql-parser)
- 🚀 **SQL Execution Validation** - Connect to a real MatrixOne database, execute SQL, and compare with expected results
- 🔍 **Version Detection** - Intelligently identify the required MatrixOne version for documents, and CI automatically uses the corresponding version for testing
- 🎯 **Punctuation Checking** - Unify punctuation standards in documents

### Why Do We Need This Tool?

- ✅ **Catch Errors Early** - Automatically detect issues before PR merging to prevent errors from entering the main branch
- ✅ **Reduce Maintenance Costs** - Reduce manual review workload and focus on content quality
- ✅ **Ensure Documentation Quality** - Guarantee all SQL examples can be executed correctly
- ✅ **Zero Learning Curve** - Transparent to contributors, no additional configuration required, and CI runs automatically

### Quick Start

**Scenario 1: Check a Single File**

```bash
# Replace <file-path> with your file path, for example:
# docs/MatrixOne/Develop/import-data/bulk-load/load-data.md

# 1. Check dead links
npm run check:links:files -- <file-path>

# 2. Check SQL syntax
npm run validate-docs:files -- <file-path>

# 3. Check SQL execution (requires MatrixOne database)
npm run mo:start                          # Start database
npm run validate-docs-execution:files -- <file-path> --verbose
npm run mo:stop                           # Stop database
```

**Scenario 2: Check All Changed Files**

```bash
# 1. Check dead links in changed files
npm run check:links:changed

# 2. Check SQL syntax in changed files
npm run validate-docs:changed

# 3. Check SQL execution in changed files (requires MatrixOne database)
npm run mo:start                          # Start database
npm run validate-docs-execution:changed   # Validate SQL
npm run mo:stop                           # Stop database
```

**Scenario 3: Start MatrixOne Database**

```bash
# Method 1: Start with latest version (default)
npm run mo:start

# Method 2: Start with specific version
npm run mo:start -- v1.2.0                # Specific version
npm run mo:start -- 1.1.0                 # Without 'v' prefix
npm run mo:start -- nightly               # Nightly build

# Method 3: Use environment variable to specify version
MO_VERSION=v1.2.0 npm run mo:start

# Method 4: Manually start with Docker
docker run -d -p 6001:6001 --name mo-test matrixorigin/matrixone:latest
docker run -d -p 6001:6001 --name mo-test matrixorigin/matrixone:v1.2.0

# Database management commands
npm run mo:status                         # Check database status
npm run mo:test                           # Test database connection
npm run mo:stop                           # Stop database
docker logs mo-test                       # View database logs
```

---

**Detailed Command Reference** - All available commands

---

## 🔍 Version Detection

### Automatically Detect Required MO Version for Documents

```bash
# Detect required versions for all documents
npm run detect-versions

# Detect required versions only for changed files (recommended)
npm run detect-versions:changed

# Detect version for specific files
npm run detect-versions -- <file-path>

# Detect versions for multiple files
npm run detect-versions -- <file1> <file2> <file3>

# Simplified output (only show version list separated by spaces)
npm run detect-versions -- --simple
```

### Mark Versions in Documents

If SQL requires a specific version of MatrixOne, you can add a version tag at the beginning of the document:

```markdown
<!-- version: v1.2.0 -->
```

or

```markdown
<!-- mo-version: v1.2.0 -->
```

or

```markdown
**Version**: v1.2.0
```

**Notes**:
- ✅ If no version is marked, CI will use the `latest` version for testing
- ✅ After marking, CI will automatically use the corresponding version of MatrixOne for testing
- ✅ Completely transparent to contributors, no manual version management required
- ✅ Supported anywhere within the first 20 lines of the document

### Usage Scenarios

```bash
# Scenario 1: Check which versions are required for the current PR
npm run detect-versions:changed

# Scenario 2: Check which version a specific document requires
npm run detect-versions -- docs/MatrixOne/Develop/SQL/ddl.md

# Scenario 3: Automatic detection in CI (runs automatically in GitHub Actions)
# No manual operation needed, automatically identified after PR submission
```

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

## 🚀 SQL Execution Validation

### Environment Preparation

```bash
# Method 1: Start MatrixOne using script (recommended)
# Pulls latest version by default
npm run mo:start

# Start with specified version (supports any version number) ⭐
npm run mo:start -- v1.2.0
npm run mo:start -- 1.1.0
npm run mo:start -- nightly

# Or specify version using environment variable
MO_VERSION=v1.2.0 npm run mo:start

# Method 2: Manually start Docker
docker run -d -p 6001:6001 --name mo-test matrixorigin/matrixone:latest

# Method 3: Locally installed MatrixOne
# Ensure it's running on 127.0.0.1:6001 with username root and password 111
```

### Basic Commands

```bash
# Validate SQL in specific files (requires MatrixOne database)
npm run validate-docs-execution:files -- <file-path>

# Only check changed files ⭐ (most commonly used)
npm run validate-docs-execution:changed

# Full check (check all documents)
npm run validate-docs:all

# Verbose output mode (show execution results for each SQL)
npm run validate-docs-execution:files -- <file-path> --verbose
```

### Database Management Commands

```bash
# Start MatrixOne (latest version by default)
npm run mo:start

# Start MatrixOne with specified version ⭐
npm run mo:start -- v1.2.0
npm run mo:start -- 1.1.0
npm run mo:start -- nightly

# Stop MatrixOne
npm run mo:stop

# Check MatrixOne status
npm run mo:status

# Test MatrixOne connection
npm run mo:test

# View container logs (if startup fails)
docker logs mo-test

# Manually check running status
docker ps | grep mo-test
```

### Advanced Usage

```bash
# Custom database connection
npm run validate-docs-execution:files -- <file> \
  --db-host 192.168.1.100 \
  --db-port 6001 \
  --db-user root \
  --db-password 111

# View help
npm run validate-docs-execution -- --help
```

### Explanation of Execution Results

After execution validation, the report will display the following statistics:

```
📈 SQL Execution Statistics:
  ├─ ✅ Successfully executed: N       # Syntax and semantics correct, execution successful
  ├─ ⚠️  Warnings (missing tables only, ignorable): N   # Syntax correct, only missing tables/columns (tool automatically creates tables for validation, can be ignored)
  ├─ ⚠️  Warnings (need manual check): N   # Syntax correct, but other semantic issues exist (requires manual check)
  ├─ ❌ Errors: N                      # True syntax errors (must be fixed)
  └─ 📊 Total: N SQL statements
```

**Status Explanations**:
- ✅ **Successfully executed**: SQL is completely correct and executed successfully
- ⚠️ **Warnings (missing tables only, ignorable)**: SQL syntax is correct, but there are no table creation statements in the document. The tool will automatically create empty tables to verify syntax, which can be ignored
- ⚠️ **Warnings (need manual check)**: SQL syntax is correct, but execution still fails even after automatic table creation. May have permission, dependency, or other semantic issues that require manual check
- ❌ **Errors**: True SQL syntax errors that must be fixed

### Recommended Usage

```bash
# Daily development - validate SQL in modified files
npm run validate-docs-execution:files -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md --verbose

# Validate test files
npm run validate-docs-execution:files -- docs/MatrixOne/Test/context-completion-test.md
```

---

## 🎯 Punctuation Checking

```bash
# Check punctuation
npm run lint

# Automatically fix punctuation
npm run lint:fix
```
