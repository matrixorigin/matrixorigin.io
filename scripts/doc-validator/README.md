# MatrixOne Documentation Validation Tool

## 📖 Introduction
This is an automated validation tool designed specifically for MatrixOne documentation, helping contributors identify and fix issues in documents before submitting PRs.

### Core Features
- 🔗 **Dead Link Check** - Automatically detect broken links in documents
- 📝 **SQL Syntax Validation** - Verify the syntax correctness of SQL code blocks using node-sql-parser
- 🚀 **SQL Execution Validation** - Connect to a real MatrixOne database, execute SQL statements, and compare results against expected outputs
- 🔍 **Version Detection** - Intelligently identify the required MatrixOne version for documents, with CI automatically using the corresponding version for testing
- 🎯 **Punctuation Check** - Standardize punctuation usage across all documentation

### Why This Tool is Essential
- ✅ **Catch Errors Early** - Automatically detect issues before PR merging to prevent bugs from entering the main branch
- ✅ **Reduce Maintenance Costs** - Minimize manual review workload and focus on content quality
- ✅ **Ensure Documentation Quality** - Guarantee that all SQL examples can be executed correctly
- ✅ **Zero Learning Curve** - Transparent to contributors with no additional configuration required; runs automatically in CI

### Quick Start
```bash
# 1. Validate modified documents (most commonly used)
npm run validate-docs:changed

# 2. Check for broken links
npm run check:links:changed

# 3. SQL execution validation (requires MatrixOne to be started first)
npm run mo:start                           # Start the database
npm run validate-docs:execution:changed    # Validate SQL
npm run mo:stop                            # Stop the database
```

---

**Detailed Command Reference** - All Available Commands

---

## 🔍 Version Detection

### Automatically Detect Required MO Versions for Documents
```bash
# Detect versions required by all documents
npm run detect-versions

# Detect versions required only by changed files (recommended)
npm run detect-versions:changed

# Detect version for a specific file
npm run detect-versions -- <file-path>

# Detect versions for multiple files
npm run detect-versions -- <file1> <file2> <file3>

# Simplified output (display only version list separated by spaces)
npm run detect-versions -- --simple
```

### Mark Versions in Documents
If SQL requires a specific version of MatrixOne, add a version tag at the beginning of the document:
```markdown
<!-- version: v1.2.0 -->
```
Or
```markdown
<!-- mo-version: v1.2.0 -->
```
Or
```markdown
**Version**: v1.2.0
```

**Notes**:
- ✅ If no version is marked, CI will use the `latest` version for testing
- ✅ After marking, CI will automatically use the corresponding MatrixOne version for testing
- ✅ Fully transparent to contributors with no manual version management required
- ✅ Supports placement anywhere within the first 20 lines of the document

### Usage Scenarios
```bash
# Scenario 1: Check which versions are required for the current PR
npm run detect-versions:changed

# Scenario 2: Check required version for a specific document
npm run detect-versions -- docs/MatrixOne/Develop/SQL/ddl.md

# Scenario 3: Automatic detection in CI (runs automatically in GitHub Actions)
# No manual operation required; triggers automatically after PR submission
```

---

## 🔗 Dead Link Check

### Basic Commands
```bash
# Check links in all documents (slow, comprehensive)
npm run check:links

# Display only errors, not successes (recommended)
npm run check:links:quiet

# Quick test - check only the first 10 documents
npm run check:links:sample

# Check only modified files (use before submission)
npm run check:links:changed
```

### Recommended Usage
```bash
# Daily development - check your modifications
npm run check:links:changed
```

---

## 📝 SQL Syntax Validation

### Basic Commands
```bash
# Validate SQL syntax for a specific file
npm run validate-docs -- <file-path>

# Validate multiple files
npm run validate-docs -- <file1> <file2> <file3>

# Validate SQL syntax for all documents (slow, comprehensive)
npm run validate-docs

# Validate only modified files (fast, recommended)
npm run validate-docs:changed

# Validate first 50 documents (medium speed)
npm run validate-docs:sample

# Validate first 10 documents (ultra-fast)
npm run validate-docs:quick

# Customize validation quantity
npm run validate-docs -- --limit 20

# Custom quantity + verbose mode
npm run validate-docs -- --limit 20 --verbose

# View help documentation
npm run validate-docs -- --help
```

### Recommended Usage
```bash
# Daily development - validate a single file
npm run validate-docs -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md

# Daily development - validate your modifications
npm run validate-docs:changed

# Quick test - verify tool functionality
npm run validate-docs:sample
```

---

## 🚀 SQL Execution Validation

### Basic Commands
```bash
# Validate SQL for a specific file (requires MatrixOne database)
npm run validate-docs:execution -- <file-path>

# Validate only changed files ⭐ (most commonly used)
npm run validate-docs:execution:changed

# Full validation (check all documents)
npm run validate-docs:all

# Verbose output mode (display execution results for each SQL statement)
npm run validate-docs:execution -- <file-path> --verbose
```

### Environment Preparation
```bash
# Method 1: Start MatrixOne using script (recommended)
# Pull latest version by default
npm run mo:start

# Start with specified version (supports any version number) ⭐
npm run mo:start -- v1.2.0
npm run mo:start -- 1.1.0
npm run mo:start -- nightly

# Or specify version using environment variable
MO_VERSION=v1.2.0 npm run mo:start

# Method 2: Start Docker manually
docker run -d -p 6001:6001 --name mo-test matrixorigin/matrixone:latest

# Method 3: Locally installed MatrixOne
# Ensure it runs on 127.0.0.1:6001 with username root and password 111
```

### Database Management Commands
```bash
# Start MatrixOne (latest version by default)
npm run mo:start

# Start specified version of MatrixOne ⭐
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
npm run validate-docs:execution -- <file> \
  --db-host 192.168.1.100 \
  --db-port 6001 \
  --db-user root \
  --db-password 111

# View help
npm run validate-docs:execution -- --help
```

### Execution Result Explanation
After execution validation, the report displays the following statistics:
```
📈 SQL Execution Statistics:
  ├─ ✅ Successfully executed: N       # Correct syntax and semantics; execution succeeded
  ├─ ⚠️  Warnings (missing tables only, ignorable): N   # Correct syntax; only missing tables/columns (tool auto-creates tables for validation; can be ignored)
  ├─ ⚠️  Warnings (need manual check): N   # Correct syntax but other semantic issues after auto table creation; requires manual review
  ├─ ❌ Errors: N                      # Actual syntax errors (must be fixed)
  └─ 📊 Total: N SQL statements
```

**Status Explanations**:
- ✅ **Successfully executed**: SQL is completely correct and executed successfully
- ⚠️ **Warnings (missing tables only, ignorable)**: SQL syntax is correct, but table creation statements are missing in the document. The tool automatically creates empty tables for validation, which can be ignored
- ⚠️ **Warnings (need manual check)**: SQL syntax is correct, but execution still fails even after automatic table creation. This may be due to permission issues, dependencies, or other semantic problems and requires manual review
- ❌ **Errors**: Actual SQL syntax errors that must be fixed

### Recommended Usage
```bash
# Daily development - validate modified SQL
npm run validate-docs:execution -- docs/MatrixOne/Develop/import-data/bulk-load/load-data.md --verbose

# Validate test files
npm run validate-docs:execution -- docs/MatrixOne/Test/context-completion-test.md
```

---

## 🎯 Punctuation Check
```bash
# Check punctuation
npm run lint

# Automatically fix punctuation issues
npm run lint:fix
```

---