"""
Draws MOTHERLAND's hero title and logo as vector art, written to data/motherland-art.ts.

The title is a design made with Li Sirajee Sylheti 3D (Lipighor Font Foundry). Its licence
lets a design use the font but forbids uploading the font file, and its ANSI encoding only
reads Bijoy-typed text, so the page carries the letter shapes and never the font.
The logo is Alfa Slab One (SIL Open Font License), slanted and chiselled to match it.

  pip install fonttools uharfbuzz skia-pathops
  python scripts/motherland-art.py <Li Sirajee Italic.ttf> <AlfaSlabOne-Regular.ttf>
"""
import json
import math
import sys

import pathops
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

BIJOY_TITLE = "Avgvi †mvbvi evsjv"  # আমার সোনার বাংলা, typed in the font's ANSI encoding
SLANT = math.tan(math.radians(20))  # The Latin letters lean as the Bangla's stems do.
CHISEL_INSET = (34, -26)  # How far inside each letter's edge the cut runs, in font units.
CHISEL_WIDTH = (13, -10)  # How wide the cut is.


def shaped_path(font_path, text, shear=0.0):
    """The text as one merged path, y down, with the font's own kerning."""
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    face = hb.Face(hb.Blob.from_file_path(font_path))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb.Font(face), buf, {"kern": True})
    path = pathops.Path()
    pen = path.getPen(glyphSet=glyphs)
    x = 0
    spots = []
    order = font.getGlyphOrder()
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        spots.append((order[info.codepoint], x, pos.x_advance))
        glyphs[order[info.codepoint]].draw(TransformPen(pen, (1, 0, shear, 1, x + pos.x_offset, pos.y_offset)))
        x += pos.x_advance
    path.simplify(fix_winding=True)
    return path, spots


def moved(path, dx, dy):
    out = pathops.Path()
    path.draw(TransformPen(out.getPen(), (1, 0, 0, 1, dx, dy)))
    return out


def chiselled(letters):
    """Cuts a thin line just inside the letters' edges, like the Bangla's 3D cut."""
    inner = pathops.op(letters, moved(letters, *CHISEL_INSET), pathops.PathOp.INTERSECTION)
    line = pathops.op(inner, moved(inner, *CHISEL_WIDTH), pathops.PathOp.DIFFERENCE)
    return pathops.op(letters, line, pathops.PathOp.DIFFERENCE)


def to_svg(path, left, top):
    """An SVG path from the ink's top-left corner, flipped to y down."""
    pen = SVGPathPen(None, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    path.draw(TransformPen(pen, (1, 0, 0, -1, -left, top)))
    return pen.getCommands()


def title(font_path):
    path, _ = shaped_path(font_path, BIJOY_TITLE)
    x0, y0, x1, y1 = path.bounds
    return {"width": round(x1 - x0), "height": round(y1 - y0), "d": to_svg(path, x0, y1)}


def logo(font_path):
    """MOTHERLAND, its O the flag's red sun: a round circle, not slanted, as tall as the letters."""
    path, spots = shaped_path(font_path, "MOTHERLAND", SLANT)
    font = TTFont(font_path)
    cap = font["OS/2"].sCapHeight
    name, x, advance = spots[1]
    o = pathops.Path()
    font.getGlyphSet()[name].draw(TransformPen(o.getPen(glyphSet=font.getGlyphSet()), (1, 0, SLANT, 1, x, 0)))
    ox0, oy0, ox1, oy1 = o.bounds
    letters = pathops.op(path, o, pathops.PathOp.DIFFERENCE)
    letters = chiselled(letters)
    x0, y0, x1, y1 = path.bounds
    r = (oy1 - oy0) / 2 * 0.92
    return {
        "width": round(x1 - x0),
        "height": round(y1 - y0),
        "d": to_svg(letters, x0, y1),
        "sun": {"cx": round((ox0 + ox1) / 2 - x0), "cy": round(y1 - (oy0 + oy1) / 2), "r": round(r)},
        "cap": cap,
    }


if __name__ == "__main__":
    art_title = title(sys.argv[1])
    art_logo = logo(sys.argv[2])
    art_logo.pop("cap")
    out = (
        "/** Written by scripts/motherland-art.py; do not edit. The title's shapes are from Li Sirajee Sylheti 3D (Lipighor Font Foundry), the logo's from Alfa Slab One (SIL OFL). */\n"
        f"export const TITLE_ART = {json.dumps(art_title, ensure_ascii=False)};\n\n"
        f"export const LOGO_ART = {json.dumps(art_logo, ensure_ascii=False)};\n"
    )
    open("data/motherland-art.ts", "w", encoding="utf-8", newline="\n").write(out)
    print("title", art_title["width"], art_title["height"], len(art_title["d"]), "logo", art_logo["width"], art_logo["height"], len(art_logo["d"]), art_logo["sun"])
