#!/usr/bin/env python3
"""Build a self-contained site for Cloudflare Pages or GitHub Pages."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root / 'download-original-assets.py')], check=True)
out = root / 'dist'
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for name in ('index.html', 'styles.css', 'script.js', 'assets'):
    source = root / name
    dest = out / name
    if source.is_dir():
        shutil.copytree(source, dest)
    else:
        shutil.copy2(source, dest)
for name in ('packages', 'contact', 'toters-rush'):
    shutil.copytree(root / name, out / name)
(out / '.nojekyll').write_text('')
(out / '_redirects').write_text('/packages /packages/ 301\n/contact /contact/ 301\n')
print(f'Built website at {out} — {sum(f.is_file() for f in out.rglob("*"))} files')
