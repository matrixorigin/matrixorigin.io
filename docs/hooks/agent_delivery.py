"""MkDocs hook: emit agent-friendly artifacts alongside the HTML build.

Produces three things so LLM-driven clients (Cursor, Claude Code, ChatGPT,
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
3. **`site/llms-full.txt`**. The whole corpus concatenated into one file so
   agents can stuff the full docs into a single context window when needed.

Override the base URL via `MATRIXONE_DOCS_BASE_URL` env var. Defaults to
`https://docs.matrixorigin.io`.
"""

from __future__ import annotations

import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

BASE_URL_DEFAULT = "https://docs.matrixorigin.io"
DOC_ROOT_REL = Path("MatrixOne")
COMPAT_MATRIX_REL = "MatrixOne/Reference/mysql-compatibility-matrix.md"
MAX_AUTO_DESC_CHARS = 160

# Curated list of top-tier pages to highlight in llms.txt. Paths are relative
# to `docs/`. Second tuple element is an optional description override; leave
# it as None to auto-derive from the page's frontmatter/first paragraph.
FEATURED_PAGES = [
    ("Docs", [
        ("MatrixOne/Overview/matrixone-introduction.md", None),
        ("MatrixOne/Overview/matrixone-feature-list.md", None),
        ("MatrixOne/Get-Started/install-standalone-matrixone.md", None),
        ("MatrixOne/Reference/SQL-Reference/SQL-Type.md",
         "SQL statement taxonomy — entry point for every supported statement"),
        (COMPAT_MATRIX_REL,
         "MySQL 8.0 compatibility status per SQL statement — consult first"),
    ]),
    ("SDK & Drivers", [
        ("MatrixOne/Develop/connect-mo/python-connect-to-matrixone.md",
         "Python client setup (PyMySQL / SQLAlchemy)"),
        ("MatrixOne/Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md",
         "Java/JDBC client setup"),
        ("MatrixOne/Develop/connect-mo/connect-to-matrixone-with-go.md",
         "Go client setup"),
    ]),
    ("Operate", [
        ("MatrixOne/Deploy/deploy-MatrixOne-cluster.md", None),
        ("MatrixOne/Maintain/backup-restore/backup-restore-overview.md", None),
    ]),
    ("Optional", [
        ("MatrixOne/Overview/architecture/matrixone-architecture-design.md",
         "HSTAP architecture deep dive — storage/compute/transaction split"),
        ("MatrixOne/Performance-Tuning/performance-tuning-overview.md", None),
        ("MatrixOne/Troubleshooting/error-code.md",
         "Error code taxonomy — look up any 5-character error code"),
    ]),
]

SYSTEM_PROMPT_BLOCK = (
    "MatrixOne is a cloud-native HTAP database broadly MySQL 8.0 compatible, "
    "but not every MySQL 8.0 feature is supported. Before assuming syntax "
    "works, consult the MySQL Compatibility Matrix at "
    "/MatrixOne/Reference/mysql-compatibility-matrix.md. Use `SHOW CREATE "
    "TABLE` to confirm schema shape; system tables differ from MySQL. SQL "
    "examples on these pages are validated against the latest 3.0-dev image "
    "via `scripts/doc-validator`."
)

# Behavioural directives kept here so they survive prompt-review sweeps.
# Each entry should be one actionable line.
AGENT_HINTS = [
    "Not all MySQL 8.0 features are supported — consult the compatibility matrix before assuming syntax works.",
    "Prefer MatrixOne-native clauses when documented: `CLUSTER BY`, `AS OF TIMESTAMP`, `USING IVFFLAT`/`USING HNSW`, `CLONE`, `PITR`.",
    "Use `SHOW CREATE TABLE <name>` to inspect a table before mutating it; system tables differ from MySQL.",
    "Vector indexes (`USING IVFFLAT`, `USING HNSW`) must be declared via `CREATE INDEX`, not `ALTER TABLE ADD INDEX`.",
    "Secondary indexes are syntactically accepted but do not yet accelerate queries — do not rely on them for performance.",
    "`ALTER TABLE` cannot combine column-level clauses (CHANGE/MODIFY/RENAME COLUMN, ADD/DROP PK) with other clauses; split into separate statements.",
    "Tables created with `CLUSTER BY` and temporary tables cannot be altered — plan schema shape up front.",
    "`CREATE DATABASE` supports only `utf8mb4` / `utf8mb4_bin`; the `ENCRYPTION` clause is accepted but inert.",
    "Foreign keys do not support `ON CASCADE DELETE`.",
    "Use `CREATE SNAPSHOT` / `PITR` / `CREATE CLONE` for point-in-time and copy-on-write workflows rather than MySQL's binlog tooling.",
]


def _base_url() -> str:
    return os.environ.get("MATRIXONE_DOCS_BASE_URL", BASE_URL_DEFAULT).rstrip("/")


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
    compat_url = f"{base}/{COMPAT_MATRIX_REL}"
    built_at = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    llms: list[str] = ["# MatrixOne", ""]
    llms.append(f"> {SYSTEM_PROMPT_BLOCK}")
    llms.append("")
    llms.append(f"- **MySQL Compatibility Matrix**: {compat_url}")
    llms.append(f"- **Per-page markdown mirror**: append `.md` to any doc URL under {base}/")
    llms.append(f"- **Full corpus**: {base}/llms-full.txt")
    llms.append(f"- **Generated**: {built_at} (UTC)")
    llms.append("")
    llms.append("Hints for AI agents writing MatrixOne SQL:")
    llms.append("")
    for hint in AGENT_HINTS:
        llms.append(f"- {hint}")
    llms.append("")
    for section_title, entries in FEATURED_PAGES:
        llms.append(f"## {section_title}")
        for rel_path, override in entries:
            url = f"{base}/{rel_path}"
            src_path = docs_dir / rel_path
            title = _page_title(src_path) or rel_path
            desc = override or _page_description(src_path) or ""
            if desc:
                llms.append(f"- [{title}]({url}): {desc}")
            else:
                llms.append(f"- [{title}]({url})")
        llms.append("")
    (site_dir / "llms.txt").write_text("\n".join(llms), encoding="utf-8")

    # 3. llms-full.txt
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
    print(f"[agent-delivery] emitted llms.txt and llms-full.txt ({len(seen)} pages)")


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
