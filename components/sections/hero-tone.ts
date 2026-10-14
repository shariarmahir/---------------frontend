import { luminance, parseFocus, pickTone, shadeUnderScrim, type TextTone } from "@/lib/backdrop-tone";

/** Pixels per sample: the band is drawn at 1/6 size, plenty for a mean-tone decision. */
const SCALE = 6;

/**
 * The tone of text that reads on the part of a hero photograph a text box
 * covers, or null when it cannot be told yet (image not decoded, band not
 * laid out, canvas refused).
 *
 * The photograph is drawn the way the band shows it (`object-fit: cover`
 * with the slide's focal point), then each pixel is darkened by the
 * scrims over it, so the verdict matches what the visitor actually sees.
 * `box` is in pixels, relative to the band's top-left.
 */
export function sampleHeroTone(opts: {
  img: HTMLImageElement;
  band: { w: number; h: number };
  focus: string | undefined;
  box: { x: number; y: number; w: number; h: number };
}): TextTone | null {
  const { img, band, focus, box } = opts;
  if (!img.complete || !img.naturalWidth || !img.naturalHeight || band.w < 1 || band.h < 1) return null;

  const cw = Math.max(1, Math.round(band.w / SCALE));
  const ch = Math.max(1, Math.round(band.h / SCALE));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // object-fit: cover, positioned by the focal point.
  const [fx, fy] = parseFocus(focus);
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  try {
    ctx.drawImage(img, (cw - dw) * fx, (ch - dh) * fy, dw, dh);

    const x0 = Math.min(cw - 1, Math.max(0, Math.floor(box.x / SCALE)));
    const y0 = Math.min(ch - 1, Math.max(0, Math.floor(box.y / SCALE)));
    const x1 = Math.min(cw, Math.max(x0 + 1, Math.ceil((box.x + box.w) / SCALE)));
    const y1 = Math.min(ch, Math.max(y0 + 1, Math.ceil((box.y + box.h) / SCALE)));
    const w = x1 - x0;
    const h = y1 - y0;
    const { data } = ctx.getImageData(x0, y0, w, h);

    const lums = new Float32Array(w * h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const i = (py * w + px) * 4;
        const [r, g, b] = shadeUnderScrim(data[i], data[i + 1], data[i + 2], (x0 + px + 0.5) / cw, (y0 + py + 0.5) / ch);
        lums[py * w + px] = luminance(r, g, b);
      }
    }
    return pickTone(lums);
  } catch {
    // A tainted canvas or a decode failure: keep whatever tone is showing.
    return null;
  }
}
