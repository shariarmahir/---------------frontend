"""Rebuild the Li Sirajee Sylheti subsets from data/logo-text.ts.

The faces are Bijoy-encoded, so each subset is built from the Bijoy
strings the site actually sets in it, keeping the font's layout features:

    LOGO_TEXT  -> Italic  -> public/font/kandari-logo.woff2
    LABEL_TEXT -> Regular -> public/font/kandari-label.woff2

    python scripts/subset-logo-font.py

Requires: pip install fonttools brotli
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_FILE = ROOT / "data/logo-text.ts"
FONTS = ROOT / "public/font"

JOBS = [
    ("LOGO_TEXT", "LiSirajeeSylheti3DANSIV2-Italic.ttf", "kandari-logo.woff2"),
    ("LABEL_TEXT", "LiSirajeeSylheti3DANSIV2-Regular.ttf", "kandari-label.woff2"),
]

source = TEXT_FILE.read_text(encoding="utf-8")

for name, face, out_name in JOBS:
    block = re.search(rf"export const {name} = \{{(.*?)\n\}} satisfies", source, re.S)
    if not block:
        sys.exit(f"{name} not found in data/logo-text.ts")
    strings = re.findall(r'bijoy:\s*"([^"]*)"', block.group(1))
    if not strings:
        sys.exit(f"No bijoy strings in {name}")

    chars = "".join(sorted(set("".join(strings)) | {" "}))
    out = FONTS / out_name
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.subset", str(FONTS / face),
            f"--text={chars}",
            "--layout-features=*",
            "--flavor=woff2",
            f"--output-file={out}",
        ],
        check=True,
    )
    print(f"{name}: {len(strings)} strings, {len(chars)} glyphs -> {out.name} ({out.stat().st_size} bytes)")
