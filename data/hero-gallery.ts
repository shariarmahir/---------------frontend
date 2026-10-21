/**
 * The ten Bangladesh photographs behind the hero mosaic and the CTA strip.
 *
 * Alt text is descriptive rather than decorative: these are the citizens the
 * 64-district healthcare mission exists for, so a screen-reader user should
 * get the same sense of place a sighted visitor does.
 */
export interface HeroPhoto {
  src: string;
  alt: string;
  /**
   * object-position for the crop. Source files are 1.0–1.96 wide while the
   * hero band is wider still, so `cover` always trims the top and bottom;
   * this steers what survives. Default "50% 50%" would cut through heads in
   * the portrait-style frames.
   */
  focus?: string;
  /**
   * object-position on a phone, where the band turns portrait (about
   * 0.6–0.75 : 1) and a 3:2 photograph shows only the middle ~45% of its
   * width: this keeps the subject in that slice. Defaults to `focus`.
   */
  mobileFocus?: string;
  /**
   * Sharper art-directed files, used when present (the current ones are
   * 640–736px wide and soft on a desktop): `wide` for ≥ 1024px at about
   * 3840 × 1100 (7:2), `tall` for phones at about 1200 × 1800 (2:3).
   * Each falls back to `src`.
   */
  wide?: string;
  tall?: string;
}

export const heroPhotos: HeroPhoto[] = [
  {
    src: "/hero/Hero-3.jpg",
    alt: "গোধূলিতে ধানক্ষেতের আলপথ ধরে মাথায় খড়ের আঁটি নিয়ে হেঁটে চলেছেন কৃষকেরা",
    // Figures walk across the upper-middle band; the lower third is bare
    // stubble, so bias upward.
    focus: "50% 38%",
    mobileFocus: "50% 45%",
  },
  {
    src: "/hero/Hero-1.jpg",
    alt: "নদীর তীরে বাঁধা রঙিন পালতোলা নৌকা",
    // Sail occupies the right half and reaches near the top edge.
    focus: "60% 42%",
    mobileFocus: "76% 50%",
  },
  {
    src: "/hero/Hero-10.jpg",
    alt: "ভোরের কুয়াশায় দুই প্রবীণ একে অপরকে পানি এগিয়ে দিচ্ছেন",
    // Both heads sit high in frame — the crop that was decapitating them.
    focus: "50% 28%",
    mobileFocus: "48% 26%",
  },
  {
    src: "/hero/Hero-8.jpg",
    alt: "সরিষা ক্ষেতের ভেতর দিয়ে স্কুলে যাচ্ছে চার কিশোরী",
    focus: "50% 40%",
    mobileFocus: "48% 40%",
  },
  {
    src: "/hero/Hero-5.jpg",
    alt: "সুন্দরবনের ম্যানগ্রোভ জলাভূমিতে একা নৌকা বাইছেন এক মাঝি",
    // Square source, so this one loses the most height; the boat sits just
    // below centre.
    focus: "50% 55%",
    mobileFocus: "38% 55%",
  },
  {
    src: "/hero/Hero-7.jpg",
    alt: "হলুদ আলোয় ধান মাড়াইয়ের যন্ত্রে কাজ করছেন কৃষকেরা",
    focus: "50% 45%",
    mobileFocus: "45% 45%",
  },
  {
    src: "/hero/Hero-2.jpg",
    alt: "অস্তগামী সূর্যের সামনে গরুর গাড়ি ও দৌড়ে চলা কিশোরদের অবয়ব",
    // Silhouettes sit along the lower horizon line.
    focus: "50% 58%",
    mobileFocus: "58% 50%",
  },
  {
    src: "/hero/Hero-4.jpg",
    alt: "পাহাড় ও হ্রদের মাঝে জলের উপর দাঁড়িয়ে থাকা একটি কাঠের ঘর",
    focus: "55% 50%",
    mobileFocus: "72% 52%",
  },
  {
    src: "/hero/Hero-6.jpg",
    alt: "সুন্দরবনের খাল ধরে যাত্রীবোঝাই নৌকা চলেছে",
    focus: "50% 48%",
    mobileFocus: "50% 55%",
  },
  {
    src: "/hero/Hero-9.jpg",
    alt: "ক্ষেতে লাঙল হাতে কৃষক ও পাশে দাঁড়ানো এক কিশোর",
    // Standing farmer's head is near the top; bias up to keep it.
    focus: "50% 35%",
    mobileFocus: "55% 35%",
  },
];

