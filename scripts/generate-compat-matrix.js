#!/usr/bin/env node
/**
 * Build `docs/MatrixOne/Reference/mysql-compatibility-matrix.md` and
 * `mysql-compatibility-matrix.json` from the `mysql_compat` frontmatter across
 * all Reference pages.
 *
 * Outputs:
 *   - Markdown table (human-readable, merged Notes column)
 *   - JSON sidecar (agent-friendly, structured, filterable)
 */

import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseFrontmatter } from './doc-validator/checkers/compat-frontmatter.js'

const ROOT = 'docs/MatrixOne/Reference'
const OUTPUT_MD = 'docs/MatrixOne/Reference/mysql-compatibility-matrix.md'
const OUTPUT_JSON = 'docs/MatrixOne/Reference/mysql-compatibility-matrix.json'

const COMPAT_LABEL = {
  full: '✅ Full',
  partial: '⚠️ Partial',
  none: '❌ None',
  mo_only: '🟣 MatrixOne-only',
  unknown: '❓ Unknown',
}

const SOURCES = [
  { dir: 'SQL-Reference',            label: 'SQL Statements',      colName: 'Statement' },
  { dir: 'Functions-and-Operators',  label: 'Functions',           colName: 'Function' },
  { dir: 'Operators',                label: 'Operators',           colName: 'Operator' },
  { dir: 'Data-Types',               label: 'Data Types',          colName: 'Data Type' },
  { dir: 'Language-Structure',       label: 'Language Structure',  colName: 'Element' },
]

const SUBDIR_LABELS = {
  'Aggregate-Functions': 'Aggregate Functions',
  'Window-Functions': 'Window Functions',
  'system-ops': 'System Operations',
  'Data-Definition-Language': 'Data Definition Language (DDL)',
  'Data-Manipulation-Language': 'Data Manipulation Language (DML)',
  'Data-Query-Language': 'Data Query Language (DQL)',
  'Data-Control-Language': 'Data Control Language (DCL)',
  'date-time-data-types': 'Date/Time Data Types',
  'arithmetic-operators': 'Arithmetic Operators',
  'assignment-operators': 'Assignment Operators',
  'bit-functions-and-operators': 'Bit Functions and Operators',
  'cast-functions-and-operators': 'Cast Functions and Operators',
  'comparison-functions-and-operators': 'Comparison Functions and Operators',
  'flow-control-functions': 'Flow Control Functions',
  'logical-operators': 'Logical Operators',
}

/** Source-dir -> short prefix for entry IDs. */
const SOURCE_ID_PREFIX = {
  'SQL-Reference': 'sql',
  'Functions-and-Operators': 'func',
  'Operators': 'op',
  'Data-Types': 'dtype',
  'Language-Structure': 'lang',
}

function subdirLabel(dir) {
  return SUBDIR_LABELS[dir] || dir.replace(/-/g, ' ')
}

function categoryOf(relPath) {
  const parts = relPath.split('/')
  if (parts.length <= 1) return '__root__'
  return parts[0]
}

function cleanRelPath(sourceDir, relPath) {
  if (sourceDir === 'Operators') {
    const parts = relPath.split('/')
    if (parts[0] === 'operators') return parts.slice(1).join('/')
  }
  return relPath
}

/** Derive a stable machine-readable ID from a source-relative path. */
function entryId(sourceDir, relPath) {
  const prefix = SOURCE_ID_PREFIX[sourceDir] || sourceDir.toLowerCase()
  // Strip .md, replace path separators and dashes with dots
  const slug = cleanRelPath(sourceDir, relPath)
    .replace(/\.md$/, '')
    .replace(/[\/\\]/g, '.')
    .replace(/-/g, '_')
    .toLowerCase()
  return `${prefix}.${slug}`
}

/** Build the JSON structure consumed by agents. */
function buildJson(rowsBySource, totals) {
  const sections = []
  for (const source of SOURCES) {
    const rows = rowsBySource[source.dir]
    if (!rows || rows.length === 0) continue

    const categories = [...new Set(rows.map(r => r.category))]
    categories.sort((a, b) => {
      if (a === '__root__') return -1
      if (b === '__root__') return 1
      return a.localeCompare(b)
    })

    const cats = []
    for (const cat of categories) {
      const catRows = rows.filter(r => r.category === cat)
      const label = cat === '__root__' ? source.label : subdirLabel(cat)
      cats.push({
        id: cat === '__root__' ? '_root' : cat.toLowerCase().replace(/[\/\\]/g, '.').replace(/-/g, '_'),
        label,
        entries: catRows.map(r => ({
          id: entryId(source.dir, r.rel),
          title: r.title,
          path: `${ROOT}/${source.dir}/${r.rel}`,
          compat: r.compat,
          notes: [...(r.differs.length ? r.differs : []), ...(r.mo_only.length ? r.mo_only.map(s => `[MO-only] ${s}`) : [])],
        })).sort((a, b) => a.title.localeCompare(b.title)),
      })
    }

    sections.push({
      id: source.dir.toLowerCase(),
      label: source.label,
      summary: {
        full: rows.filter(r => r.compat === 'full').length,
        partial: rows.filter(r => r.compat === 'partial').length,
        none: rows.filter(r => r.compat === 'none').length,
        mo_only: rows.filter(r => r.compat === 'mo_only').length,
        unknown: rows.filter(r => r.compat === 'unknown').length,
      },
      categories: cats,
    })
  }

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total: Object.values(totals).reduce((a, b) => a + b, 0),
      full: totals.full || 0,
      partial: totals.partial || 0,
      none: totals.none || 0,
      mo_only: totals.mo_only || 0,
      unknown: totals.unknown || 0,
    },
    sections,
  }
}

async function scanSource(sourceDir) {
  const sourceRoot = `${ROOT}/${sourceDir}`
  const files = await glob(`${sourceRoot}/**/*.md`)
  const rows = []
  for (const file of files) {
    const rel = path.relative(sourceRoot, file)
    const raw = readFileSync(file, 'utf-8')
    const fm = parseFrontmatter(raw) || {}
    const displayRel = cleanRelPath(sourceDir, rel)
    rows.push({
      file,
      rel: displayRel,
      category: categoryOf(displayRel),
      title: fm.title || path.basename(displayRel, '.md'),
      compat: fm.mysql_compat || 'unknown',
      differs: Array.isArray(fm.differs_from_mysql) ? fm.differs_from_mysql : [],
      mo_only: Array.isArray(fm.mo_only) ? fm.mo_only : [],
    })
  }
  return rows
}

function escapeCell(s) {
  return String(s).replace(/\|/g, '\\|')
}

/** Render a single row's notes cell. Combines differs + mo_only when both present. */
function renderNotes(r) {
  const parts = []
  if (r.differs.length) parts.push(...r.differs)
  if (r.mo_only.length) {
    const labeled = r.mo_only.map(s => `[MO-only] ${s}`)
    parts.push(...labeled)
  }
  return parts.length ? parts.map(escapeCell).join('<br/>') : '—'
}

function renderSection(source, rows) {
  const out = []
  out.push(`## ${source.label}`)
  out.push('')

  const secTotals = rows.reduce((acc, r) => { acc[r.compat] = (acc[r.compat] || 0) + 1; return acc }, {})
  out.push('| Status | Count |')
  out.push('|---|---|')
  for (const key of ['full', 'partial', 'none', 'mo_only', 'unknown']) {
    if (secTotals[key]) out.push(`| ${COMPAT_LABEL[key]} | ${secTotals[key]} |`)
  }
  out.push(`| **Total** | **${rows.length}** |`)
  out.push('')

  const categories = [...new Set(rows.map(r => r.category))]
  categories.sort((a, b) => {
    if (a === '__root__') return -1
    if (b === '__root__') return 1
    return a.localeCompare(b)
  })

  for (const cat of categories) {
    const catRows = rows.filter(r => r.category === cat)
    const label = cat === '__root__' ? source.label : subdirLabel(cat)
    out.push(`### ${label}`)
    out.push('')
    out.push(`| ${source.colName} | MySQL Compat | Notes |`)
    out.push('|---|---|---|')
    catRows.sort((a, b) => a.title.localeCompare(b.title))
    for (const r of catRows) {
      const link = `[${escapeCell(r.title)}](./${source.dir}/${r.rel.replace(/\\/g, '/')})`
      const compat = COMPAT_LABEL[r.compat] || r.compat
      out.push(`| ${link} | ${compat} | ${renderNotes(r)} |`)
    }
    out.push('')
  }

  return out
}

async function main() {
  const allRows = []
  const rowsBySource = {}
  const sections = []

  for (const source of SOURCES) {
    const rows = await scanSource(source.dir)
    if (rows.length === 0) continue
    rowsBySource[source.dir] = rows
    allRows.push(...rows)
    sections.push(renderSection(source, rows))
  }

  const totals = allRows.reduce((acc, r) => { acc[r.compat] = (acc[r.compat] || 0) + 1; return acc }, {})

  // ---- Markdown output ----
  const out = []
  out.push('---')
  out.push('title: "MySQL Compatibility Matrix"')
  out.push('mysql_compat: full')
  out.push('---')
  out.push('')
  out.push('# MySQL Compatibility Matrix')
  out.push('')
  out.push('> Auto-generated from `mysql_compat` frontmatter across')
  out.push(`> ${SOURCES.map(s => `\`${ROOT}/${s.dir}/**\``).join(', ')}.`)
  out.push('> Do not edit by hand — re-run `node scripts/generate-compat-matrix.js`')
  out.push('> after updating any source page.')
  out.push('')
  out.push('## Summary')
  out.push('')
  out.push('| Status | Count |')
  out.push('|---|---|')
  for (const key of ['full', 'partial', 'none', 'mo_only', 'unknown']) {
    out.push(`| ${COMPAT_LABEL[key]} | ${totals[key] || 0} |`)
  }
  out.push(`| **Total** | **${allRows.length}** |`)
  out.push('')

  for (const section of sections) {
    out.push(...section)
  }

  writeFileSync(OUTPUT_MD, out.join('\n'), 'utf-8')
  console.log(`✓ Wrote ${OUTPUT_MD}`)

  // ---- JSON output (agent-friendly) ----
  const json = buildJson(rowsBySource, totals)
  writeFileSync(OUTPUT_JSON, JSON.stringify(json, null, 2), 'utf-8')
  console.log(`✓ Wrote ${OUTPUT_JSON}`)

  console.log(`  ${allRows.length} rows, distribution: ${Object.entries(totals).map(([k, v]) => `${k}=${v}`).join(', ')}`)
}

main().catch(err => { console.error(err); process.exit(1) })
