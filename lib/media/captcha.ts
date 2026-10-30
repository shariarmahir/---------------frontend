/**
 * The picture-match check at the classroom door: one picture is shown, and
 * the person taps the same picture among six, each turned a little. Pure
 * rules, tested in captcha.test.ts.
 *
 * TODO(backend): this runs in the browser, so it slows a careless script
 * rather than stopping a determined one; a real check needs the server to
 * set the puzzle and verify the answer.
 */

export const CAPTCHA_ITEMS = ["book", "pencil", "calculator", "microscope", "globe", "flask", "ruler", "atom", "bulb", "bell", "backpack", "palette"] as const;
export type CaptchaItem = (typeof CAPTCHA_ITEMS)[number];

/** What each picture is called, for the prompt and for screen readers. */
export const ITEM_BN: Record<CaptchaItem, string> = {
  book: "বই",
  pencil: "পেনসিল",
  calculator: "ক্যালকুলেটর",
  microscope: "অণুবীক্ষণ যন্ত্র",
  globe: "গ্লোব",
  flask: "ফ্লাস্ক",
  ruler: "স্কেল",
  atom: "পরমাণু",
  bulb: "বাল্ব",
  bell: "ঘণ্টা",
  backpack: "স্কুলব্যাগ",
  palette: "রঙের প্যালেট",
};

export const OPTIONS = 6;
/** Turns an option may take, in degrees; the target is always upright. */
const TURNS = [-30, -15, 0, 15, 30, 45];

export interface Captcha {
  target: CaptchaItem;
  options: { item: CaptchaItem; turn: number }[];
}

/** A new puzzle: the target plus five other pictures, shuffled, each turned. `rand` returns [0, 1). */
export function makeCaptcha(rand: () => number, avoid?: CaptchaItem): Captcha {
  const pool = [...CAPTCHA_ITEMS];
  // Fisher–Yates, so every order is equally likely.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // A fresh puzzle after a miss asks for a different picture.
  const target = pool.find((p) => p !== avoid) ?? pool[0];
  const others = pool.filter((p) => p !== target).slice(0, OPTIONS - 1);
  const picks = [target, ...others];
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }
  return { target, options: picks.map((item) => ({ item, turn: TURNS[Math.floor(rand() * TURNS.length)] })) };
}

export const solves = (c: Captcha, item: CaptchaItem) => item === c.target;
