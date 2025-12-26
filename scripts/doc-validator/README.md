# Documentation Validation Tool

A documentation validation tool that supports **Dead Link checking**, **SQL syntax validation**, and **SQL execution validation**.

## Commands

### 🔗 Dead Link Checking

```bash
# Single file
pnpm run check:links:file docs/MatrixOne/Test/test-pass.md

# Multiple files
pnpm run check:links:files docs/MatrixOne/Test/test-pass.md docs/MatrixOne/Test/test-fail.md

# Changed files
pnpm run check:links:changed
```

---

### 🧾 SQL Syntax Validation

Validates the **syntactic correctness** of SQL statements in documentation without executing them against a database.

```bash
# Single file
pnpm run check:sql-syntax:file docs/MatrixOne/Test/test-pass.md

# Multiple files
pnpm run check:sql-syntax:files docs/MatrixOne/Test/test-pass.md docs/MatrixOne/Test/test-fail.md

# Changed files
pnpm run check:sql-syntax:changed
```

---

### ▶️ SQL Execution Validation

Verifies the **executability and execution results** of SQL statements against a real database environment.

```bash
# Start database (latest nightly)
pnpm run db:start

# Start a specific version (prefer release, fallback to nightly)
pnpm run db:start 3.0.4

# Single file
pnpm run check:sql-exec:file docs/MatrixOne/Test/test-pass.md

# Multiple files
pnpm run check:sql-exec:files docs/MatrixOne/Test/test-pass.md docs/MatrixOne/Test/test-fail.md

# Changed files
pnpm run check:sql-exec:changed

# Stop database
pnpm run db:stop
```

