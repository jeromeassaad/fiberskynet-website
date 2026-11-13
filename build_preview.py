#!/usr/bin/env python3
"""Build a self-contained site for Cloudflare Pages or GitHub Pages."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root / 'download-original-assets.py')], check=True)
subprocess.run([sys.executable, str(root / 'enhance_hero_asset.py')], check=True)
out = root / 'dist'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for name in ('index.html', 'styles.css', 'refinements.css', 'script.js', 'assets'):
    source = root / name
    dest = out / name
    if source.is_dir():
        shutil.copytree(source, dest)
    else:
        shutil.copy2(source, dest)
for name in ('packages', 'contact'):
    shutil.copytree(root / name, out / name)
(out / '.nojekyll').write_text('')
(out / '_redirects').write_text('/packages /packages/ 301\n/contact /contact/ 301\n')
print(f'Built website at {out} — {sum(f.is_file() for f in out.rglob("*"))} files')


# Version static assets with the commit SHA to prevent outdated CSS/JS from
# persisting across GitHub Pages deployments. Works for root and nested pages.
import os
import re
version=(os.getenv("GITHUB_SHA") or "local").strip()[:12]
for html_file in (out / "index.html", out / "packages/index.html", out / "contact/index.html"):
    page=html_file.read_text(encoding="utf-8")
    page=re.sub(r'(refinements\.css)(?:\?v=[A-Za-z0-9._-]+)?',lambda m:m.group(1)+"?v="+version,page)
    html_file.write_text(page,encoding="utf-8")
print(f"Cache-busted CSS: v={version}")
