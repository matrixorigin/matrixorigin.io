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

#### Skipping Syntax Templates

The validator automatically detects and skips common syntax template patterns:

- **Angle bracket placeholders**: `<table_name>`, `<column_name>`, `<index_name>`
- **Ellipsis patterns**: `col1, col2, ...` or `(expr1, expr2, ...)`
- **Optional syntax markers**: `[WITH PARSER ...]`, `[ASC | DESC]`
- **Curly brace placeholders**: `{expr}`, `{value}`

For code blocks that cannot be auto-detected, use the `validator-ignore` comment:

```markdown
<!-- validator-ignore -->
```sql
CREATE FULLTEXT INDEX <index_name>
ON <table_name> (col1, col2, ...)
[WITH PARSER (default | ngram | json)];
\```
```

Or inline:

```markdown
```sql <!-- validator-ignore -->
MATCH (col1, col2, ...) AGAINST (expr [search_modifier]);
\```
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

