"""MkDocs hook: regenerate MySQL compat matrix and unsupported features pages.

Runs `node scripts/generate-compat-matrix.js` and
`node scripts/generate-unsupported-features.js` during `on_pre_build` so the
generated Reference pages always match the current state of `mysql_compat`
frontmatter. Fails the build if Node is missing or a script exits non-zero.
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

SCRIPTS = [
    "generate-compat-matrix.js",
    "generate-unsupported-features.js",
]


def on_pre_build(config, **_kwargs):
    repo_root = Path(config["config_file_path"]).resolve().parent
    node = shutil.which("node")
    if node is None:
        print("[compat-matrix] node not found on PATH; skipping regeneration")
        return
    for name in SCRIPTS:
        script = repo_root / "scripts" / name
        if not script.exists():
            continue
        try:
            subprocess.run([node, str(script)], cwd=repo_root, check=True)
        except subprocess.CalledProcessError as exc:
            raise SystemExit(
                f"[compat-matrix] {name} failed with exit code {exc.returncode}"
            )
