import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { argv, exit } from 'node:process'
import { readFileSync, writeFileSync } from 'node:fs'

import glob from 'fast-glob'

/** Equivalent to the built-in `__dirname` property in the `commonjs` module system. */
const __dirname = dirname(fileURLToPath(import.meta.url))

/** CLI args */
const options = parseArgv(argv)

/** The pattern to match docs.  */
const DOCS_PATTERN = './docs/MatrixOne/**/*.md'

/**
 * Map of half or full width punctuations
 * @type {Array<[RegExp, string]>}
 */
const PUNCTUATION_MAP = [
  // 逗号、顿号
  [/，|、/g, ','],

  // 句号
  [/。/g, '.'],

  // 问号
  [/？/g, '?'],

  // 冒号
  [/：/g, ':'],

  // 分号
  [/；/g, ';'],

  // 单引号
  [/‘|’/g, `'`],

  // 双引号
  [/“|”/g, '"'],

  // 圆括号
  [/（/g, '('],
  [/）/g, ')'],

  // 方括号
  [/【/g, '['],
  [/】/g, ']'],

  // 尖括号
  [/《/g, '<'],
  [/》/g, '>'],

  // 省略号
  [/…{1, 2}/g, '...'],
]

/**
 * Checker pattern.
 * @example  
 * `/，|、|。|？|：|；|‘|’|“|”|（|）|【|】|《|》|…{1, 2}/`
 */
const CHECKER_PATTERN = new RegExp(
  PUNCTUATION_MAP.map(([k]) => k.source).join('|')
)

main()

/**
 * Main entry.
 */
async function main() {
  /** Relative Paths */
  const relPaths = await glob(DOCS_PATTERN)
  /** Autofix or not. */
  const fix = options.fix ?? false

  iterateFiles(relPaths, fixPunctuation, fix)
}

/**
 * Iterate docs.
 * @param {string[]} relPaths Relative paths of the docs.
 * @param {Function} processer Utility to process the text content.
 * @param {boolean} fix Whether to autofix the content.
 */
function iterateFiles(relPaths, processer, fix) {
  if (fix) {
    console.log(`Punctuation Linting (fix mode):`)
  } else {
    console.log(`Punctuation Linting:`)
  }

  /** The total number of fixed files. */
  let fixedFileCount = 0
  /** The error flag. */
  let errFlag = false
  /** The total number of files with error(s). */
  let errFileCount = 0
  /** The total number of error(s). */
  let errCount = 0
  for (const relPath of relPaths) {
    const absPath = resolveAbsPath(relPath)
    const fileContent = readFileSync(absPath, { encoding: 'utf8' })
    if (!CHECKER_PATTERN.test(fileContent)) {
      console.log(`[start] ${relPath} ✅`)
      continue
    }
    if (fix) {
      const fixedContent = processer(fileContent)
      writeFileSync(absPath, fixedContent)
      ++fixedFileCount

      console.log(`[start] ${relPath} 🔧`)
    } else {
      errFlag = true
      errFileCount++

      const coordinates = coordinatesOfChars(CHECKER_PATTERN, fileContent)
      errCount += coordinates.length

      console.log(`[start] ${relPath} ❌`)
      for (const [lineNumber, colNumber, char] of coordinates) {
        console.log(`       📌 ${relPath}:${lineNumber}:${colNumber}\t${char}`)
      }
    }
  }

  console.log(`Scanning: ${relPaths.length} file(s)`)
  console.log(`Finding: ${DOCS_PATTERN}`)

  if (!fix) {
    if (errFlag) {
      console.log(`Summary: ${errCount} error(s) in ${errFileCount} file(s) found. Please check the log above.\n`)

      exit(1)
    } else {
      console.log(`No error found.\n`)
    }
  } else {
    if (!fixedFileCount) {
      console.log(`No error found.\n`)
    } else {
      console.log(`Summary: ${fixedFileCount} file(s) fixed\n`)
    }
  }
}

/**
 * Resolve the absolute path of the argument.
 * @param {string} relPath
 * @returns {string} The absolute file path.
 */
function resolveAbsPath(relPath) {
  return join(__dirname + '/../', relPath)
}

/**
 * Replace full-width punctuations.
 * @param {string} content
 */
function fixPunctuation(content) {
  let result = content
  for (const [k, v] of PUNCTUATION_MAP) {
    result = result.replace(k, v)
  }
  return result
}

/**
 * Get coordinates of chars satisfying the given pattern from body of text.
 * @param {RegExp} pattern The pattern which the char matches.
 * @param {string} text Body of the text.
 * @returns A tuple of line number, column number and the char.
 */
function coordinatesOfChars(pattern, text) {
  const result = []
  const globalPattern = new RegExp(pattern.source, 'g')
  const matches = text.matchAll(globalPattern)

  for (const match of matches) {
    const anchor = match.index
    const lines = text.substring(0, anchor + 1).split('\n')
    const lineNumber = lines.length
    const colNumber = lines.at(-1).length + 1
    result.push([lineNumber, colNumber, text[anchor]])
  }

  return result
}

/**
 * Parse CLI arguments.
 * @param {Array<string>} argv
 */
function parseArgv(argv) {
  const cpy = [...argv],
    options = {}

  while (cpy.length > 2) {
    const [flag] = cpy.splice(2, 1)
    options[flag.slice(2)] = true
  }

  return options
}
