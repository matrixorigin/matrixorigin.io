"""MkDocs hook: regenerate the MySQL compatibility matrix before building.

Runs `node scripts/generate-compat-matrix.js` during `on_pre_build` so the
generated `docs/MatrixOne/Reference/mysql-compatibility-matrix.md` always
matches the current state of `mysql_compat` frontmatter on SQL-Reference
pages. Fails the build if Node is missing or the script exits non-zero —
keeping the matrix and the source pages in lock-step.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


def on_pre_build(config, **_kwargs):
    repo_root = Path(config["config_file_path"]).resolve().parent
    script = repo_root / "scripts" / "generate-compat-matrix.js"
    if not script.exists():
        return
    node = shutil.which("node")
    if node is None:
        print("[compat-matrix] node not found on PATH; skipping regeneration")
        return
    try:
        subprocess.run([node, str(script)], cwd=repo_root, check=True)
    except subprocess.CalledProcessError as exc:
        raise SystemExit(
            f"[compat-matrix] generate-compat-matrix.js failed with exit code {exc.returncode}"
        )
