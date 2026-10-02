/**
 * Unicode Bangla → Bijoy (ANSI) key codes, for the brand's Li Sirajee
 * display face, which draws Bangla on Latin code points. Covers plain
 * letters, kars (moving ি ে ৈ in front), reph, hasant and the few conjuncts
 * the classroom slogans use; anything else keeps an explicit hasant. Only
 * fixed slogans go through this — live text stays Unicode. Tested in
 * bijoy.test.ts.
 */

const LETTER: Record<string, string> = {
  অ: "A", আ: "Av", ই: "B", ঈ: "C", উ: "D", ঊ: "E", ঋ: "F", এ: "G", ঐ: "H", ও: "I", ঔ: "J",
  ক: "K", খ: "L", গ: "M", ঘ: "N", ঙ: "O", চ: "P", ছ: "Q", জ: "R", ঝ: "S", ঞ: "T",
  ট: "U", ঠ: "V", ড: "W", ঢ: "X", ণ: "Y", ত: "Z", থ: "_", দ: "`", ধ: "a", ন: "b",
  প: "c", ফ: "d", ব: "e", ভ: "f", ম: "g", য: "h", র: "i", ল: "j", শ: "k", ষ: "l",
  স: "m", হ: "n", "ড়": "o", "ঢ়": "p", "য়": "q", "ৎ": "r", "ং": "s", "ঃ": "t", "ঁ": "u",
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  "।": "|",
};

/** Kars that follow the consonant. */
const POST: Record<string, string> = { "া": "v", "ী": "x", "ু": "y", "ূ": "~", "ৃ": "„", "ৗ": "Š" };
/** Kars drawn before the consonant cluster. */
const PRE: Record<string, string> = { "ি": "w", "ে": "‡", "ৈ": "‰" };

/**
 * Joined forms, each checked by eye against the Li Sirajee face. Anything
 * else falls back to the letters with a hasant (&), and the strict reader
 * refuses it.
 */
const CONJUNCT: Record<string, string> = {
  "ক্ক": "°", "ক্ত": "³", "ক্র": "µ", "ক্ষ": "ÿ", "ক্স": "·", "গ্র": "MÖ", "ঙ্ক": "¼", "ঙ্গ": "½",
  "চ্চ": "”P", "জ্জ": "¾", "জ্ব": "R¡", "ঞ্চ": "Â", "ঞ্জ": "Ä", "ট্ট": "Æ", "ট্র": "Uª",
  "ত্ত": "Ë", "ত্ম": "Z¥", "ত্র": "Î", "দ্দ": "Ï", "দ্ধ": "×", "দ্ব": "Ø", "দ্র": "`ª", "ধ্ব": "aŸ",
  "ন্ট": "›U", "ন্ড": "Û", "ন্ত": "šÍ", "ন্দ": "›`", "ন্ধ": "Ü", "ন্ন": "bœ", "ন্ম": "b¥", "প্ত": "ß",
  "প্র": "cÖ", "ব্দ": "ã", "ব্র": "eª", "ম্প": "¤ú", "ম্ব": "¤^", "ম্ভ": "¤¢", "ম্ম": "¤§", "ল্প": "í",
  "ল্ল": "jø", "শ্চ": "ð", "শ্র": "kª", "ষ্ট": "ó", "ষ্ঠ": "ô", "ষ্ণ": "ò", "স্ক": "¯‹", "স্ট": "÷",
  "স্ত": "¯Í", "স্থ": "¯’", "স্প": "¯ú", "স্ম": "¯§", "হ্ন": "ý", "হ্ম": "þ",
};

const HASANT = "্";
const isConsonant = (c: string) => /^[ক-হড়ঢ়য়]$/u.test(c);

/** Split into letters, folding nukta forms (ড + ় → ড়) into one. */
const letters = (s: string) => [...s.normalize("NFC").replace(/ড়/g, "ড়").replace(/ঢ়/g, "ঢ়").replace(/য়/g, "য়")];

interface Read {
  /** False once something had no checked form. */
  exact: boolean;
}

function cluster(parts: string[], r: Read): string {
  const text = parts.join(HASANT);
  if (CONJUNCT[text]) return CONJUNCT[text];
  // ্য and ্র attach to the cluster before them.
  const last = parts.at(-1);
  if (parts.length >= 2 && last === "য") return cluster(parts.slice(0, -1), r) + "¨";
  if (parts.length === 2 && last === "র") return (LETTER[parts[0]] ?? parts[0]) + "ª";
  if (parts.length === 1) return LETTER[parts[0]] ?? parts[0];
  // Longest known conjunct at the start, then the rest one by one.
  for (let n = parts.length - 1; n >= 2; n--) {
    const head = parts.slice(0, n).join(HASANT);
    if (CONJUNCT[head]) {
      r.exact = false;
      return CONJUNCT[head] + "&" + cluster(parts.slice(n), r);
    }
  }
  r.exact = false;
  return parts.map((p) => LETTER[p] ?? p).join("&");
}

/** Bijoy codes for any Bangla; unknown conjuncts keep a visible hasant. */
export const toBijoy = (input: string) => convert(input, { exact: true });

/**
 * Bijoy codes only when every letter has a checked form, else null — for
 * live text like a person's name, which then stays in the Unicode face.
 * Latin letters refuse too: the display face would draw them as Bangla.
 */
export function toBijoyStrict(input: string): string | null {
  if (/[A-Za-z]/.test(input)) return null;
  const r = { exact: true };
  const out = convert(input, r);
  return r.exact && !/[ঀ-৿]/.test(out) ? out : null;
}

function convert(input: string, r: Read): string {
  const s = letters(input);
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (!isConsonant(c)) {
      out += POST[c] ?? LETTER[c] ?? c;
      i++;
      continue;
    }
    // Reph: র্ in front of another consonant.
    let reph = false;
    if (c === "র" && s[i + 1] === HASANT && s[i + 2] && isConsonant(s[i + 2])) {
      reph = true;
      i += 2;
    }
    const parts = [s[i]];
    i++;
    while (s[i] === HASANT && s[i + 1] && isConsonant(s[i + 1])) {
      parts.push(s[i + 1]);
      i += 2;
    }
    let body = cluster(parts, r);
    if (s[i] === HASANT) {
      body += "&";
      i++;
    }
    let pre = "";
    let post = "";
    const k = s[i];
    if (k === "ো") {
      pre = "‡";
      post = "v";
      i++;
    } else if (k === "ৌ") {
      pre = "‡";
      post = "Š";
      i++;
    } else if (PRE[k]) {
      pre = PRE[k];
      i++;
    } else if (POST[k]) {
      post = POST[k];
      i++;
    }
    out += pre + body + post + (reph ? "©" : "");
  }
  return out;
}
