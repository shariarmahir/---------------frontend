/**
 * Text out of the files students actually have: .docx and .pptx are zip
 * archives of XML, read here with a small zip reader; old .doc and .ppt keep
 * their words as UTF-16 runs, which are fished out as best we can. The
 * caller passes the inflater (DecompressionStream in the browser, zlib in
 * tests), so this stays pure. Tested in office-text.test.ts.
 */

export type Inflate = (raw: Uint8Array) => Promise<Uint8Array>;

/** Enough for a chapter; more would only crowd the tutor's context. */
export const TEXT_CAP = 40_000;

interface Entry {
  name: string;
  method: number;
  size: number;
  offset: number;
}

function entries(b: Uint8Array): Entry[] | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  // The end-of-directory record sits in the last 64 KB (its comment can be that long).
  let end = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65_557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) return null;
  const count = v.getUint16(end + 10, true);
  let p = v.getUint32(end + 16, true);
  const out: Entry[] = [];
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (p + 46 > b.length || v.getUint32(p, true) !== 0x02014b50) return null;
    const nameLen = v.getUint16(p + 28, true);
    out.push({
      method: v.getUint16(p + 10, true),
      size: v.getUint32(p + 20, true),
      offset: v.getUint32(p + 42, true),
      name: dec.decode(b.subarray(p + 46, p + 46 + nameLen)),
    });
    p += 46 + nameLen + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  }
  return out;
}

async function read(b: Uint8Array, e: Entry, inflate: Inflate): Promise<string | null> {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (e.offset + 30 > b.length || v.getUint32(e.offset, true) !== 0x04034b50) return null;
  const start = e.offset + 30 + v.getUint16(e.offset + 26, true) + v.getUint16(e.offset + 28, true);
  const raw = b.subarray(start, start + e.size);
  if (e.method === 0) return new TextDecoder().decode(raw);
  if (e.method === 8) return new TextDecoder().decode(await inflate(raw));
  return null;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Word and PowerPoint XML to plain lines: one line per paragraph, tags dropped. */
export function xmlText(xml: string): string {
  return xml
    .replace(/<w:tab\/>|<a:tab\/>/g, "\t")
    .replace(/<w:br\/>|<a:br\/>|<\/w:p>|<\/a:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, code: string) => {
      if (code[0] === "#") return String.fromCodePoint(code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
      return ENTITIES[code] ?? all;
    })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

const slideNo = (name: string) => Number(/slide(\d+)\.xml$/.exec(name)?.[1] ?? 0);

/** The words in a .docx or .pptx, slide by slide; null when it is not one. */
export async function officeText(bytes: Uint8Array, inflate: Inflate): Promise<string | null> {
  const list = entries(bytes);
  if (!list) return null;
  const doc = list.find((e) => e.name === "word/document.xml");
  if (doc) {
    const xml = await read(bytes, doc, inflate);
    return xml === null ? null : xmlText(xml).slice(0, TEXT_CAP);
  }
  const slides = list.filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.name)).sort((a, b) => slideNo(a.name) - slideNo(b.name));
  if (slides.length === 0) return null;
  const parts: string[] = [];
  for (const s of slides) {
    const xml = await read(bytes, s, inflate);
    if (xml === null) continue;
    const text = xmlText(xml);
    if (text) parts.push(`[স্লাইড ${slideNo(s.name)}]\n${text}`);
  }
  return parts.length ? parts.join("\n\n").slice(0, TEXT_CAP) : null;
}

/**
 * Old binary .doc and .ppt: keep runs of readable UTF-16 text at least
 * twelve characters long. Rough, but it finds the body text; null when
 * there is too little to be worth sending.
 */
export function legacyText(bytes: Uint8Array): string | null {
  const runs: string[] = [];
  let run = "";
  const flush = () => {
    const t = run.trim();
    if (t.length >= 12 && /\p{L}{3}/u.test(t)) runs.push(t);
    run = "";
  };
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const c = bytes[i] | (bytes[i + 1] << 8);
    const ch = String.fromCharCode(c);
    if (c === 13 || c === 11) {
      run += "\n";
      continue;
    }
    if ((c >= 32 && c < 127) || (c >= 0x980 && c <= 0x9ff) || c === 0x200c || c === 0x200d || (c >= 0x2010 && c <= 0x2027) || c === 0xa0) run += ch;
    else flush();
  }
  flush();
  const wide = runs.join("\n");
  // English-only files often store their text as plain 8-bit bytes instead.
  const narrow = (new TextDecoder("latin1").decode(bytes).match(/[\x20-\x7e\r\n\t]{20,}/g) ?? []).filter((t) => /[a-z]{3}/i.test(t) && (t.match(/[a-z ]/gi)?.length ?? 0) > t.length * 0.7).join("\n");
  const text = (wide.length >= narrow.length ? wide : narrow).replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text.length >= 40 ? text.slice(0, TEXT_CAP) : null;
}
