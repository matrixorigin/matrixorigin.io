"""MkDocs hook: emit agent-friendly artifacts alongside the HTML build.

Produces four things so LLM-driven clients (Cursor, Claude Code, ChatGPT,
MCP servers, etc.) can consume the MatrixOne docs without parsing HTML:

1. **Per-page markdown mirror.** Every source `docs/MatrixOne/**/*.md` file
   is copied into `site/` at the same relative location. Frontmatter is
   preserved as-is — it's cheap metadata for downstream tools.
2. **`site/llms.txt`**. A concise llmstxt.org-format index pointing at the
   most load-bearing pages. Section titles come from the page's `title:`
   frontmatter (or first H1); one-line descriptions come from the page's
   `description:` frontmatter with a first-paragraph fallback, so editing a
   doc keeps llms.txt fresh without touching this file. The header carries
   a blockquote of behavioural directives for SQL-writing agents and a
   direct pointer to the MySQL Compatibility Matrix.
3. **`site/llms-sql.txt`**. A flat per-statement index of every SQL-Reference
   page with its MySQL compatibility tag, so agents can scan the full SQL
   surface area in one fetch without parsing the matrix table.
4. **`site/llms-func.txt`**. A flat per-function index of every
   Functions-and-Operators page with its MySQL compatibility tag.
5. **`site/llms-op.txt`**. A flat per-operator index of every Operators page
   with its MySQL compatibility tag.
6. **`site/llms-full.txt`**. The whole corpus concatenated into one file so
   agents can stuff the full docs into a single context window when needed.

Override the base URL via `MATRIXONE_DOCS_BASE_URL` env var. Defaults to
`https://docs.matrixorigin.cn`.
"""

from __future__ import annotations

import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

BASE_URL_DEFAULT = "https://docs.matrixorigin.cn"
DOC_ROOT_REL = Path("MatrixOne")
COMPAT_MATRIX_REL = "MatrixOne/Reference/mysql-compatibility-matrix.md"
SQL_REF_ROOT_REL = Path("MatrixOne/Reference/SQL-Reference")
FUNC_REF_ROOT_REL = Path("MatrixOne/Reference/Functions-and-Operators")
OP_REF_ROOT_REL = Path("MatrixOne/Reference/Operators")
MAX_AUTO_DESC_CHARS = 160

SQL_CATEGORY_ORDER = [
    ("Data-Definition-Language", "DDL — Data Definition Language"),
    ("Data-Manipulation-Language", "DML — Data Manipulation Language"),
    ("Data-Query-Language", "DQL — Data Query Language"),
    ("Data-Control-Language", "DCL — Data Control Language"),
    ("Other", "Other"),
]
COMPAT_TAG = {
    "full": "full",
    "partial": "partial",
    "none": "none",
    "mo_only": "mo-only",
    "unknown": "unknown",
}

FUNC_CATEGORY_ORDER = [
    ("Aggregate-Functions", "Aggregate Functions"),
    ("Datetime", "Date/Time Functions"),
    ("Json", "JSON Functions"),
    ("Mathematical", "Math Functions"),
    ("String", "String Functions"),
    ("Table", "Table Functions"),
    ("Vector", "Vector Functions"),
    ("Window-Functions", "Window Functions"),
    ("system-ops", "System Operations"),
    ("Other", "Other Functions"),
]

OP_CATEGORY_ORDER = [
    ("arithmetic-operators", "Arithmetic Operators"),
    ("assignment-operators", "Assignment Operators"),
    ("bit-functions-and-operators", "Bit Functions and Operators"),
    ("cast-functions-and-operators", "Cast Functions and Operators"),
    ("comparison-functions-and-operators", "Comparison Functions and Operators"),
    ("flow-control-functions", "Flow Control Functions"),
    ("logical-operators", "Logical Operators"),
]

# Curated list of top-tier pages to highlight in llms.txt. Paths are relative
# to `docs/`. Second tuple element is an optional description override; leave
# it as None to auto-derive from the page's frontmatter/first paragraph.
FEATURED_PAGES = [
    ("Docs", [
        ("MatrixOne/Overview/matrixone-introduction.md",
         "What MatrixOne is: a hyper-converged cloud-native HSTAP database that unifies OLTP, OLAP, streaming, and vector/full-text workloads in one engine."),
        ("MatrixOne/Overview/matrixone-feature-list.md",
         "Feature list at a glance — what's supported today vs on the roadmap."),
        ("MatrixOne/Get-Started/install-standalone-matrixone.md",
         "Single-node install walkthrough — fastest path to a running instance for trying things out."),
        ("MatrixOne/Reference/SQL-Reference/SQL-Type.md",
         "SQL statement taxonomy — entry point for every supported statement."),
        (COMPAT_MATRIX_REL,
         "MySQL 8.0 compatibility status per SQL statement — consult first before assuming syntax works."),
        ("MatrixOne/Reference/Data-Types/data-types.md",
         "All supported data types, including MatrixOne-specific `VECF32` / `VECF64` vectors and `DATALINK`."),
        ("MatrixOne/Reference/Variable/system-variables/system-variables-overview.md",
         "System variables reference — session/global toggles that change SQL behaviour."),
        ("MatrixOne/Reference/System-Parameters/system-parameter.md",
         "Server configuration parameters (static startup-time + dynamic) for tuning the engine."),
    ]),
    ("Core Capabilities", [
        ("MatrixOne/Overview/feature/key-feature-htap.md",
         "HTAP: run transactional and analytical workloads against the same data without ETL."),
        ("MatrixOne/Tutorial/git4data-demo.md",
         "Git-for-Data branching workflow: create/diff/merge data branches just like code branches — the MatrixOne differentiator for agent-safe experiments."),
        ("MatrixOne/Maintain/backup-restore/mobr-backup-restore/mobr-snapshot-backup-restore.md",
         "Snapshot-based backup & restore — cluster/tenant/database/table scope, copy-on-write semantics."),
        ("MatrixOne/Maintain/backup-restore/mobr-backup-restore/mobr-pitr-backup-restore.md",
         "Point-in-time recovery (PITR) — restore to an arbitrary timestamp within the configured retention window."),
        ("MatrixOne/Tutorial/efficient-clone-demo.md",
         "CREATE CLONE: instant copy-on-write table/database clones, including across tenants."),
        ("MatrixOne/Develop/Vector/vector_search.md",
         "Vector search with `VECF32` / `VECF64`, L2/cosine/IP distance, IVFFLAT and HNSW indexes."),
        ("MatrixOne/Reference/SQL-Reference/Data-Definition-Language/create-fulltext-index.md",
         "Full-text indexing — natural-language, boolean, and JSON search modes."),
        ("MatrixOne/Tutorial/hybrid-search-demo.md",
         "Hybrid retrieval: combine vector search with full-text and scalar filters in a single query — the RAG-friendly pattern."),
    ]),
    ("SDK & Drivers", [
        ("MatrixOne/Develop/connect-mo/python-connect-to-matrixone.md",
         "Python client setup (PyMySQL / SQLAlchemy)."),
        ("MatrixOne/Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md",
         "Java/JDBC client setup."),
        ("MatrixOne/Develop/connect-mo/connect-to-matrixone-with-go.md",
         "Go client setup (`database/sql` + driver)."),
    ]),
    ("Data In / Out", [
        ("MatrixOne/Develop/import-data/bulk-load/bulk-load-overview.md",
         "Bulk load overview: `LOAD DATA` for CSV/JSONL, `SOURCE` for SQL dumps, S3-backed external ingestion."),
        ("MatrixOne/Develop/import-data/bulk-load/load-s3.md",
         "Load directly from S3-compatible object storage via stages."),
        ("MatrixOne/Reference/SQL-Reference/Data-Definition-Language/create-external-table.md",
         "External tables: query CSV/Parquet/S3 data in place without ingestion."),
        ("MatrixOne/Develop/export-data/select-into-outfile.md",
         "Export query results via `SELECT ... INTO OUTFILE` to local files or S3 stages."),
    ]),
    ("Migrate", [
        ("MatrixOne/Migrate/migrate-overview.md",
         "Migration overview: tools and workflows for moving from MySQL / PostgreSQL / Oracle / SQL Server to MatrixOne."),
        ("MatrixOne/Migrate/migrate-from-mysql-to-matrixone.md",
         "MySQL → MatrixOne migration — the most common path, leverages MySQL wire-protocol compatibility."),
    ]),
    ("Operate", [
        ("MatrixOne/Deploy/deploy-MatrixOne-cluster.md",
         "Distributed cluster deployment on Kubernetes — separates storage, compute, and transaction."),
        ("MatrixOne/Maintain/backup-restore/backup-restore-overview.md",
         "Backup & restore strategy overview — snapshot, PITR, and `mo_br` tool."),
    ]),
    ("Optional", [
        ("MatrixOne/Overview/architecture/matrixone-architecture-design.md",
         "HSTAP architecture deep dive — storage/compute/transaction split, TAE engine, log service, proxy."),
        ("MatrixOne/Performance-Tuning/performance-tuning-overview.md",
         "Performance tuning methods — query plan reading, indexing, statistics, resource controls."),
        ("MatrixOne/Troubleshooting/error-code.md",
         "Error code taxonomy — look up any 5-character error code."),
    ]),
]

SYSTEM_PROMPT_BLOCK = (
    "MatrixOne is a cloud-native HSTAP database unifying OLTP, OLAP, streaming, "
    "vector, and full-text workloads in one engine. It is broadly MySQL 8.0 "
    "wire-protocol compatible, but not all MySQL features are supported — "
    "always verify against the MySQL Compatibility Matrix. SQL examples on "
    "these pages are executed against the latest 3.0-dev image by "
    "`scripts/doc-validator` on every pull request."
)

# Short routing hint shown after the header bullets so agents know which
# artifact to pull for which kind of question.
AGENT_ROUTING = (
    "Agent routing: writing or debugging SQL → pull `llms-sql.txt` for the "
    "flat per-statement catalogue; function lookup → `llms-func.txt`; operator "
    "reference → `llms-op.txt`; broad conceptual questions → this file; "
    "long-context offline reading → `llms-full.txt`; authoritative diffs "
    "from MySQL → the MySQL Compatibility Matrix linked above."
)

# Behavioural directives kept here so they survive prompt-review sweeps.
# Each entry should be one actionable line.
AGENT_HINTS = [
    "Not all MySQL 8.0 features are supported — consult the compatibility matrix before assuming syntax works.",
    "Prefer MatrixOne-native clauses when documented: `CLUSTER BY`, `AS OF TIMESTAMP`, `USING IVFFLAT`/`USING HNSW`, `CLONE`, `PITR`, `SNAPSHOT`.",
    "Use `SHOW CREATE TABLE <name>` to inspect a table before mutating it; system tables differ from MySQL.",
    "Vector indexes (`USING IVFFLAT`, `USING HNSW`) must be declared via `CREATE INDEX`, not `ALTER TABLE ADD INDEX`.",
    "Secondary indexes are syntactically accepted but do not yet accelerate queries — do not rely on them for performance.",
    "`ALTER TABLE` cannot combine column-level clauses (CHANGE/MODIFY/RENAME COLUMN, ADD/DROP PK) with other clauses; split into separate statements.",
    "Tables created with `CLUSTER BY` and temporary tables cannot be altered — plan schema shape up front.",
    "`CREATE DATABASE` supports only `utf8mb4` / `utf8mb4_bin`; the `ENCRYPTION` clause is accepted but inert.",
    "Foreign keys do not support `ON CASCADE DELETE`.",
    "`LOAD DATA INFILE` expects a local absolute path or a stage URL (e.g. `stage://my_stage/file.csv`) — relative paths and MySQL-style secure-file-priv do not apply.",
    "Use `CREATE SNAPSHOT` / `PITR` / `CREATE CLONE` for point-in-time and copy-on-write workflows rather than MySQL's binlog tooling.",
    "For agent-safe experiments, prefer a data branch (`DATA BRANCH CREATE` → test → `DATA BRANCH DIFF` → `DATA BRANCH MERGE` / delete) over mutating shared tables in place.",
]


def _base_url() -> str:
    return os.environ.get("MATRIXONE_DOCS_BASE_URL", BASE_URL_DEFAULT).rstrip("/")


def _page_url(base: str, rel_from_docs: str) -> str:
    """Convert a source-relative path to a clean documentation URL.
    Strips .md and appends / for mkdocs clean URLs.
    """
    if rel_from_docs.endswith(".md"):
        rel_from_docs = rel_from_docs[:-3] + "/"
    return f"{base}/{rel_from_docs}"


def _iter_source_pages(docs_dir: Path) -> Iterable[Path]:
    for path in sorted((docs_dir / DOC_ROOT_REL).rglob("*.md")):
        yield path


def on_post_build(config, **_kwargs):
    site_dir = Path(config["site_dir"]).resolve()
    docs_dir = Path(config["docs_dir"]).resolve()
    if not site_dir.exists():
        return

    # 1. Per-page markdown mirror.
    mirrored = 0
    for src in _iter_source_pages(docs_dir):
        rel = src.relative_to(docs_dir)
        dest = site_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        mirrored += 1
    print(f"[agent-delivery] mirrored {mirrored} markdown source files into site/")

    # 2. llms.txt
    base = _base_url()
    compat_url = _page_url(base, COMPAT_MATRIX_REL)
    built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    llms: list[str] = ["# MatrixOne", ""]
    llms.append(f"> {SYSTEM_PROMPT_BLOCK}")
    llms.append("")
    llms.append(f"- **MySQL Compatibility Matrix**: {compat_url}")
    llms.append(f"- **Per-page markdown mirror**: append `.md` to any doc URL under {base}/")
    llms.append(f"- **MySQL Compatibility Matrix (JSON)**: {base}/MatrixOne/Reference/mysql-compatibility-matrix.json")
    llms.append(f"- **Full SQL reference (flat index, all statements)**: {base}/llms-sql.txt")
    llms.append(f"- **Functions reference (flat index)**: {base}/llms-func.txt")
    llms.append(f"- **Operators reference (flat index)**: {base}/llms-op.txt")
    llms.append(f"- **Full corpus**: {base}/llms-full.txt")
    llms.append(f"- **Generated**: {built_at} (UTC)")
    llms.append("")
    llms.append(AGENT_ROUTING)
    llms.append("")
    llms.append("Hints for AI agents writing MatrixOne SQL:")
    llms.append("")
    for hint in AGENT_HINTS:
        llms.append(f"- {hint}")
    llms.append("")
    for section_title, entries in FEATURED_PAGES:
        llms.append(f"## {section_title}")
        for rel_path, override in entries:
            url = _page_url(base, rel_path)
            src_path = docs_dir / rel_path
            title = _page_title(src_path) or rel_path
            desc = override or _page_description(src_path) or ""
            if desc:
                llms.append(f"- [{title}]({url}): {desc}")
            else:
                llms.append(f"- [{title}]({url})")
        llms.append("")
    (site_dir / "llms.txt").write_text("\n".join(llms), encoding="utf-8")

    # 3. llms-sql.txt — flat index of every SQL-Reference page with compat tag.
    sql_lines = _build_sql_index(docs_dir, base, built_at)
    (site_dir / "llms-sql.txt").write_text("\n".join(sql_lines), encoding="utf-8")

    # 3b. llms-func.txt — flat index of every Functions-and-Operators page.
    func_lines = _build_func_index(docs_dir, base, built_at)
    (site_dir / "llms-func.txt").write_text("\n".join(func_lines), encoding="utf-8")

    # 3c. llms-op.txt — flat index of every Operators page.
    op_lines = _build_op_index(docs_dir, base, built_at)
    (site_dir / "llms-op.txt").write_text("\n".join(op_lines), encoding="utf-8")

    # 4. llms-full.txt
    sections_order = [
        "MatrixOne/Overview",
        "MatrixOne/Get-Started",
        "MatrixOne/Reference",
        "MatrixOne/Develop",
        "MatrixOne/Deploy",
        "MatrixOne/Maintain",
        "MatrixOne/Performance-Tuning",
        "MatrixOne/Security",
        "MatrixOne/Migrate",
        "MatrixOne/Tutorial",
        "MatrixOne/Troubleshooting",
        "MatrixOne/FAQs",
        "MatrixOne/Release-Notes",
        "MatrixOne/Test",
        "MatrixOne/Contribution-Guide",
    ]
    full_parts = [
        "# MatrixOne — Full Documentation",
        "",
        "Source: " + base,
        f"Generated: {built_at} (UTC)",
        "",
        SYSTEM_PROMPT_BLOCK,
        "",
    ]
    seen: set[Path] = set()
    for prefix in sections_order:
        root = docs_dir / prefix
        if not root.exists():
            continue
        for src in sorted(root.rglob("*.md")):
            rel = src.relative_to(docs_dir)
            if rel in seen:
                continue
            seen.add(rel)
            full_parts.append("")
            full_parts.append(f"# === {rel.as_posix()} ===")
            full_parts.append("")
            full_parts.append(src.read_text(encoding="utf-8"))
    # Append any remaining pages we didn't group above.
    for src in _iter_source_pages(docs_dir):
        rel = src.relative_to(docs_dir)
        if rel in seen:
            continue
        seen.add(rel)
        full_parts.append("")
        full_parts.append(f"# === {rel.as_posix()} ===")
        full_parts.append("")
        full_parts.append(src.read_text(encoding="utf-8"))
    (site_dir / "llms-full.txt").write_text("\n".join(full_parts), encoding="utf-8")
    print(f"[agent-delivery] emitted llms.txt, llms-sql.txt, llms-func.txt, llms-op.txt and llms-full.txt ({len(seen)} pages)")


def _build_sql_index(docs_dir: Path, base: str, built_at: str) -> list[str]:
    """Emit a flat one-line-per-statement catalogue of every SQL-Reference
    page. Each line is `- [TITLE](URL) [compat-tag]: one-line description.`
    so agents can scan the whole SQL surface area in a single fetch.
    """
    root = docs_dir / SQL_REF_ROOT_REL
    lines: list[str] = [
        "# MatrixOne SQL Reference — Flat Index",
        "",
        f"> Every SQL statement supported by MatrixOne, grouped by category, "
        f"each tagged with its MySQL 8.0 compatibility status. Generated from "
        f"`mysql_compat` frontmatter on {built_at} (UTC).",
        "",
        "Legend: `[full]` MySQL-compatible · `[partial]` compatible with "
        "caveats (see linked page for `differs_from_mysql:`) · "
        "`[mo-only]` MatrixOne-only, no MySQL counterpart · "
        "`[none]` not supported · `[unknown]` frontmatter missing.",
        "",
        f"Compatibility matrix (grouped table view): {_page_url(base, COMPAT_MATRIX_REL)}",
        "",
    ]
    if not root.exists():
        lines.append("_No SQL-Reference pages found._")
        return lines

    buckets: dict[str, list[tuple[str, str, str, str]]] = {k: [] for k, _ in SQL_CATEGORY_ORDER}
    uncategorised: list[tuple[str, str, str, str]] = []
    for src in sorted(root.rglob("*.md")):
        rel_to_ref = src.relative_to(root)
        parts = rel_to_ref.parts
        category = parts[0] if len(parts) > 1 else "__root__"
        text = _read(src) or ""
        fm, _ = _split_frontmatter(text)
        compat = COMPAT_TAG.get(fm.get("mysql_compat", "unknown"), "unknown")
        title = fm.get("title") or _page_title(src) or rel_to_ref.as_posix()
        desc = _page_description(src) or ""
        rel_from_docs = src.relative_to(docs_dir).as_posix()
        url = _page_url(base, rel_from_docs)
        row = (title, url, compat, desc)
        if category in buckets:
            buckets[category].append(row)
        else:
            uncategorised.append(row)

    for key, label in SQL_CATEGORY_ORDER:
        rows = buckets.get(key) or []
        if not rows:
            continue
        lines.append(f"## {label}")
        lines.append("")
        for title, url, compat, desc in sorted(rows, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    if uncategorised:
        lines.append("## Uncategorised")
        lines.append("")
        for title, url, compat, desc in sorted(uncategorised, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    return lines


def _build_func_index(docs_dir: Path, base: str, built_at: str) -> list[str]:
    """Emit a flat one-line-per-function catalogue of every Functions-and-Operators
    page. Same format as `_build_sql_index`.
    """
    root = docs_dir / FUNC_REF_ROOT_REL
    lines: list[str] = [
        "# MatrixOne Functions Reference — Flat Index",
        "",
        f"> Every function supported by MatrixOne, grouped by category, "
        f"each tagged with its MySQL 8.0 compatibility status. Generated from "
        f"`mysql_compat` frontmatter on {built_at} (UTC).",
        "",
        "Legend: `[full]` MySQL-compatible · `[partial]` compatible with "
        "caveats (see linked page for `differs_from_mysql:`) · "
        "`[mo-only]` MatrixOne-only, no MySQL counterpart · "
        "`[unknown]` frontmatter missing.",
        "",
        f"Compatibility matrix (grouped table view): {_page_url(base, COMPAT_MATRIX_REL)}",
        "",
    ]
    if not root.exists():
        lines.append("_No Functions-and-Operators pages found._")
        return lines

    buckets: dict[str, list[tuple[str, str, str, str]]] = {k: [] for k, _ in FUNC_CATEGORY_ORDER}
    uncategorised: list[tuple[str, str, str, str]] = []
    for src in sorted(root.rglob("*.md")):
        rel_to_ref = src.relative_to(root)
        parts = rel_to_ref.parts
        category = parts[0] if len(parts) > 1 else "__root__"
        text = _read(src) or ""
        fm, _ = _split_frontmatter(text)
        compat = COMPAT_TAG.get(fm.get("mysql_compat", "unknown"), "unknown")
        title = fm.get("title") or _page_title(src) or rel_to_ref.as_posix()
        desc = _page_description(src) or ""
        rel_from_docs = src.relative_to(docs_dir).as_posix()
        url = _page_url(base, rel_from_docs)
        row = (title, url, compat, desc)
        if category in buckets:
            buckets[category].append(row)
        else:
            uncategorised.append(row)

    for key, label in FUNC_CATEGORY_ORDER:
        rows = buckets.get(key) or []
        if not rows:
            continue
        lines.append(f"## {label}")
        lines.append("")
        for title, url, compat, desc in sorted(rows, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    if uncategorised:
        lines.append("## Uncategorised")
        lines.append("")
        for title, url, compat, desc in sorted(uncategorised, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    return lines


def _build_op_index(docs_dir: Path, base: str, built_at: str) -> list[str]:
    """Emit a flat one-line-per-operator catalogue of every Operators page."""
    root = docs_dir / OP_REF_ROOT_REL
    lines: list[str] = [
        "# MatrixOne Operators Reference — Flat Index",
        "",
        f"> Every operator supported by MatrixOne, grouped by category, "
        f"each tagged with its MySQL 8.0 compatibility status. Generated from "
        f"`mysql_compat` frontmatter on {built_at} (UTC).",
        "",
        "Legend: `[full]` MySQL-compatible · `[partial]` compatible with "
        "caveats (see linked page for `differs_from_mysql:`) · "
        "`[mo-only]` MatrixOne-only, no MySQL counterpart · "
        "`[unknown]` frontmatter missing.",
        "",
        f"Compatibility matrix (grouped table view): {_page_url(base, COMPAT_MATRIX_REL)}",
        "",
    ]
    if not root.exists():
        lines.append("_No Operators pages found._")
        return lines

    buckets: dict[str, list[tuple[str, str, str, str]]] = {k: [] for k, _ in OP_CATEGORY_ORDER}
    uncategorised: list[tuple[str, str, str, str]] = []
    for src in sorted(root.rglob("*.md")):
        rel_to_ref = src.relative_to(root)
        parts = rel_to_ref.parts
        # Operators/ tree has an extra `operators/` prefix; skip it.
        if parts[0] == "operators":
            category = parts[1] if len(parts) > 2 else "operators"
        else:
            category = parts[0] if len(parts) > 0 else "__root__"
        text = _read(src) or ""
        fm, _ = _split_frontmatter(text)
        compat = COMPAT_TAG.get(fm.get("mysql_compat", "unknown"), "unknown")
        title = fm.get("title") or _page_title(src) or rel_to_ref.as_posix()
        desc = _page_description(src) or ""
        rel_from_docs = src.relative_to(docs_dir).as_posix()
        url = _page_url(base, rel_from_docs)
        row = (title, url, compat, desc)
        if category in buckets:
            buckets[category].append(row)
        else:
            uncategorised.append(row)

    for key, label in OP_CATEGORY_ORDER:
        rows = buckets.get(key) or []
        if not rows:
            continue
        lines.append(f"## {label}")
        lines.append("")
        for title, url, compat, desc in sorted(rows, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    if uncategorised:
        lines.append("## Uncategorised")
        lines.append("")
        for title, url, compat, desc in sorted(uncategorised, key=lambda r: r[0].lower()):
            suffix = f": {desc}" if desc else ""
            lines.append(f"- [{title}]({url}) [{compat}]{suffix}")
        lines.append("")

    return lines


_FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\s*\n", re.DOTALL)
_MD_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")
_MD_EMPHASIS_RE = re.compile(r"\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`")


def _read(md_path: Path) -> str | None:
    if not md_path.exists():
        return None
    return md_path.read_text(encoding="utf-8", errors="replace")


def _split_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Return (frontmatter_dict, body). Accepts only flat scalar frontmatter —
    nested lists/dicts (e.g. `differs_from_mysql:`) are ignored.
    """
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    fm: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if not line or line.startswith((" ", "\t", "-", "#")):
            continue
        if ":" not in line:
            continue
        key, _, raw = line.partition(":")
        fm[key.strip()] = raw.strip().strip('"\'')
    return fm, text[m.end():]


def _page_title(md_path: Path) -> str | None:
    text = _read(md_path)
    if text is None:
        return None
    fm, body = _split_frontmatter(text)
    if fm.get("title"):
        return fm["title"]
    for line in body.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip().replace("**", "")
    return None


def _page_description(md_path: Path) -> str | None:
    """Derive a one-line description: prefer `description:` or `summary:`
    frontmatter; fall back to the first non-heading, non-code paragraph, with
    markdown emphasis/link markup flattened and truncated to MAX_AUTO_DESC_CHARS.
    """
    text = _read(md_path)
    if text is None:
        return None
    fm, body = _split_frontmatter(text)
    for key in ("description", "summary"):
        if fm.get(key):
            return _clip(fm[key])

    in_code = False
    paragraph: list[str] = []
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if not line:
            if paragraph:
                break
            continue
        if line.startswith(("#", ">", "|", "-", "*", "!", "<")):
            # Skip headings, blockquotes, tables, lists, images, HTML.
            continue
        paragraph.append(line)

    if not paragraph:
        return None
    return _clip(" ".join(paragraph))


def _clip(text: str) -> str:
    cleaned = _MD_LINK_RE.sub(r"\1", text)
    cleaned = _MD_EMPHASIS_RE.sub(lambda m: next(g for g in m.groups() if g), cleaned)
    cleaned = " ".join(cleaned.split())
    # Strip a trailing colon that usually introduces a now-dropped list.
    cleaned = cleaned.rstrip(":").rstrip()
    if len(cleaned) <= MAX_AUTO_DESC_CHARS:
        return cleaned
    clipped = cleaned[:MAX_AUTO_DESC_CHARS]
    # Back up to the last sentence boundary or space to avoid mid-word cuts.
    for boundary in (". ", "; ", ", ", " "):
        idx = clipped.rfind(boundary)
        if idx > MAX_AUTO_DESC_CHARS * 0.6:
            return clipped[:idx].rstrip(",;. ") + "…"
    return clipped.rstrip() + "…"
