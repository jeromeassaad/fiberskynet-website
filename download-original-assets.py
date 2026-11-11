#!/usr/bin/env python3
"""Build-time archive of public FiberSkynet Squarespace imagery.

Stops the build if any of the expected original images are missing.
The original files are stored locally in the output folder; the rendered
website never needs to hotlink images from a canceled Squarespace account.
"""
import html
import json
import pathlib
import re
import sys
import time
import urllib.request
from urllib.parse import unquote, urlsplit

root = pathlib.Path(__file__).resolve().parent
images = json.loads((root / 'original-assets.json').read_text())
cdn = 'https://images.squarespace-cdn.com/content/v1/6a84671990b7083815f66c38/'
assets = root / 'assets' / 'original'
assets.mkdir(parents=True, exist_ok=True)
replacements = {}
failed = []

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
}

def get(url, attempts=2):
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=35) as response:
                payload = response.read()
                content_type = response.headers.get('Content-Type', '').lower()
            if not payload or 'text/html' in content_type:
                raise ValueError('Not an image response')
            return payload
        except Exception as exc:
            if attempt == attempts - 1:
                raise
            print(f'Retrying {url}: {exc}', flush=True)
            time.sleep(2)

def image_bytes(url):
    data = get(url)
    if not (data[:4] == b'RIFF' or data[:4] == b'\x89PNG' or data[:3] == b'\xff\xd8\xff'):
        raise ValueError(f'Unsupported image format: {data[:12]!r}')
    return data

def original_urls():
    """Look for all published CDN URLs in Squarespace HTML and page JSON."""
    found = []
    for route in ('', 'packages', 'contact'):
        try:
            data = get('https://www.fiberskynet.net/' + route).decode('utf8', 'replace')
            data = html.unescape(data).replace('\\/', '/').replace('\\u002F', '/')
            # Raw HTML image src, data-src, social/JSON fields, etc.
            found.extend(re.findall(r'https?://images\.squarespace-cdn\.com/content/v1/[^\s\"\'<>\\]+', data))
        except Exception as exc:
            print(f'NOTE: Page scan {route or "home"} unavailable: {exc}', flush=True)
    return list(dict.fromkeys(u.rstrip(',;()') for u in found))

published = original_urls()
print(f'Discovered {len(published)} public image URLs on the existing site.')

def canonical_name(url):
    s = unquote(urlsplit(url).path.split('/')[-1]).replace('+', ' ')
    return s.lower()

for name, path in images.items():
    url = cdn + path
    filename = canonical_name(url)
    candidates = [url] + [u for u in published if canonical_name(u) == filename and u != url]
    suffix = filename.rsplit('.', 1)[-1]
    if suffix not in ('png', 'jpg', 'jpeg', 'webp'):
        suffix = 'jpg'
    target = assets / f'{name}.{suffix}'
    for candidate in candidates:
        try:
            image = image_bytes(candidate)
            target.write_bytes(image)
            # The source URL may be the original hard-coded reference even
            # when a Squarespace migrated URL was the one that worked.
            replacements[url] = target
            print(f'OK {name} ({len(image):,} bytes)')
            break
        except Exception as exc:
            last_error = exc
    else:
        failed.append(name)
        print(f'ERROR {name}: {last_error}', file=sys.stderr)

if failed:
    raise SystemExit('ABORT: Required original images unavailable: ' + ', '.join(failed))

# Official vector logo is supplied from the original Illustrator/PDF artwork.
# Keep it unchanged rather than pulling a possibly outdated site logo.
print('Using supplied official vector logo (header and footer).')

for target in (root / 'styles.css', root / 'index.html', root / 'packages/index.html', root / 'contact/index.html'):
    page = target.read_text()
    for url, path in replacements.items():
        local = path.relative_to(root).as_posix()
        if target.parent != root:
            local = '../' + local
        page = page.replace(url, local)
    target.write_text(page)
print('Verified: All required photo and package artwork references now use local files.')
