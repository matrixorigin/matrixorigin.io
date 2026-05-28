#!/usr/bin/env node
/**
 * Build `docs/MatrixOne/Reference/mysql-unsupported-features.md` listing
 * every MySQL feature that MatrixOne does not (fully) support.
 *
 * Two data sources:
 * 1. Auto-generated: every `differs_from_mysql` entry across
 *    `docs/MatrixOne/Reference/**` pages tagged `mysql_compat: partial`.
 * 2. Curated: a hand-maintained list of MySQL features that have no
 *    corresponding MatrixOne documentation page (triggers, stored procs,
 *    events, etc.).
 */

import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from './doc-validator/checkers/compat-frontmatter.js'

const ROOT = 'docs/MatrixOne/Reference'
const OUTPUT = 'docs/MatrixOne/Reference/mysql-unsupported-features.md'

// Curated list of MySQL features that MatrixOne does NOT support at all.
// These have no corresponding MatrixOne documentation page, so they cannot
// be auto-discovered from frontmatter. Each entry: { category, feature, note }
const CURATED = [
  // DDL
  { category: 'DDL', feature: 'ALTER DATABASE', note: 'No ALTER DATABASE support' },
  { category: 'DDL', feature: 'CREATE / DROP TRIGGER', note: 'Triggers are not supported' },
  { category: 'DDL', feature: 'CREATE / DROP EVENT', note: 'Event scheduler is not supported' },
  { category: 'DDL', feature: 'CREATE / DROP PROCEDURE', note: 'Stored procedures are not supported' },
  { category: 'DDL', feature: 'CREATE FUNCTION (SQL body)', note: 'Only Python UDFs and simple SQL functions are supported; MySQL-style compound-statement function bodies are not' },
  { category: 'DDL', feature: 'ALTER TABLE ... PARTITION', note: 'Partition management via ALTER TABLE is not supported' },
  { category: 'DDL', feature: 'ALTER TABLE ... ALGORITHM / LOCK', note: 'ALTER TABLE algorithm/lock hints are not supported' },
  { category: 'DDL', feature: 'ENGINE= clause in CREATE TABLE', note: 'ENGINE= clause is syntactically accepted but ignored; MatrixOne uses TAE exclusively' },
  { category: 'DDL', feature: 'CREATE TABLE ... TABLESPACE', note: 'Tablespace assignment is not supported' },
  { category: 'DDL', feature: 'CREATE TABLE with GENERATED columns', note: 'Generated (computed) columns are not supported' },
  { category: 'DDL', feature: 'CREATE TABLE with CHECK constraints', note: 'CHECK constraints are not enforced' },
  { category: 'DDL', feature: 'CREATE VIEW ... WITH CHECK OPTION', note: 'WITH CHECK OPTION is syntactically accepted but not enforced for views' },
  { category: 'DDL', feature: 'CREATE VIEW ... DEFINER / SQL SECURITY', note: 'DEFINER and SQL SECURITY clauses are not supported' },
  { category: 'DDL', feature: 'Materialized Views', note: 'CREATE MATERIALIZED VIEW is not supported' },
  { category: 'DDL', feature: 'Character sets and collations beyond utf8mb4/utf8mb4_bin', note: 'Only utf8mb4/utf8mb4_bin are functional; other charsets/collations (latin1, gbk, utf8, utf8mb3) are syntactically accepted but have no effect' },
  { category: 'DDL', feature: 'ALTER EVENT', note: 'Event body/schedule/status modification not supported (no event scheduler)' },
  { category: 'DDL', feature: 'ALTER FUNCTION (MySQL stored function)', note: 'Modifying MySQL-style stored function characteristics is not supported; ALTER FUNCTION in MatrixOne serves a different purpose' },
  { category: 'DDL', feature: 'ALTER INSTANCE', note: 'MySQL 8.0 instance reconfiguration (e.g. InnoDB redo log rotation) is not supported' },
  { category: 'DDL', feature: 'ALTER PROCEDURE', note: 'Modifying stored procedure characteristics is not supported (no stored procedures)' },
  { category: 'DDL', feature: 'ALTER RESOURCE GROUP', note: 'Resource group VCPU/thread priority management is not supported' },
  { category: 'DDL', feature: 'ALTER SERVER', note: 'FEDERATED engine server connection options are not supported' },
  { category: 'DDL', feature: 'ALTER TABLESPACE', note: 'Tablespace data file add/drop/rename is not supported' },
  { category: 'DDL', feature: 'CREATE RESOURCE GROUP', note: 'Resource group creation (VCPU affinity, thread priority) is not supported' },
  { category: 'DDL', feature: 'CREATE SERVER', note: 'FEDERATED engine remote server definitions are not supported' },
  { category: 'DDL', feature: 'CREATE SPATIAL REFERENCE SYSTEM', note: 'Custom spatial reference systems for GIS are not supported' },
  { category: 'DDL', feature: 'CREATE TABLESPACE', note: 'General/undo tablespace creation is not supported; MatrixOne manages storage automatically' },
  { category: 'DDL', feature: 'DROP RESOURCE GROUP', note: 'Resource group removal is not supported' },
  { category: 'DDL', feature: 'DROP SERVER', note: 'FEDERATED server definition removal is not supported' },
  { category: 'DDL', feature: 'DROP SPATIAL REFERENCE SYSTEM', note: 'SRS definition removal is not supported' },
  { category: 'DDL', feature: 'DROP TABLESPACE', note: 'Tablespace removal is not supported; MatrixOne manages storage automatically' },

  // DML
  { category: 'DML', feature: 'HANDLER statements', note: 'HANDLER OPEN / READ / CLOSE are not supported' },
  { category: 'DML', feature: 'LOAD XML', note: 'LOAD XML INFILE is not supported; use LOAD DATA for CSV/JSONL' },
  { category: 'DML', feature: 'CALL procedure_name()', note: 'Stored procedure execution is not supported' },
  { category: 'DML', feature: 'DO statement', note: 'DO expr [, expr] ... is not supported' },
  { category: 'DML', feature: 'IMPORT TABLE', note: 'MySQL 8.0 IMPORT TABLE (import InnoDB .ibd tablespace files) is not supported' },
  { category: 'DML', feature: 'Parenthesized Query Expressions', note: 'MySQL 8.0.19+ parenthesized query blocks with per-block ORDER BY / LIMIT are not supported' },
  { category: 'DML', feature: 'TABLE statement', note: 'MySQL 8.0.19+ TABLE tablename (equivalent to SELECT * FROM) is not supported' },
  { category: 'DML', feature: 'VALUES statement (DML)', note: 'MySQL 8.0.19+ VALUES row_constructor_list as standalone DML is not supported' },

  // DQL
  { category: 'DQL', feature: 'FULL JOIN / FULL OUTER JOIN', note: 'FULL JOIN is not supported; emulate with LEFT JOIN UNION RIGHT JOIN' },

  // DCL
  { category: 'DCL', feature: 'GRANT with PROXY', note: 'PROXY user grants are not supported' },
  { category: 'DCL', feature: 'RENAME USER', note: 'RENAME USER is not supported; use ALTER USER instead' },
  { category: 'DCL', feature: 'SET PASSWORD', note: 'SET PASSWORD is syntactically accepted but does not change the password; use ALTER USER instead' },
  { category: 'DCL', feature: 'SQL modes beyond ONLY_FULL_GROUP_BY', note: 'Only ONLY_FULL_GROUP_BY has actual effect; other SQL modes (STRICT_TRANS_TABLES, NO_ZERO_DATE, NO_ENGINE_SUBSTITUTION, etc.) are syntax-only with no behavioral impact' },
  { category: 'DCL', feature: 'Connection limit clauses (MAX_USER_CONNECTIONS, MAX_QUERIES_PER_HOUR, etc.)', note: 'ALTER USER account resource limit clauses are not honored' },
  { category: 'DCL', feature: 'IP whitelisting for user accounts', note: 'Connection IP whitelisting / host-based access control is not supported' },

  // Data Types
  { category: 'Data Types', feature: 'Spatial types (GEOMETRY, POINT, LINESTRING, POLYGON, etc.)', note: 'Spatial type names are syntactically accepted but non-functional (no spatial operations or GIS functions work)' },
  { category: 'Data Types', feature: 'MEDIUMINT', note: 'MEDIUMINT is syntactically accepted but treated as INT; prefer explicit INT or SMALLINT for clarity' },
  { category: 'Data Types', feature: 'Year type (with 2-digit format)', note: 'YEAR(2) is not supported; only YEAR(4) / YEAR is available' },
  { category: 'Data Types', feature: 'BIT(M) with M > 64', note: 'BIT type is supported but length limits may differ' },
  { category: 'Data Types', feature: 'ENUM sorting and filtering', note: 'ENUM values can only be compared with strings in WHERE conditions; ENUM filtering and sorting are not supported' },
  { category: 'Data Types', feature: 'DECIMAL precision limits', note: 'DECIMAL(P, D) accepts P up to at least 65 but precision enforcement may differ from MySQL; verify exact behavior for financial applications requiring high precision' },

  // Indexes and Constraints
  { category: 'Indexes & Constraints', feature: 'SPATIAL INDEX', note: 'Spatial indexes are not supported' },
  { category: 'Indexes & Constraints', feature: 'FULLTEXT INDEX (MySQL native syntax)', note: 'MatrixOne has its own full-text index syntax (CREATE FULLTEXT INDEX) that differs from MySQL' },
  { category: 'Indexes & Constraints', feature: 'FOREIGN KEY ... ON DELETE SET DEFAULT / ON UPDATE SET DEFAULT', note: 'SET DEFAULT referential action is not supported (CASCADE and SET NULL work)' },
  { category: 'Indexes & Constraints', feature: 'Index hints (USE INDEX, FORCE INDEX, IGNORE INDEX)', note: 'Index hints in SELECT statements are not supported' },
  { category: 'Indexes & Constraints', feature: 'Descending indexes', note: 'DESC in index column definitions is not supported' },
  { category: 'Indexes & Constraints', feature: 'Functional / expression indexes', note: 'Indexes on expressions are not supported' },
  { category: 'Indexes & Constraints', feature: 'Invisible indexes', note: 'ALTER INDEX ... INVISIBLE is not supported' },

  // Storage Engine
  { category: 'Storage Engine', feature: 'InnoDB storage engine', note: 'MatrixOne uses TAE (Transactional Analytical Engine) instead of InnoDB; ENGINE= clause is ignored' },
  { category: 'Storage Engine', feature: 'MyISAM / MEMORY / ARCHIVE / CSV engines', note: 'Only the TAE engine is available; alternative storage engines are not supported' },

  // Partitioning
  { category: 'Partitioning', feature: 'Subpartitioning', note: 'Subpartitioning is not supported' },
  { category: 'Partitioning', feature: 'Partition management (REORGANIZE, COALESCE, EXCHANGE, etc.)', note: 'MySQL partition management operations are not supported' },

  // Transactions
  { category: 'Transactions', feature: 'SAVEPOINT / ROLLBACK TO SAVEPOINT', note: 'Savepoints within transactions are not supported' },
  { category: 'Transactions', feature: 'RELEASE SAVEPOINT', note: 'Releasing a transaction savepoint is not supported (no savepoints)' },
  { category: 'Transactions', feature: 'XA transactions (distributed transactions)', note: 'XA START / XA END / XA PREPARE / XA COMMIT are not supported; MatrixOne uses its own distributed transaction model' },
  { category: 'Transactions', feature: 'LOCK TABLES / UNLOCK TABLES', note: 'LOCK TABLES / UNLOCK TABLES is syntactically accepted but does not enforce actual table-level locks' },
  { category: 'Transactions', feature: 'LOCK INSTANCE FOR BACKUP / UNLOCK INSTANCE', note: 'MySQL 8.0 backup-oriented global instance locks are not supported' },
  { category: 'Transactions', feature: 'FLUSH TABLES WITH READ LOCK', note: 'Global read locks are not supported' },
  { category: 'Transactions', feature: 'SET operations within transactions', note: 'SET variable assignments are not allowed within an active transaction block' },

  // Replication & Binary Log
  { category: 'Replication', feature: 'Binary log (binlog)', note: 'MySQL binary log and related statements are not supported; MatrixOne uses its own CDC mechanism' },
  { category: 'Replication', feature: 'SHOW BINARY LOGS / SHOW MASTER LOGS', note: 'Listing binary log files on the server is not supported' },
  { category: 'Replication', feature: 'SHOW BINLOG EVENTS', note: 'Displaying events in a binary log is not supported' },
  { category: 'Replication', feature: 'SHOW MASTER STATUS', note: 'Showing source server binary log position is not supported' },
  { category: 'Replication', feature: 'PURGE BINARY LOGS', note: 'Deleting binary log files is not supported' },
  { category: 'Replication', feature: 'SHOW REPLICA STATUS / SHOW SLAVE STATUS', note: 'Showing replica server status is not supported' },
  { category: 'Replication', feature: 'SHOW REPLICAS / SHOW SLAVE HOSTS', note: 'Listing registered replicas is not supported' },
  { category: 'Replication', feature: 'SHOW RELAYLOG EVENTS', note: 'Displaying relay log events is not supported' },
  { category: 'Replication', feature: 'CHANGE MASTER TO / START SLAVE / STOP SLAVE', note: 'MySQL replication protocol (source/replica management) is not supported; MatrixOne has mo_cdc and pub/sub instead' },
  { category: 'Replication', feature: 'RESET MASTER / RESET SLAVE', note: 'MySQL replication management commands are not supported' },
  { category: 'Replication', feature: 'CLONE LOCAL DATA DIRECTORY', note: 'MySQL 8.0 clone plugin local cloning is not supported' },
  { category: 'Replication', feature: 'CLONE INSTANCE', note: 'MySQL 8.0 clone plugin remote cloning is not supported' },

  // SHOW Statements
  { category: 'SHOW Statements', feature: 'SHOW TRIGGER', note: 'Not supported (no triggers in MatrixOne)' },
  { category: 'SHOW Statements', feature: 'SHOW EVENTS', note: 'Not supported (no event scheduler)' },
  { category: 'SHOW Statements', feature: 'SHOW PROCEDURE STATUS', note: 'Not supported (no stored procedures)' },
  { category: 'SHOW Statements', feature: 'SHOW ENGINE', note: 'Not supported; MatrixOne does not expose storage engine internals' },
  { category: 'SHOW Statements', feature: 'SHOW ENGINES', note: 'Accepted syntactically but produces empty result set; MatrixOne uses TAE exclusively' },
  { category: 'SHOW Statements', feature: 'SHOW STATUS', note: 'Accepted syntactically but produces empty output' },
  { category: 'SHOW Statements', feature: 'SHOW PRIVILEGES', note: 'Accepted syntactically but produces empty output' },
  { category: 'SHOW Statements', feature: 'SHOW CHARACTER SET', note: 'Accepted syntactically but returns empty result set; only utf8mb4 charset is available' },
  { category: 'SHOW Statements', feature: 'SHOW PROFILE / SHOW PROFILES', note: 'Query profiling via SHOW PROFILE is not supported' },
  { category: 'SHOW Statements', feature: 'SHOW OPEN TABLES', note: 'Not supported' },
  { category: 'SHOW Statements', feature: 'SHOW PLUGINS', note: 'Not supported' },
  { category: 'SHOW Statements', feature: 'SHOW ERRORS / SHOW WARNINGS', note: 'Results differ significantly from MySQL due to different implementation' },
  { category: 'SHOW Statements', feature: 'SHOW CREATE USER', note: 'Not supported; returns a parser error' },
  { category: 'SHOW Statements', feature: 'SHOW CREATE EVENT', note: 'Not supported (no event scheduler)' },
  { category: 'SHOW Statements', feature: 'SHOW CREATE PROCEDURE', note: 'Not supported (no stored procedures)' },
  { category: 'SHOW Statements', feature: 'SHOW CREATE TRIGGER', note: 'Not supported (no triggers)' },
  { category: 'SHOW Statements', feature: 'SHOW FUNCTION CODE', note: 'Not supported (no stored function internals to display)' },
  { category: 'SHOW Statements', feature: 'SHOW PROCEDURE CODE', note: 'Not supported (no stored procedure internals to display)' },

  // System & Administration
  { category: 'Administration', feature: 'FLUSH statements (FLUSH LOGS, FLUSH TABLES, FLUSH PRIVILEGES, etc.)', note: 'FLUSH operations are not supported; privilege changes take effect without FLUSH PRIVILEGES' },
  { category: 'Administration', feature: 'CACHE INDEX / LOAD INDEX INTO CACHE', note: 'Key cache management is not supported' },
  { category: 'Administration', feature: 'CHECKSUM TABLE', note: 'Not supported' },
  { category: 'Administration', feature: 'OPTIMIZE TABLE', note: 'Not supported; MatrixOne handles storage optimization automatically' },
  { category: 'Administration', feature: 'REPAIR TABLE', note: 'Not supported' },
  { category: 'Administration', feature: 'CHECK TABLE', note: 'Not supported' },
  { category: 'Administration', feature: 'mysql.* system database', note: 'The mysql system database is not accessible; MatrixOne has its own system metadata tables (mo_catalog)' },
  { category: 'Administration', feature: 'INFORMATION_SCHEMA (full)', note: 'INFORMATION_SCHEMA tables are present but most return empty result sets' },
  { category: 'Administration', feature: 'PERFORMANCE_SCHEMA', note: 'Performance Schema is not available' },
  { category: 'Administration', feature: 'INSTALL PLUGIN / UNINSTALL PLUGIN', note: 'Plugin system is not supported' },
  { category: 'Administration', feature: 'INSTALL COMPONENT / UNINSTALL COMPONENT', note: 'Component system is not supported' },
  { category: 'Administration', feature: 'RESET / RESET PERSIST', note: 'System variable persistence management is not supported' },
  { category: 'Administration', feature: 'RESTART', note: 'RESTART server statement is not supported' },
  { category: 'Administration', feature: 'SHUTDOWN', note: 'Server shutdown statement is not supported' },
  { category: 'Administration', feature: 'BINLOG statement', note: 'The BINLOG statement for executing events decoded from a binary log is not supported' },
  { category: 'Administration', feature: 'HELP statement', note: 'HELP command for SQL syntax reference is not supported' },

  // Functions & Operators
  { category: 'Functions', feature: 'MySQL native full-text search functions (MATCH ... AGAINST)', note: 'MatrixOne full-text search uses different syntax; MySQL MATCH AGAINST is not available' },
  { category: 'Functions', feature: 'Window functions: NTILE, FIRST_VALUE, LAST_VALUE, NTH_VALUE, LEAD, LAG', note: 'Some MySQL window functions are not yet supported in MatrixOne' },
  { category: 'Functions', feature: 'GIS / spatial functions', note: 'ST_* spatial functions are not supported (no spatial data types)' },
  { category: 'Functions', feature: 'XML functions (ExtractValue, UpdateXML)', note: 'XML processing functions are not supported' },
  { category: 'Functions', feature: 'Performance Schema functions', note: 'FORMAT_BYTES, FORMAT_PICO_TIME, PS_THREAD_ID, etc. are not available' },
  { category: 'Functions', feature: 'GROUPING()', note: 'GROUPING function for ROLLUP identification may behave differently' },
  { category: 'Functions', feature: 'JSON functions (bulk missing)', note: 'Only ~8 JSON functions supported (JSON_UNQUOTE, JSON_QUOTE, JSON_EXTRACT, JSON_SET, JSON_ROW, etc.) vs MySQL 30+. Missing: JSON_OBJECT, JSON_ARRAY, JSON_MERGE, JSON_SEARCH, JSON_CONTAINS, JSON_KEYS, JSON_LENGTH, JSON_TYPE, JSON_VALID, JSON_TABLE, JSON_ARRAYAGG, JSON_OBJECTAGG, and more' },
  { category: 'Functions', feature: 'GET_LOCK() / RELEASE_LOCK()', note: 'Advisory (user-level) locks are not supported' },
  { category: 'Functions', feature: 'BENCHMARK()', note: 'BENCHMARK(count, expr) function for measuring SQL execution speed is not supported' },

  // Tools
  { category: 'Tools', feature: 'mysql_upgrade', note: 'Database upgrade tool is not available; MatrixOne has its own upgrade procedure' },
  { category: 'Tools', feature: 'mysqlcheck', note: 'Table checking/repair tool is not available' },
  { category: 'Tools', feature: 'mysqlbinlog', note: 'Binary log utility is not available' },
  { category: 'Tools', feature: 'mysqlpump / mysqldump', note: 'Use mo_dump for MatrixOne logical backups' },
  { category: 'Tools', feature: 'mysqlslap', note: 'Load testing client is not available' },
  { category: 'Tools', feature: 'mysql_config_editor', note: 'Login path configuration is not available' },
  { category: 'Tools', feature: 'xtrabackup', note: 'Physical backup uses mo_br instead; xtrabackup / mariabackup are not compatible' },
]

const CATEGORY_LABEL = {
  'DDL': 'DDL — Data Definition Language',
  'DML': 'DML — Data Manipulation Language',
  'DCL': 'DCL — Data Control Language',
  'Data Types': 'Data Types',
  'Indexes & Constraints': 'Indexes & Constraints',
  'Storage Engine': 'Storage Engine',
  'Partitioning': 'Partitioning',
  'Transactions': 'Transactions',
  'Replication': 'Replication & Binary Log',
  'SHOW Statements': 'SHOW Statements',
  'Administration': 'System & Administration',
  'Functions': 'Functions & Operators',
  'Tools': 'Peripheral Tools',
}

function categoryOf(relPath) {
  const parts = relPath.split('/')
  if (parts.length <= 1) return null
  const dir = parts[0]
  const map = {
    'SQL-Reference': null,
    'Data-Types': 'Data Types',
    'Functions-and-Operators': 'Functions',
    'Operators': 'Operators',
    'Variable': 'System Variables',
    'System-Parameters': 'System Parameters',
    'Language-Structure': 'Language Structure',
    'Limitations': 'Limitations',
    'mo-tools': 'Tools',
  }
  if (dir in map) return map[dir]
  return null
}

function sqlCategoryOf(relPath) {
  const parts = relPath.split('/')
  if (parts.length <= 1) return '__root__'
  const dir = parts[0]
  const map = {
    'Data-Definition-Language': 'DDL',
    'Data-Manipulation-Language': 'DML',
    'Data-Query-Language': 'DQL',
    'Data-Control-Language': 'DCL',
    'Other': 'Other',
  }
  return map[dir] || 'Other'
}

async function main() {
  const files = await glob(`${ROOT}/**/*.md`)
  const autoRows = []

  for (const file of files) {
    if (file.includes('mysql-compatibility-matrix.md')) continue
    if (file.includes('mysql-unsupported-features.md')) continue
    const raw = readFileSync(file, 'utf-8')
    const fm = parseFrontmatter(raw) || {}
    if (fm.mysql_compat !== 'partial' && fm.mysql_compat !== 'none') continue

    const differs = Array.isArray(fm.differs_from_mysql) ? fm.differs_from_mysql : []
    if (differs.length === 0 && fm.mysql_compat !== 'none') continue

    const rel = path.relative(ROOT, file)
    const title = fm.title || rel.replace(/\.md$/, '')

    let cat
    if (rel.startsWith('SQL-Reference/')) {
      const sqlRel = rel.replace('SQL-Reference/', '')
      cat = sqlCategoryOf(sqlRel)
    } else {
      cat = categoryOf(rel)
    }
    if (!cat) cat = 'Other'

    for (const d of differs) {
      autoRows.push({
        category: cat,
        feature: title,
        note: d,
        sourcePage: rel,
        curated: false,
      })
    }

    if (fm.mysql_compat === 'none' && differs.length === 0) {
      autoRows.push({
        category: cat,
        feature: title,
        note: 'Not supported (mysql_compat: none)',
        sourcePage: rel,
        curated: false,
      })
    }
  }

  const groups = new Map()
  for (const row of autoRows) {
    const key = row.category
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  const out = []
  out.push('---')
  out.push('title: "MySQL Features Not Supported by MatrixOne"')
  out.push('description: "Comprehensive list of MySQL features and syntax that MatrixOne does not (fully) support."')
  out.push('---')
  out.push('')
  out.push('# MySQL Features Not Supported by MatrixOne')
  out.push('')
  out.push('> This page lists MySQL features and SQL syntax that MatrixOne either')
  out.push('> does not support at all (**Completely Missing**) or supports with')
  out.push('> documented differences (**Partial Support**).')
  out.push('>')
  out.push('> - **Completely Missing** entries are curated manually for MySQL features')
  out.push('>   that have no corresponding MatrixOne documentation page.')
  out.push('> - **Partial Support** entries are extracted from `differs_from_mysql`')
  out.push('>   frontmatter on `mysql_compat: partial` pages under `docs/MatrixOne/Reference/**`.')
  out.push('')

  const curatedCount = CURATED.length
  const autoCount = autoRows.length
  out.push('## Summary')
  out.push('')
  out.push(`| Source | Count |`)
  out.push(`|---|---|`)
  out.push(`| Completely Missing (curated) | ${curatedCount} |`)
  out.push(`| Partial Support | ${autoCount} |`)
  out.push(`| **Total** | **${curatedCount + autoCount}** |`)
  out.push('')

  out.push('## Completely Missing')
  out.push('')
  out.push('These MySQL features have no MatrixOne counterpart and are not available in any form.')
  out.push('')

  const curatedGroups = new Map()
  for (const item of CURATED) {
    const key = item.category
    if (!curatedGroups.has(key)) curatedGroups.set(key, [])
    curatedGroups.get(key).push(item)
  }

  const curatedCategoryOrder = [
    'DDL', 'DML', 'DCL', 'Data Types', 'Indexes & Constraints',
    'Storage Engine', 'Partitioning', 'Transactions', 'Replication',
    'SHOW Statements', 'Administration', 'Functions', 'Tools',
  ]

  for (const cat of curatedCategoryOrder) {
    const items = curatedGroups.get(cat)
    if (!items || items.length === 0) continue
    const label = CATEGORY_LABEL[cat] || cat
    out.push(`### ${label}`)
    out.push('')
    out.push('| Feature | Note |')
    out.push('|---|---|')
    for (const item of items) {
      out.push(`| ${escapeCell(item.feature)} | ${escapeCell(item.note)} |`)
    }
    out.push('')
  }

  for (const [cat, items] of curatedGroups) {
    if (curatedCategoryOrder.includes(cat)) continue
    const label = CATEGORY_LABEL[cat] || cat
    out.push(`### ${label}`)
    out.push('')
    out.push('| Feature | Note |')
    out.push('|---|---|')
    for (const item of items) {
      out.push(`| ${escapeCell(item.feature)} | ${escapeCell(item.note)} |`)
    }
    out.push('')
  }

  out.push('## Partial Support')
  out.push('')
  out.push('These MySQL features are partially supported by MatrixOne with documented differences.')
  out.push('Each row links to the relevant MatrixOne documentation page for full details.')
  out.push('')

  const autoCategoryOrder = ['DDL', 'DML', 'DQL', 'DCL', 'Other']

  for (const cat of autoCategoryOrder) {
    const rows = groups.get(cat)
    if (!rows || rows.length === 0) continue
    const label = CATEGORY_LABEL[cat] || cat
    out.push(`### ${label}`)
    out.push('')
    out.push('| Statement | Difference from MySQL |')
    out.push('|---|---|')
    rows.sort((a, b) => a.feature.localeCompare(b.feature))
    for (const r of rows) {
      const link = `[${escapeCell(r.feature)}](./${r.sourcePage.replace(/\\/g, '/')})`
      out.push(`| ${link} | ${escapeCell(r.note)} |`)
    }
    out.push('')
  }

  for (const [cat, rows] of groups) {
    if (autoCategoryOrder.includes(cat)) continue
    const label = CATEGORY_LABEL[cat] || cat
    out.push(`### ${label}`)
    out.push('')
    out.push('| Statement | Difference from MySQL |')
    out.push('|---|---|')
    rows.sort((a, b) => a.feature.localeCompare(b.feature))
    for (const r of rows) {
      const link = `[${escapeCell(r.feature)}](./${r.sourcePage.replace(/\\/g, '/')})`
      out.push(`| ${link} | ${escapeCell(r.note)} |`)
    }
    out.push('')
  }

  writeFileSync(OUTPUT, out.join('\n'), 'utf-8')
  console.log(`✓ Wrote ${OUTPUT}`)
  console.log(`  Curated: ${curatedCount} entries across ${curatedGroups.size} categories`)
  console.log(`  Auto-extracted: ${autoCount} entries across ${groups.size} categories`)
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|')
}

main().catch(err => { console.error(err); process.exit(1) })
