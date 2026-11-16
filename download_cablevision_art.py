#!/usr/bin/env python3
"""Store FiberSkynet's new Cablevision+ image locally during deployment.

Source is an Unsplash free-use 3D interior render by Michael Alake:
https://unsplash.com/photos/C1w9tlkG-Rs
This replaces the previous Squarespace Cablevision photo only.
"""
from pathlib import Path
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parent
TARGET=ROOT/"assets"/"cablevision-premium.jpg"
SOURCE="https://images.unsplash.com/photo-1716846135834-ae0490d08c83?auto=format&fit=crop&fm=jpg&q=85&w=2000"
HEADERS={"User-Agent":"Mozilla/5.0 (compatible; FiberSkynet site asset build)","Accept":"image/jpeg,image/*;q=0.8"}
TARGET.parent.mkdir(parents=True,exist_ok=True)

request=Request(SOURCE,headers=HEADERS)
with urlopen(request,timeout=45) as response:
    data=response.read()
    content_type=response.headers.get("Content-Type","").lower()
if (not data.startswith(b"\xff\xd8\xff") or "image" not in content_type or len(data)<15000):
    raise RuntimeError("New Cablevision photo unavailable or not a JPEG image; refusing an incomplete deployment")
TARGET.write_bytes(data)
print(f"Saved new Cablevision+ artwork: {TARGET.name}, {len(data):,} bytes")
