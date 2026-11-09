"""
Draws MOTHERLAND's hero title and the shapes of its logo, written to data/motherland-art.ts.

The title is a design made with Li Sirajee Sylheti 3D (Lipighor Font Foundry). Its licence
lets a design use the font but forbids uploading the font file, and its ANSI encoding only
reads Bijoy-typed text, so the page carries the letter shapes and never the font.
The logo's letters are Knewave by Tyler Finck (SIL Open Font License), one shape per letter
so the page can write each in.

  pip install fonttools uharfbuzz skia-pathops
  python scripts/motherland-art.py <Li Sirajee Regular.ttf> <Knewave Regular.ttf>
"""
import json
import sys

import pathops
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

BIJOY_TITLE = "Avgv†`i evsjv"  # আমাদের বাংলা, typed in the font's ANSI encoding
TRACKING = 0  # Extra room between the letters, in font units: the brush letters sit as the font sets them.


def shaped(font_path, text):
    """Each glyph of the text and where it sits, with the font's own kerning."""
    font = TTFont(font_path)
    order = font.getGlyphOrder()
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb.Font(hb.Face(hb.Blob.from_file_path(font_path))), buf, {"kern": True})
    spots = []
    x = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        spots.append((order[info.codepoint], x + pos.x_offset, pos.y_offset))
        x += pos.x_advance
    return font, spots


def outline(font, spots, shift=0):
    glyphs = font.getGlyphSet()
    path = pathops.Path()
    pen = path.getPen(glyphSet=glyphs)
    for name, x, y in spots:
        glyphs[name].draw(TransformPen(pen, (1, 0, 0, 1, x + shift, y)))
    path.simplify(fix_winding=True)
    return path


def to_svg(path, left, top):
    """An SVG path from the ink's top-left corner, flipped to y down."""
    pen = SVGPathPen(None, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    path.draw(TransformPen(pen, (1, 0, 0, -1, -left, top)))
    return pen.getCommands()


def title(font_path):
    """The title, and where each of its words starts and ends: the melt colours them one by one."""
    font, spots = shaped(font_path, BIJOY_TITLE)
    path = outline(font, spots)
    x0, y0, x1, y1 = path.bounds
    runs = [[]]
    for spot in spots:
        if spot[0] == "space":
            runs.append([])
        else:
            runs[-1].append(spot)
    words = [[round(outline(font, run).bounds[0] - x0), round(outline(font, run).bounds[2] - x0)] for run in runs]
    return {"width": round(x1 - x0), "height": round(y1 - y0), "d": to_svg(path, x0, y1), "words": words}


def letters(font_path):
    """Each letter of MotherLand and its full stop on one baseline at y = 0, y down, and how tall the tallest stands."""
    font, spots = shaped(font_path, "MotherLand.")
    out = []
    top = bottom = 0
    for i, (name, x, y) in enumerate(spots):
        path = outline(font, [(name, x + i * TRACKING, y)])
        x0, y0, x1, y1 = path.bounds
        top, bottom = max(top, y1), min(bottom, y0)
        out.append({"d": to_svg(path, 0, 0), "x0": round(x0), "x1": round(x1), "y0": -round(y1), "y1": -round(y0)})
    return {"cap": font["OS/2"].sCapHeight, "x": font["OS/2"].sxHeight, "top": -round(top), "bottom": -round(bottom), "letters": out}


if __name__ == "__main__":
    art_title = title(sys.argv[1])
    art_logo = letters(sys.argv[2])
    out = (
        "/** Written by scripts/motherland-art.py; do not edit. The title's shapes are from Li Sirajee Sylheti 3D (Lipighor Font Foundry), the logo's letters from Knewave (SIL OFL). */\n"
        f"export const TITLE_ART = {json.dumps(art_title, ensure_ascii=False)};\n\n"
        f"export const LOGO_ART = {json.dumps(art_logo, ensure_ascii=False)};\n"
    )
    open("data/motherland-art.ts", "w", encoding="utf-8", newline="\n").write(out)
    print("title", art_title["width"], art_title["height"], art_title["words"], "logo", art_logo["cap"], art_logo["x"], art_logo["top"], art_logo["bottom"], [(l["x0"], l["x1"]) for l in art_logo["letters"]])
