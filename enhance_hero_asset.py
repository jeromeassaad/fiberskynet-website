#!/usr/bin/env python3
"""Generate the high-density web illustration from the approved original cutout.
This does not hallucinate tiny details: careful sharpening and 2x pixels improve
browser sampling while preserving colors, transparency, and the existing design.
"""
from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parent
src = root / "assets" / "fiber-crew.webp"
dest = root / "assets" / "fiber-crew-hd.webp"
if not src.exists():
    raise FileNotFoundError(f"Missing hero artwork: {src}")
with Image.open(src) as img:
    rgba = img.convert("RGBA")
    target_size = (rgba.width * 2, rgba.height * 2)
    rgba = rgba.resize(target_size, resample=Image.Resampling.LANCZOS)
    red, green, blue, alpha = rgba.split()
    rgb = Image.merge("RGB", (red, green, blue))
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.45, percent=115, threshold=3))
    r, g, b = rgb.split()
    enhanced = Image.merge("RGBA", (r, g, b, alpha))
    enhanced.save(dest, "WEBP", quality=94, method=6)
    print(f"Prepared crisp hero art: {dest.name} ({target_size[0]} x {target_size[1]}; {dest.stat().st_size:,} bytes)")
